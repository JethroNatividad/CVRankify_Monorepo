"use client";

import Link from "next/link";
import React from "react";
import { Button } from "~/app/_components/ui/button";
import { Skeleton } from "~/app/_components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/app/_components/ui/card";
import { api } from "~/trpc/react";
import JobCard from "./job-card";
import { PlusIcon, BriefcaseIcon } from "lucide-react";

const Jobs = () => {
  const { data: jobs, isLoading, error } = api.job.getAll.useQuery();

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="py-12 text-center">
          <p className="text-red-500">Error loading jobs: {error.message}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Jobs</h2>
          <p className="text-muted-foreground">
            Manage your job postings and track applications
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/jobs/create">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Job
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <JobsLoadingSkeleton />
      ) : jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyJobsState />
      )}
    </div>
  );
};

// Loading skeleton component
function JobsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <Card key={i} className="h-full">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-18" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="grid grid-cols-3 gap-3 border-t pt-3">
              <div className="space-y-1 text-center">
                <Skeleton className="mx-auto h-6 w-8" />
                <Skeleton className="mx-auto h-3 w-12" />
              </div>
              <div className="space-y-1 text-center">
                <Skeleton className="mx-auto h-6 w-8" />
                <Skeleton className="mx-auto h-3 w-16" />
              </div>
              <div className="space-y-1 text-center">
                <Skeleton className="mx-auto h-6 w-8" />
                <Skeleton className="mx-auto h-3 w-10" />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Empty state component
function EmptyJobsState() {
  return (
    <div className="py-12 text-center">
      <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
        <BriefcaseIcon className="text-muted-foreground h-12 w-12" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">No jobs posted yet</h3>
      <p className="text-muted-foreground mx-auto mb-6 max-w-md">
        Get started by creating your first job posting. You&apos;ll be able to
        track applications and manage candidates.
      </p>
      <Button asChild>
        <Link href="/dashboard/jobs/create">
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Your First Job
        </Link>
      </Button>
    </div>
  );
}

export default Jobs;
