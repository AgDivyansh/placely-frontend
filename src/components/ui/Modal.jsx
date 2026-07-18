import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * Modal — overlay dialog with focus trap, esc-to-close, click-outside-to-close.
 * Uses Framer Motion for spring-based entry/exit.
 */
export function Modal({ open, onClose, title, description, size = "md", children, footer }) {
  // Esc to close + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Portal to <body> so the modal escapes any transformed ancestor (e.g. the
  // JobCard's hover transform), which would otherwise become the containing
  // block for position:fixed and clip the modal inside the card.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={cn(
              "relative w-full surface-card-elev overflow-hidden",
              SIZES[size]
            )}
          >
            {(title || onClose) && (
              <div className="flex items-start justify-between gap-4 p-5 border-b border-border">
                <div className="flex-1">
                  {title && <h2 className="font-display italic text-xl text-ink leading-tight">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
                </div>
                <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
            {footer && <div className="p-5 border-t border-border bg-surface-tint/40">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
