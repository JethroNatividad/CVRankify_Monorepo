"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/app/_components/ui/dialog";

interface BulkUploadTestProps {
  jobId: number;
}

export function BulkUploadTest({ jobId }: BulkUploadTestProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const bulkUploadMutation = api.applicant.bulkUploadTestResumes.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Successfully created ${data.count} test applicant${data.count > 1 ? "s" : ""}`,
      );
      setOpen(false);
      setFiles([]);
      // Refresh the page to show new applicants
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Failed to upload: ${error.message}`);
      setUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setUploading(true);

    try {
      // Upload files to MinIO
      const uploadedResumes: Array<{
        minioPath: string;
        originalFileName: string;
      }> = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        // Use filename without extension as applicant name
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        formData.append("applicantName", nameWithoutExt);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = (await response.json()) as { fileName: string };
        uploadedResumes.push({
          minioPath: data.fileName,
          originalFileName: file.name,
        });
      }

      // Call the bulk upload mutation
      bulkUploadMutation.mutate({
        jobId,
        resumes: uploadedResumes,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload files",
      );
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Test Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Test Upload</DialogTitle>
          <DialogDescription>
            Upload multiple resumes for testing. Each file will create a test
            applicant with the name as the filename (without extension) and
            email as the filename@testmail.com
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="files"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select Resume Files
            </label>
            <input
              id="files"
              type="file"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={handleFileChange}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              disabled={uploading}
            />
            {files.length > 0 && (
              <p className="text-muted-foreground text-sm">
                {files.length} file{files.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {files.length > 0 && `(${files.length})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
