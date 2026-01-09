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
import { TagsInput } from "~/app/_components/ui/tags-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";
import { Loader2, X, Plus } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { SerializedJob } from "~/lib/types";
import { Badge } from "~/app/_components/ui/badge";

const formSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255, "Title is too long"),
    description: z.string().min(1, "Description is required"),
    skills: z
      .array(
        z.object({
          name: z
            .string()
            .min(1, "Skill name is required")
            .max(100, "Skill name is too long"),
          weight: z.coerce.number().min(0),
        }),
      )
      .min(1, "At least one skill is required"),
    yearsOfExperience: z.coerce
      .number()
      .min(0, "Years of experience must be 0 or greater")
      .max(50, "Years of experience seems too high"),
    educationDegree: z.enum([
      "None",
      "High School",
      "Bachelor",
      "Master",
      "PhD",
    ]),
    educationField: z
      .string()
      .max(100, "Education field is too long")
      .optional(),
    timezone: z
      .string()
      .min(1, "Timezone is required")
      .max(100, "Timezone is too long"),
    skillsWeight: z.coerce
      .number()
      .min(0)
      .max(1, "Weight must be between 0 and 1"),
    experienceWeight: z.coerce
      .number()
      .min(0)
      .max(1, "Weight must be between 0 and 1"),
    educationWeight: z.coerce
      .number()
      .min(0)
      .max(1, "Weight must be between 0 and 1"),
    timezoneWeight: z.coerce
      .number()
      .min(0)
      .max(1, "Weight must be between 0 and 1"),
    interviewsNeeded: z.coerce
      .number()
      .min(1, "At least 1 interview is needed")
      .max(10, "Too many interviews"),
    hiresNeeded: z.coerce
      .number()
      .min(1, "At least 1 hire is needed")
      .max(50, "Too many hires"),
    isOpen: z.boolean().optional(),
    // New required fields
    employmentType: z.enum([
      "Full-time",
      "Part-time",
      "Contract",
      "Internship",
    ]),
    workplaceType: z.enum(["Remote", "Hybrid", "On-site"]),
    location: z.string().max(255, "Location is too long").optional(),
    // New optional fields
    benefits: z.string().optional(),
    // Salary fields
    salaryType: z.enum(["FIXED", "RANGE"]).optional(),
    fixedSalary: z.coerce.number().positive().optional(),
    salaryRangeMin: z.coerce.number().positive().optional(),
    salaryRangeMax: z.coerce.number().positive().optional(),
    salaryCurrency: z.string().max(10).optional(),
  })
  .refine(
    (data) => {
      const totalWeight =
        data.skillsWeight +
        data.experienceWeight +
        data.educationWeight +
        data.timezoneWeight;
      return Math.abs(totalWeight - 1) < 0.01; // Allow for small floating point errors
    },
    {
      message: "All weights must sum to 1.00",
      path: ["skillsWeight"],
    },
  )
  .refine(
    (data) => {
      // Location is required for Hybrid and On-site workplace types
      if (data.workplaceType === "Hybrid" || data.workplaceType === "On-site") {
        return data.location !== undefined && data.location.length > 0;
      }
      return true;
    },
    {
      message: "Location is required for Hybrid and On-site workplace types",
      path: ["location"],
    },
  )
  .refine(
    (data) => {
      // If salaryType is FIXED, fixedSalary must be provided
      if (data.salaryType === "FIXED") {
        return data.fixedSalary !== undefined && data.fixedSalary > 0;
      }
      return true;
    },
    {
      message: "Fixed salary is required when salary type is FIXED",
      path: ["fixedSalary"],
    },
  )
  .refine(
    (data) => {
      // If salaryType is RANGE, both min and max must be provided
      if (data.salaryType === "RANGE") {
        return (
          data.salaryRangeMin !== undefined &&
          data.salaryRangeMax !== undefined &&
          data.salaryRangeMin > 0 &&
          data.salaryRangeMax > 0
        );
      }
      return true;
    },
    {
      message:
        "Salary range minimum and maximum are required when salary type is RANGE",
      path: ["salaryRangeMin"],
    },
  )
  .refine(
    (data) => {
      // If salaryType is RANGE, max must be greater than min
      if (
        data.salaryType === "RANGE" &&
        data.salaryRangeMin !== undefined &&
        data.salaryRangeMax !== undefined
      ) {
        return data.salaryRangeMax > data.salaryRangeMin;
      }
      return true;
    },
    {
      message: "Salary range maximum must be greater than minimum",
      path: ["salaryRangeMax"],
    },
  );

