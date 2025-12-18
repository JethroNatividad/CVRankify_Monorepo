import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { Button } from "~/app/_components/ui/button";
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  HomeIcon,
} from "lucide-react";
import Link from "next/link";

interface JobCardProps {
  job: {
    id: number;
    title: string;
    description: string;
    skills: string;
    yearsOfExperience: number;
    educationDegree: string;
    educationField: string | null;
    timezone: string;
    isOpen: boolean;
    createdAt: Date;
    interviewing: number;
    interviewsNeeded: number;
    hires: number;
    hiresNeeded: number;
    employmentType: string;
    workplaceType: string;
    location: string | null;
    _count: {
      applicants: number;
    };
  };
}

export default function JobCard({ job }: JobCardProps) {
  const skillsArray = job.skills.split(", ").filter(Boolean);

  return (
    <Card className="h-full transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {job.description}
            </CardDescription>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge variant="outline" className="text-xs">
                <BriefcaseIcon className="mr-1 h-3 w-3" />
                {job.employmentType}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <HomeIcon className="mr-1 h-3 w-3" />
                {job.workplaceType}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <MapPinIcon className="mr-1 h-3 w-3" />
                {job.location}
              </Badge>
            </div>
          </div>
          <Badge variant={job.isOpen ? "default" : "secondary"}>
            {job.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex h-full flex-col justify-between space-y-4">
        {/* Skills */}
        <div>
          <h4 className="mb-2 text-sm font-medium">Required Skills</h4>
          <div className="flex flex-wrap gap-1">
            {skillsArray.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill.trim()}
              </Badge>
            ))}
            {skillsArray.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{skillsArray.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Job Requirements */}
        <div className="text-muted-foreground grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            <span>{job.yearsOfExperience}+ years exp</span>
          </div>

          <div className="flex items-center gap-2">
            <GraduationCapIcon className="h-4 w-4" />
            <span>
              {job.educationDegree} of {job.educationField}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            <span>{job.timezone}</span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 border-t pt-3">
          <div className="text-center">
            <div className="text-lg font-semibold">{job._count.applicants}</div>
            <div className="text-muted-foreground text-xs">Applicants</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold">{job.interviewing}</div>
            <div className="text-muted-foreground text-xs">Interviewing</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold">
              {job.hires}/{job.hiresNeeded}
            </div>
            <div className="text-muted-foreground text-xs">Hired</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/dashboard/jobs/${job.id}`}>View Details</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/jobs/${job.id}/edit`}>Edit</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
