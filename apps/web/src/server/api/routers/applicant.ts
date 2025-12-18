import { z } from "zod";
import { resumeQueue } from "~/lib/queue";
import { getFileUrl } from "~/lib/minio";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  externalAIProcedure,
} from "~/server/api/trpc";

export const applicantRouter = createTRPCRouter({
  getResumeUrl: protectedProcedure
    .input(
      z.object({
        applicantId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const applicant = await ctx.db.applicant.findUnique({
        where: { id: input.applicantId },
      });

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      if (!applicant.resume) {
        throw new Error("No resume found for this applicant");
      }

      // Get presigned URL from MinIO
      const url = await getFileUrl(applicant.resume);

      return { url };
    }),

  applyJob: publicProcedure
    .input(
      z.object({
        jobId: z.number(),
        name: z.string().min(1, "Name is required").max(255),
        email: z.string().email("Valid email is required").max(255),
        resumeFileName: z.string().min(1, "Resume file name is required"),
        expectedSalary: z.number().positive().optional(),
        willingToRelocate: z.boolean().optional(),
        applicantLocation: z.string().max(255).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First verify the job exists and is open
      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId, isOpen: true },
      });

      if (!job) {
        throw new Error("Job not found or is no longer accepting applications");
      }

      // Check if user has already applied to this job
      const existingApplication = await ctx.db.applicant.findFirst({
        where: {
          jobId: input.jobId,
          email: input.email,
        },
      });

      if (existingApplication) {
        throw new Error("You have already applied to this position");
      }

      // Create the applicant
      const applicant = await ctx.db.applicant.create({
        data: {
          name: input.name,
          email: input.email,
          resume: input.resumeFileName, // Store the MinIO file path/name
          jobId: input.jobId,
          expectedSalary: input.expectedSalary,
          willingToRelocate: input.willingToRelocate,
          applicantLocation: input.applicantLocation,
          statusAI: "pending",
          interviewStatus: "pending",
          skillsScoreAI: 0.0,
          experienceScoreAI: 0.0,
          educationScoreAI: 0.0,
          timezoneScoreAI: 0.0,
          overallScoreAI: 0.0,
        },
      });

      await resumeQueue.add("process-resume", {
        applicantId: applicant.id,
        resumePath: input.resumeFileName,
      });

      return { success: true, id: applicant.id };
    }),

  updateStatusAI: externalAIProcedure
    .input(
      z.object({
        applicantId: z.number(),
        statusAI: z.enum([
          "pending",
          "parsing",
          "processing",
          "completed",
          "failed",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const applicant = await ctx.db.applicant.update({
        where: { id: input.applicantId },
        data: { statusAI: input.statusAI },
      });

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      return { success: true };
    }),

  reQueueResumeProcessing: externalAIProcedure
    .input(
      z.object({
        applicantId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const applicant = await ctx.db.applicant.findUnique({
        where: { id: input.applicantId },
      });

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      if (!applicant.resume) {
        throw new Error("Applicant does not have a resume on file");
      }

      // Re-add to the queue
      await resumeQueue.add("process-resume", {
        applicantId: applicant.id,
        resumePath: applicant.resume,
      });

      // Update statusAI to 'pending' if it was 'failed'
      await ctx.db.applicant.update({
        where: { id: applicant.id },
        data: { statusAI: "pending" },
      });

      return { success: true };
    }),

  updateParsedDataAI: externalAIProcedure
    .input(
      z.object({
        applicantId: z.number(),
        parsedHighestEducationDegree: z.string().max(100).optional(),
        parsedEducationField: z.string().max(100).optional(),
        parsedTimezone: z.string().max(100).optional(),
        parsedSkills: z.string().optional(), // Comma-separated list
        parsedYearsOfExperience: z.number().min(0).optional(),
        parsedExperiences: z
          .array(
            z.object({
              jobTitle: z.string().max(255),
              startYear: z.string(),
              endYear: z.string().optional(),
              startMonth: z.string(),
              endMonth: z.string().optional(),
              relevant: z.boolean().optional(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Use a transaction to update applicant and create experiences atomically
      await ctx.db.$transaction(async (tx) => {
        // Update applicant with parsed data
        const applicant = await tx.applicant.update({
          where: { id: input.applicantId },
          data: {
            parsedHighestEducationDegree: input.parsedHighestEducationDegree,
            parsedEducationField: input.parsedEducationField,
            parsedTimezone: input.parsedTimezone,
            parsedSkills: input.parsedSkills,
            parsedYearsOfExperience: input.parsedYearsOfExperience,
          },
        });

        if (!applicant) {
          throw new Error("Applicant not found");
        }

        // If experiences are provided, delete old ones and create new ones
        if (input.parsedExperiences && input.parsedExperiences.length > 0) {
          // Delete existing experiences for this applicant
          await tx.experience.deleteMany({
            where: { applicantId: input.applicantId },
          });

          // Create new experiences
          await tx.experience.createMany({
            data: input.parsedExperiences.map((exp) => ({
              applicantId: input.applicantId,
              jobTitle: exp.jobTitle,
              startYear: exp.startYear,
              endYear: exp.endYear ?? null,
              startMonth: exp.startMonth,
              endMonth: exp.endMonth ?? null,
              relevant: exp.relevant ?? false,
            })),
          });
        }
      });

      return { success: true };
    }),

  updateApplicantMatchedSkillsAI: externalAIProcedure
    .input(
      z.object({
        applicantId: z.number(),
        matchedSkills: z.array(
          z.object({
            jobSkill: z.string().max(255),
            matchType: z.enum(["explicit", "implied", "missing"]),
            applicantSkill: z.string().max(255),
            score: z.number().min(0),
            reason: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify applicant exists
      const applicant = await ctx.db.applicant.findUnique({
        where: { id: input.applicantId },
      });

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      // Use a transaction to delete old matched skills and create new ones
      await ctx.db.$transaction(async (tx) => {
        // Delete existing matched skills for this applicant
        await tx.matchedSkill.deleteMany({
          where: { applicantId: input.applicantId },
        });

        // Create new matched skills if provided
        if (input.matchedSkills.length > 0) {
          await tx.matchedSkill.createMany({
            data: input.matchedSkills.map((skill) => ({
              applicantId: input.applicantId,
              jobSkill: skill.jobSkill,
              matchType: skill.matchType,
              applicantSkill: skill.applicantSkill,
              score: skill.score,
              reason: skill.reason ?? null,
            })),
          });
        }
      });

      return { success: true };
    }),

  updateApplicantExperienceRelevanceAI: externalAIProcedure
    .input(
      z.object({
        applicantId: z.number(),
        experiences: z.array(
          z.object({
            id: z.number(),
            relevant: z.boolean(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify applicant exists
      const applicant = await ctx.db.applicant.findUnique({
        where: { id: input.applicantId },
      });

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      // Update each experience's relevant field individually
      await ctx.db.$transaction(
        input.experiences.map((exp) =>
          ctx.db.experience.update({
            where: {
              id: exp.id,
              applicantId: input.applicantId, // Ensure the experience belongs to this applicant
            },
            data: { relevant: exp.relevant },
          }),
        ),
      );

      return { success: true };
    }),

  updateApplicantScoresAI: externalAIProcedure
    .input(
      z.object({
        applicantId: z.number(),
        skillsScoreAI: z.number().min(0),
        experienceScoreAI: z.number().min(0),
        educationScoreAI: z.number().min(0),
        timezoneScoreAI: z.number().min(0),
        overallScoreAI: z.number().min(0),
        parsedYearsOfExperience: z.number().min(0).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("Updating applicant scores:", input);
      const applicant = await ctx.db.applicant.update({
        where: { id: input.applicantId },
        data: {
          skillsScoreAI: input.skillsScoreAI,
          experienceScoreAI: input.experienceScoreAI,
          educationScoreAI: input.educationScoreAI,
          timezoneScoreAI: input.timezoneScoreAI,
          overallScoreAI: input.overallScoreAI,
          parsedYearsOfExperience: input.parsedYearsOfExperience,
        },
      });

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      return { success: true };
    }),

  queueScoring: externalAIProcedure
    .input(
      z.object({
        applicantId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const applicant = await ctx.db.applicant.findUnique({
        where: { id: input.applicantId },
        include: { experiences: true },
      });

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      if (applicant.statusAI == "pending") {
        throw new Error("Applicant resume processing is not completed");
      }

      const job = await ctx.db.job.findUnique({
        where: { id: applicant.jobId },
      });

      console.log(applicant);

      if (!job) {
        throw new Error("Associated job not found");
      }

      // Set statusAI to 'processing'
      await ctx.db.applicant.update({
        where: { id: applicant.id },
        data: { statusAI: "processing" },
      });

      await resumeQueue.add("score-applicant", {
        applicantId: applicant.id,
        applicantData: JSON.stringify(applicant),
        jobData: JSON.stringify(job),
      });

      return { success: true };
    }),

  updateInterviewStatus: protectedProcedure
    .input(
      z.object({
        applicantId: z.number(),
        interviewStatus: z.enum([
          "pending",
          "scheduled",
          "passed",
          "failed",
          "hired",
          "rejected",
        ]),
        currentStage: z.number().min(0).optional(),
        interviewNotes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the applicant exists and belongs to a job owned by the user
      const applicant = await ctx.db.applicant.findUnique({
        where: { id: input.applicantId },
        include: { job: true },
      });

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      if (applicant.job.createdById !== ctx.session.user.id) {
        throw new Error("You do not have permission to update this applicant");
      }

      // Use a transaction to update applicant and job atomically
      const result = await ctx.db.$transaction(async (tx) => {
        // Update the applicant's interview status
        const updatedApplicant = await tx.applicant.update({
          where: { id: input.applicantId },
          data: {
            interviewStatus: input.interviewStatus,
            currentStage: input.currentStage,
            interviewNotes: input.interviewNotes,
          },
        });

        // If the applicant is being hired, increment the job's hires counter
        if (
          input.interviewStatus === "hired" &&
          applicant.interviewStatus !== "hired"
        ) {
          await tx.job.update({
            where: { id: applicant.jobId },
            data: {
              hires: { increment: 1 },
            },
          });
        }

        // If the applicant was previously hired but is now being set to another status, decrement hires
        if (
          applicant.interviewStatus === "hired" &&
          input.interviewStatus !== "hired"
        ) {
          await tx.job.update({
            where: { id: applicant.jobId },
            data: {
              hires: { decrement: 1 },
            },
          });
        }

        return updatedApplicant;
      });

      return { success: true, applicant: result };
    }),

  proceedToInterview: protectedProcedure
    .input(
      z.object({
        applicantId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the applicant exists and belongs to a job owned by the user
      const applicant = await ctx.db.applicant.findUnique({
        where: { id: input.applicantId },
        include: { job: true },
      });

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      if (applicant.job.createdById !== ctx.session.user.id) {
        throw new Error("You do not have permission to update this applicant");
      }

      // Increment the current stage and set status to scheduled
      const newStage = applicant.currentStage + 1;

      const updatedApplicant = await ctx.db.applicant.update({
        where: { id: input.applicantId },
        data: {
          currentStage: newStage,
          interviewStatus: "scheduled",
        },
      });

      return { success: true, applicant: updatedApplicant };
    }),
});
