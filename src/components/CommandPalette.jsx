import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Briefcase, Building2, GraduationCap, LayoutDashboard,
  Settings, Bookmark, BarChart3, ArrowRight, Calendar, Shield,
  Activity, Users, TrendingUp, MessageSquareQuote, Megaphone,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectJobs } from "@/store/slices/jobsSlice";
import { selectRole } from "@/store/slices/authSlice";
import { ALUMNI, COMPANIES } from "@/data/mockData";
import { cn } from "@/lib/utils";

/**
 * CommandPalette — ⌘K search across the entire app.
 *
 * Engineering:
 *  - Single keyboard listener attached at mount; toggles open state
 *  - Search index built lazily via useMemo when palette opens
 *  - Items keyed by stable IDs for React's reconciler
 *  - Arrow keys navigate; Enter activates
 */
const STUDENT_PAGES = [
  { id: "p-dash", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", kind: "Page" },
  { id: "p-jobs", label: "Jobs", icon: Briefcase, path: "/jobs", kind: "Page" },
  { id: "p-bookmarks", label: "Saved jobs", icon: Bookmark, path: "/bookmarks", kind: "Page" },
  { id: "p-cal", label: "Calendar", icon: Calendar, path: "/calendar", kind: "Page" },
  { id: "p-companies", label: "Companies", icon: Building2, path: "/companies", kind: "Page" },
  { id: "p-alumni", label: "Alumni Connect", icon: GraduationCap, path: "/alumni", kind: "Page" },
  { id: "p-interview", label: "Interview Prep", icon: MessageSquareQuote, path: "/interview-experiences", kind: "Page" },
  { id: "p-stats", label: "Placement Stats", icon: TrendingUp, path: "/placement-stats", kind: "Page" },
  { id: "p-announce", label: "Announcements", icon: Megaphone, path: "/announcements", kind: "Page" },
  { id: "p-docs", label: "Documents", icon: Shield, path: "/documents", kind: "Page" },
  { id: "p-settings", label: "Settings", icon: Settings, path: "/settings", kind: "Page" },
];

const ADMIN_PAGES = [
  { id: "p-admin", label: "Analytics dashboard", icon: BarChart3, path: "/admin", kind: "Page" },
  { id: "p-admin-jobs", label: "Job postings", icon: Briefcase, path: "/admin/jobs", kind: "Page" },
  { id: "p-admin-apps", label: "All applicants", icon: Users, path: "/admin/applicants", kind: "Page" },
  { id: "p-admin-students", label: "Student Directory", icon: GraduationCap, path: "/admin/students", kind: "Page" },
  { id: "p-admin-announce", label: "Announcements", icon: Megaphone, path: "/admin/announcements", kind: "Page" },
  { id: "p-admin-activity", label: "Activity feed", icon: Activity, path: "/admin/activity", kind: "Page" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const jobs = useSelector(selectJobs);
  const role = useSelector(selectRole);

  // Cmd/Ctrl + K to toggle
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setHighlightedIdx(0);
    }
  }, [open]);

  // Build a flat list of all searchable items
  const allItems = useMemo(() => {
    const pages = role === "admin" ? ADMIN_PAGES : STUDENT_PAGES;
    const jobItems = jobs.map((j) => {
      const c = COMPANIES.find((x) => x.id === j.companyId);
      return {
        id: `j-${j.id}`,
        label: `${j.role} — ${c?.name}`,
        kind: "Job",
        icon: Briefcase,
        path: `/jobs/${j.id}`,
      };
    });
    const companyItems = COMPANIES.map((c) => ({
      id: `c-${c.id}`,
      label: c.name,
      kind: "Company",
      icon: Building2,
      path: `/companies/${c.id}`,
    }));
    const alumniItems = ALUMNI.map((a) => {
      const c = COMPANIES.find((x) => x.id === a.companyId);
      return {
        id: `a-${a.id}`,
        label: `${a.name} (${c?.name})`,
        kind: "Alumni",
        icon: GraduationCap,
        path: `/alumni/${a.id}`,
      };
    });
    return role === "admin" ? pages : [...pages, ...jobItems, ...companyItems, ...alumniItems];
  }, [role, jobs]);

  // Filter
  const visible = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 12);
    const q = query.toLowerCase();
    return allItems.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 20);
  }, [allItems, query]);

  // Group by kind
  const grouped = useMemo(() => {
    const g = {};
    visible.forEach((item) => {
      g[item.kind] = g[item.kind] || [];
      g[item.kind].push(item);
    });
    return g;
  }, [visible]);

  // Reset highlight when query changes
  useEffect(() => setHighlightedIdx(0), [query]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.min(visible.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      const item = visible[highlightedIdx];
      if (item) {
        navigate(item.path);
        setOpen(false);
      }
    }
  };

  // Build a flat index keyed by absolute index for highlight matching
  let runningIdx = 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/50 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="relative w-full max-w-2xl glass rounded-2xl shadow-xl overflow-hidden border border-border"
          >
            <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
              <Search className="h-4 w-4 text-ink-3" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search jobs, companies, alumni, pages…"
                className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink-3"
              />
              <kbd className="hidden md:inline-flex items-center px-1.5 h-5 text-[10px] font-mono text-ink-3 bg-surface-tint border border-border rounded">
                ESC
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {visible.length === 0 ? (
                <p className="text-sm text-ink-3 px-3 py-6 text-center">
                  No results for "{query}"
                </p>
              ) : (
                Object.entries(grouped).map(([kind, items]) => (
                  <div key={kind} className="mb-2">
                    <p className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-semibold text-ink-3">
                      {kind}
                    </p>
                    {items.map((item) => {
                      const idx = runningIdx++;
                      const active = idx === highlightedIdx;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onMouseEnter={() => setHighlightedIdx(idx)}
                          onClick={() => {
                            navigate(item.path);
                            setOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                            active ? "bg-ink text-bg" : "hover:bg-surface-tint text-ink"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", active ? "text-bg" : "text-ink-2")} />
                          <span className="flex-1 text-sm truncate">{item.label}</span>
                          {active && <ArrowRight className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[10px] text-ink-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-surface-tint border border-border rounded font-mono">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-surface-tint border border-border rounded font-mono">↵</kbd>
                  select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1 bg-surface-tint border border-border rounded font-mono">⌘K</kbd>
                toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
