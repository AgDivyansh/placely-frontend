import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Download, Upload, Mail, UserX, X, MoreVertical,
  ChevronRight, ShieldCheck,
} from "lucide-react";
import { Card, Button, Input, Chip, Badge, Avatar } from "@/components/ui";
import { StatusStepper } from "@/components/domain/StatusStepper";
import { PageTransition } from "@/components/feedback/PageTransition";
import { EmptyState } from "@/components/feedback/EmptyState";
import { EmailComposerModal } from "@/components/admin/EmailComposerModal";
import { CountUp } from "@/components/motion";
import {
  selectApplicantsByJob, fetchApplicantsByJob,
  revokeApplicant, bulkRevokeApplicants, bulkAdvanceApplicants,
} from "@/store/slices/applicantsSlice";
import { IS_MOCK, applicantsApi } from "@/api";
import { selectJobs } from "@/store/slices/jobsSlice";
import { logActivity } from "@/store/slices/activityFeedSlice";
import { useAuth } from "@/store/hooks";
import { useToast } from "@/context/ToastContext";
import { useTwoStep } from "@/context/TwoStepContext";
import { COMPANIES } from "@/data/mockData";
import { STAGES } from "@/lib/constants";
import { toCSV, downloadCSV, parseCSV } from "@/lib/csv";
import { cn, formatLPA, formatDate } from "@/lib/utils";

const STAGE_TONE = {
  applied: "neutral", shortlist: "info", oa: "warning",
  tech: "warning", hr: "accent", offer: "success",
};

