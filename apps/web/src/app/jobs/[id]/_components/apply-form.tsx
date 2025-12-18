"use client";

import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Button } from "~/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  email: z
    .string()
    .email("Valid email is required")
    .max(255, "Email is too long"),
  expectedSalary: z.coerce.number().positive().optional(),
  applicantLocation: z.string().max(255).optional(),
  willingToRelocate: z.boolean().optional(),
  resumeFile: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Please select a resume file")
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB",
    )
    .refine(
      (file) =>
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ].includes(file.type),
      "Only PDF, DOC, DOCX, and TXT files are allowed",
    ),
});

type FormData = z.infer<typeof formSchema>;

interface ApplyFormProps {
  jobId: number;
  jobTitle: string;
  salaryType?: string | null;
  salaryCurrency?: string | null;
  workplaceType?: string | null;
  jobLocation?: string | null;
}

export function ApplyForm({
  jobId,
  jobTitle,
  salaryType,
  salaryCurrency,
  workplaceType,
  jobLocation,
}: ApplyFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      expectedSalary: undefined,
      applicantLocation: "",
      willingToRelocate: false,
    },
  });

  const applyMutation = api.applicant.applyJob.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Application submitted successfully!");
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to submit application");
    },
  });

  const uploadFile = async (
    file: File,
    applicantName: string,
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicantName", applicantName);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };
      throw new Error(errorData.error ?? "Failed to upload file");
    }

    const result = (await response.json()) as { fileName: string };
    return result.fileName;
  };

  const onSubmit = async (data: FormData) => {
    if (!data.resumeFile) {
      toast.error("Please select a resume file");
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to MinIO first
      const fileName = await uploadFile(data.resumeFile, data.name);

      // Then submit the application with the file reference
      applyMutation.mutate({
        jobId,
        name: data.name,
        email: data.email,
        resumeFileName: fileName,
        expectedSalary: data.expectedSalary,
        applicantLocation: data.applicantLocation,
        willingToRelocate: data.willingToRelocate,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload file";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-green-700">
                Application Submitted!
              </h3>
              <p className="text-muted-foreground">
                Thank you for applying to {jobTitle}. We&apos;ll review your
                application and get back to you soon.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="mt-4"
            >
              Submit Another Application
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Apply for {jobTitle}
        </CardTitle>
        <CardDescription>
          Fill out the form below to submit your application. All fields are
          required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      {...field}
                      disabled={applyMutation.isPending || isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      {...field}
                      disabled={applyMutation.isPending || isUploading}
                    />
                  </FormControl>
                  <FormDescription>
                    We&apos;ll use this email to contact you about your
                    application.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {salaryType === "RANGE" && (
              <FormField
                control={form.control}
                name="expectedSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Salary</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`Enter your expected salary ${salaryCurrency ? `(${salaryCurrency})` : ""}`}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : e.target.valueAsNumber,
                          );
                        }}
                        disabled={applyMutation.isPending || isUploading}
                      />
                    </FormControl>
                    <FormDescription>
                      What is your expected salary for this position?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(workplaceType === "Hybrid" || workplaceType === "On-site") && (
              <>
                <FormField
                  control={form.control}
                  name="applicantLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Current Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., San Francisco, CA"
                          {...field}
                          disabled={applyMutation.isPending || isUploading}
                        />
                      </FormControl>
                      <FormDescription>
                        Where are you currently located?
                        {jobLocation && ` (Job location: ${jobLocation})`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="willingToRelocate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={applyMutation.isPending || isUploading}
                          className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300 focus:ring-2"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I am willing to relocate
                          {jobLocation && ` to ${jobLocation}`}
                        </FormLabel>
                        <FormDescription>
                          Check this if you&apos;re open to relocating for this
                          position
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="resumeFile"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Resume Upload</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      disabled={applyMutation.isPending || isUploading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload your resume in PDF, DOC, DOCX, or TXT format (max
                    5MB).
                    {value && (
                      <span className="ml-2 text-xs font-medium">
                        Selected: {value.name}
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={applyMutation.isPending || isUploading}
              className="w-full"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Resume...
                </>
              ) : applyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
