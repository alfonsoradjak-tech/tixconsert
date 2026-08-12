import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function Stepper({
  steps,
  current,
}: {
  steps: { label: string; done?: boolean }[];
  current: number;
}) {
  return (
    <ol className="flex w-full items-center gap-2 sm:gap-3">
      {steps.map((step, i) => {
        const active = i === current;
        const done = step.done || i < current;
        return (
          <li key={step.label} className="flex flex-1 flex-col items-center gap-2 sm:flex-row sm:gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                done
                  ? "border-brand-500 bg-brand-500 text-white"
                  : active
                    ? "border-brand-500 bg-brand-500/10 text-brand-300"
                    : "border-border bg-surface text-muted"
              )}
            >
              {done && i !== current ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden text-xs font-semibold sm:block",
                active || done ? "text-foreground" : "text-muted"
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "hidden h-0.5 flex-1 rounded-full sm:block",
                  done ? "bg-brand-500" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
