import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Download, Upload, X, Mail, Phone, GraduationCap,
  Award, Briefcase,
} from "lucide-react";
import { Card, Input, Chip, Badge, Avatar, Button } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { EmptyState } from "@/components/feedback/EmptyState";
import { selectAllApplicants } from "@/store/slices/applicantsSlice";
import { selectJobs } from "@/store/slices/jobsSlice";
import { selectCompaniesById } from "@/store/slices/companiesSlice";
import { studentsApi, IS_MOCK } from "@/api";
import { COMPANIES } from "@/data/mockData";
import { BRANCHES, STAGES } from "@/lib/constants";
import { toCSV, downloadCSV, parseCSV } from "@/lib/csv";
import { useToast } from "@/context/ToastContext";

const STAGE_TONE = {
  applied: "neutral", shortlist: "info", oa: "warning",
  tech: "warning", hr: "accent", offer: "success",
};
const stageLabel = (key) => STAGES.find((s) => s.key === key)?.label || key;

// CSV headers are lenient: lowercased, with a few common aliases mapped to
// the fields the backend import expects.
const HEADER_ALIASES = {
  rollno: "collegeRollId", roll: "collegeRollId", rollnumber: "collegeRollId",
  "roll number": "collegeRollId", collegerollid: "collegeRollId",
  gradyear: "graduationYear", graduationyear: "graduationYear",
  name: "name", email: "email", branch: "branch", cgpa: "cgpa",
};
const mapRow = (row) => {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const key = HEADER_ALIASES[k.trim().toLowerCase()] || k.trim();
    out[key] = v;
  }
  return out;
};

