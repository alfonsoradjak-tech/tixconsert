import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const textSize =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl";
  const iconSize = size === "lg" ? "h-9 w-9" : size === "sm" ? "h-6 w-6" : "h-7 w-7";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center justify-center rounded-xl bg-gradient-brand p-1.5 shadow-lg shadow-brand-600/30">
        <Ticket className={cn("text-white", iconSize)} />
      </div>
      <span className={cn("font-display font-black tracking-tight", textSize)}>
        TIX<span className="text-gradient">CONCERT</span>
      </span>
    </div>
  );
}
