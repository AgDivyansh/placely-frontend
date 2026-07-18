import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, X, Download } from "lucide-react";
import { Card, Button, Input, Chip, Badge, Avatar } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { useToast } from "@/context/ToastContext";
import { STAGES, STAGE_INDEX } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toCSV, downloadCSV } from "@/lib/csv";

// Static demo applicants
const APPLICANTS = [
  { id: "1", name: "Aarav Mehta", roll: "21CS5021", branch: "CSE", cgpa: 9.1, company: "Razorpay", stage: "tech" },
  { id: "2", name: "Diya Krishnan", roll: "21CS5034", branch: "CSE", cgpa: 8.6, company: "Razorpay", stage: "hr" },
  { id: "3", name: "Ishaan Patel", roll: "21IT5012", branch: "IT", cgpa: 8.2, company: "Razorpay", stage: "oa" },
  { id: "4", name: "Riya Sharma", roll: "21CS5067", branch: "CSE", cgpa: 8.9, company: "Razorpay", stage: "shortlist" },
  { id: "5", name: "Krishna Iyer", roll: "21IT5022", branch: "IT", cgpa: 9.4, company: "Razorpay", stage: "offer" },
  { id: "6", name: "Ananya Desai", roll: "21EC5008", branch: "ECE", cgpa: 8.0, company: "Razorpay", stage: "applied" },
  { id: "7", name: "Arjun Reddy", roll: "21CS5089", branch: "CSE", cgpa: 7.8, company: "Razorpay", stage: "tech" },
  { id: "8", name: "Sneha Banerjee", roll: "21AI5014", branch: "AIML", cgpa: 8.7, company: "Razorpay", stage: "shortlist" },
];

const STAGE_TONE = {
  applied: "neutral",
  shortlist: "info",
  oa: "warning",
  tech: "warning",
  hr: "accent",
  offer: "success",
};

export default function AdminApplicantsPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState(null);
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    let list = APPLICANTS;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.roll.toLowerCase().includes(q));
    }
    if (stageFilter) list = list.filter((a) => a.stage === stageFilter);
    return list;
  }, [search, stageFilter]);

  const toggleSelect = (id) => {
    setSelected((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));
  };

  const toggleAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((a) => a.id));
  };

  const bulkAdvance = () => {
    toast.success(`Advanced ${selected.length} applicant${selected.length !== 1 ? "s" : ""}`, "Moved to next stage");
    setSelected([]);
  };

  const bulkReject = () => {
    toast.warning(`Rejected ${selected.length} applicant${selected.length !== 1 ? "s" : ""}`, "Notification sent");
    setSelected([]);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="display-heading text-3xl text-ink">Applicants</h1>
            <p className="text-sm text-ink-2 mt-1">{filtered.length} applicant{filtered.length !== 1 ? "s" : ""} · Razorpay · Software Engineer</p>
          </div>
          <Button
            variant="secondary"
            leftIcon={Download}
            onClick={() => {
              const rows = filtered.map((a) => ({
                name: a.name,
                roll: a.roll,
                branch: a.branch,
                cgpa: a.cgpa,
                company: a.company,
                stage: STAGES.find((s) => s.key === a.stage)?.label,
              }));
              const csv = toCSV(rows, [
                { key: "name", label: "Name" },
                { key: "roll", label: "Roll" },
                { key: "branch", label: "Branch" },
                { key: "cgpa", label: "CGPA" },
                { key: "company", label: "Company" },
                { key: "stage", label: "Stage" },
              ]);
              downloadCSV(`placely-applicants-${new Date().toISOString().slice(0, 10)}.csv`, csv);
              toast.success("Export started", `${rows.length} applicants downloaded`);
            }}
          >
            Export CSV
          </Button>
        </div>

        {/* Filter row */}
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

        {/* Table */}
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Branch</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">CGPA</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider">Stage</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wider"></th>
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
                      <td className="py-3 px-4 text-ink">{a.branch}</td>
                      <td className="py-3 px-4 num font-semibold text-ink">{a.cgpa}</td>
                      <td className="py-3 px-4">
                        <Badge tone={STAGE_TONE[a.stage]} size="sm">
                          {STAGES.find((s) => s.key === a.stage)?.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <ChevronRight className="h-4 w-4 text-ink-3 inline" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

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
              <Button size="sm" onClick={bulkAdvance}>Move forward</Button>
              <Button size="sm" variant="danger" onClick={bulkReject}>Reject</Button>
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
