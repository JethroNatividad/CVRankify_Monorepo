"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";
import { Input } from "~/app/_components/ui/input";
import { toast } from "sonner";
import { Button } from "~/app/_components/ui/button";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

const baseFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  repeatPassword: z.string().min(6),
  companyName: z.string().min(2).max(100),
});

const formSchema = baseFormSchema.refine(
  (data) => data.password === data.repeatPassword,
  {
    message: "Passwords don't match",
    path: ["repeatPassword"],
  },
);

type FormFields = keyof z.infer<typeof baseFormSchema>;

const SetupForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      repeatPassword: "",
      companyName: "",
    },
  });

  const createUser = api.setup.createUser.useMutation({
    onSuccess: async () => {
      toast.success("Success! Signing you in...");
      await signIn("credentials", {
        email: form.getValues("email"),
        password: form.getValues("password"),
        redirectTo: "/dashboard",
      });
    },

    onError: (error) => {
      const errorParts = error.message.split(":");
      if (errorParts[0] && errorParts[1]) {
        const [field, message] = errorParts;
        const validFields = Object.keys(baseFormSchema.shape) as FormFields[];

        if (validFields.includes(field as FormFields)) {
          form.setError(field as FormFields, {
            type: "manual",
            message: message.trim(),
          });
          return;
        }
      }
      toast.error(error.message);
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await createUser.mutateAsync({
      email: values.email,
      name: values.name,
      password: values.password,
      companyName: values.companyName,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Admin" {...field} />
              </FormControl>
              <FormDescription>This is your display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corporation" {...field} />
              </FormControl>
              <FormDescription>The name of your organization.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>This will be your login email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormDescription>
                Must be at least 6 characters long.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="repeatPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repeat Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormDescription>Confirm your password.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={createUser.isPending}
        >
          Create Account
          {createUser.isPending && <Loader2 className="ml-1 animate-spin" />}
        </Button>
      </form>
    </Form>
  );
};

export default SetupForm;
