import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase, CheckCircle2, Calendar, TrendingUp, ArrowRight,
  Sparkles, ChevronRight, FileText,
} from "lucide-react";
import { Card, Button, Badge, Progress } from "@/components/ui";
import { StatCard } from "@/components/domain/StatCard";
import { StatusStepper } from "@/components/domain/StatusStepper";
import { JobCard } from "@/components/domain/JobCard";
import { PageTransition } from "@/components/feedback/PageTransition";
import { useAuth } from "@/store/hooks";
import { useAppData } from "@/store/hooks";
import { resolveEligibility } from "@/lib/eligibilityEngine";
import { recommendJobs } from "@/lib/recommendations";
import { COMPANIES } from "@/data/mockData";
import { formatLPA } from "@/lib/utils";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applications, jobs } = useAppData();

  // Derived counts — memoized
  const stats = useMemo(() => {
    const eligibleJobs = jobs.filter((j) => resolveEligibility(user, j).eligible);
    const upcoming = applications.filter((a) => ["oa", "tech", "hr"].includes(a.currentStage));
    return {
      applied: applications.length,
      eligible: eligibleJobs.length,
      upcoming: upcoming.length,
      total: jobs.length,
    };
  }, [user, applications, jobs]);

  // Profile completeness — engineering: pure derivation, not stored
  const completeness = useMemo(() => {
    const fields = ["name", "email", "phone", "branch", "cgpa", "tenth", "twelfth", "resume", "skills"];
    const filled = fields.filter((f) => {
      const v = user?.[f];
      return v !== null && v !== undefined && v !== "" && (Array.isArray(v) ? v.length > 0 : true);
    }).length;
    return Math.round((filled / fields.length) * 100);
  }, [user]);

  // Recommended jobs — algorithm in lib/recommendations.js
  const recommendations = useMemo(
    () => recommendJobs({ user, jobs, applications, companies: COMPANIES, limit: 3 }),
    [user, jobs, applications]
  );

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="display-heading text-4xl text-ink leading-tight">
            Good to see you, <em className="text-accent">{user?.name.split(" ")[0]}</em>
          </h1>
          <p className="mt-2 text-ink-2">
            You're eligible for <span className="font-semibold text-ink num">{stats.eligible}</span> of {stats.total} active jobs.
            {completeness < 100 && (
              <> Complete your profile to unlock more opportunities.</>
            )}
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
          <StatCard
            icon={Briefcase}
            label="Applied"
            countTo={stats.applied}
            hint="Active applications"
            tone="blue"
            onClick={stats.applied > 0 ? () => navigate("/jobs?filter=applied") : undefined}
          />
          <StatCard
            icon={CheckCircle2}
            label="Eligible jobs"
            countTo={stats.eligible}
            hint="Ready to apply"
            tone="sage"
            onClick={stats.eligible > 0 ? () => navigate("/jobs?filter=eligible") : undefined}
          />
          <StatCard
            icon={Calendar}
            label="Upcoming rounds"
            countTo={stats.upcoming}
            hint="OAs and interviews"
            tone="coral"
            onClick={stats.upcoming > 0 ? () => navigate("/jobs?filter=applied") : undefined}
          />
        </div>

        {/* Recommended jobs — algorithmic picks based on profile + history */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display italic text-2xl text-ink flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Recommended for you
                </h2>
                <p className="text-xs text-ink-3 mt-0.5">
                  Picks based on your profile, applications, and location.
                </p>
              </div>
              <Button variant="link" size="sm" rightIcon={ChevronRight} onClick={() => navigate("/jobs")}>
                See all jobs
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {recommendations.map(({ job }) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active applications with steppers */}
          <Card className="lg:col-span-2">
            <Card.Header className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-ink">Active applications</h2>
                <p className="text-xs text-ink-3 mt-0.5">Track every stage in real-time</p>
              </div>
              <Button variant="link" size="sm" rightIcon={ChevronRight} onClick={() => navigate("/jobs")}>
                View all
              </Button>
            </Card.Header>
            <div className="px-5 pb-5 space-y-4">
              {applications.length === 0 ? (
                <div className="py-8 text-center text-sm text-ink-3">
                  No applications yet. Browse jobs to get started.
                </div>
              ) : (
                applications.map((app) => {
                  const job = jobs.find((j) => j.id === app.jobId);
                  const company = job?.company || COMPANIES.find((c) => c.id === (app.companyId || job?.companyId));
                  if (!job) return null;
                  return (
                    <Card
                      key={app.id}
                      hoverable
                      interactive
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="!shadow-none border-border"
                    >
                      <Card.Body className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0 text-sm"
                            style={{ background: company?.color }}
                          >
                            {company?.initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-ink truncate">{job.role}</h3>
                            <p className="text-xs text-ink-2">{company?.name} · {formatLPA(job.package)}</p>
                          </div>
                          <Badge tone="info" size="sm">Applied</Badge>
                        </div>
                        <StatusStepper currentStage={app.currentStage} />
                      </Card.Body>
                    </Card>
                  );
                })
              )}
            </div>
          </Card>

          {/* Right column */}
          <div className="space-y-6">
            {/* Profile completeness */}
            <Card>
              <Card.Body className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink text-sm">Profile completeness</h3>
                  <span className="num text-sm font-semibold text-ink">{completeness}%</span>
                </div>
                <Progress value={completeness} tone={completeness === 100 ? "success" : completeness >= 70 ? "accent" : "warning"} />
                <Button variant="secondary" size="sm" rightIcon={ArrowRight} onClick={() => navigate("/profile")} className="w-full">
                  Complete profile
                </Button>
              </Card.Body>
            </Card>

            {/* Quick actions */}
            <Card>
              <Card.Header>
                <h3 className="font-semibold text-ink text-sm">Quick actions</h3>
              </Card.Header>
              <div className="px-5 pb-5 space-y-2">
                {[
                  { icon: Sparkles, label: "Eligible jobs", to: "/jobs?filter=eligible" },
                  { icon: Briefcase, label: "Browse companies", to: "/companies" },
                  { icon: TrendingUp, label: "Connect with alumni", to: "/alumni" },
                  { icon: FileText, label: "Update resume", to: "/profile" },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={() => navigate(a.to)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-tint transition-colors text-left group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-surface-tint flex items-center justify-center">
                      <a.icon className="h-4 w-4 text-ink-2" />
                    </div>
                    <span className="flex-1 text-sm text-ink">{a.label}</span>
                    <ChevronRight className="h-4 w-4 text-ink-3 group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
