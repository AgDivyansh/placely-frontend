import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui";
import { CountUp } from "@/components/motion";
import { cn } from "@/lib/utils";
import { SPRING_SNAPPY } from "@/lib/motion";

const TINTS = {
  blue: { bg: "bg-info/8", icon: "text-info", shadow: "shadow-[0_8px_24px_-6px_var(--tint-blue)]" },
  coral: { bg: "bg-accent/8", icon: "text-accent", shadow: "shadow-[0_8px_24px_-6px_var(--tint-coral)]" },
  sage: { bg: "bg-success/8", icon: "text-success", shadow: "shadow-[0_8px_24px_-6px_var(--tint-sage)]" },
  amber: { bg: "bg-warning/8", icon: "text-warning", shadow: "shadow-[0_8px_24px_-6px_var(--tint-amber)]" },
};

/**
 * StatCard
 *
 * Two ways to pass the figure:
 *   1. value        — a pre-formatted string ("₹18 LPA"). Rendered as-is.
 *   2. countTo      — a number; animates 0 → countTo on view.
 *      + prefix / suffix / decimals to format the animated number.
 *
 * countTo takes precedence when provided. Keeps older call-sites
 * (which pass `value`) working untouched.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  countTo,
  prefix = "",
  suffix = "",
  decimals = 0,
  hint,
  tone = "blue",
  onClick,
}) {
  const t = TINTS[tone];
  return (
    <Card interactive={!!onClick} onClick={onClick} className={cn("group", t.shadow)}>
      <Card.Body className="space-y-3">
        <div className="flex items-start justify-between">
          {/* Icon gently lifts + scales on card hover — a small "alive" cue */}
          <motion.div
            className={cn("h-10 w-10 rounded-xl flex items-center justify-center", t.bg)}
            whileHover={{ scale: 1.08, rotate: -3 }}
            transition={SPRING_SNAPPY}
          >
            <Icon className={cn("h-5 w-5", t.icon)} />
          </motion.div>
          {onClick && (
            <motion.div
              className="text-ink-3 opacity-0 group-hover:opacity-100"
              initial={false}
              whileHover={{ x: 2, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowUpRight className="h-4 w-4" />
            </motion.div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-3 font-medium">{label}</p>
          <p className="num text-3xl font-semibold text-ink mt-1">
            {countTo !== undefined ? (
              <CountUp value={countTo} prefix={prefix} suffix={suffix} decimals={decimals} />
            ) : (
              value
            )}
          </p>
          {hint && <p className="text-xs text-ink-2 mt-1">{hint}</p>}
        </div>
      </Card.Body>
    </Card>
  );
}
