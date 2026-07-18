import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Progress({ value = 0, max = 100, className, tone = "accent" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const colors = {
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-border overflow-hidden", className)}>
      <motion.div
        className={cn("h-full rounded-full", colors[tone])}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
