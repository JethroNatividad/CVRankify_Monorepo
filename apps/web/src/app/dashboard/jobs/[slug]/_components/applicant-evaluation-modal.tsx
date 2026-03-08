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
import { Printer, GraduationCap, Briefcase, Code, Globe } from "lucide-react";
import { cn } from "~/lib/utils";
import type {
  SerializedApplicantWithIncludes,
  SerializedJob,
} from "~/lib/types";

// const job = {
//   title: "Frontend Developer",
//   skills: "React, TypeScript, JavaScript, HTML, CSS",
//   yearsOfExperience: 3,
//   educationDegree: "Bachelor",
//   educationField: "Computer Science",
//   timezone: "GMT-5",
// };

// const applicant = {
//   name: "Angelo",
//   email: "angelo@email.com",
//   parsedSkills: "HTML/CSS, Photoshop, Illustrator, Branding",
//   parsedHighestEducationDegree: "Bachelor",
//   parsedEducationField: "Graphic Design",
//   parsedTimezone: "GMT+8",
//   matchedSkills: [
//     {
//       jobSkill: "React",
//       matchType: "missing",
//       applicantSkill: "",
//       score: 0.0,
//       reason: "No related or similar skill found in CV",
//     },
//     {
//       jobSkill: "TypeScript",
//       matchType: "missing",
//       applicantSkill: "",
//       score: 0.0,
//       reason: "No related or similar skill found in CV",
//     },
//     {
//       jobSkill: "JavaScript",
//       matchType: "implied",
//       applicantSkill: "HTML/CSS",
//       score: 0.7,
//       reason: "Inferred from related web technology",
//     },
//     {
//       jobSkill: "HTML",
//       matchType: "explicit",
//       applicantSkill: "HTML/CSS",
//       score: 1.0,
//       reason: "Exact match between job skill and CV skill",
//     },
//     {
//       jobSkill: "CSS",
//       matchType: "explicit",
//       applicantSkill: "HTML/CSS",
//       score: 1.0,
//       reason: "Exact match between job skill and CV skill",
//     },
//   ],
//   experiences: [
//     {
//       id: 1,
//       jobTitle: "Graphic Artist",
//       startMonth: "April",
//       startYear: "2011",
//       endMonth: "None",
//       endYear: "Present",
//       relevant: true,
//     },
//     {
//       id: 2,
//       jobTitle: "Freelance Designer",
//       startMonth: "June",
//       startYear: "2009",
//       endMonth: "March",
//       endYear: "2011",
//       relevant: false,
//     },
//   ],
//   educationScoreAI: 94.0,
//   experienceScoreAI: 205.0,
//   skillsScoreAI: 22.73,
//   timezoneScoreAI: 25.0,
//   overallScoreAI: 91.89,
//   totalYearsOfExperience: 13.5,
// };

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

