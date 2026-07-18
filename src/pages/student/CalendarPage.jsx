import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar as CalIcon, ChevronLeft, ChevronRight, Clock,
  CalendarPlus, Briefcase, FileText, Video, Phone,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useAppData } from "@/store/hooks";
import { COMPANIES } from "@/data/mockData";
import { cn, formatDate } from "@/lib/utils";

/**
 * CalendarPage — derives a unified event feed from the student's
 * applications + each job's deadline.
 *
 * Derived event types:
 *   - oa: Online assessment (from applications in stage `oa`)
 *   - tech: Technical interview
 *   - hr: HR interview
 *   - deadline: Application deadline reminder for upcoming jobs
 *
 * In production these come from a `calendar_events` table populated
 * by the placement cell when they schedule each round.
 */
const STAGE_TO_EVENT = {
  oa: { type: "oa", label: "Online assessment", icon: FileText, tone: "warning" },
  tech: { type: "tech", label: "Technical interview", icon: Video, tone: "info" },
  hr: { type: "hr", label: "HR interview", icon: Phone, tone: "accent" },
};

const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function CalendarPage() {
  const navigate = useNavigate();
  const { applications, jobs } = useAppData();
  const [cursor, setCursor] = useState(new Date()); // current visible month

  // Derive event list from applications
  const events = useMemo(() => {
    const evs = [];
    applications.forEach((app, idx) => {
      const job = jobs.find((j) => j.id === app.jobId);
      const company = COMPANIES.find((c) => c.id === app.companyId);
      if (!job) return;
      const meta = STAGE_TO_EVENT[app.currentStage];
      if (meta) {
        // Fake a near-future date based on application order
        const date = daysFromNow(1 + idx * 2);
        evs.push({
          id: `e-${app.id}-${app.currentStage}`,
          type: meta.type,
          label: meta.label,
          icon: meta.icon,
          tone: meta.tone,
          date,
          time: ["10:00 AM", "2:00 PM", "11:30 AM"][idx % 3],
          jobId: job.id,
          jobRole: job.role,
          companyName: company?.name,
          companyColor: company?.color,
          companyInitial: company?.initial,
        });
      }
    });
    // Add deadline reminders for upcoming jobs
    jobs.forEach((j) => {
      const d = new Date(j.deadline);
      if (d > new Date()) {
        const company = COMPANIES.find((c) => c.id === j.companyId);
        evs.push({
          id: `d-${j.id}`,
          type: "deadline",
          label: "Application deadline",
          icon: Briefcase,
          tone: "danger",
          date: d,
          time: "11:59 PM",
          jobId: j.id,
          jobRole: j.role,
          companyName: company?.name,
          companyColor: company?.color,
          companyInitial: company?.initial,
        });
      }
    });
    return evs.sort((a, b) => a.date - b.date);
  }, [applications, jobs]);

  // Build month grid
  const monthGrid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startOffset = first.getDay();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
    return cells;
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const k = e.date.toDateString();
      map[k] = map[k] || [];
      map[k].push(e);
    });
    return map;
  }, [events]);

  // Upcoming list (next 14 days)
  const upcoming = useMemo(() => {
    const now = new Date();
    const horizon = daysFromNow(14);
    return events.filter((e) => e.date >= now && e.date <= horizon).slice(0, 8);
  }, [events]);

  const today = new Date();
  const isToday = (d) => d && sameDay(d, today);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="display-heading text-3xl text-ink flex items-center gap-3">
            <CalIcon className="h-7 w-7 text-accent" />
            Calendar
          </h1>
          <p className="text-sm text-ink-2 mt-1">
            All your OAs, interviews, and deadlines in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Month grid */}
          <Card className="lg:col-span-2">
            <Card.Header className="flex items-center justify-between">
              <h2 className="font-display italic text-2xl text-ink">
                {cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </h2>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="iconSm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
                <Button variant="ghost" size="iconSm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-[10px] uppercase tracking-widest text-ink-3 font-semibold py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthGrid.map((d, i) => {
                  const dayEvents = d ? eventsByDay[d.toDateString()] || [] : [];
                  return (
                    <div
                      key={i}
                      className={cn(
                        "aspect-square rounded-lg p-1.5 text-xs relative",
                        d ? "bg-surface-tint/40 border border-border" : "",
                        isToday(d) && "ring-2 ring-accent border-accent"
                      )}
                    >
                      {d && (
                        <>
                          <span className={cn(
                            "block text-[11px] num font-medium",
                            isToday(d) ? "text-accent" : "text-ink-2"
                          )}>
                            {d.getDate()}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {dayEvents.slice(0, 2).map((e) => (
                              <button
                                key={e.id}
                                onClick={() => navigate(`/jobs/${e.jobId}`)}
                                className={cn(
                                  "w-full text-left text-[9px] px-1.5 py-0.5 rounded truncate font-medium",
                                  e.tone === "warning" && "bg-warning/15 text-warning",
                                  e.tone === "info" && "bg-info/15 text-info",
                                  e.tone === "accent" && "bg-accent/15 text-accent",
                                  e.tone === "danger" && "bg-danger/15 text-danger"
                                )}
                              >
                                {e.label.slice(0, 12)}
                              </button>
                            ))}
                            {dayEvents.length > 2 && (
                              <span className="text-[9px] text-ink-3 px-1.5">+{dayEvents.length - 2}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          {/* Upcoming list */}
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-ink">Upcoming (next 14 days)</h3>
              <p className="text-xs text-ink-3 mt-0.5">{upcoming.length} event{upcoming.length === 1 ? "" : "s"}</p>
            </Card.Header>
            <div className="px-5 pb-5 space-y-2">
              {upcoming.length === 0 ? (
                <p className="text-sm text-ink-3 py-4 text-center">No upcoming events.</p>
              ) : (
                upcoming.map((e) => (
                  <motion.button
                    key={e.id}
                    whileHover={{ x: 2 }}
                    onClick={() => navigate(`/jobs/${e.jobId}`)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-border-strong hover:bg-surface-tint transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold shrink-0 text-xs"
                        style={{ background: e.companyColor }}
                      >
                        {e.companyInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <e.icon className={cn(
                            "h-3.5 w-3.5",
                            e.tone === "warning" && "text-warning",
                            e.tone === "info" && "text-info",
                            e.tone === "accent" && "text-accent",
                            e.tone === "danger" && "text-danger"
                          )} />
                          <p className="text-sm font-semibold text-ink truncate">{e.label}</p>
                        </div>
                        <p className="text-xs text-ink-2 mt-0.5 truncate">
                          {e.companyName} — {e.jobRole}
                        </p>
                        <p className="text-xs text-ink-3 mt-1 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {e.date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {e.time}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </Card>
        </div>

        {events.length === 0 && (
          <EmptyState
            icon={CalIcon}
            title="No events yet"
            description="Apply to a job to see your upcoming assessments and interviews here."
            action={<Button onClick={() => navigate("/jobs")}>Browse jobs</Button>}
          />
        )}
      </div>
    </PageTransition>
  );
}
