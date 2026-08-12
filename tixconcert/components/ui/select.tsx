"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full h-11 appearance-none rounded-xl border border-border bg-surface px-3.5 pr-9 text-sm text-foreground outline-none transition-all focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
        )}
      />
    </div>
  );
}
