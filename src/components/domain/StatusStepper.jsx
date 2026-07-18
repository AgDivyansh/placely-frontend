import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { STAGES, STAGE_INDEX } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * StatusStepper — horizontal pipeline showing application progress.
 * Reused across dashboard, job detail, and company detail pages.
 */
export function StatusStepper({ currentStage, compact = false }) {
  const currentIdx = STAGE_INDEX[currentStage] ?? 0;
  const isOffered = currentStage === "offer";

  return (
    <div className={cn("flex items-center w-full", compact && "gap-1")}>
      {STAGES.map((stage, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const pending = idx > currentIdx;

        return (
          <div key={stage.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={cn(
                  "relative flex items-center justify-center rounded-full border-2 transition-colors",
                  compact ? "h-5 w-5" : "h-7 w-7",
                  done && "bg-success border-success",
                  active && !isOffered && "bg-accent border-accent animate-pulse",
                  active && isOffered && "bg-success border-success",
                  pending && "bg-surface border-border"
                )}
              >
                {done || (active && isOffered) ? (
                  <Check className={compact ? "h-3 w-3 text-white" : "h-3.5 w-3.5 text-white"} />
                ) : active ? (
                  <span className={cn("rounded-full bg-white", compact ? "h-1.5 w-1.5" : "h-2 w-2")} />
                ) : (
                  <span className={cn("rounded-full bg-ink-3", compact ? "h-1 w-1" : "h-1.5 w-1.5")} />
                )}
              </motion.div>
              {!compact && (
                <span
                  className={cn(
                    "text-[10px] font-medium whitespace-nowrap",
                    (done || active) ? "text-ink" : "text-ink-3"
                  )}
                >
                  {stage.label}
                </span>
              )}
            </div>

            {idx < STAGES.length - 1 && (
              <div className={cn("flex-1 mx-1.5 mb-5", compact && "mb-0")}>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.07 }}
                  style={{ originX: 0 }}
                  className={cn("h-0.5 rounded-full", done ? "bg-success" : "bg-border")}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
