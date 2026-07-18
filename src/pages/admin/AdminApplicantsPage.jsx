import { useState, useMemo, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Download, Building2 } from "lucide-react";
import { Card, Button, Input, Chip, Badge, Avatar, Combobox } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useToast } from "@/context/ToastContext";
import { useTwoStep } from "@/context/TwoStepContext";
import { selectCompanies } from "@/store/slices/companiesSlice";
import { selectJobs } from "@/store/slices/jobsSlice";
import {
  selectAllApplicants, bulkAdvanceApplicants, bulkRevokeApplicants,
} from "@/store/slices/applicantsSlice";
import { applicantsApi, IS_MOCK } from "@/api";
import { STAGES } from "@/lib/constants";
import { toCSV, downloadCSV } from "@/lib/csv";
import { cn } from "@/lib/utils";

const STAGE_TONE = {
  applied: "neutral", shortlist: "info", oa: "warning",
  tech: "warning", hr: "accent", offer: "success",
};
const stageLabel = (key) => STAGES.find((s) => s.key === key)?.label || key;

export default function AdminApplicantsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { request } = useTwoStep();
  const companies = useSelector(selectCompanies);
  const jobs = useSelector(selectJobs);
  const allApplicants = useSelector(selectAllApplicants);

  const [companyId, setCompanyId] = useState("");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState(null);
  const [selected, setSelected] = useState([]);
  const [remote, setRemote] = useState([]); // real-mode fetched applicants

  const company = companies.find((c) => c.id === companyId);

  // Real mode: fetch a company's applicants across all its jobs.
  const loadRemote = useCallback(async (cid) => {
    if (IS_MOCK || !cid) return;
    try {
      const data = await applicantsApi.byCompany(cid);
      setRemote(data.applicants || []);
    } catch (err) {
      toast.error("Couldn't load applicants", err.message || "Please try again.");
    }
  }, [toast]);

  useEffect(() => {
    setSelected([]);
    loadRemote(companyId);
  }, [companyId, loadRemote]);

  // Mock mode derives from the synthetic slice by matching the company's jobs.
  const applicants = useMemo(() => {
    if (!companyId) return [];
    if (!IS_MOCK) return remote;
    const jobIds = new Set(
      jobs.filter((j) => (j.company?.id || j.companyId) === companyId).map((j) => j.id)
    );
    return allApplicants
      .filter((a) => jobIds.has(a.jobId))
      .map((a) => ({ ...a, jobRole: jobs.find((j) => j.id === a.jobId)?.role || "—" }));
  }, [companyId, remote, allApplicants, jobs]);

  const filtered = useMemo(() => {
    let list = applicants;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.roll.toLowerCase().includes(q));
    }
    if (stageFilter) list = list.filter((a) => a.currentStage === stageFilter);
    return list;
  }, [applicants, search, stageFilter]);

  const toggleSelect = (id) =>
    setSelected((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));
  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((a) => a.id));

  const handleBulkAdvance = async () => {
    try {
      await dispatch(bulkAdvanceApplicants(selected)).unwrap();
      if (!IS_MOCK) await loadRemote(companyId);
      toast.success(`Advanced ${selected.length} applicant${selected.length === 1 ? "" : "s"}`, "Moved to next stage");
      setSelected([]);
    } catch (err) {
      toast.error("Couldn't advance", err.message || "Please try again.");
    }
  };

  const handleBulkRevoke = () => {
    request({
      title: `Revoke ${selected.length} application${selected.length === 1 ? "" : "s"}`,
      description: `This permanently removes ${selected.length} application${selected.length === 1 ? "" : "s"} at ${company?.name}. Students are notified.`,
      actionLabel: `Revoke ${selected.length}`,
      danger: true,
      onConfirm: async () => {
        try {
          await dispatch(bulkRevokeApplicants(selected)).unwrap();
          if (!IS_MOCK) await loadRemote(companyId);
          toast.warning("Applications revoked", `${selected.length} removed`);
          setSelected([]);
        } catch (err) {
          toast.error("Couldn't revoke", err.message || "Please try again.");
        }
      },
    });
  };

  const handleExport = () => {
    const rows = filtered.map((a) => ({
      name: a.name, roll: a.roll, branch: a.branch, cgpa: a.cgpa,
      role: a.jobRole, stage: stageLabel(a.currentStage),
    }));
    const csv = toCSV(rows, [
      { key: "name", label: "Name" },
      { key: "roll", label: "Roll" },
      { key: "branch", label: "Branch" },
      { key: "cgpa", label: "CGPA" },
      { key: "role", label: "Role" },
      { key: "stage", label: "Stage" },
    ]);
    downloadCSV(`placely-${company?.name || "company"}-applicants.csv`, csv);
    toast.success("Export started", `${rows.length} applicants downloaded`);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="display-heading text-3xl text-ink flex items-center gap-3">
            <Building2 className="h-7 w-7 text-accent" />
            Applicants by company
          </h1>
          <p className="text-sm text-ink-2 mt-1">
            Pick a company to review everyone who applied across its roles.
          </p>
        </div>

        <div className="max-w-sm">
          <Combobox
            label="Company"
            placeholder="Select a company…"
            value={companyId}
            onChange={setCompanyId}
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>

        {!companyId ? (
          <EmptyState icon={Building2} title="No company selected" description="Choose a company above to see its applicants." />
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-ink-2">
                {filtered.length} applicant{filtered.length === 1 ? "" : "s"} · {company?.name}
              </p>
              <Button variant="secondary" size="sm" leftIcon={Download} onClick={handleExport} disabled={filtered.length === 0}>
                Export CSV
              </Button>
            </div>

            <div className="space-y-3">
              <Input placeholder="Search applicants" leftIcon={Search} value={search} onChange={(e) => setSearch(e.target.value)} />
              <div className="flex items-center gap-2 flex-wrap">
                <Chip active={!stageFilter} onClick={() => setStageFilter(null)}>All stages</Chip>
                {STAGES.map((s) => (
                  <Chip key={s.key} active={stageFilter === s.key} onClick={() => setStageFilter(s.key)}>
                    {s.label}
                  </Chip>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState icon={Search} title="No applicants" description="No one matches the current filters." />
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-tint border-b border-border">
                        <th className="text-left py-3 px-4 w-10">
                          <input
                            type="checkbox"
                            checked={selected.length === filtered.length && filtered.length > 0}
                            onChange={toggleAll}
                            className="h-4 w-4 rounded accent-accent"
                          />
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Student</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Role</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Branch</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">CGPA</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Stage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((a) => {
                        const isSel = selected.includes(a.id);
                        return (
                          <tr
                            key={a.id}
                            className={cn(
                              "border-b border-border hover:bg-surface-tint transition-colors cursor-pointer",
                              isSel && "bg-accent/4"
                            )}
                            onClick={() => toggleSelect(a.id)}
                          >
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={isSel}
                                onChange={() => toggleSelect(a.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-4 w-4 rounded accent-accent"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <Avatar name={a.name} size="sm" color="var(--accent)" />
                                <div>
                                  <p className="font-medium text-ink">{a.name}</p>
                                  <p className="text-xs text-ink-3 font-mono">{a.roll}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-ink-2">{a.jobRole}</td>
                            <td className="py-3 px-4 text-ink">{a.branch}</td>
                            <td className="py-3 px-4 num font-semibold text-ink">{a.cgpa}</td>
                            <td className="py-3 px-4">
                              <Badge tone={STAGE_TONE[a.currentStage]} size="sm">{stageLabel(a.currentStage)}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Bulk action floating bar */}
        <AnimatePresence>
          {selected.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 glass rounded-xl px-4 py-3 shadow-xl flex items-center gap-4"
            >
              <span className="text-sm font-medium text-ink">{selected.length} selected</span>
              <div className="h-5 w-px bg-border" />
              <Button size="sm" onClick={handleBulkAdvance}>Move forward</Button>
              <Button size="sm" variant="danger" onClick={handleBulkRevoke}>Revoke</Button>
              <button onClick={() => setSelected([])} className="p-1 rounded hover:bg-surface-tint">
                <X className="h-4 w-4 text-ink-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
