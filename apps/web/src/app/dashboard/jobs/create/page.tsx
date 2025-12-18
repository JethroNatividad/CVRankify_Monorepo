import React from "react";
import CreateJobForm from "./_components/create-job-form";

const CreateJobPage = () => {
  return (
    <div className="container mx-auto px-6   py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Job</h1>
          <p className="text-muted-foreground mt-2">
            Add a new job posting to your organization
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <CreateJobForm />
        </div>
      </div>
    </div>
  );
};

export default CreateJobPage;
