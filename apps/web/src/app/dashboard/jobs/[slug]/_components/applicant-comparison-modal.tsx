import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "~/app/_components/ui/dialog";
import { Badge } from "~/app/_components/ui/badge";
import { Button } from "~/app/_components/ui/button";
import { Progress } from "~/app/_components/ui/progress";
import type { SerializedApplicantWithIncludes, SerializedJob } from "~/lib/types";
import { cn } from "~/lib/utils";

import ApplicantEvaluationModal from "./applicant-evaluation-modal";

interface ApplicantComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicant1: SerializedApplicantWithIncludes;
    applicant2: SerializedApplicantWithIncludes;
    job: SerializedJob;
}

export default function ApplicantComparisonModal({
    isOpen,
    onClose,
    applicant1,
    applicant2,
    job,
}: ApplicantComparisonModalProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return "bg-green-600";
        if (score >= 60) return "bg-yellow-600";
        return "bg-red-600";
    };

    const renderSkillMatchBadge = (matchType: string) => {
        switch (matchType) {
            case "explicit":
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] px-1.5 py-0">Explicit</Badge>;
            case "implied":
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0">Implied</Badge>;
            case "missing":
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] px-1.5 py-0">Missing</Badge>;
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 gap-0">
                <div className="sticky top-0 z-20 bg-background border-b px-6 py-4">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-center text-xl">Applicant Comparison</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
                        {/* Applicant 1 Header */}
                        <div className="text-center space-y-1">
                            <h3 className="font-bold text-lg leading-tight">{applicant1.name}</h3>
                            <p className="text-xs text-muted-foreground">{applicant1.email}</p>
                            <div className="flex justify-center mt-2">
                                <Badge variant={Number(applicant1.overallScoreAI) >= 80 ? "default" : "secondary"} className="text-sm px-2">
                                    {applicant1.overallScoreAI} Overall
                                </Badge>
                            </div>
                        </div>

                        {/* VS Divider */}
                        <div className="flex items-center justify-center px-4">
                            <span className="text-muted-foreground font-bold text-sm bg-muted rounded-full w-8 h-8 flex items-center justify-center">VS</span>
                        </div>

                        {/* Applicant 2 Header */}
                        <div className="text-center space-y-1">
                            <h3 className="font-bold text-lg leading-tight">{applicant2.name}</h3>
                            <p className="text-xs text-muted-foreground">{applicant2.email}</p>
                            <div className="flex justify-center mt-2">
                                <Badge variant={Number(applicant2.overallScoreAI) >= 80 ? "default" : "secondary"} className="text-sm px-2">
                                    {applicant2.overallScoreAI} Overall
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Education Section */}
                    <section>
                        <div className="text-center mb-4 relative">
                            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground bg-background px-3 inline-block relative z-10">Education</h4>
                            <div className="absolute top-1/2 left-0 w-full h-px bg-border -z-0"></div>
                        </div>
                        {/* Job Requirement Info */}
                        <div className="text-center mb-4">
                            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                Requirement: {job.educationDegree} {job.educationField && `in ${job.educationField}`}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="border rounded-lg p-4 bg-card">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Match Score</span>
                                    <span className={`font-bold ${getScoreColor(Number(applicant1.educationScoreAI))}`}>{applicant1.educationScoreAI}</span>
                                </div>
                                <Progress value={Number(applicant1.educationScoreAI)} className={`h-1.5 mb-4 ${getProgressColor(Number(applicant1.educationScoreAI)).replace('bg-', 'text-')}`} />
                                <div className="text-sm">
                                    <p className="font-medium">{applicant1.parsedHighestEducationDegree || "Not specified"}</p>
                                    <p className="text-muted-foreground text-xs">{applicant1.parsedEducationField}</p>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 bg-card">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Match Score</span>
                                    <span className={`font-bold ${getScoreColor(Number(applicant2.educationScoreAI))}`}>{applicant2.educationScoreAI}</span>
                                </div>
                                <Progress value={Number(applicant2.educationScoreAI)} className="h-1.5 mb-4" />
                                <div className="text-sm">
                                    <p className="font-medium">{applicant2.parsedHighestEducationDegree || "Not specified"}</p>
                                    <p className="text-muted-foreground text-xs">{applicant2.parsedEducationField}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Experience Section */}
                    <section>
                        <div className="text-center mb-4 relative">
                            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground bg-background px-3 inline-block relative z-10">Experience</h4>
                            <div className="absolute top-1/2 left-0 w-full h-px bg-border -z-0"></div>
                        </div>
                        <div className="text-center mb-4">
                            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                Requirement: {job.yearsOfExperience}+ Years
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            {/* Applicant 1 Experience */}
                            <div className="border rounded-lg p-4 bg-card flex flex-col h-full">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold">{Number(applicant1.parsedYearsOfExperience || 0)}</span>
                                        <span className="text-xs text-muted-foreground">Years</span>
                                    </div>
                                    <span className={`font-bold ${getScoreColor(Number(applicant1.experienceScoreAI))}`}>{applicant1.experienceScoreAI} pts</span>
                                </div>
                                <div className="space-y-2 mt-2 flex-grow">
                                    {applicant1.experiences.filter(e => e.relevant).slice(0, 3).map((exp, i) => (
                                        <div key={i} className="text-xs border-l-2 border-green-500 pl-2 py-0.5">
                                            <div className="font-medium truncate">{exp.jobTitle}</div>
                                            <div className="text-muted-foreground text-[10px]">{exp.startYear} - {exp.endYear}</div>
                                        </div>
                                    ))}
                                    {applicant1.experiences.filter(e => e.relevant).length === 0 && (
                                        <div className="text-xs text-muted-foreground italic">No relevant experience highlighted</div>
                                    )}
                                    {applicant1.experiences.filter(e => e.relevant).length > 3 && (
                                        <div className="text-[10px] text-muted-foreground text-center pt-1">
                                            +{applicant1.experiences.filter(e => e.relevant).length - 3} more relevant roles
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Applicant 2 Experience */}
                            <div className="border rounded-lg p-4 bg-card flex flex-col h-full">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold">{Number(applicant2.parsedYearsOfExperience || 0)}</span>
                                        <span className="text-xs text-muted-foreground">Years</span>
                                    </div>
                                    <span className={`font-bold ${getScoreColor(Number(applicant2.experienceScoreAI))}`}>{applicant2.experienceScoreAI} pts</span>
                                </div>
                                <div className="space-y-2 mt-2 flex-grow">
                                    {applicant2.experiences.filter(e => e.relevant).slice(0, 3).map((exp, i) => (
                                        <div key={i} className="text-xs border-l-2 border-green-500 pl-2 py-0.5">
                                            <div className="font-medium truncate">{exp.jobTitle}</div>
                                            <div className="text-muted-foreground text-[10px]">{exp.startYear} - {exp.endYear}</div>
                                        </div>
                                    ))}
                                    {applicant2.experiences.filter(e => e.relevant).length === 0 && (
                                        <div className="text-xs text-muted-foreground italic">No relevant experience highlighted</div>
                                    )}
                                    {applicant2.experiences.filter(e => e.relevant).length > 3 && (
                                        <div className="text-[10px] text-muted-foreground text-center pt-1">
                                            +{applicant2.experiences.filter(e => e.relevant).length - 3} more relevant roles
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>


                    {/* Skills Section */}
                    <section>
                        <div className="text-center mb-4 relative">
                            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground bg-background px-3 inline-block relative z-10">Skills Analysis</h4>
                            <div className="absolute top-1/2 left-0 w-full h-px bg-border -z-0"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="flex justify-between items-baseline px-1">
                                    <span className="text-sm font-medium">Match Score</span>
                                    <span className={`font-bold ${getScoreColor(Number(applicant1.skillsScoreAI))}`}>{applicant1.skillsScoreAI}</span>
                                </div>
                                <div className="border rounded-lg bg-card divide-y">
                                    {applicant1.matchedSkills.map(skill => (
                                        <div key={skill.id} className="p-2 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium">{skill.jobSkill}</span>
                                                {skill.matchType === 'implied' && skill.applicantSkill && (
                                                    <span className="text-[10px] text-muted-foreground">from {skill.applicantSkill}</span>
                                                )}
                                            </div>
                                            {renderSkillMatchBadge(skill.matchType)}
                                        </div>
                                    ))}
                                    {applicant1.matchedSkills.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">No skills analyzed</div>}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-baseline px-1">
                                    <span className="text-sm font-medium">Match Score</span>
                                    <span className={`font-bold ${getScoreColor(Number(applicant2.skillsScoreAI))}`}>{applicant2.skillsScoreAI}</span>
                                </div>
                                <div className="border rounded-lg bg-card divide-y">
                                    {applicant2.matchedSkills.map(skill => (
                                        <div key={skill.id} className="p-2 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium">{skill.jobSkill}</span>
                                                {skill.matchType === 'implied' && skill.applicantSkill && (
                                                    <span className="text-[10px] text-muted-foreground">from {skill.applicantSkill}</span>
                                                )}
                                            </div>
                                            {renderSkillMatchBadge(skill.matchType)}
                                        </div>
                                    ))}
                                    {applicant2.matchedSkills.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">No skills analyzed</div>}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Timezone Section */}
                    <section>
                        <div className="text-center mb-4 relative">
                            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground bg-background px-3 inline-block relative z-10">Timezone / Location</h4>
                            <div className="absolute top-1/2 left-0 w-full h-px bg-border -z-0"></div>
                        </div>
                        <div className="text-center mb-4">
                            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                Target: {job.timezone}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="border rounded-lg p-3 bg-card text-center">
                                <div className="text-sm font-medium mb-1">{applicant1.parsedTimezone || "Unknown"}</div>
                                <span className={`text-xs font-bold ${getScoreColor(Number(applicant1.timezoneScoreAI))}`}>{applicant1.timezoneScoreAI} pts</span>
                            </div>
                            <div className="border rounded-lg p-3 bg-card text-center">
                                <div className="text-sm font-medium mb-1">{applicant2.parsedTimezone || "Unknown"}</div>
                                <span className={`text-xs font-bold ${getScoreColor(Number(applicant2.timezoneScoreAI))}`}>{applicant2.timezoneScoreAI} pts</span>
                            </div>
                        </div>
                    </section>

                </div>

                <div className="sticky bottom-0 bg-background border-t p-4 grid grid-cols-2 gap-8">
                    <ApplicantEvaluationModal job={job} applicant={applicant1}>
                        <Button variant="outline" className="w-full truncate block px-2">
                            View Applicant
                        </Button>
                    </ApplicantEvaluationModal>
                    <ApplicantEvaluationModal job={job} applicant={applicant2}>
                        <Button variant="outline" className="w-full truncate block px-2">
                            View Applicant
                        </Button>
                    </ApplicantEvaluationModal>
                </div>
            </DialogContent>
        </Dialog>
    );
}
