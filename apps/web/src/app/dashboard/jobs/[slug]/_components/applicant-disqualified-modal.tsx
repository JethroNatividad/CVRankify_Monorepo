"use client";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "~/app/_components/ui/dialog";
import { Button } from "~/app/_components/ui/button";
import { Printer, AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import type {
  SerializedApplicantWithIncludes,
  SerializedJob,
} from "~/lib/types";

type Props = {
  job: SerializedJob;
  applicant: SerializedApplicantWithIncludes;
  children: React.ReactNode;
};

function formatProcessTime(
  parsingMs: number | null,
  scoringMs: number | null,
): string {
  const totalMs = (parsingMs ?? 0) + (scoringMs ?? 0);
  if (totalMs === 0) return "Unknown";

  if (totalMs < 1000) {
    return `${totalMs}ms`;
  } else {
    const seconds = (totalMs / 1000).toFixed(2);
    return `${seconds}s`;
  }
}

export default function ApplicantDisqualifiedModal({
  job,
  applicant,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Disqualified Applicant - ${applicant.email}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.3;
              color: #1a1a1a;
              padding: 12px;
              max-width: 800px;
              margin: 0 auto;
              font-size: 11px;
            }
            h1 {
              font-size: 16px;
              margin-bottom: 2px;
            }
            .description {
              color: #666;
              font-size: 10px;
              margin-bottom: 10px;
            }
            .alert {
              background: #fee2e2;
              border: 1px solid #fecaca;
              border-radius: 4px;
              padding: 8px 10px;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .alert-text {
              font-size: 10px;
              color: #991b1b;
            }
            section {
              margin-bottom: 10px;
            }
            h3 {
              font-size: 9px;
              text-transform: uppercase;
              color: #666;
              font-weight: 600;
              margin-bottom: 4px;
            }
            .section-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 4px;
            }
            .points {
              font-size: 10px;
              font-weight: 600;
              color: #2563eb;
            }
            .card {
              border: 1px solid #e5e5e5;
              border-radius: 4px;
              padding: 6px 8px;
              font-size: 10px;
            }
            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .skill-item {
              padding: 3px 0;
              border-bottom: 1px solid #eee;
            }
            .skill-item:last-child {
              border-bottom: none;
            }
            .skill-name {
              font-weight: 500;
              font-size: 10px;
            }
            .skill-reason {
              font-size: 9px;
              color: #666;
            }
            .badge {
              display: inline-block;
              padding: 1px 5px;
              border-radius: 3px;
              font-size: 9px;
              font-weight: 500;
            }
            .badge-green {
              background: #dcfce7;
              color: #166534;
            }
            .badge-blue {
              background: #dbeafe;
              color: #1d4ed8;
            }
            .badge-red {
              background: #fee2e2;
              color: #b91c1c;
            }
            .badge-gray {
              background: #f3f4f6;
              color: #4b5563;
            }
            .text-muted {
              color: #666;
            }
            .experience-item {
              padding: 6px 8px;
              border: 1px solid #e5e5e5;
              border-radius: 4px;
              margin-bottom: 4px;
            }
            .experience-item.relevant {
              border-left: 3px solid #22c55e;
            }
            .job-title {
              font-weight: 500;
              font-size: 10px;
            }
            .date-range {
              font-size: 9px;
              color: #666;
            }
            @media print {
              body {
                padding: 8px;
              }
              section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <h1>${applicant.email}</h1>
          <p class="description">Disqualified - Missing Critical Skills</p>
          
          <div class="alert">
            <span class="alert-text">⚠️ This candidate was automatically disqualified because they did not meet critical skill requirements.</span>
          </div>

          <section>
            <div class="section-header">
              <h3>Skills Match</h3>
              <span class="points">${applicant.skillsScoreAI?.toString() ?? "-"} pts</span>
            </div>
            <div class="card">
              ${applicant.matchedSkills
                .map(
                  (s) => `
                <div class="skill-item">
                  <div class="card-header">
                    <div>
                      <span class="skill-name">${s.jobSkill}</span>
                      <span class="skill-reason"> - ${s.reason}${s.matchType === "implied" && s.applicantSkill ? ` <span style="color: #2563eb">(from ${s.applicantSkill})</span>` : ""}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="font-size: 9px; color: #666;">${(Number(s.score) * 100).toFixed(0)}%</span>
                      <span class="badge ${s.matchType === "explicit" ? "badge-green" : s.matchType === "implied" ? "badge-blue" : "badge-red"}">${s.matchType.charAt(0).toUpperCase() + s.matchType.slice(1)}</span>
                    </div>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </section>

          <section>
            <div class="section-header">
              <h3>Experiences <span style="font-weight: normal; text-transform: none;">(Total: ${Number(applicant.parsedYearsOfExperience ?? 0)} yrs)</span></h3>
              <span class="points text-muted">-</span>
            </div>
            ${
              applicant.experiences.length > 0
                ? applicant.experiences
                    .map(
                      (exp) => `
                <div class="experience-item ${exp.relevant ? "relevant" : ""}">
                  <div class="card-header">
                    <div>
                      <span class="job-title">${exp.jobTitle}</span>
                      <span class="date-range"> · ${exp.startMonth} ${exp.startYear} – ${exp.endMonth !== "None" ? exp.endMonth : "Present"} ${exp.endYear !== "Present" ? exp.endYear : ""}</span>
                    </div>
                    <span class="badge ${exp.relevant ? "badge-green" : "badge-gray"}">${exp.relevant ? "-" : "-"}</span>
                  </div>
                </div>
              `,
                    )
                    .join("")
                : '<p style="color: #666; font-size: 10px;">No experiences found.</p>'
            }
          </section>

          <section>
            <div class="section-header">
              <h3>Education</h3>
              <span class="points text-muted">-</span>
            </div>
            <div class="card">
              ${applicant.parsedHighestEducationDegree} in ${applicant.parsedEducationField}
            </div>
          </section>

          <section>
            <div class="section-header">
              <h3>Timezone</h3>
              <span class="points text-muted">-</span>
            </div>
            <div class="card">
              ${applicant.parsedTimezone}
            </div>
          </section>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>{applicant.email}</DialogTitle>
              <DialogDescription>
                Disqualified - Missing Critical Skills
              </DialogDescription>
              <p className="text-muted-foreground mt-1 text-xs">
                Process Time:{" "}
                {formatProcessTime(
                  applicant.parsingTimeMsAI,
                  applicant.scoringTimeMsAI,
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="mr-6 flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogHeader>

        <div ref={printRef} className="mt-4 space-y-6">
          {/* Alert Banner */}
          <div className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>
              This candidate was automatically disqualified before full AI
              evaluation because they did not meet critical skill requirements.
            </span>
          </div>

          {/* 🧩 Skills Match */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                Skills Match
              </h3>
              <span className="text-primary text-sm font-semibold">
                {applicant.skillsScoreAI?.toString() ?? "-"} pts
              </span>
            </div>
            <div className="bg-muted/30 space-y-2 rounded-md border p-3 text-sm">
              {applicant.matchedSkills.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 border-b pb-2 last:border-none last:pb-0"
                >
                  <div className="flex-1">
                    <div className="font-medium">{s.jobSkill}</div>
                    <div className="text-muted-foreground text-xs">
                      {s.reason}
                      {s.matchType === "implied" && s.applicantSkill && (
                        <span className="ml-1 text-blue-600">
                          (implied from {s.applicantSkill})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium">
                      {Number(s.score) *
                        (job.skills.find((skill) => skill.name === s.jobSkill)
                          ?.weight ?? 0)}
                      /
                      {job.skills.find((skill) => skill.name === s.jobSkill)
                        ?.weight ?? 0}
                    </span>
                    <div
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        s.matchType === "explicit"
                          ? "bg-green-100 text-green-700"
                          : s.matchType === "implied"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700",
                      )}
                    >
                      {s.matchType.charAt(0).toUpperCase() +
                        s.matchType.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 💼 Experiences */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                Experiences
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-xs">
                  Total: {Number(applicant.parsedYearsOfExperience ?? 0)} years
                </span>
                <span className="text-muted-foreground text-sm font-semibold">
                  -
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {applicant.experiences.length > 0 ? (
                applicant.experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className={cn(
                      "bg-muted/30 flex items-center justify-between rounded-md border p-3 text-sm",
                      exp.relevant ? "border-l-4 border-l-green-500" : "",
                    )}
                  >
                    <div>
                      <div className="font-medium">{exp.jobTitle}</div>
                      <div className="text-muted-foreground text-xs">
                        {exp.startMonth} {exp.startYear} –{" "}
                        {exp.endMonth !== "None" ? exp.endMonth : "Present"}{" "}
                        {exp.endYear !== "Present" ? exp.endYear : ""}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        exp.relevant
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {exp.relevant ? "Relevant" : "-"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No experiences found.
                </p>
              )}
            </div>
          </section>

          {/* 🎓 Education */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                Education
              </h3>
              <span className="text-muted-foreground text-sm font-semibold">
                -
              </span>
            </div>
            <div className="bg-muted/30 flex justify-between rounded-md border p-3 text-sm">
              <span>
                {applicant.parsedHighestEducationDegree} in{" "}
                {applicant.parsedEducationField}
              </span>
            </div>
          </section>

          {/* 🌐 Timezone */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                Timezone Compatibility
              </h3>
              <span className="text-muted-foreground text-sm font-semibold">
                -
              </span>
            </div>
            <div className="bg-muted/30 flex justify-between rounded-md border p-3 text-sm">
              <span>{applicant.parsedTimezone}</span>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
