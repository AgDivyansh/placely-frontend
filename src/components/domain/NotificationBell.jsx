import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, X } from "lucide-react";
import { useAppData } from "@/store/hooks";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllNotificationsRead } = useAppData();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const grouped = notifications.reduce((acc, n) => {
    acc[n.group] = acc[n.group] || [];
    acc[n.group].push(n);
    return acc;
  }, {});

  const KIND_COLORS = {
    info: "bg-info",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-danger",
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 rounded-lg border border-border bg-surface hover:bg-surface-tint hover:border-border-strong transition-colors flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 text-ink-2" />
        {unreadCount > 0 && (
          <>
            {/* Soft pulse ring — a calm "you have updates" cue, not a flashing alarm */}
            <motion.span
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 2.2 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.span
              key={unreadCount}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-accent text-white text-[10px] font-semibold flex items-center justify-center shadow-sm"
            >
              {unreadCount}
            </motion.span>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 surface-card-elev overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">Notifications</h3>
                {unreadCount > 0 && <Badge tone="accent" size="sm">{unreadCount} new</Badge>}
              </div>
              {unreadCount > 0 && (
                <Button variant="link" size="sm" onClick={markAllNotificationsRead}>
                  Mark all read
                </Button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {Object.keys(grouped).map((group) => (
                <div key={group}>
                  <p className="px-4 py-2 text-[10px] uppercase tracking-widest text-ink-3 font-semibold bg-surface-tint">
                    {group}
                  </p>
                  {grouped[group].map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "px-4 py-3 flex items-start gap-3 hover:bg-surface-tint transition-colors border-b border-border last:border-b-0",
                        !n.read && "bg-accent/4"
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", KIND_COLORS[n.kind] || "bg-ink-3")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink leading-tight">{n.title}</p>
                        <p className="text-xs text-ink-2 mt-0.5">{n.body}</p>
                        <p className="text-[10px] text-ink-3 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
