import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, IndianRupee, Briefcase, Calendar, Building2,
  Check, X, CheckCircle2, AlertCircle, MessageCircle, ShieldCheck,
} from "lucide-react";
import { Card, Button, Badge, Tabs, Avatar } from "@/components/ui";
import { StatusStepper } from "@/components/domain/StatusStepper";
import { PageTransition } from "@/components/feedback/PageTransition";
import { useAuth } from "@/store/hooks";
import { useAppData } from "@/store/hooks";
import { useToast } from "@/context/ToastContext";
import { checkEligibility } from "@/lib/eligibilityEngine";
import { COMPANIES, ALUMNI, INTERVIEW_EXPERIENCES } from "@/data/mockData";
import { formatLPA, cn } from "@/lib/utils";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "eligibility", label: "Eligibility" },
  { key: "rounds", label: "Rounds" },
  { key: "insights", label: "Alumni insights" },
];

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { jobs, hasAppliedTo, getApplicationFor, apply } = useAppData();
  const toast = useToast();
  const [tab, setTab] = useState("overview");

  const job = jobs.find((j) => j.id === id);
  if (!job) {
    return (
      <PageTransition>
        <Card>
          <Card.Body>
            <p className="text-ink-2">Job not found.</p>
            <Button className="mt-3" variant="secondary" onClick={() => navigate("/jobs")}>
              Back to jobs
            </Button>
          </Card.Body>
        </Card>
      </PageTransition>
    );
  }

  const company = COMPANIES.find((c) => c.id === job.companyId);
  const eligibility = checkEligibility(user, job);
  const application = getApplicationFor(job.id);
  const applied = !!application;
  const companyAlumni = ALUMNI.filter((a) => a.companyId === job.companyId);
  const experiences = INTERVIEW_EXPERIENCES[job.companyId] || [];

  const handleApply = () => {
    if (!eligibility.eligible) return;
    apply(job);
    toast.success("Application submitted", `${company?.name} · ${job.role}`);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={() => navigate(-1)}>
          Back
        </Button>

        {/* Hero header */}
        <Card elevated className="overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-32 opacity-10"
            style={{ background: `linear-gradient(135deg, ${company?.color} 0%, transparent 60%)` }}
          />
          <Card.Body className="space-y-5 relative">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div
                className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md"
                style={{ background: company?.color }}
              >
                {company?.initial}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="display-heading text-3xl text-ink leading-tight">{job.role}</h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-ink-2">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{company?.name}</span>
                  </span>
                  <span className="text-ink-3">·</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {job.location}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {job.tags?.map((t) => (
                    <Badge key={t} tone="accent" size="sm">{t}</Badge>
                  ))}
                </div>
              </div>

              {/* Apply CTA */}
              <div className="md:text-right">
                {applied ? (
                  <Badge tone="success" size="lg" icon={CheckCircle2}>Applied ✓</Badge>
                ) : eligibility.eligible ? (
                  <Button size="lg" onClick={handleApply}>Apply now</Button>
                ) : (
                  <div className="space-y-1">
                    <Button size="lg" disabled>Apply now</Button>
                    <p className="text-xs text-danger flex items-center gap-1 justify-end">
                      <AlertCircle className="h-3 w-3" /> {eligibility.passed} of {eligibility.total} criteria
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border">
              <Stat icon={IndianRupee} label="Package" value={formatLPA(job.package)} />
              <Stat icon={Briefcase} label="Type" value={job.type} />
              <Stat icon={Calendar} label="Apply by" value={new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />
              <Stat icon={Building2} label="Industry" value={company?.industry} />
            </div>
          </Card.Body>
        </Card>

        {/* Status banner if applied */}
        {applied && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <Card.Body className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink text-sm">Your application status</h3>
                  <Badge tone="info" size="sm">In progress</Badge>
                </div>
                <StatusStepper currentStage={application.currentStage} />
              </Card.Body>
            </Card>
          </motion.div>
        )}

        {/* Smart CTA — not eligible reason */}
        {!eligibility.eligible && !applied && (
          <Card className="border-l-4 border-l-warning">
            <Card.Body className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-ink text-sm">
                  You meet {eligibility.passed} of {eligibility.total} criteria
                </p>
                <p className="text-xs text-ink-2 mt-0.5">
                  Missing: <span className="text-danger font-medium">{eligibility.reasons.join(", ")}</span>
                </p>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Tabs */}
        <Tabs tabs={TABS} activeKey={tab} onChange={setTab} />

        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          {tab === "overview" && (
            <Card>
              <Card.Body className="prose prose-sm max-w-none">
                <h3 className="font-semibold text-ink mb-2">About the role</h3>
                <p className="text-sm text-ink-2 leading-relaxed">{job.description}</p>
              </Card.Body>
            </Card>
          )}

          {tab === "eligibility" && (
            <Card>
              <Card.Body className="space-y-2">
                {eligibility.checks.map((c, i) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "flex items-center justify-between py-2.5 px-3 rounded-lg border",
                      c.pass
                        ? "bg-success/5 border-success/20"
                        : "bg-danger/5 border-danger/20"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {c.pass ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-danger" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-ink">{c.name}</p>
                        <p className="text-xs text-ink-3">Required: {c.required}</p>
                      </div>
                    </div>
                    <span className={cn("num text-sm font-semibold", c.pass ? "text-success" : "text-danger")}>
                      {c.actual}
                    </span>
                  </motion.div>
                ))}
              </Card.Body>
            </Card>
          )}

          {tab === "rounds" && (
            <Card>
              <Card.Body className="space-y-3">
                {job.rounds.map((r, i) => (
                  <div key={r} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-ink text-bg flex items-center justify-center font-semibold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{r}</p>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}

          {tab === "insights" && (
            <div className="space-y-4">
              {experiences.length > 0 && (
                <Card>
                  <Card.Header>
                    <h3 className="font-semibold text-ink text-sm">Interview experiences</h3>
                  </Card.Header>
                  <div className="px-5 pb-5 space-y-3">
                    {experiences.map((e, i) => (
                      <div key={i} className="p-3 rounded-lg bg-surface-tint border border-border">
                        <p className="text-xs font-semibold text-ink mb-1">{e.author}</p>
                        <p className="text-sm text-ink-2">{e.content}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {companyAlumni.length > 0 && (
                <Card>
                  <Card.Header>
                    <h3 className="font-semibold text-ink text-sm">Alumni from your college</h3>
                  </Card.Header>
                  <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {companyAlumni.map((al) => (
                      <button
                        key={al.id}
                        onClick={() =>
                          navigate(`/alumni/${al.id}`, {
                            state: { from: location.pathname, fromLabel: "Back to job" },
                          })
                        }
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-tint transition-colors text-left border border-border"
                      >
                        <Avatar name={al.name} size="md" color={company?.color} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium text-ink truncate">{al.name}</p>
                            {al.verified && <ShieldCheck className="h-3 w-3 text-info" />}
                          </div>
                          <p className="text-xs text-ink-3">{al.role}</p>
                        </div>
                        <MessageCircle className="h-4 w-4 text-ink-3" />
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-ink-3">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <p className="text-sm font-semibold text-ink num">{value}</p>
    </div>
  );
}
