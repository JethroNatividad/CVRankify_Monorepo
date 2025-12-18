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
import { Printer } from "lucide-react";
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

      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>{applicant.email}</DialogTitle>
              <DialogDescription>
                Detailed evaluation and scoring of applicant against job
                requirements
              </DialogDescription>
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
          {/* 📊 Job vs Applicant Comparison */}
          <section>
            <h3 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">
              Job Requirements vs Applicant
            </h3>
            <div className="bg-muted/30 overflow-hidden rounded-md border">
              <div className="bg-border grid grid-cols-3 gap-px">
                {/* Header */}
                <div className="bg-muted/30 p-2">
                  <span className="text-muted-foreground text-xs font-semibold">
                    Criteria
                  </span>
                </div>
                <div className="bg-muted/30 p-2">
                  <span className="text-muted-foreground text-xs font-semibold">
                    Job Requirement
                  </span>
                </div>
                <div className="bg-muted/30 p-2">
                  <span className="text-muted-foreground text-xs font-semibold">
                    Applicant
                  </span>
                </div>

                {/* Education */}
                <div className="bg-background p-2">
                  <span className="text-sm font-medium">Education</span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-sm">
                    {job.educationDegree}
                    {job.educationField && ` in ${job.educationField}`}
                  </span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-sm">
                    {applicant.parsedHighestEducationDegree} in{" "}
                    {applicant.parsedEducationField}
                  </span>
                </div>

                {/* Experience */}
                <div className="bg-background p-2">
                  <span className="text-sm font-medium">Experience</span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-sm">{job.yearsOfExperience} years</span>
                </div>
                <div className="bg-background p-2">
                  <span
                    className={cn(
                      "text-sm",
                      applicant.parsedYearsOfExperience !== null &&
                        Number(applicant.parsedYearsOfExperience) >=
                          job.yearsOfExperience
                        ? "font-medium text-green-600"
                        : "text-red-600",
                    )}
                  >
                    {Number(applicant.parsedYearsOfExperience ?? 0)} years
                  </span>
                </div>

                {/* Skills */}
                <div className="bg-background p-2">
                  <span className="text-sm font-medium">Skills</span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-muted-foreground text-xs">
                    {job.skills}
                  </span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-muted-foreground text-xs">
                    {applicant.parsedSkills}
                  </span>
                </div>

                {/* Timezone */}
                <div className="bg-background p-2">
                  <span className="text-sm font-medium">Timezone</span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-sm">{job.timezone}</span>
                </div>
                <div className="bg-background p-2">
                  <span className="text-sm">{applicant.parsedTimezone}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 🧩 Skills Match */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                Skills Match
              </h3>
              <span className="text-primary text-sm font-semibold">
                {applicant.skillsScoreAI.toString()} pts
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
                      {(Number(s.score) * 100).toFixed(0)}%
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
                <span className="text-primary text-sm font-semibold">
                  {applicant.experienceScoreAI.toString()} pts
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

          {/* 🎓 Education */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                Education Match
              </h3>
              <span className="text-primary text-sm font-semibold">
                {applicant.educationScoreAI.toString()} pts
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
              <span className="text-primary text-sm font-semibold">
                {applicant.timezoneScoreAI.toString()} pts
              </span>
            </div>
            <div className="bg-muted/30 flex justify-between rounded-md border p-3 text-sm">
              <span>{applicant.parsedTimezone}</span>
            </div>
          </section>

          {/* 🧮 Overall */}
          <section>
            <div className="border-t pt-4">
              <div className="bg-primary/5 border-primary/20 flex items-center justify-between rounded-lg border-2 p-4">
                <h3 className="text-base font-semibold">Overall AI Score</h3>
                <span className="text-primary text-2xl font-bold">
                  {applicant.overallScoreAI.toString()}
                </span>
              </div>
              <div className="text-muted-foreground mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Skills:</span>
                  <span>{applicant.skillsScoreAI.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span>{applicant.experienceScoreAI.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Education:</span>
                  <span>{applicant.educationScoreAI.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Timezone:</span>
                  <span>{applicant.timezoneScoreAI.toString()}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
