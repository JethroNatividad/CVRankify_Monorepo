import React from "react";
import EditJobForm from "./_components/edit-job-form";
import { api } from "~/trpc/server";

interface EditJobPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { slug } = await params;
  const jobId = parseInt(slug);

  if (isNaN(jobId)) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Edit Job</h1>
            <p className="text-muted-foreground mt-2">
              Update your job posting details and requirements
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <div className="py-8 text-center">
              <p className="text-red-500">Invalid job ID provided</p>
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
          <div>
            <h1 className="text-3xl font-bold">Edit Job</h1>
            <p className="text-muted-foreground mt-2">
              Update your job posting details and requirements
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <div className="py-8 text-center">
              <p className="text-red-500">Job not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log("JOB FROM SERVER", job);

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Job</h1>
          <p className="text-muted-foreground mt-2">
            Update your job posting details and requirements
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <EditJobForm job={job} />
        </div>
      </div>
    </div>
  );
}
