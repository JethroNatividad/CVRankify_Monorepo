"use client";

import React from "react";
import {
  FileText,
  UserCheck,
  UserX,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "~/app/_components/ui/badge";
import { Button } from "~/app/_components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/app/_components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
import type { SerializedJob } from "~/lib/types";
import ApplicantEvaluationModal from "./applicant-evaluation-modal";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

interface ApplicantsTableProps {
  job: SerializedJob;
}

interface ScoreTooltipProps {
  score: number;
  label: string;
  feedback?: string | null;
  color: string;
}

function ScoreTooltip({ score, label, feedback, color }: ScoreTooltipProps) {
  if (!feedback) {
    return (
      <div className="text-center">
        <div className={`text-sm font-medium ${color}`}>{score} pts</div>
        <div className="text-muted-foreground text-xs">{label}</div>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-help text-center">
          <div className={`text-sm font-medium ${color}`}>{score} pts</div>
          <div className="text-muted-foreground text-xs">{label}</div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-medium">AI Feedback - {label}</p>
        <p className="text-sm">{feedback}</p>
      </TooltipContent>
    </Tooltip>
  );
}

const formatTimeAgo = (date: Date | string): string => {
  try {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) {
      return "Unknown";
    }
    const now = new Date();
    const diffInMs = now.getTime() - parsedDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "1 day ago";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? "1 month ago" : `${months} months ago`;
    }
  } catch {
    return "Unknown";
  }
};

function ViewResumeButton({ applicantId }: { applicantId: number }) {
  const handleViewResume = () => {
    // Open the resume via the API proxy route
    window.open(`/api/resume/${applicantId}`, "_blank");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleViewResume}
      className="w-full"
    >
      <FileText className="mr-2 h-4 w-4" />
      View
    </Button>
  );
}

interface InterviewStatusActionsProps {
  applicantId: number;
  currentStage: number;
  interviewStatus: string;
  statusAI: string;
  interviewsNeeded: number;
}