export default function StudentDirectoryPage() {
  const applicants = useSelector(selectAllApplicants);
  const jobs = useSelector(selectJobs);
  const companiesById = useSelector(selectCompaniesById);
  const navigate = useNavigate();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState(null);
  const [selected, setSelected] = useState(null); // student detail drawer
  const [apiStudents, setApiStudents] = useState([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  // Deep-link from the job pipeline ("Profile" button) → open this student.
  const [searchParams] = useSearchParams();
  const deepLinkRoll = searchParams.get("roll");
  const deepLinkHandled = useRef(null);

  const loadStudents = useCallback(async () => {
    if (IS_MOCK) return;
    try {
      const data = await studentsApi.list();
      setApiStudents(data.students || []);
    } catch (err) {
      toast.error("Couldn't load students", err.message || "Please try again.");
    }
  }, [toast]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // Mock mode: aggregate synthetic applicants → unique students by roll.
  const mockStudents = useMemo(() => {
    const map = new Map();
    applicants.forEach((a) => {
      if (!map.has(a.roll)) {
        map.set(a.roll, {
          id: a.roll, roll: a.roll, name: a.name, branch: a.branch, cgpa: a.cgpa,
          email: `${a.name.toLowerCase().replace(/\s+/g, ".")}@college.edu`,
          phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
          applications: [],
        });
      }
      const job = jobs.find((j) => j.id === a.jobId);
      const company = job ? (job.company || companiesById[job.companyId] || COMPANIES.find((c) => c.id === job.companyId)) : null;
      map.get(a.roll).applications.push({
        id: a.id, jobId: a.jobId, jobRole: job?.role || "—",
        companyName: company?.name || "—", companyColor: company?.color, stage: a.currentStage,
      });
    });
    return [...map.values()].map((s) => ({
      ...s, applicationCount: s.applications.length,
      placed: s.applications.some((a) => a.stage === "offer"),
    }));
  }, [applicants, jobs, companiesById]);

  // Real mode: map the API list to the common shape (applications lazy-loaded).
  const students = useMemo(() => {
    if (IS_MOCK) return mockStudents;
    return apiStudents.map((s) => ({
      id: s.id, roll: s.collegeRollId || "—", name: s.name, branch: s.branch,
      cgpa: s.cgpa, email: s.email, phone: s.phone,
      applicationCount: s.applicationCount || 0, placed: !!s.placed, applications: [],
    }));
  }, [mockStudents, apiStudents]);

  const filtered = useMemo(() => {
    let list = students;
    if (branchFilter) list = list.filter((s) => s.branch === branchFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => b.cgpa - a.cgpa);
  }, [students, branchFilter, search]);

  const activeBranches = useMemo(
    () => BRANCHES.filter((b) => students.some((s) => s.branch === b)),
    [students]
  );
  const placedCount = useMemo(() => students.filter((s) => s.placed).length, [students]);

  // Open the drawer; in real mode fetch the student's applications on demand.
  const openStudent = async (s) => {
    setSelected(s);
    if (!IS_MOCK && s.applications.length === 0 && s.applicationCount > 0) {
      try {
        const data = await studentsApi.detail(s.id);
        const apps = (data.applications || []).map((a) => ({
          id: a.id,
          jobId: a.jobId?._id || a.jobId?.id || a.jobId,
          jobRole: a.jobId?.role || "—",
          companyName: a.companyId?.name || "—",
          companyColor: a.companyId?.color,
          stage: a.currentStage,
        }));
        setSelected((cur) => (cur && cur.id === s.id ? { ...cur, applications: apps } : cur));
      } catch {
        /* drawer still shows profile; applications just stay empty */
      }
    }
  };

  // Open the drawer automatically when arriving via ?roll= (from the pipeline).
  // Waits for the list to load (real mode is async); the ref fires it once.
  useEffect(() => {
    if (!deepLinkRoll || deepLinkHandled.current === deepLinkRoll) return;
    const match = students.find((s) => s.roll === deepLinkRoll);
    if (match) {
      deepLinkHandled.current = deepLinkRoll;
      openStudent(match);
    }
  }, [deepLinkRoll, students]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = () => {
    const rows = filtered.map((s) => ({
      name: s.name, roll: s.roll, branch: s.branch, cgpa: s.cgpa,
      email: s.email, applications: s.applicationCount, placed: s.placed ? "Yes" : "No",
    }));
    const csv = toCSV(rows, [
      { key: "name", label: "Name" }, { key: "roll", label: "Roll" },
      { key: "branch", label: "Branch" }, { key: "cgpa", label: "CGPA" },
      { key: "email", label: "Email" }, { key: "applications", label: "Applications" },
      { key: "placed", label: "Placed" },
    ]);
    downloadCSV("student-directory.csv", csv);
    toast.success("Export started", `${rows.length} students exported`);
  };

  const handleImport = async (file) => {
    if (!file) return;
    if (IS_MOCK) {
      toast.info("Demo mode", "Connect the backend to import students for real.");
      return;
    }
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text).map(mapRow);
      if (rows.length === 0) {
        toast.error("Empty file", "No rows found. Include a header row: name,email,collegeRollId,branch,cgpa,graduationYear");
        return;
      }
      const res = await studentsApi.import(rows);
      const { created = 0, failed = [] } = res;
      if (failed.length === 0) toast.success("Import complete", `${created} student${created === 1 ? "" : "s"} added`);
      else toast.warning("Import finished with issues", `${created} added, ${failed.length} skipped (${failed[0]?.reason || "error"})`);
      await loadStudents();
    } catch (err) {
      toast.error("Import failed", err.message || "Check the CSV format and try again.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="display-heading text-3xl text-ink flex items-center gap-3">
              <Users className="h-7 w-7 text-accent" />
              People
            </h1>
            <p className="text-sm text-ink-2 mt-1">
              {students.length} students · {placedCount} placed · {activeBranches.length} branches
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={(e) => handleImport(e.target.files?.[0])}
              className="hidden"
            />
            <Button variant="secondary" leftIcon={Upload} loading={importing} onClick={() => fileRef.current?.click()}>
              Import CSV
            </Button>
            <Button variant="secondary" leftIcon={Download} onClick={handleExport}>
              Export CSV
            </Button>
          </div>
        </div>

        <p className="text-xs text-ink-3 -mt-3">
          Import expects a header row: <span className="font-mono">name, email, collegeRollId, branch, cgpa, graduationYear</span>
        </p>

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
          <EmptyState icon={Search} title="No students found" description="Try a different search or import a roster." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((s, i) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                onClick={() => openStudent(s)}
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
                      {s.placed && <Badge tone="success" size="sm" icon={Award}>Placed</Badge>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone="neutral" size="sm">{s.branch}</Badge>
                      <Badge tone="info" size="sm">CGPA {s.cgpa}</Badge>
                      <Badge tone="accent" size="sm">{s.applicationCount} applied</Badge>
                    </div>
                  </Card.Body>
                </Card>
              </motion.button>
            ))}
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
                    Applications ({selected.applicationCount})
                  </h3>
                  <div className="space-y-2">
                    {selected.applications.length === 0 ? (
                      <p className="text-xs text-ink-3">
                        {selected.applicationCount > 0 ? "Loading applications…" : "No applications yet."}
                      </p>
                    ) : (
                      selected.applications.map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          disabled={!app.jobId}
                          onClick={() => app.jobId && navigate(`/admin/jobs/${app.jobId}/applicants`)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border border-border text-left transition-colors enabled:hover:bg-surface-tint enabled:hover:border-border-strong disabled:cursor-default"
                          title={app.jobId ? "Open this job's pipeline" : undefined}
                        >
                          <div
                            className="h-8 w-8 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: app.companyColor || "var(--accent)" }}
                          >
                            {app.companyName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{app.jobRole}</p>
                            <p className="text-xs text-ink-3">{app.companyName}</p>
                          </div>
                          <Badge tone={STAGE_TONE[app.stage]} size="sm">{stageLabel(app.stage)}</Badge>
                        </button>
                      ))
                    )}
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