export default function JobApplicantsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const toast = useToast();
  const { request } = useTwoStep();

  const jobs = useSelector(selectJobs);
  const job = jobs.find((j) => j.id === id);
  const applicants = useSelector(selectApplicantsByJob(id));
  const company = job ? (job.company || COMPANIES.find((c) => c.id === job.companyId)) : null;

  // Load real applicants for this job on mount (real mode only; mock mode
  // already has synthetic applicants seeded in the slice).
  useEffect(() => {
    if (!IS_MOCK && id) dispatch(fetchApplicantsByJob(id));
  }, [dispatch, id]);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState(null);
  const [selected, setSelected] = useState([]);
  const [showEmail, setShowEmail] = useState(false);
  const [importing, setImporting] = useState(false);
  const statusFileRef = useRef(null);

  // Bulk stage update from a CSV of rollId,stage rows for THIS job.
  const handleStatusImport = async (file) => {
    if (!file) return;
    if (IS_MOCK) {
      toast.info("Demo mode", "Connect the backend to import statuses for real.");
      return;
    }
    setImporting(true);
    try {
      const rows = parseCSV(await file.text())
        .map((r) => {
          const lower = {};
          for (const [k, v] of Object.entries(r)) lower[k.trim().toLowerCase()] = v;
          return {
            rollId: lower.rollid || lower.roll || lower["roll number"] || lower.collegerollid || "",
            stage: (lower.stage || "").toLowerCase(),
          };
        })
        .filter((r) => r.rollId && r.stage);
      if (rows.length === 0) {
        toast.error("Empty file", "Include a header row: rollId,stage");
        return;
      }
      const res = await applicantsApi.importStatus(id, rows);
      const { updated = 0, failed = [] } = res;
      if (failed.length === 0) toast.success("Statuses updated", `${updated} applicant${updated === 1 ? "" : "s"} moved`);
      else toast.warning("Import finished with issues", `${updated} updated, ${failed.length} skipped (${failed[0]?.reason || "error"})`);
      dispatch(fetchApplicantsByJob(id));
    } catch (err) {
      toast.error("Import failed", err.message || "Check the CSV format and try again.");
    } finally {
      setImporting(false);
      if (statusFileRef.current) statusFileRef.current.value = "";
    }
  };

  const filtered = useMemo(() => {
    let list = applicants;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.roll.toLowerCase().includes(q));
    }
    if (stageFilter) list = list.filter((a) => a.currentStage === stageFilter);
    return list;
  }, [applicants, search, stageFilter]);

  // Stage breakdown for the header strip
  const stageCounts = useMemo(() => {
    const counts = { applied: 0, shortlist: 0, oa: 0, tech: 0, hr: 0, offer: 0 };
    applicants.forEach((a) => { counts[a.currentStage] = (counts[a.currentStage] || 0) + 1; });
    return counts;
  }, [applicants]);

  if (!job) {
    return (
      <PageTransition>
        <Card><Card.Body><p className="text-ink-2">Job not found.</p></Card.Body></Card>
      </PageTransition>
    );
  }

  /* ───────────────────────────────────────────
     Destructive actions — gated by 2-step verification
     ─────────────────────────────────────────── */
  const handleRevoke = (applicant) => {
    request({
      title: "Revoke application",
      description: `Permanently remove ${applicant.name}'s application from ${job.role}. The student will be notified by email.`,
      actionLabel: "Revoke application",
      danger: true,
      onConfirm: async () => {
        try {
          await dispatch(revokeApplicant(applicant.id)).unwrap();
          dispatch(logActivity({
            actor: user?.name || "Admin",
            action: "Revoked application of",
            target: `${applicant.name} — ${job.role}`,
            kind: "stage",
          }));
          toast.warning("Application revoked", `${applicant.name} removed from ${job.role}`);
        } catch (err) {
          toast.error("Couldn't revoke", err.message || "Please try again.");
        }
      },
    });
  };

  const handleBulkRevoke = () => {
    request({
      title: `Revoke ${selected.length} applications`,
      description: `This will permanently remove ${selected.length} student application${selected.length === 1 ? "" : "s"} from ${job.role}. Students will be notified by email.`,
      actionLabel: `Revoke ${selected.length}`,
      danger: true,
      onConfirm: async () => {
        try {
          await dispatch(bulkRevokeApplicants(selected)).unwrap();
          dispatch(logActivity({
            actor: user?.name || "Admin",
            action: `Revoked ${selected.length} applications`,
            target: job.role,
            kind: "stage",
          }));
          toast.warning("Applications revoked", `${selected.length} students removed`);
          setSelected([]);
        } catch (err) {
          toast.error("Couldn't revoke", err.message || "Please try again.");
        }
      },
    });
  };

  const handleBulkAdvance = async () => {
    try {
      await dispatch(bulkAdvanceApplicants(selected)).unwrap();
      dispatch(logActivity({
        actor: user?.name || "Admin",
        action: `Advanced ${selected.length} applicants`,
        target: job.role,
        kind: "stage",
      }));
      toast.success(`Advanced ${selected.length} applicants`, "Moved to next stage");
      setSelected([]);
    } catch (err) {
      toast.error("Couldn't advance", err.message || "Please try again.");
    }
  };

  const handleExport = () => {
    const rows = filtered.map((a) => ({
      name: a.name, roll: a.roll, branch: a.branch, cgpa: a.cgpa,
      stage: STAGES.find((s) => s.key === a.currentStage)?.label,
      applied_at: a.appliedAt,
    }));
    const csv = toCSV(rows, [
      { key: "name", label: "Name" },
      { key: "roll", label: "Roll" },
      { key: "branch", label: "Branch" },
      { key: "cgpa", label: "CGPA" },
      { key: "stage", label: "Stage" },
      { key: "applied_at", label: "Applied On" },
    ]);
    downloadCSV(`${company?.name}-${job.role}-applicants.csv`, csv);
    toast.success("Export started", `${rows.length} applicants exported`);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={() => navigate("/admin/jobs")}>
          Back to all jobs
        </Button>

        {/* Hero: job + company info */}
        <Card elevated>
          <Card.Body>
            <div className="flex items-start gap-4">
              <div
                className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md"
                style={{ background: company?.color }}
              >
                {company?.initial}
              </div>
              <div className="flex-1">
                <h1 className="display-heading text-3xl text-ink leading-tight">{job.role}</h1>
                <p className="text-sm text-ink-2 mt-1">
                  {company?.name} · {formatLPA(job.package)} · {job.location}
                </p>
                <p className="text-xs text-ink-3 mt-0.5">Apply by {formatDate(job.deadline)}</p>
              </div>
              <Button variant="secondary" leftIcon={Mail} onClick={() => setShowEmail(true)}>
                Email applicants
              </Button>
              <input
                ref={statusFileRef}
                type="file"
                accept=".csv"
                onChange={(e) => handleStatusImport(e.target.files?.[0])}
                className="hidden"
              />
              <Button variant="secondary" leftIcon={Upload} loading={importing} onClick={() => statusFileRef.current?.click()} title="CSV columns: rollId, stage">
                Import statuses
              </Button>
              <Button variant="secondary" leftIcon={Download} onClick={handleExport}>
                Export CSV
              </Button>
            </div>

            {/* Stage funnel strip */}
            <div className="mt-6 grid grid-cols-6 gap-2 pt-4 border-t border-border">
              {STAGES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStageFilter(stageFilter === s.key ? null : s.key)}
                  className={cn(
                    "text-left p-3 rounded-lg border transition-all",
                    stageFilter === s.key
                      ? "bg-accent/8 border-accent"
                      : "bg-surface-tint/40 border-border hover:border-border-strong"
                  )}
                >
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-ink-3">{s.label}</p>
                  <p className="num text-2xl font-semibold text-ink mt-1">
                    <CountUp value={stageCounts[s.key] || 0} duration={0.7} />
                  </p>
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* Search + filter chips */}
        <div className="space-y-3">
          <Input placeholder="Search by name or roll" leftIcon={Search} value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="flex items-center gap-2 flex-wrap">
            <Chip active={!stageFilter} onClick={() => setStageFilter(null)}>All stages</Chip>
            {STAGES.map((s) => (
              <Chip key={s.key} active={stageFilter === s.key} onClick={() => setStageFilter(s.key)}>
                {s.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Applicants list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title={search || stageFilter ? "No applicants match" : "No applicants yet"}
            description={search || stageFilter ? "Try clearing the search or filter." : "Students who apply will appear here."}
          />
        ) : (
          <Card>
            <div className="divide-y divide-border">
              {filtered.map((a, i) => {
                const isSel = selected.includes(a.id);
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.25 }}
                    className={cn(
                      "px-5 py-4 flex items-center gap-4 hover:bg-surface-tint/40 transition-colors",
                      isSel && "bg-accent/4"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() =>
                        setSelected((p) => p.includes(a.id) ? p.filter((x) => x !== a.id) : [...p, a.id])
                      }
                      className="h-4 w-4 rounded accent-accent"
                    />
                    <Avatar name={a.name} color={company?.color} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink truncate">{a.name}</p>
                      <p className="text-xs text-ink-3 font-mono mt-0.5">{a.roll} · {a.branch} · CGPA {a.cgpa}</p>
                    </div>

                    {/* Stage stepper (compact) — visual at-a-glance status */}
                    <div className="hidden md:block w-48">
                      <StatusStepper currentStage={a.currentStage} compact />
                    </div>

                    <Badge tone={STAGE_TONE[a.currentStage]} size="md" className="w-28 justify-center">
                      {STAGES.find((s) => s.key === a.currentStage)?.label}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/students?roll=${encodeURIComponent(a.roll)}`)}
                      title="View this student's full record"
                    >
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => handleRevoke(a)}
                      aria-label="Revoke application"
                    >
                      <UserX className="h-4 w-4 text-danger" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Bulk action floating bar */}
        <AnimatePresence>
          {selected.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 glass rounded-xl px-4 py-3 shadow-xl flex items-center gap-3"
            >
              <span className="text-sm font-medium text-ink">{selected.length} selected</span>
              <div className="h-5 w-px bg-border" />
              <Button size="sm" onClick={handleBulkAdvance}>Move forward</Button>
              <Button size="sm" variant="danger" leftIcon={ShieldCheck} onClick={handleBulkRevoke}>
                Revoke
              </Button>
              <button onClick={() => setSelected([])} className="p-1 rounded hover:bg-surface-tint">
                <X className="h-4 w-4 text-ink-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <EmailComposerModal
          open={showEmail}
          onClose={() => setShowEmail(false)}
          job={job}
          company={company}
          recipients={filtered}
        />
      </div>
    </PageTransition>
  );
}
