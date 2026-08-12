import { forwardRef } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "subtle";
type Size = "xs" | "sm" | "md" | "lg" | "xl" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-brand text-white shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 hover:brightness-110 active:scale-[0.98]",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-surface-2 active:scale-[0.98]",
  outline:
    "border border-brand-500/40 text-brand-300 hover:bg-brand-500/10 active:scale-[0.98]",
  ghost: "text-muted hover:text-foreground hover:bg-surface-2",
  danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 active:scale-[0.98]",
  subtle: "bg-brand-500/10 text-brand-300 hover:bg-brand-500/20",
};

const sizes: Record<Size, string> = {
  xs: "h-8 px-3 text-xs",
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-11 px-6 text-sm",
  xl: "h-14 px-8 text-base",
  icon: "h-10 w-10",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, href, children, disabled, ...props }, ref) => {
    const cls = buttonVariants({ variant, size, className });

    if (href) {
      return (
        <Link href={href} className={cls}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={cls}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
