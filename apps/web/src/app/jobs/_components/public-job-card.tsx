"use client";

import React from "react";
import { Badge } from "~/app/_components/ui/badge";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardHeader } from "~/app/_components/ui/card";
import {
  Clock,
  GraduationCap,
  MapPin,
  Users,
  Building,
  Eye,
  Briefcase,
  Home,
} from "lucide-react";
import Link from "next/link";

interface PublicJobCardProps {
  job: {
    id: number;
    title: string;
    description: string;
    skills: string;
    yearsOfExperience: number;
    educationDegree: string;
    timezone: string;
    hires: number;
    hiresNeeded: number;
    createdAt: Date;
    employmentType: string;
    workplaceType: string;
    location: string;
    salaryRange?: string | null;
    createdBy: {
      name: string | null;
    };
    _count: {
      applicants: number;
    };
  };
}

const PublicJobCard = ({ job }: PublicJobCardProps) => {
  const skills = job.skills.split(", ").filter(Boolean);
  const applicationCount = job._count.applicants;
  const positionsRemaining = job.hiresNeeded - job.hires;

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg leading-tight font-semibold">{job.title}</h3>
            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
              <Building className="h-3 w-3" />
              <span>{job.createdBy.name ?? "Anonymous"}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Briefcase className="mr-1 h-3 w-3" />
                {job.employmentType}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Home className="mr-1 h-3 w-3" />
                {job.workplaceType}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <MapPin className="mr-1 h-3 w-3" />
                {job.location}
              </Badge>
            </div>
          </div>
          <Badge variant="default" className="ml-2 shrink-0">
            Open
          </Badge>
        </div>

        {/* Description preview */}
        <p className="text-muted-foreground line-clamp-2 min-h-12 text-sm leading-relaxed">
          {job.description}
        </p>
      </CardHeader>

      <CardContent className="flex h-full flex-col justify-between space-y-4">
        {/* Requirements */}
        <div className="space-y-2">
          <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Requirements
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-blue-500" />
              <span>{job.yearsOfExperience}+ years</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-3 w-3 text-green-500" />
              <span>{job.educationDegree}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-purple-500" />
              <span>{job.timezone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3 text-orange-500" />
              <span>{positionsRemaining} position/s</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Skills
          </h4>
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 4).map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="px-2 py-0.5 text-xs"
              >
                {skill}
              </Badge>
            ))}
            {skills.length > 4 && (
              <Badge variant="outline" className="px-2 py-0.5 text-xs">
                +{skills.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Salary Range */}
        {job.salaryRange && (
          <div className="space-y-2">
            <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Salary Range
            </h4>
            <p className="text-sm font-medium">{job.salaryRange}</p>
          </div>
        )}

        {/* Stats */}
        <div className="text-muted-foreground flex items-center justify-between border-t pt-3 text-xs">
          <span>{applicationCount} applicants</span>
          <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Action Button */}
        <Button asChild className="w-full">
          <Link href={`/jobs/${job.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View & Apply
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PublicJobCard;
