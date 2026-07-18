import { useState, useMemo } from "react";
import {
  Activity, Filter, Briefcase, GraduationCap, TrendingUp, FileText,
} from "lucide-react";
import { Card, Chip, Avatar, Badge } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { useActivityFeed } from "@/store/hooks";
import { cn, timeAgo } from "@/lib/utils";

const KIND_ICONS = {
  application: GraduationCap,
  job: Briefcase,
  stage: TrendingUp,
  info: FileText,
};

const KIND_TONES = {
  application: "info",
  job: "accent",
  stage: "success",
  info: "neutral",
};

const FILTERS = [
  { key: "all", label: "All activity" },
  { key: "job", label: "Job postings" },
  { key: "application", label: "Applications" },
  { key: "stage", label: "Stage changes" },
];

export default function ActivityFeedPage() {
  const { items } = useActivityFeed();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((it) => it.kind === filter);
  }, [items, filter]);

  // Group by day
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((it) => {
      const day = new Date(it.at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      g[day] = g[day] || [];
      g[day].push(it);
    });
    return g;
  }, [filtered]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="display-heading text-3xl text-ink flex items-center gap-3">
            <Activity className="h-7 w-7 text-accent" />
            Activity feed
          </h1>
          <p className="text-sm text-ink-2 mt-1">
            Audit trail of every job, application, and stage change.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-ink-3" />
          {FILTERS.map((f) => (
            <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
            </Chip>
          ))}
          <span className="ml-2 text-xs text-ink-3 num">{filtered.length} entries</span>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <Card><Card.Body><p className="text-sm text-ink-3 text-center py-6">No activity yet.</p></Card.Body></Card>
        ) : (
          Object.entries(grouped).map(([day, dayItems]) => (
            <div key={day} className="space-y-2">
              <p className="text-xs uppercase tracking-widest font-semibold text-ink-3 px-1">{day}</p>
              <Card>
                <div className="divide-y divide-border">
                  {dayItems.map((it) => {
                    const Icon = KIND_ICONS[it.kind] || FileText;
                    return (
                      <div key={it.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-surface-tint transition-colors">
                        <div className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                          it.kind === "application" && "bg-info/10",
                          it.kind === "job" && "bg-accent/10",
                          it.kind === "stage" && "bg-success/10",
                          (!["application", "job", "stage"].includes(it.kind)) && "bg-surface-tint"
                        )}>
                          <Icon className={cn(
                            "h-4 w-4",
                            it.kind === "application" && "text-info",
                            it.kind === "job" && "text-accent",
                            it.kind === "stage" && "text-success",
                            (!["application", "job", "stage"].includes(it.kind)) && "text-ink-2"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink">
                            <span className="font-semibold">{it.actor}</span>
                            <span className="text-ink-2"> {it.action} </span>
                            <span className="font-medium">{it.target}</span>
                          </p>
                          <p className="text-xs text-ink-3 mt-0.5">{timeAgo(new Date(it.at).toISOString())}</p>
                        </div>
                        <Badge tone={KIND_TONES[it.kind]} size="sm">{it.kind}</Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          ))
        )}
      </div>
    </PageTransition>
  );
}
