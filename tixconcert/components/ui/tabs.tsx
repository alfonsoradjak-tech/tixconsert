"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  value,
  onValueChange,
  options,
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string; count?: number }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl bg-surface-2 p-1 overflow-x-auto no-scrollbar",
        className
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onValueChange(o.value)}
          className={cn(
            "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all",
            value === o.value
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          )}
        >
          {o.label}
          {o.count != null && (
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                value === o.value ? "bg-brand-500/15 text-brand-300" : "bg-surface-2"
              )}
            >
              {o.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