function InterviewStatusActions({
  applicantId,
  currentStage,
  interviewStatus,
  statusAI,
  interviewsNeeded,
}: InterviewStatusActionsProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const proceedToInterview = api.applicant.proceedToInterview.useMutation({
    onSuccess: () => {
      void utils.job.getById.invalidate();
      router.refresh();
    },
  });

  const updateInterviewStatus = api.applicant.updateInterviewStatus.useMutation(
    {
      onSuccess: () => {
        void utils.job.getById.invalidate();
        router.refresh();
      },
    },
  );

  // Don't show actions if AI processing is not complete
  if (statusAI !== "completed") {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  // If hired or rejected, show final state
  if (interviewStatus === "hired" || interviewStatus === "rejected") {
    return null;
  }

  const handleProceedToInterview = () => {
    proceedToInterview.mutate({ applicantId });
  };

  const handleHire = () => {
    updateInterviewStatus.mutate({
      applicantId,
      interviewStatus: "hired",
      currentStage,
    });
  };

  const handleReject = () => {
    updateInterviewStatus.mutate({
      applicantId,
      interviewStatus: "rejected",
      currentStage,
    });
  };

  const isLoading =
    proceedToInterview.isPending || updateInterviewStatus.isPending;

  const getInterviewLabel = () => {
    if (interviewsNeeded > 1) {
      return currentStage === 0
        ? "Proceed to Interview 1"
        : `Proceed to Interview ${currentStage + 1}`;
    }
    return "Proceed to Interview";
  };

  const isInInterview = currentStage > 0;
  const isLastInterview = currentStage >= interviewsNeeded;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Show proceed to interview if not at last stage */}
        {!isLastInterview && (
          <DropdownMenuItem onClick={handleProceedToInterview}>
            <Calendar className="mr-2 h-4 w-4 text-blue-600" />
            {getInterviewLabel()}
          </DropdownMenuItem>
        )}
        {/* Show hire option if in interview process */}
        {isInInterview && (
          <DropdownMenuItem onClick={handleHire}>
            <UserCheck className="mr-2 h-4 w-4 text-green-600" />
            Hire
          </DropdownMenuItem>
        )}
        {(isInInterview || !isLastInterview) && <DropdownMenuSeparator />}
        <DropdownMenuItem onClick={handleReject} className="text-red-600">
          <UserX className="mr-2 h-4 w-4" />
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ApplicantsTable({ job }: ApplicantsTableProps) {
  // Separate completed and non-completed applicants
  let { applicants } = job;

  const completedApplicants =
    applicants
      ?.filter((applicant) => applicant.statusAI === "completed")
      ?.sort(
        (a, b) =>
          (parseFloat(b.overallScoreAI?.toString() || "0") || 0) -
          (parseFloat(a.overallScoreAI?.toString() || "0") || 0),
      ) || [];

  const nonCompletedApplicants =
    applicants
      ?.filter((applicant) => applicant.statusAI !== "completed")
      ?.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ) || [];

  // Combine arrays with completed first, then non-completed
  applicants = [...completedApplicants, ...nonCompletedApplicants];

  if (!applicants?.length) {
    return (
      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-base font-medium">Applicants</h2>
            <p className="text-muted-foreground text-sm">No applications yet</p>
          </div>
        </div>
        <div className="text-muted-foreground p-6 text-center text-sm">
          <div className="space-y-2">
            <div className="text-foreground text-lg font-medium">
              No Applicants Yet
            </div>
            <p>Applications will appear here when candidates apply</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "scheduled":
        return "secondary";
      case "passed":
        return "default";
      case "failed":
        return "destructive";
      case "hired":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getAIStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white dark:bg-green-600";
      case "processing":
        return "bg-yellow-500 text-white dark:bg-yellow-600";
      case "pending":
        return "bg-gray-500 text-white dark:bg-gray-600";
      case "failed":
        return "bg-red-500 text-white dark:bg-red-600";
      default:
        return "outline";
    }
  };

  return (
    <TooltipProvider>
      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-base font-medium">Applicants</h2>
            <p className="text-muted-foreground text-sm">
              {applicants.length} total application
              {applicants.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {applicants.length} Applied
            </Badge>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Rank</TableHead>
                <TableHead className="w-[200px]">Applicant</TableHead>
                <TableHead className="w-[120px]">Overall Score</TableHead>
                <TableHead className="w-[100px]">AI Status</TableHead>
                <TableHead className="w-[120px]">Interview Status</TableHead>
                <TableHead className="w-[100px]">Applied</TableHead>
                <TableHead className="w-[300px]">Assessment</TableHead>
                <TableHead className="w-[100px]">Resume</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((applicant) => {
                const overallScore = parseFloat(
                  applicant.overallScoreAI?.toString() || "0",
                );
                const skillsScore = parseFloat(
                  applicant.skillsScoreAI?.toString() || "0",
                );
                const experienceScore = parseFloat(
                  applicant.experienceScoreAI?.toString() || "0",
                );
                const educationScore = parseFloat(
                  applicant.educationScoreAI?.toString() || "0",
                );
                const timezoneScore = parseFloat(
                  applicant.timezoneScoreAI?.toString() || "0",
                );

                // Only show rank for completed applicants
                const isCompleted = applicant.statusAI === "completed";
                const completedIndex = completedApplicants.findIndex(
                  (ca) => ca.id === applicant.id,
                );
                const rank = isCompleted ? completedIndex + 1 : null;

                return (
                  <TableRow key={applicant.id}>
                    <TableCell>
                      {rank ? (
                        <div className="text-primary text-lg font-bold">
                          #{rank}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">-</div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{applicant.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {applicant.email}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {applicant.statusAI === "completed" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help text-center">
                              <div className="text-lg font-semibold">
                                {overallScore} pts
                              </div>
                              <div className="text-muted-foreground text-xs">
                                Overall
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium">AI Feedback - Overall</p>
                            {applicant.overallFeedbackAI && (
                              <p className="text-sm">
                                {applicant.overallFeedbackAI}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <div className="text-muted-foreground text-center text-sm">
                          Pending
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getAIStatusColor(applicant.statusAI)}`}
                      >
                        {applicant.statusAI}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={getStatusColor(applicant.interviewStatus)}
                          className="text-xs"
                        >
                          {applicant.interviewStatus}
                        </Badge>
                        {applicant.currentStage > 0 && (
                          <span className="text-muted-foreground text-xs">
                            {job.interviewsNeeded > 1
                              ? `Interview ${applicant.currentStage}`
                              : "Interview"}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-muted-foreground text-sm">
                        {formatTimeAgo(applicant.createdAt)}
                      </div>
                    </TableCell>

                    <TableCell>
                      {applicant.statusAI === "completed" ? (
                        <ApplicantEvaluationModal
                          applicant={applicant}
                          job={job}
                        >
                          <div className="grid cursor-pointer grid-cols-4 gap-2 transition-opacity hover:opacity-70">
                            <ScoreTooltip
                              score={skillsScore}
                              label="Skills"
                              feedback={applicant.skillsFeedbackAI}
                              color="text-blue-600"
                            />
                            <ScoreTooltip
                              score={experienceScore}
                              label="Exp"
                              feedback={applicant.experienceFeedbackAI}
                              color="text-green-600"
                            />
                            <ScoreTooltip
                              score={educationScore}
                              label="Edu"
                              feedback={applicant.educationFeedbackAI}
                              color="text-purple-600"
                            />
                            <ScoreTooltip
                              score={timezoneScore}
                              label="Time"
                              feedback={applicant.timezoneFeedbackAI}
                              color="text-orange-600"
                            />
                          </div>
                        </ApplicantEvaluationModal>
                      ) : (
                        <div className="text-muted-foreground text-center text-sm">
                          Processing...
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <ViewResumeButton applicantId={applicant.id} />
                    </TableCell>

                    <TableCell>
                      <InterviewStatusActions
                        applicantId={applicant.id}
                        currentStage={applicant.currentStage}
                        interviewStatus={applicant.interviewStatus}
                        statusAI={applicant.statusAI}
                        interviewsNeeded={job.interviewsNeeded}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}
