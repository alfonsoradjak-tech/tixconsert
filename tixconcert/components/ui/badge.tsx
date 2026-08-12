import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "hot" | "best" | "limited" | "sold" | "success" | "warning" | "danger" | "info" | "neutral";

const variants: Record<BadgeVariant, string> = {
  default: "bg-brand-500/15 text-brand-300 border-brand-500/30",
  hot: "bg-gradient-brand text-white border-transparent",
  best: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  limited: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
  sold: "bg-red-500/15 text-red-400 border-red-500/30",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  danger: "bg-red-500/15 text-red-400 border-red-500/30",
  info: "bg-neon-500/15 text-neon-400 border-neon-500/30",
  neutral: "bg-surface-2 text-muted border-border",
};

export function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
