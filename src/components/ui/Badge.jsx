import { cn } from "@/lib/utils";

/**
 * Badge — small status / category indicator.
 * Tones map to semantic CSS variables, so they auto-adapt to dark mode.
 */
const TONES = {
  neutral: "bg-surface-tint text-ink-2 border-border",
  accent: "bg-[var(--accent-soft)] text-accent-strong border-[var(--accent-soft)]",
  success: "bg-[var(--success-soft)] text-success border-[var(--success-soft)]",
  warning: "bg-[var(--warning-soft)] text-warning border-[var(--warning-soft)]",
  danger: "bg-[var(--danger-soft)] text-danger border-[var(--danger-soft)]",
  info: "bg-[var(--info-soft)] text-info border-[var(--info-soft)]",
};

const SIZES = {
  sm: "h-5 px-2 text-[10px]",
  md: "h-6 px-2.5 text-xs",
  lg: "h-7 px-3 text-sm",
};

export function Badge({ tone = "neutral", size = "md", icon: Icon, className, children, ...rest }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full border tracking-tight",
        TONES[tone],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {Icon && <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />}
      {children}
    </span>
  );
}
