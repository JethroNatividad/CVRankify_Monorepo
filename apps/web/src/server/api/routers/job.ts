import { z } from "zod";
import type { SerializedJob } from "~/lib/types";
import { resumeQueue } from "~/lib/queue";
import {
  createTRPCRouter,
  externalAIProcedure,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const jobRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z
        .object({
          title: z.string().min(1).max(255),
          description: z.string().min(1),
          skills: z.string().min(1),
          yearsOfExperience: z.number().min(0).max(50),
          educationDegree: z.string().min(1).max(100),
          educationField: z.string().max(100).optional(),
          timezone: z.string().min(1).max(100),
          skillsWeight: z.number().min(0).max(1),
          experienceWeight: z.number().min(0).max(1),
          educationWeight: z.number().min(0).max(1),
          timezoneWeight: z.number().min(0).max(1),
          interviewsNeeded: z.number().min(1).max(10),
          hiresNeeded: z.number().min(1).max(50),
          // New required fields
          employmentType: z.enum([
            "Full-time",
            "Part-time",
            "Contract",
            "Internship",
          ]),
          workplaceType: z.enum(["Remote", "Hybrid", "On-site"]),
          location: z.string().max(255).optional(),
          // New optional fields
          benefits: z.string().optional(),
          // Salary fields
          salaryType: z.enum(["FIXED", "RANGE"]).optional(),
          fixedSalary: z.number().positive().optional(),
          salaryRangeMin: z.number().positive().optional(),
          salaryRangeMax: z.number().positive().optional(),
          salaryCurrency: z.string().max(10).optional().default("USD"),
        })
        .refine(
          (data) => {
            // Location is required for Hybrid and On-site workplace types
            if (
              data.workplaceType === "Hybrid" ||
              data.workplaceType === "On-site"
            ) {
              return data.location !== undefined && data.location.length > 0;
            }
            return true;
          },
          {
            message:
              "Location is required for Hybrid and On-site workplace types",
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
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.job.create({
        data: {
          title: input.title,
          description: input.description,
          skills: input.skills,
          yearsOfExperience: input.yearsOfExperience,
          educationDegree: input.educationDegree,
          educationField: input.educationField,
          timezone: input.timezone,
          skillsWeight: input.skillsWeight,
          experienceWeight: input.experienceWeight,
          educationWeight: input.educationWeight,
          timezoneWeight: input.timezoneWeight,
          interviewsNeeded: input.interviewsNeeded,
          hiresNeeded: input.hiresNeeded,
          employmentType: input.employmentType,
          workplaceType: input.workplaceType,
          location: input.location,
          benefits: input.benefits,
          salaryType: input.salaryType,
          fixedSalary: input.fixedSalary,
          salaryRangeMin: input.salaryRangeMin,
          salaryRangeMax: input.salaryRangeMax,
          salaryCurrency: input.salaryCurrency,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
      return job;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const jobs = await ctx.db.job.findMany({
      where: { createdById: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applicants: true,
          },
        },
        applicants: {
          where: {
            interviewStatus: "scheduled",
          },
          select: {
            id: true,
          },
        },
      },
    });

    // Convert Decimal fields to numbers for display
    return jobs.map((job) => ({
      ...job,
      skillsWeight: Number(job.skillsWeight),
      experienceWeight: Number(job.experienceWeight),
      educationWeight: Number(job.educationWeight),
      timezoneWeight: Number(job.timezoneWeight),
      fixedSalary: job.fixedSalary ? Number(job.fixedSalary) : null,
      salaryRangeMin: job.salaryRangeMin ? Number(job.salaryRangeMin) : null,
      salaryRangeMax: job.salaryRangeMax ? Number(job.salaryRangeMax) : null,
      interviewing: job.applicants.length,
    }));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.job.findUnique({
        where: { id: input.id, createdById: ctx.session.user.id },
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
          applicants: {
            include: {
              experiences: true,
              matchedSkills: true,
            },
          },
        },
      });

      if (!job) {
        return null;
      }

      //   Convert Decimal fields to strings
      const serializedJob: SerializedJob = {
        ...job,
        skillsWeight: job.skillsWeight?.toString() ?? "0",
        experienceWeight: job.experienceWeight?.toString() ?? "0",
        educationWeight: job.educationWeight?.toString() ?? "0",
        timezoneWeight: job.timezoneWeight
          ? Number(job.timezoneWeight).toString()
          : "0",
        fixedSalary: job.fixedSalary?.toString() ?? null,
        salaryRangeMin: job.salaryRangeMin?.toString() ?? null,
        salaryRangeMax: job.salaryRangeMax?.toString() ?? null,
        applicants: job.applicants.map((applicant) => ({
          ...applicant,
          skillsScoreAI: applicant.skillsScoreAI?.toString() ?? "0",
          experienceScoreAI: applicant.experienceScoreAI?.toString() ?? "0",
          educationScoreAI: applicant.educationScoreAI?.toString() ?? "0",
          timezoneScoreAI: applicant.timezoneScoreAI?.toString() ?? "0",
          overallScoreAI: applicant.overallScoreAI?.toString() ?? "0",
          parsedYearsOfExperience: applicant.parsedYearsOfExperience
            ? applicant.parsedYearsOfExperience.toString()
            : undefined,
          expectedSalary: applicant.expectedSalary?.toString() ?? undefined,
          matchedSkills: applicant.matchedSkills.map((skill) => ({
            ...skill,
            score: skill.score?.toString() ?? "0",
          })),
        })),
      };

      return serializedJob;
    }),

  update: protectedProcedure
    .input(
      z
        .object({
          id: z.number(),
          title: z.string().min(1).max(255),
          description: z.string().min(1),
          skills: z.string().min(1),
          yearsOfExperience: z.number().min(0).max(50),
          educationDegree: z.string().min(1).max(100),
          educationField: z.string().max(100).optional(),
          timezone: z.string().min(1).max(100),
          skillsWeight: z.number().min(0).max(1),
          experienceWeight: z.number().min(0).max(1),
          educationWeight: z.number().min(0).max(1),
          timezoneWeight: z.number().min(0).max(1),
          interviewsNeeded: z.number().min(1).max(10),
          hiresNeeded: z.number().min(1).max(50),
          isOpen: z.boolean().optional(),
          // New required fields
          employmentType: z.enum([
            "Full-time",
            "Part-time",
            "Contract",
            "Internship",
          ]),
          workplaceType: z.enum(["Remote", "Hybrid", "On-site"]),
          location: z.string().min(1).max(255).optional(),
          // New optional fields
          benefits: z.string().optional(),
          // Salary fields
          salaryType: z.enum(["FIXED", "RANGE"]).optional(),
          fixedSalary: z.number().positive().optional(),
          salaryRangeMin: z.number().positive().optional(),
          salaryRangeMax: z.number().positive().optional(),
          salaryCurrency: z.string().max(10).optional().default("USD"),
        })
        .refine(
          (data) => {
            // Location is required for Hybrid and On-site workplace types
            if (
              data.workplaceType === "Hybrid" ||
              data.workplaceType === "On-site"
            ) {
              return data.location !== undefined && data.location.length > 0;
            }
            return true;
          },
          {
            message:
              "Location is required for Hybrid and On-site workplace types",
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
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify the job belongs to the user
      const existingJob = await ctx.db.job.findUnique({
        where: { id, createdById: ctx.session.user.id },
      });

      if (!existingJob) {
        throw new Error(
          "Job not found or you don't have permission to edit it",
        );
      }

      const job = await ctx.db.job.update({
        where: { id },
        data: updateData,
      });
      return job;
    }),

  // Public routes for job listings
  getAllPublic: publicProcedure.query(async ({ ctx }) => {
    const jobs = await ctx.db.job.findMany({
      where: { isOpen: true },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            applicants: true,
          },
        },
      },
    });

    // Convert Decimal fields to numbers for display
    return jobs.map((job) => ({
      ...job,
      skillsWeight: Number(job.skillsWeight),
      experienceWeight: Number(job.experienceWeight),
      educationWeight: Number(job.educationWeight),
      timezoneWeight: Number(job.timezoneWeight),
      fixedSalary: job.fixedSalary ? Number(job.fixedSalary) : null,
      salaryRangeMin: job.salaryRangeMin ? Number(job.salaryRangeMin) : null,
      salaryRangeMax: job.salaryRangeMax ? Number(job.salaryRangeMax) : null,
    }));
  }),

  getByIdPublic: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.job.findUnique({
        where: { id: input.id, isOpen: true },
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              applicants: true,
            },
          },
        },
      });

      if (!job) {
        return null;
      }

      // For public view, convert Decimal fields to numbers for display
      return {
        ...job,
        skillsWeight: Number(job.skillsWeight),
        experienceWeight: Number(job.experienceWeight),
        educationWeight: Number(job.educationWeight),
        timezoneWeight: Number(job.timezoneWeight),
        fixedSalary: job.fixedSalary ? Number(job.fixedSalary) : null,
        salaryRangeMin: job.salaryRangeMin ? Number(job.salaryRangeMin) : null,
        salaryRangeMax: job.salaryRangeMax ? Number(job.salaryRangeMax) : null,
      };
    }),

  queueScoringAll: externalAIProcedure
    .input(
      z.object({
        jobId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: {
          applicants: true,
        },
      });

      if (!job) {
        throw new Error("Job not found");
      }

      // Filter applicants that have resumes
      const applicantsToProcess = job.applicants.filter(
        (applicant) => applicant.resume,
      );

      if (applicantsToProcess.length === 0) {
        throw new Error("No applicants with resumes to process");
      }

      // Queue all applicants for resume processing
      const queuePromises = applicantsToProcess.map(async (applicant) => {
        // Update statusAI to 'pending'
        await ctx.db.applicant.update({
          where: { id: applicant.id },
          data: { statusAI: "pending" },
        });

        // Add to queue - we've already filtered for applicants with resumes
        return resumeQueue.add("process-resume", {
          applicantId: applicant.id,
          resumePath: applicant.resume,
        });
      });

      await Promise.all(queuePromises);

      return {
        success: true,
        queued: applicantsToProcess.length,
      };
    }),

  reScoreApplicants: protectedProcedure
    .input(
      z.object({
        jobId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId, createdById: ctx.session.user.id },
        include: {
          applicants: {
            include: { experiences: true },
          },
        },
      });

      if (!job) {
        throw new Error(
          "Job not found or you don't have permission to access it",
        );
      }

      // Filter applicants that are not pending and have completed processing
      const applicantsToProcess = job.applicants.filter(
        (applicant) => applicant.statusAI !== "pending",
      );

      if (applicantsToProcess.length === 0) {
        throw new Error("No applicants ready for rescoring");
      }

      // Queue all applicants for rescoring
      const queuePromises = applicantsToProcess.map(async (applicant) => {
        // Set statusAI to 'processing'
        await ctx.db.applicant.update({
          where: { id: applicant.id },
          data: { statusAI: "processing" },
        });

        return resumeQueue.add("score-applicant", {
          applicantId: applicant.id,
          applicantData: JSON.stringify(applicant),
          jobData: JSON.stringify(job),
        });
      });

      await Promise.all(queuePromises);

      return {
        success: true,
        queued: applicantsToProcess.length,
      };
    }),
});
