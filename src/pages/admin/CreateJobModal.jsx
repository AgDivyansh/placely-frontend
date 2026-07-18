import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { Modal, Button, Input, Chip, Combobox } from "@/components/ui";
import { selectCompanies, createCompany } from "@/store/slices/companiesSlice";
import { useToast } from "@/context/ToastContext";
import { BRANCHES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "basic", label: "Basic info" },
  { key: "rounds", label: "Rounds" },
  { key: "eligibility", label: "Eligibility" },
];

const blank = {
  companyId: "",
  role: "",
  package: "",
  location: "",
  type: "Full-time",
  deadline: "",
  description: "",
  rounds: [],
  newRound: "",
  eligibility: {
    minCgpa: 7.0,
    minTenth: 70,
    minTwelfth: 70,
    branches: [],
    maxBacklogs: 0,
  },
};

export function CreateJobModal({ open, onClose, onCreate }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const companies = useSelector(selectCompanies);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(blank);
  const [addingCompany, setAddingCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", industry: "" });

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const updateEligibility = (patch) =>
    setForm((f) => ({ ...f, eligibility: { ...f.eligibility, ...patch } }));

  const handleCreateCompany = async () => {
    if (!newCompany.name.trim() || !newCompany.industry.trim()) return;
    const result = await dispatch(createCompany(newCompany));
    if (createCompany.rejected.match(result)) {
      toast.error("Couldn't add company", result.payload || "Try again.");
      return;
    }
    update({ companyId: result.payload.id });
    setNewCompany({ name: "", industry: "" });
    setAddingCompany(false);
    toast.success("Company added", result.payload.name);
  };

  const canAdvance = useMemo(() => {
    if (step === 0) return form.companyId && form.role && form.package && form.location && form.deadline;
    if (step === 1) return form.rounds.length >= 1;
    if (step === 2) return form.eligibility.branches.length > 0;
    return false;
  }, [step, form]);

  const handlePublish = () => {
    const job = {
      id: `j${Date.now()}`,
      companyId: form.companyId,
      role: form.role,
      package: Number(form.package),
      location: form.location,
      type: form.type,
      deadline: form.deadline,
      description: form.description,
      tags: [],
      rounds: form.rounds,
      eligibility: form.eligibility,
    };
    onCreate(job);
    setForm(blank);
    setStep(0);
    onClose();
  };

  const reset = () => {
    setForm(blank);
    setStep(0);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={reset}
      title="Create new job posting"
      size="lg"
      footer={
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canAdvance}>
              Next
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={!canAdvance}>Publish job</Button>
          )}
        </div>
      }
    >
      {/* Step indicator */}
      <div className="flex items-center mb-6">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                className={cn(
                  "h-7 w-7 rounded-full border-2 flex items-center justify-center font-semibold text-xs transition-colors",
                  i < step && "bg-success border-success text-white",
                  i === step && "bg-ink border-ink text-bg",
                  i > step && "bg-surface border-border text-ink-3"
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </motion.div>
              <span className={cn("text-[10px] font-medium", i === step ? "text-ink" : "text-ink-3")}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-5 bg-border">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i < step ? 1 : 0 }}
                  style={{ originX: 0 }}
                  className="h-full bg-success"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Step 1: basic info */}
      {step === 0 && (
        <div className="space-y-3">
          <Combobox
            label="Company"
            placeholder="Select a company…"
            value={form.companyId}
            onChange={(v) => update({ companyId: v })}
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
            footer={
              <button
                type="button"
                onClick={() => setAddingCompany((v) => !v)}
                className="w-full px-3 py-2.5 text-sm text-left text-accent hover:bg-surface-tint transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add new company
              </button>
            }
          />
          {addingCompany && (
            <div className="rounded-lg border border-border bg-surface-tint p-3 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Company name"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany((c) => ({ ...c, name: e.target.value }))}
                />
                <Input
                  placeholder="Industry"
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany((c) => ({ ...c, industry: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setAddingCompany(false)}>Cancel</Button>
                <Button size="sm" onClick={handleCreateCompany} disabled={!newCompany.name.trim() || !newCompany.industry.trim()}>
                  Add company
                </Button>
              </div>
            </div>
          )}
          <Input
            label="Role title"
            placeholder="e.g. Software Engineer"
            value={form.role}
            onChange={(e) => update({ role: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Package (LPA)"
              type="number"
              placeholder="18"
              value={form.package}
              onChange={(e) => update({ package: e.target.value })}
            />
            <Input
              label="Apply by"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={form.deadline}
              onChange={(e) => update({ deadline: e.target.value })}
            />
          </div>
          <Input
            label="Location"
            placeholder="e.g. Bengaluru / Remote"
            value={form.location}
            onChange={(e) => update({ location: e.target.value })}
          />
          <label className="block">
            <span className="block text-xs font-medium text-ink-2 mb-1.5">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={3}
              placeholder="What will candidates work on?"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border focus:border-accent text-sm placeholder:text-ink-3 resize-none"
            />
          </label>
        </div>
      )}

      {/* Step 2: rounds */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-ink-2">Add each interview round in order.</p>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Technical round 1"
              value={form.newRound}
              onChange={(e) => update({ newRound: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && form.newRound.trim()) {
                  update({ rounds: [...form.rounds, form.newRound.trim()], newRound: "" });
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={() => {
                if (form.newRound.trim()) {
                  update({ rounds: [...form.rounds, form.newRound.trim()], newRound: "" });
                }
              }}
            >
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {form.rounds.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-tint border border-border">
                <div className="h-7 w-7 rounded-full bg-ink text-bg flex items-center justify-center font-semibold text-xs">
                  {i + 1}
                </div>
                <p className="flex-1 text-sm text-ink">{r}</p>
                <button
                  onClick={() => update({ rounds: form.rounds.filter((_, idx) => idx !== i) })}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            {form.rounds.length === 0 && (
              <p className="text-xs text-ink-3 italic text-center py-4">No rounds added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: eligibility */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min CGPA"
              type="number"
              step="0.1"
              value={form.eligibility.minCgpa}
              onChange={(e) => updateEligibility({ minCgpa: Number(e.target.value) })}
            />
            <Input
              label="Max backlogs"
              type="number"
              value={form.eligibility.maxBacklogs}
              onChange={(e) => updateEligibility({ maxBacklogs: Number(e.target.value) })}
            />
            <Input
              label="Min 10th %"
              type="number"
              value={form.eligibility.minTenth}
              onChange={(e) => updateEligibility({ minTenth: Number(e.target.value) })}
            />
            <Input
              label="Min 12th %"
              type="number"
              value={form.eligibility.minTwelfth}
              onChange={(e) => updateEligibility({ minTwelfth: Number(e.target.value) })}
            />
          </div>
          <div>
            <span className="block text-xs font-medium text-ink-2 mb-2">Eligible branches</span>
            <div className="flex gap-2 flex-wrap">
              {BRANCHES.map((b) => (
                <Chip
                  key={b}
                  active={form.eligibility.branches.includes(b)}
                  onClick={() =>
                    updateEligibility({
                      branches: form.eligibility.branches.includes(b)
                        ? form.eligibility.branches.filter((x) => x !== b)
                        : [...form.eligibility.branches, b],
                    })
                  }
                >
                  {b}
                </Chip>
              ))}
            </div>
            {form.eligibility.branches.length === 0 && (
              <p className="text-xs text-warning mt-2">Select at least one branch.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
