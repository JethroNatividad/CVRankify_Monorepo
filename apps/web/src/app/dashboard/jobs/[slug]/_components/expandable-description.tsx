"use client";

import { useState } from "react";
import { Button } from "~/app/_components/ui/button";

interface ExpandableDescriptionProps {
  description: string;
  maxLength?: number;
  className?: string;
}

export const ExpandableDescription = ({
  description,
  maxLength = 200,
  className = "",
}: ExpandableDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't show see more/less if text is short enough
  if (description.length <= maxLength) {
    return (
      <p
        className={`text-muted-foreground text-sm leading-relaxed ${className}`}
      >
        {description}
      </p>
    );
  }

  const trimmedDescription = description.slice(0, maxLength).trim();

  return (
    <div className={className}>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {isExpanded ? description : `${trimmedDescription}...`}{" "}
        <Button
          variant="link"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-auto p-0 text-sm font-normal text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? "see less" : "see more"}
        </Button>
      </p>
    </div>
  );
};
