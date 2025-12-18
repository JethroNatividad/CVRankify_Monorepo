import React from "react";
import { api } from "~/trpc/server";
import { Badge } from "~/app/_components/ui/badge";
import { Button } from "~/app/_components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/app/_components/ui/collapsible";
import {
  ChevronDown,
  Clock,
  GraduationCap,
  MapPin,
  Users,
  Edit,
  Briefcase,
  Home,
  DollarSign,
  Gift,
} from "lucide-react";
import Link from "next/link";
import { ExpandableDescription } from "./_components/expandable-description";
import { ApplicantsTable } from "./_components/applicants-table";

interface JobPageProps {
  params: Promise<{ slug: string }>;
}

const JobPage = async ({ params }: JobPageProps) => {
  const { slug } = await params;
  const jobId = parseInt(slug);

  if (isNaN(jobId)) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold">Invalid Job ID</h1>
                <Badge variant="destructive">Error</Badge>
              </div>
              <p className="text-muted-foreground">
                The provided job ID is not valid
              </p>
            </div>
          </div>

          {/* Error Details */}
          <div className="rounded-lg border">
            <div className="p-6 text-center">
              <div className="space-y-4">
                <div className="text-lg font-medium text-red-600">
                  Invalid Job ID Provided
                </div>
                <p className="text-muted-foreground">
                  The job ID in the URL is not a valid number. Please check the
                  URL and try again.
                </p>
                <Button asChild>
                  <Link href="/dashboard/">
                    <Edit className="mr-2 h-4 w-4" />
                    Back to Jobs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const job = await api.job.getById({ id: jobId });

  if (!job) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold">Job Not Found</h1>
                <Badge variant="destructive">Error</Badge>
              </div>
              <p className="text-muted-foreground">
                Job ID #{jobId} could not be found
              </p>
            </div>
          </div>

          {/* Error Details */}
          <div className="rounded-lg border">
            <div className="p-6 text-center">
              <div className="space-y-4">
                <div className="text-lg font-medium text-red-600">
                  Job Not Found
                </div>
                <p className="text-muted-foreground">
                  The job you&apos;re looking for doesn&apos;t exist or you
                  don&apos;t have permission to view it.
                </p>
                <Button asChild>
                  <Link href="/dashboard/">
                    <Edit className="mr-2 h-4 w-4" />
                    Back to Jobs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const skills = job.skills.split(", ").filter(Boolean);
  const applicationCount = job.applicants?.length || 0;

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <Badge variant={job.isOpen ? "default" : "secondary"}>
                {job.isOpen ? "Open" : "Closed"}
              </Badge>
            </div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Briefcase className="mr-1 h-3 w-3" />
                {job.employmentType}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Home className="mr-1 h-3 w-3" />
                {job.workplaceType}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <MapPin className="mr-1 h-3 w-3" />
                {job.location}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {applicationCount} applications • Updated{" "}
              {new Date(job.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <Button asChild>
            <Link href={`/dashboard/jobs/${jobId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>

        <Collapsible defaultOpen>
          <div className="rounded-lg border">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="hover:bg-muted/50 flex w-full justify-between p-4 text-left text-base font-medium"
              >
                Job Details & Requirements
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pt-2 pb-4">
              <div className="space-y-4 text-sm">
                {/* Requirements Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Requirements
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-sm">
                          {job.yearsOfExperience}+ years experience
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-sm">
                          {job.educationDegree} degree in {job.educationField}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-sm">{job.timezone} timezone</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Progress
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-sm">
                          {job.hires}/{job.hiresNeeded} positions filled
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 rounded-full bg-emerald-500" />
                        <span className="text-sm">
                          {applicationCount} total applications
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 rounded-full bg-amber-500" />
                        <span className="text-sm">
                          {Math.round(
                            ((job.hiresNeeded - job.hires) / job.hiresNeeded) *
                              100,
                          )}
                          % remaining
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills & Weights Combined */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                      Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-2 py-0.5 text-xs font-medium"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                      Evaluation Weights
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-blue-600">
                          {Number(Number(job.skillsWeight) * 100).toFixed(0)}%
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Skills
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-green-600">
                          {Number(Number(job.experienceWeight) * 100).toFixed(
                            0,
                          )}
                          %
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Experience
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-purple-600">
                          {Number(Number(job.educationWeight) * 100).toFixed(0)}
                          %
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Education
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-orange-600">
                          {Number(Number(job.timezoneWeight) * 100).toFixed(0)}%
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Timezone
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                    Job Description
                  </h4>
                  <ExpandableDescription
                    description={job.description}
                    maxLength={200}
                  />
                </div>

                {/* Salary */}
                {((job.salaryType === "FIXED" && job.fixedSalary) ??
                  (job.salaryType === "RANGE" &&
                    job.salaryRangeMin &&
                    job.salaryRangeMax)) && (
                  <div>
                    <h4 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                      <DollarSign className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />
                      {job.salaryType === "FIXED"
                        ? "Fixed Salary"
                        : "Salary Range"}
                    </h4>
                    <p className="text-sm font-medium">
                      {job.salaryType === "FIXED" && job.fixedSalary && (
                        <span>
                          {job.salaryCurrency ?? "USD"}{" "}
                          {Number(job.fixedSalary).toLocaleString()}
                        </span>
                      )}
                      {job.salaryType === "RANGE" &&
                        job.salaryRangeMin &&
                        job.salaryRangeMax && (
                          <span>
                            {job.salaryCurrency ?? "USD"}{" "}
                            {Number(job.salaryRangeMin).toLocaleString()} -{" "}
                            {Number(job.salaryRangeMax).toLocaleString()}
                          </span>
                        )}
                    </p>
                  </div>
                )}

                {/* Benefits */}
                {job.benefits && (
                  <div>
                    <h4 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                      <Gift className="mr-1 inline h-3.5 w-3.5 text-amber-500" />
                      Benefits & Perks
                    </h4>
                    <ExpandableDescription
                      description={job.benefits}
                      maxLength={200}
                    />
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <ApplicantsTable job={job} />
      </div>
    </div>
  );
};

export default JobPage;