export default function ApplicantEvaluationModal({
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
          <title>Applicant Evaluation - ${applicant.email}</title>
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
            .table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #e5e5e5;
              font-size: 10px;
            }
            .table th, .table td {
              padding: 4px 6px;
              text-align: left;
              border: 1px solid #e5e5e5;
            }
            .table th {
              background: #f5f5f5;
              font-size: 9px;
              color: #666;
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
            .overall-score {
              border: 1px solid #dbeafe;
              background: #eff6ff;
              border-radius: 4px;
              padding: 8px 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 8px;
            }
            .overall-score h3 {
              font-size: 12px;
              color: #1a1a1a;
              text-transform: none;
              margin: 0;
            }
            .overall-score .score {
              font-size: 18px;
              font-weight: 700;
              color: #2563eb;
            }
            .score-breakdown {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 3px 12px;
              margin-top: 6px;
              font-size: 9px;
              color: #666;
            }
            .score-item {
              display: flex;
              justify-content: space-between;
            }
            .text-green {
              color: #16a34a;
              font-weight: 500;
            }
            .text-red {
              color: #dc2626;
            }
            .two-col {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
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
          <p class="description">Evaluation against job requirements</p>
          
          <section>
            <h3>Job Requirements vs Applicant</h3>
            <table class="table">
              <tr>
                <th>Criteria</th>
                <th>Job Requirement</th>
                <th>Applicant</th>
              </tr>
              <tr>
                <td><strong>Education</strong></td>
                <td>${job.educationDegree}${job.educationField ? ` in ${job.educationField}` : ""}</td>
                <td>${applicant.parsedHighestEducationDegree} in ${applicant.parsedEducationField}</td>
              </tr>
              <tr>
                <td><strong>Experience</strong></td>
                <td>${job.yearsOfExperience} years</td>
                <td class="${applicant.parsedYearsOfExperience !== null && Number(applicant.parsedYearsOfExperience) >= job.yearsOfExperience ? "text-green" : "text-red"}">${Number(applicant.parsedYearsOfExperience ?? 0)} years</td>
              </tr>
              <tr>
                <td><strong>Skills</strong></td>
                <td>${job.skills}</td>
                <td>${applicant.parsedSkills}</td>
              </tr>
              <tr>
                <td><strong>Timezone</strong></td>
                <td>${job.timezone}</td>
                <td>${applicant.parsedTimezone}</td>
              </tr>
            </table>
          </section>

          <section>
            <div class="section-header">
              <h3>Skills Match</h3>
              <span class="points">${applicant.skillsScoreAI.toString()} pts</span>
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
                      <span style="font-size: 9px; color: #666;">${Number(s.score) * (job.skills.find((skill) => skill.name === s.jobSkill)?.weight ?? 0)}/${job.skills.find((skill) => skill.name === s.jobSkill)?.weight ?? 0}</span>
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
              <span class="points">${applicant.experienceScoreAI.toString()} pts</span>
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
                    <span class="badge ${exp.relevant ? "badge-green" : "badge-gray"}">${exp.relevant ? "Relevant" : "Not Relevant"}</span>
                  </div>
                </div>
              `,
                    )
                    .join("")
                : '<p style="color: #666; font-size: 10px;">No experiences found.</p>'
            }
          </section>

          <div class="two-col">
            <section>
              <div class="section-header">
                <h3>Education Match</h3>
                <span class="points">${applicant.educationScoreAI.toString()} pts</span>
              </div>
              <div class="card">
                ${applicant.parsedHighestEducationDegree} in ${applicant.parsedEducationField}
              </div>
            </section>

            <section>
              <div class="section-header">
                <h3>Timezone</h3>
                <span class="points">${applicant.timezoneScoreAI.toString()} pts</span>
              </div>
              <div class="card">
                ${applicant.parsedTimezone}
              </div>
            </section>
          </div>

          <section>
            <div class="overall-score">
              <h3>Overall AI Score</h3>
              <span class="score">${applicant.overallScoreAI.toString()}</span>
            </div>
            <div class="score-breakdown">
              <div class="score-item"><span>Skills:</span><span>${applicant.skillsScoreAI.toString()}</span></div>
              <div class="score-item"><span>Experience:</span><span>${applicant.experienceScoreAI.toString()}</span></div>
              <div class="score-item"><span>Education:</span><span>${applicant.educationScoreAI.toString()}</span></div>
              <div class="score-item"><span>Timezone:</span><span>${applicant.timezoneScoreAI.toString()}</span></div>
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

      <DialogContent className="max-h-[85vh] w-[95vw] max-w-6xl sm:max-w-6xl overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <DialogTitle className="text-xl">{applicant.email}</DialogTitle>
              <DialogDescription className="mt-1">
                Detailed evaluation and scoring of applicant against job
                requirements
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
              className="mr-6 flex shrink-0 items-center gap-2 sm:mr-0"
            >
              <Printer className="h-4 w-4" />
              Print Report
            </Button>
          </div>
        </DialogHeader>

        <div ref={printRef} className="mt-2 flex flex-col gap-6">
          {/* Top Section: Overall Score and Breakdown */}
          <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="bg-primary/5 border-primary/20 col-span-2 flex flex-col items-center justify-center rounded-xl border p-4 md:col-span-1 md:items-start">
              <div className="text-muted-foreground text-sm font-medium">
                Overall Score
              </div>
              <div className="text-primary mt-1 text-4xl font-bold">
                {applicant.overallScoreAI.toString()}
              </div>
            </div>

            <div className="bg-muted/30 flex flex-col justify-center rounded-xl border p-4">
              <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Skills Score
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {applicant.skillsScoreAI.toString()}{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  pts
                </span>
              </div>
            </div>

            <div className="bg-muted/30 flex flex-col justify-center rounded-xl border p-4">
              <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Experience Score
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {applicant.experienceScoreAI.toString()}{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  pts
                </span>
              </div>
            </div>

            <div className="bg-muted/30 flex flex-col justify-center rounded-xl border p-4">
              <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Education Score
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {applicant.educationScoreAI.toString()}{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  pts
                </span>
              </div>
            </div>

            <div className="bg-muted/30 flex flex-col justify-center rounded-xl border p-4">
              <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Timezone Score
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {applicant.timezoneScoreAI.toString()}{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  pts
                </span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - mostly comparison info */}
            <div className="space-y-6 lg:col-span-1">
              <section className="space-y-4">
                {/* Education */}
                <div className="bg-muted/10 rounded-xl border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <GraduationCap className="text-muted-foreground h-4 w-4" />
                    <h4 className="text-sm font-semibold">Education</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1 text-xs">
                        Required
                      </div>
                      <div className="text-muted-foreground font-medium">
                        {job.educationDegree}
                        {job.educationField && ` in ${job.educationField}`}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1 text-xs">
                        Applicant
                      </div>
                      <div className="font-medium">
                        {applicant.parsedHighestEducationDegree} in{" "}
                        {applicant.parsedEducationField}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-muted/10 rounded-xl border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Briefcase className="text-muted-foreground h-4 w-4" />
                    <h4 className="text-sm font-semibold">Experience</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1 text-xs">
                        Required
                      </div>
                      <div className="text-muted-foreground font-medium">
                        {job.yearsOfExperience} years
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1 text-xs">
                        Applicant
                      </div>
                      <div
                        className={cn(
                          "font-medium",
                          applicant.parsedYearsOfExperience !== null &&
                            Number(applicant.parsedYearsOfExperience) >=
                              job.yearsOfExperience
                            ? "text-green-600"
                            : "text-red-500",
                        )}
                      >
                        {Number(applicant.parsedYearsOfExperience ?? 0)} years
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Overview */}
                <div className="bg-muted/10 rounded-xl border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Code className="text-muted-foreground h-4 w-4" />
                    <h4 className="text-sm font-semibold">Skills Overview</h4>
                  </div>
                  <div className="flex flex-col gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1 text-xs">
                        Required
                      </div>
                      <div className="text-muted-foreground font-medium">
                        {job.skills.map((skill) => skill.name).join(", ")}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1 text-xs">
                        Applicant
                      </div>
                      <div className="font-medium">
                        {applicant.parsedSkills}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timezone */}
                <div className="bg-muted/10 rounded-xl border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Globe className="text-muted-foreground h-4 w-4" />
                    <h4 className="text-sm font-semibold">Timezone</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1 text-xs">
                        Required
                      </div>
                      <div className="text-muted-foreground font-medium">
                        {job.timezone}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1 text-xs">
                        Applicant
                      </div>
                      <div className="font-medium">
                        {applicant.parsedTimezone}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Deep dive */}
            <div className="space-y-6 lg:col-span-2">
              {/* Skills Match */}
              <section className="bg-muted/10 rounded-xl border p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider">
                    Detailed Skills Analysis
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {applicant.matchedSkills.map((s, i) => (
                    <div
                      key={i}
                      className="bg-background flex flex-col justify-between rounded-lg border p-3 shadow-sm"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm">
                            {s.jobSkill}
                          </div>
                          <div className="text-muted-foreground mt-1 text-xs leading-relaxed">
                            {s.reason}
                            {s.matchType === "implied" && s.applicantSkill && (
                              <span className="mt-0.5 block text-blue-600">
                                ↳ Implied from {s.applicantSkill}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
                            s.matchType === "explicit"
                              ? "bg-green-100 text-green-700"
                              : s.matchType === "implied"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700",
                          )}
                        >
                          {s.matchType}
                        </div>
                      </div>
                      <div className="text-muted-foreground border-t pt-2 text-right text-xs font-medium">
                        Score:{" "}
                        {Number(s.score) *
                          (job.skills.find(
                            (skill) => skill.name === s.jobSkill,
                          )?.weight ?? 0)}{" "}
                        /{" "}
                        {job.skills.find((skill) => skill.name === s.jobSkill)
                          ?.weight ?? 0}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Experiences */}
              <section className="bg-muted/10 rounded-xl border p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider">
                    Experience History
                  </h3>
                  <span className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-semibold">
                    Total: {Number(applicant.parsedYearsOfExperience ?? 0)}{" "}
                    years
                  </span>
                </div>
                <div className="space-y-3">
                  {applicant.experiences.length > 0 ? (
                    applicant.experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className={cn(
                          "bg-background flex items-center justify-between gap-4 rounded-lg border p-4 shadow-sm",
                          exp.relevant
                            ? "border-l-4 border-l-green-500"
                            : "border-l-4 border-l-gray-300",
                        )}
                      >
                        <div>
                          <div className="text-sm font-semibold">
                            {exp.jobTitle}
                          </div>
                          <div className="text-muted-foreground mt-1 text-xs">
                            {exp.startMonth} {exp.startYear} –{" "}
                            {exp.endMonth !== "None"
                              ? exp.endMonth
                              : "Present"}{" "}
                            {exp.endYear !== "Present" ? exp.endYear : ""}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
                            exp.relevant
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600",
                          )}
                        >
                          {exp.relevant ? "Relevant" : "Not Relevant"}
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
