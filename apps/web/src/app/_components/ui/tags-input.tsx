"use client";

import React, { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "~/app/_components/ui/badge";
import { Input } from "~/app/_components/ui/input";
import { cn } from "~/lib/utils";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(
  ({ value = [], onChange, placeholder, className, ...props }, ref) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const trimmedValue = inputValue.trim();

        if (trimmedValue && !value.includes(trimmedValue)) {
          onChange([...value, trimmedValue]);
          setInputValue("");
        }
      }

      if (e.key === "Backspace" && !inputValue && value.length > 0) {
        onChange(value.slice(0, -1));
      }
    };

    const removeTag = (tagToRemove: string) => {
      onChange(value.filter((tag) => tag !== tagToRemove));
    };

    return (
      <div
        className={cn(
          "border-input bg-background ring-offset-background focus-within:ring-ring flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2",
          className,
        )}
      >
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="hover:bg-secondary/80 gap-1 pr-1"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-secondary-foreground/20 ml-1 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </button>
          </Badge>
        ))}
        <Input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          {...props}
        />
      </div>
    );
  },
);

TagsInput.displayName = "TagsInput";

export { TagsInput };
