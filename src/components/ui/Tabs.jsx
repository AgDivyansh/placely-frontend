import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Tabs({ tabs, activeKey, onChange, className }) {
  return (
    <div className={cn("flex items-center gap-1 border-b border-border", className)}>
      {tabs.map((t) => {
        const active = t.key === activeKey;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              "relative h-10 px-4 text-sm font-medium transition-colors",
              active ? "text-ink" : "text-ink-3 hover:text-ink-2"
            )}
          >
            {t.label}
            {active && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
