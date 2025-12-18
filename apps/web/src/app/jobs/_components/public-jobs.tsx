"use client";

import React from "react";
import { Button } from "~/app/_components/ui/button";
import { Skeleton } from "~/app/_components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/app/_components/ui/card";
import { api } from "~/trpc/react";
import PublicJobCard from "./public-job-card";
import { BriefcaseIcon, Search } from "lucide-react";
import { Input } from "~/app/_components/ui/input";

const PublicJobs = () => {
  const { data: jobs, isLoading, error } = api.job.getAllPublic.useQuery();
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filter jobs based on search term
  const filteredJobs = React.useMemo(() => {
    if (!jobs || !searchTerm) return jobs;

    const term = searchTerm.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.skills.toLowerCase().includes(term) ||
        job.createdBy.name?.toLowerCase().includes(term),
    );
  }, [jobs, searchTerm]);

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
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Available Jobs</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Discover exciting career opportunities
        </p>
      </div>

      {/* Search Bar */}
      <div className="mx-auto mb-6 max-w-md">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search jobs by title, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <PublicJobsLoadingSkeleton />
      ) : filteredJobs && filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <PublicJobCard key={job.id} job={job} />
          ))}
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="py-12 text-center">
          <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
            <Search className="text-muted-foreground h-12 w-12" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No jobs found</h3>
          <p className="text-muted-foreground mx-auto mb-6 max-w-md">
            No jobs match your search criteria. Try adjusting your search terms.
          </p>
          <Button variant="outline" onClick={() => setSearchTerm("")}>
            Clear Search
          </Button>
        </div>
      ) : (
        <EmptyJobsState />
      )}
    </div>
  );
};

// Loading skeleton component
function PublicJobsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <Card key={i} className="h-full">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-1 h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-18" />
              </div>
            </div>
            <div className="flex justify-between border-t pt-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
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
      <h3 className="mb-2 text-xl font-semibold">No jobs available</h3>
      <p className="text-muted-foreground mx-auto mb-6 max-w-md">
        There are no open job position/s at the moment. Check back later for new
        opportunities.
      </p>
    </div>
  );
}

export default PublicJobs;
