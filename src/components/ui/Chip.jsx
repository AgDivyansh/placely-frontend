import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Chip({ active = false, onClick, children, className, icon: Icon }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-all duration-200",
        active
          ? "bg-ink text-bg border-ink shadow-md"
          : "bg-surface text-ink-2 border-border hover:border-border-strong hover:text-ink hover:bg-surface-tint",
        className
      )}
    >
      {active && <Check className="h-3 w-3" />}
      {!active && Icon && <Icon className="h-3 w-3" />}
      {children}
    </motion.button>
  );
}