interface EditJobFormProps {
  job: SerializedJob;
}

const EditJobForm = ({ job }: EditJobFormProps) => {
  const router = useRouter();
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillImportance, setNewSkillImportance] = useState<string>("5");

  const educationField = job.educationField ? String(job.educationField) : "";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: job.title,
      description: job.description,
      skills: job.skills,
      yearsOfExperience: job.yearsOfExperience,
      educationDegree: job.educationDegree as
        | "High School"
        | "Bachelor"
        | "Master"
        | "PhD",
      educationField: educationField,
      timezone: job.timezone,
      skillsWeight: Number(job.skillsWeight),
      experienceWeight: Number(job.experienceWeight),
      educationWeight: Number(job.educationWeight),
      timezoneWeight: Number(job.timezoneWeight),
      interviewsNeeded: job.interviewsNeeded,
      hiresNeeded: job.hiresNeeded,
      isOpen: job.isOpen,
      employmentType: job.employmentType as
        | "Full-time"
        | "Part-time"
        | "Contract"
        | "Internship",
      workplaceType: job.workplaceType as "Remote" | "Hybrid" | "On-site",
      location: job.location ?? undefined,
      benefits: job.benefits ?? "",
      salaryType:
        (job.salaryType as "FIXED" | "RANGE" | undefined) ?? undefined,
      fixedSalary: job.fixedSalary ? Number(job.fixedSalary) : undefined,
      salaryRangeMin: job.salaryRangeMin
        ? Number(job.salaryRangeMin)
        : undefined,
      salaryRangeMax: job.salaryRangeMax
        ? Number(job.salaryRangeMax)
        : undefined,
      salaryCurrency: job.salaryCurrency ?? "USD",
    },
  });

  const utils = api.useUtils();

  const addSkill = () => {
    if (!newSkillName.trim()) {
      toast.error("Please enter a skill name");
      return;
    }

    const currentSkills = form.getValues("skills");

    // Check for duplicates
    if (
      currentSkills.some(
        (s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase(),
      )
    ) {
      toast.error("This skill has already been added");
      return;
    }

    form.setValue("skills", [
      ...currentSkills,
      {
        name: newSkillName.trim(),
        weight: Number(newSkillImportance),
      },
    ]);

    // Reset input
    setNewSkillName("");
  };

  const removeSkill = (index: number) => {
    const currentSkills = form.getValues("skills");
    form.setValue(
      "skills",
      currentSkills.filter((_, i) => i !== index),
    );
  };

  const getImportanceLabel = (weight: number) => {
    if (weight === 10) return "Critical";
    if (weight === 7) return "High Priority";
    if (weight === 5) return "Standard";
    if (weight === 2) return "Low";
    return "Custom";
  };

  const getImportanceBadgeVariant = (
    weight: number,
  ): "default" | "secondary" | "outline" => {
    if (weight === 10) return "default";
    if (weight === 7) return "default";
    if (weight === 5) return "secondary";
    return "outline";
  };

  const updateJob = api.job.update.useMutation({
    onSuccess: () => {
      toast.success("Job updated successfully!");
      // Invalidate jobs queries to refresh the data
      void utils.job.getAll.invalidate();
      void utils.job.getById.invalidate({ id: job.id });
      router.push("/dashboard/");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  console.log(job);

  // Update form values when job data is loaded
  React.useEffect(() => {
    if (job) {
      const educationField = job.educationField
        ? String(job.educationField)
        : "";
      form.reset({
        title: job.title,
        description: job.description,
        skills: job.skills,
        yearsOfExperience: job.yearsOfExperience,
        educationDegree: job.educationDegree as
          | "High School"
          | "Bachelor"
          | "Master"
          | "PhD",
        educationField: educationField,
        timezone: job.timezone,
        skillsWeight: Number(job.skillsWeight),
        experienceWeight: Number(job.experienceWeight),
        educationWeight: Number(job.educationWeight),
        timezoneWeight: Number(job.timezoneWeight),
        interviewsNeeded: job.interviewsNeeded,
        hiresNeeded: job.hiresNeeded,
        isOpen: job.isOpen,
        employmentType: job.employmentType as
          | "Full-time"
          | "Part-time"
          | "Contract"
          | "Internship",
        workplaceType: job.workplaceType as "Remote" | "Hybrid" | "On-site",
        location: job.location ?? undefined,
        benefits: job.benefits ?? "",
        salaryType:
          (job.salaryType as "FIXED" | "RANGE" | undefined) ?? undefined,
        fixedSalary: job.fixedSalary ? Number(job.fixedSalary) : undefined,
        salaryRangeMin: job.salaryRangeMin
          ? Number(job.salaryRangeMin)
          : undefined,
        salaryRangeMax: job.salaryRangeMax
          ? Number(job.salaryRangeMax)
          : undefined,
        salaryCurrency: job.salaryCurrency ?? "USD",
      });
    }
  }, [job, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const submitData = {
      id: job.id,
      ...values,
    };

    await updateJob.mutateAsync(submitData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Job Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Job Information</h3>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Senior Frontend Developer"
                    {...field}
                  />
                </FormControl>
                <FormDescription>The title of the job position</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description</FormLabel>
                <FormControl>
                  <textarea
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe the job responsibilities, requirements, and what you're looking for in a candidate..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Detailed description of the job role and responsibilities
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {/* Skill Input Section */}
                    <div className="flex gap-2">
                      <Select
                        value={newSkillImportance}
                        onValueChange={setNewSkillImportance}
                      >
                        <SelectTrigger className="w-[180px] text-left">
                          <SelectValue placeholder="Importance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">
                            <div className="flex flex-col">
                              <span className="font-medium">Critical</span>
                              <span className="text-muted-foreground text-xs">
                                Mandatory - 10 pts
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="7">
                            <div className="flex flex-col">
                              <span className="font-medium">High Priority</span>
                              <span className="text-muted-foreground text-xs">
                                Very Important - 7 pts
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="5">
                            <div className="flex flex-col">
                              <span className="font-medium">Standard</span>
                              <span className="text-muted-foreground text-xs">
                                Normal - 5 pts
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="2">
                            <div className="flex flex-col">
                              <span className="font-medium">Low</span>
                              <span className="text-muted-foreground text-xs">
                                Bonus - 2 pts
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="e.g., React, Python, TypeScript..."
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addSkill}
                        variant="secondary"
                        size="icon"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Skills List */}
                    {field.value.length > 0 && (
                      <div className="bg-muted/50 flex flex-wrap gap-2 rounded-md border p-3">
                        {field.value.map((skill, index) => (
                          <Badge
                            key={index}
                            variant={getImportanceBadgeVariant(skill.weight)}
                            className="flex items-center gap-2 py-1.5 pr-1 pl-3 text-sm"
                          >
                            <span>{skill.name}</span>
                            <span className="text-xs opacity-70">
                              ({getImportanceLabel(skill.weight)})
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSkill(index)}
                              className="hover:bg-background/20 ml-1 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Add skills and set their importance level. Critical skills are
                  must-haves, High Priority are very important, Standard are
                  normal requirements, and Low are bonuses.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>Type of employment</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workplaceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workplace Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select workplace type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="On-site">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>Work arrangement</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Remote - Philippines"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Job location or region</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="benefits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Benefits (Optional)</FormLabel>
                <FormControl>
                  <textarea
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="List benefits such as health insurance, flexible hours, PTO, etc..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Benefits and perks offered with this position
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Salary Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              Salary Information (Optional)
            </h4>

            <FormField
              control={form.control}
              name="salaryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select salary type (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED">Fixed Salary</SelectItem>
                        <SelectItem value="RANGE">Salary Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Choose whether to offer a fixed salary or a salary range
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("salaryType") === "FIXED" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fixedSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fixed Salary</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 75000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the fixed salary amount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? "USD"}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="PHP">PHP (₱)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="JPY">JPY (¥)</SelectItem>
                            <SelectItem value="AUD">AUD (A$)</SelectItem>
                            <SelectItem value="CAD">CAD (C$)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>Currency for the salary</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {form.watch("salaryType") === "RANGE" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="salaryRangeMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Salary</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 50000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormDescription>Minimum salary range</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryRangeMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Salary</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 70000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormDescription>Maximum salary range</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? "USD"}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="PHP">PHP (₱)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="JPY">JPY (¥)</SelectItem>
                            <SelectItem value="AUD">AUD (A$)</SelectItem>
                            <SelectItem value="CAD">CAD (C$)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>Currency for the salary</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="yearsOfExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="3" {...field} />
                  </FormControl>
                  <FormDescription>
                    Minimum years of relevant experience
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone {field.value}</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GMT-12">
                          GMT-12 (Baker Island)
                        </SelectItem>
                        <SelectItem value="GMT-11">
                          GMT-11 (American Samoa)
                        </SelectItem>
                        <SelectItem value="GMT-10">GMT-10 (Hawaii)</SelectItem>
                        <SelectItem value="GMT-9">GMT-9 (Alaska)</SelectItem>
                        <SelectItem value="GMT-8">
                          GMT-8 (Pacific Time)
                        </SelectItem>
                        <SelectItem value="GMT-7">
                          GMT-7 (Mountain Time)
                        </SelectItem>
                        <SelectItem value="GMT-6">
                          GMT-6 (Central Time)
                        </SelectItem>
                        <SelectItem value="GMT-5">
                          GMT-5 (Eastern Time)
                        </SelectItem>
                        <SelectItem value="GMT-4">
                          GMT-4 (Atlantic Time)
                        </SelectItem>
                        <SelectItem value="GMT-3">
                          GMT-3 (Argentina, Brazil)
                        </SelectItem>
                        <SelectItem value="GMT-2">
                          GMT-2 (Mid-Atlantic)
                        </SelectItem>
                        <SelectItem value="GMT-1">GMT-1 (Azores)</SelectItem>
                        <SelectItem value="GMT+0">
                          GMT+0 (London, Dublin)
                        </SelectItem>
                        <SelectItem value="GMT+1">
                          GMT+1 (Paris, Berlin)
                        </SelectItem>
                        <SelectItem value="GMT+2">
                          GMT+2 (Cairo, Athens)
                        </SelectItem>
                        <SelectItem value="GMT+3">
                          GMT+3 (Moscow, Istanbul)
                        </SelectItem>
                        <SelectItem value="GMT+4">
                          GMT+4 (Dubai, Baku)
                        </SelectItem>
                        <SelectItem value="GMT+5">
                          GMT+5 (Pakistan, Kazakhstan)
                        </SelectItem>
                        <SelectItem value="GMT+5:30">
                          GMT+5:30 (India, Sri Lanka)
                        </SelectItem>
                        <SelectItem value="GMT+6">
                          GMT+6 (Bangladesh, Kyrgyzstan)
                        </SelectItem>
                        <SelectItem value="GMT+7">
                          GMT+7 (Thailand, Vietnam)
                        </SelectItem>
                        <SelectItem value="GMT+8">
                          GMT+8 (China, Singapore)
                        </SelectItem>
                        <SelectItem value="GMT+9">
                          GMT+9 (Japan, South Korea)
                        </SelectItem>
                        <SelectItem value="GMT+10">
                          GMT+10 (Australia East)
                        </SelectItem>
                        <SelectItem value="GMT+11">
                          GMT+11 (Solomon Islands)
                        </SelectItem>
                        <SelectItem value="GMT+12">
                          GMT+12 (New Zealand)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Required or preferred timezone
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="educationDegree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Degree</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select degree level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="High School">High School</SelectItem>
                        <SelectItem value="Bachelor">
                          Bachelor&apos;s Degree
                        </SelectItem>
                        <SelectItem value="Master">
                          Master&apos;s Degree
                        </SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Required minimum education level
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="educationField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Field</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Computer Science, Engineering, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Required or preferred field of study (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Scoring Weights */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Evaluation Criteria Weights</h3>
          <p className="text-muted-foreground text-sm">
            Set the importance of each criteria in candidate evaluation. All
            weights must sum to 1.00.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Current Sum:</span>
            <span
              className={`font-mono ${
                Math.abs(
                  Number(form.watch("skillsWeight")) +
                    Number(form.watch("experienceWeight")) +
                    Number(form.watch("educationWeight")) +
                    Number(form.watch("timezoneWeight")) -
                    1,
                ) < 0.01
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {(
                Number(form.watch("skillsWeight")) +
                Number(form.watch("experienceWeight")) +
                Number(form.watch("educationWeight")) +
                Number(form.watch("timezoneWeight"))
              ).toFixed(2)}
            </span>
            <span className="text-muted-foreground">/ 1.00</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="skillsWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.25"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Weight for technical skills evaluation (0-1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experienceWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.25"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Weight for experience evaluation (0-1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="educationWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.25"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Weight for education evaluation (0-1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezoneWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.25"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Weight for timezone match (0-1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Hiring Process */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hiring Process</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="interviewsNeeded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Rounds Needed</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      placeholder="1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of interview rounds required
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hiresNeeded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Hires Needed</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      placeholder="1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Total number of people to hire for this role
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isOpen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      value={field.value ? "true" : "false"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">
                          Open for Applications
                        </SelectItem>
                        <SelectItem value="false">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Whether this job is accepting new applications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={updateJob.isPending}>
            Update Job Posting
            {updateJob.isPending && <Loader2 className="ml-1 animate-spin" />}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditJobForm;
