import React from "react";
import { api } from "~/trpc/server";
import { Badge } from "~/app/_components/ui/badge";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardHeader } from "~/app/_components/ui/card";
import {
  Clock,
  GraduationCap,
  MapPin,
  Users,
  Building,
  Calendar,
  ArrowLeft,
  Briefcase,
  Home,
  DollarSign,
  Gift,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyForm } from "./_components/apply-form";

interface PublicJobPageProps {
  params: Promise<{ id: string }>;
}

const PublicJobPage = async ({ params }: PublicJobPageProps) => {
  const { id } = await params;
  const jobId = parseInt(id);

  if (isNaN(jobId)) {
    notFound();
  }

  const job = await api.job.getByIdPublic({ id: jobId });

  if (!job) {
    notFound();
  }

  const skills = job.skills.split(", ").filter(Boolean);
  const applicationCount = job._count.applicants;
  const positionsRemaining = job.hiresNeeded - job.hires;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          <div>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{job.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    <Briefcase className="mr-1 h-4 w-4" />
                    {job.employmentType}
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    <Home className="mr-1 h-4 w-4" />
                    {job.workplaceType}
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    <MapPin className="mr-1 h-4 w-4" />
                    {job.location}
                  </Badge>
                </div>
                <div className="text-muted-foreground mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{job.createdBy.name ?? "Anonymous Company"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant="default" className="shrink-0">
                Open
              </Badge>
            </div>
          </div>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Job Description</h2>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Required Skills */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Required Skills</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="px-3 py-1 text-sm"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Requirements</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Experience</div>
                    <div className="text-muted-foreground text-sm">
                      {job.yearsOfExperience}+ years required
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Education</div>
                    <div className="text-muted-foreground text-sm">
                      {job.educationDegree} degree in {job.educationField}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">Timezone</div>
                    <div className="text-muted-foreground text-sm">
                      {job.timezone} timezone
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium">Positions</div>
                    <div className="text-muted-foreground text-sm">
                      {positionsRemaining} position/s available
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          {job.benefits && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  <Gift className="mr-2 inline h-5 w-5 text-amber-500" />
                  Benefits & Perks
                </h2>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {job.benefits}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Application Stats</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total Applications
                </span>
                <span className="font-medium">{applicationCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Positions Available
                </span>
                <span className="font-medium">{positionsRemaining}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hires Made</span>
                <span className="font-medium">{job.hires}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Needed</span>
                <span className="font-medium">{job.hiresNeeded}</span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Job Info */}
          {(job.salaryType === "FIXED" && job.fixedSalary) ||
          (job.salaryType === "RANGE" &&
            job.salaryRangeMin &&
            job.salaryRangeMax) ? (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Job Details</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="mt-0.5 h-5 w-5 text-emerald-500" />
                  <div>
                    <div className="text-sm font-medium">
                      {job.salaryType === "FIXED"
                        ? "Fixed Salary"
                        : "Salary Range"}
                    </div>
                    <div className="text-muted-foreground text-sm font-medium">
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
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Apply Section */}
          <ApplyForm
            jobId={jobId}
            jobTitle={job.title}
            salaryType={job.salaryType}
            salaryCurrency={job.salaryCurrency}
            workplaceType={job.workplaceType}
            jobLocation={job.location}
          />

          {/* Company Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Posted By</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                  <Building className="text-muted-foreground h-6 w-6" />
                </div>
                <div>
                  <div className="font-medium">
                    {job.createdBy.name ?? "Anonymous Company"}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicJobPage;
