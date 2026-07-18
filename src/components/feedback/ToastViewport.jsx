import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastState } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info, warning: AlertTriangle };
const TONES = {
  success: "border-l-success",
  error: "border-l-danger",
  info: "border-l-info",
  warning: "border-l-warning",
};

export function ToastViewport() {
  const { toasts, dismiss } = useToastState();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-[340px]">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.kind] || Info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className={cn(
                "glass rounded-lg border-l-4 shadow-lg p-3.5 flex items-start gap-3",
                TONES[t.kind] || TONES.info
              )}
            >
              <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", `text-${t.kind === "error" ? "danger" : t.kind}`)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink leading-snug">{t.title}</p>
                {t.body && <p className="text-xs text-ink-2 mt-0.5 leading-snug">{t.body}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="p-1 rounded hover:bg-surface-tint">
                <X className="h-3.5 w-3.5 text-ink-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
