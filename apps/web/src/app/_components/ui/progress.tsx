"use client";

import * as React from "react";

import { cn } from "~/lib/utils";

// Since we don't have @radix-ui/react-progress installed in package.json from what I saw,
// I will implement a simple HTML/Tailwind version that mimics the API.
// If the user wants the real Radix one, we'd need to install it, but for now this is faster and cleaner given the constraints.
// Actually, I'll just build a purely accessible div-based one.

const Progress = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value?: number | null; max?: number }
>(({ className, value, max = 100, ...props }, ref) => {
    const percentage = Math.min(
        Math.max(0, ((value || 0) / (max || 100)) * 100),
        100,
    );

    return (
        <div
            ref={ref}
            className={cn(
                "bg-secondary relative h-4 w-full overflow-hidden rounded-full",
                className,
            )}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={value || 0}
            {...props}
        >
            <div
                className="bg-primary h-full flex-1 transition-all"
                style={{ transform: `translateX(-${100 - percentage}%)` }}
            />
        </div>
    );
});
Progress.displayName = "Progress";

export { Progress };
