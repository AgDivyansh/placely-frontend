import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Download, X, Mail, Phone, GraduationCap,
  Award, Briefcase, TrendingUp, IdCard,
} from "lucide-react";
import { Card, Input, Chip, Badge, Avatar, Button } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { EmptyState } from "@/components/feedback/EmptyState";
import { selectAllApplicants } from "@/store/slices/applicantsSlice";
import { selectJobs } from "@/store/slices/jobsSlice";
import { COMPANIES } from "@/data/mockData";
import { BRANCHES, STAGES } from "@/lib/constants";
import { toCSV, downloadCSV } from "@/lib/csv";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

/**
 * StudentDirectoryPage — the admin's roster of all students.
 *
 * Aggregates the applicants data into unique student profiles (a student
 * may apply to several jobs). Clicking a student opens a detail drawer
 * showing their profile + every application and its stage.
 *
 * API-ready: GET /students in production. Derived from the applicants
 * slice for the demo.
 */

const STAGE_TONE = {
  applied: "neutral", shortlist: "info", oa: "warning",
  tech: "warning", hr: "accent", offer: "success",
};
const stageLabel = (key) => STAGES.find((s) => s.key === key)?.label || key;

export default function StudentDirectoryPage() {
  const applicants = useSelector(selectAllApplicants);
  const jobs = useSelector(selectJobs);
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState(null);
  const [selected, setSelected] = useState(null); // student detail drawer

  // Aggregate applicants → unique students by roll number
  const students = useMemo(() => {
    const map = new Map();
    applicants.forEach((a) => {
      if (!map.has(a.roll)) {
        map.set(a.roll, {
          roll: a.roll,
          name: a.name,
          branch: a.branch,
          cgpa: a.cgpa,
          email: `${a.name.toLowerCase().replace(/\s+/g, ".")}@college.edu`,
          phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
          applications: [],
        });
      }
      const job = jobs.find((j) => j.id === a.jobId);
      const company = job ? COMPANIES.find((c) => c.id === job.companyId) : null;
      map.get(a.roll).applications.push({
        id: a.id,
        jobRole: job?.role || "—",
        companyName: company?.name || "—",
        companyColor: company?.color,
        stage: a.currentStage,
      });
    });
    return [...map.values()];
  }, [applicants, jobs]);

  const filtered = useMemo(() => {
    let list = students;
    if (branchFilter) list = list.filter((s) => s.branch === branchFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.cgpa - a.cgpa);
  }, [students, branchFilter, search]);

  // Which branches actually have students
  const activeBranches = useMemo(
    () => BRANCHES.filter((b) => students.some((s) => s.branch === b)),
    [students]
  );

  const placedCount = useMemo(
    () => students.filter((s) => s.applications.some((a) => a.stage === "offer")).length,
    [students]
  );

  const handleExport = () => {
    const rows = filtered.map((s) => ({
      name: s.name, roll: s.roll, branch: s.branch, cgpa: s.cgpa,
      email: s.email, applications: s.applications.length,
      offers: s.applications.filter((a) => a.stage === "offer").length,
    }));
    const csv = toCSV(rows, [
      { key: "name", label: "Name" },
      { key: "roll", label: "Roll" },
      { key: "branch", label: "Branch" },
      { key: "cgpa", label: "CGPA" },
      { key: "email", label: "Email" },
      { key: "applications", label: "Applications" },
      { key: "offers", label: "Offers" },
    ]);
    downloadCSV("student-directory.csv", csv);
    toast.success("Export started", `${rows.length} students exported`);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="display-heading text-3xl text-ink flex items-center gap-3">
              <Users className="h-7 w-7 text-accent" />
              Student Directory
            </h1>
            <p className="text-sm text-ink-2 mt-1">
              {students.length} students · {placedCount} placed · {activeBranches.length} branches
            </p>
          </div>
          <Button variant="secondary" leftIcon={Download} onClick={handleExport}>
            Export CSV
          </Button>
        </div>

        {/* Search + branch filters */}
        <div className="space-y-3">
          <Input
            placeholder="Search by name or roll number"
            leftIcon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Chip active={!branchFilter} onClick={() => setBranchFilter(null)}>All branches</Chip>
            {activeBranches.map((b) => (
              <Chip key={b} active={branchFilter === b} onClick={() => setBranchFilter(b)}>
                {b}
              </Chip>
            ))}
          </div>
        </div>

        {/* Student grid */}
        {filtered.length === 0 ? (
          <EmptyState icon={Search} title="No students found" description="Try a different search or filter." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((s, i) => {
              const offers = s.applications.filter((a) => a.stage === "offer").length;
              return (
                <motion.button
                  key={s.roll}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => setSelected(s)}
                  className="text-left"
                >
                  <Card interactive className="h-full">
                    <Card.Body className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-ink truncate">{s.name}</p>
                          <p className="text-xs text-ink-3 font-mono">{s.roll}</p>
                        </div>
                        {offers > 0 && <Badge tone="success" size="sm" icon={Award}>Placed</Badge>}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge tone="neutral" size="sm">{s.branch}</Badge>
                        <Badge tone="info" size="sm">CGPA {s.cgpa}</Badge>
                        <Badge tone="accent" size="sm">{s.applications.length} applied</Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-bg z-50 shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={selected.name} size="lg" />
                    <div>
                      <h2 className="display-heading text-2xl text-ink">{selected.name}</h2>
                      <p className="text-xs text-ink-3 font-mono">{selected.roll}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="iconSm" onClick={() => setSelected(null)} aria-label="Close">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Profile fields */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: GraduationCap, label: "Branch", value: selected.branch },
                    { icon: Award, label: "CGPA", value: selected.cgpa },
                    { icon: Mail, label: "Email", value: selected.email },
                    { icon: Phone, label: "Phone", value: selected.phone },
                  ].map((f) => (
                    <div key={f.label} className="p-3 rounded-lg bg-surface-tint/50 border border-border">
                      <div className="flex items-center gap-1.5 text-ink-3">
                        <f.icon className="h-3.5 w-3.5" />
                        <span className="text-[10px] uppercase tracking-widest font-semibold">{f.label}</span>
                      </div>
                      <p className="text-sm text-ink mt-1 truncate">{f.value}</p>
                    </div>
                  ))}
                </div>

                {/* Applications */}
                <div>
                  <h3 className="font-semibold text-ink flex items-center gap-2 mb-3">
                    <Briefcase className="h-4 w-4 text-accent" />
                    Applications ({selected.applications.length})
                  </h3>
                  <div className="space-y-2">
                    {selected.applications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border"
                      >
                        <div
                          className="h-8 w-8 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: app.companyColor }}
                        >
                          {app.companyName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{app.jobRole}</p>
                          <p className="text-xs text-ink-3">{app.companyName}</p>
                        </div>
                        <Badge tone={STAGE_TONE[app.stage]} size="sm">
                          {stageLabel(app.stage)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
