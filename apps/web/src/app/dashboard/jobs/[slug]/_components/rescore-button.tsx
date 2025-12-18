"use client";

import { useState } from "react";
import { Button } from "~/app/_components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/app/_components/ui/dialog";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ReScoreButtonProps {
    jobId: number;
}

export function ReScoreButton({ jobId }: ReScoreButtonProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const utils = api.useUtils();

    const reScoreMutation = api.job.reScoreApplicants.useMutation({
        onSuccess: (data) => {
            toast.success(
                `Successfully queued ${data.queued} applicant${data.queued !== 1 ? "s" : ""} for rescoring`,
            );
            void utils.job.getById.invalidate();
            router.refresh();
            setOpen(false);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to rescore applicants");
        },
    });

    const handleReScore = () => {
        reScoreMutation.mutate({ jobId });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Re-Score Resumes
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Re-Score All Applicants?</DialogTitle>
                    <DialogDescription>
                        This will re-evaluate all applicants for this job using the current
                        job requirements and weights. Existing scores will be recalculated.
                        This process may take a few moments.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={reScoreMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleReScore} disabled={reScoreMutation.isPending}>
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${reScoreMutation.isPending ? "animate-spin" : ""}`}
                        />
                        {reScoreMutation.isPending ? "Re-Scoring..." : "Confirm Re-Score"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}