import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, CheckCircle2, FileQuestion } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { useAuth } from "@/store/hooks";
import { cn } from "@/lib/utils";

/**
 * ResumePickerModal — shown when a student applies. They MUST pick one of
 * their saved resumes. With none saved, it prompts them to add one first.
 *
 * onConfirm(resumeId) is called with the chosen resume; the parent runs the
 * actual apply and closes the modal on success.
 */
export function ResumePickerModal({ open, onClose, onConfirm, jobLabel, applying }) {
  const { user } = useAuth();
  const resumes = user?.resumes || [];
  const [selected, setSelected] = useState(null);

  // Default to the resume marked default (or the first) each time it opens.
  useEffect(() => {
    if (open) {
      const def = resumes.find((r) => r.isDefault) || resumes[0];
      setSelected(def?.id || null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasResumes = resumes.length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose a resume"
      description={jobLabel ? `Applying to ${jobLabel}` : "Select which resume to submit"}
      footer={
        hasResumes ? (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onConfirm(selected)} disabled={!selected || applying} loading={applying}>
              Submit application
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Link to="/documents">
              <Button>Add a resume</Button>
            </Link>
          </div>
        )
      }
    >
      {hasResumes ? (
        <div className="space-y-2">
          {resumes.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelected(r.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                selected === r.id
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-border-strong"
              )}
            >
              <div className="h-9 w-9 rounded-lg bg-surface-tint flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{r.name}</p>
                {r.filename && <p className="text-xs text-ink-3 truncate font-mono">{r.filename}</p>}
              </div>
              {selected === r.id && <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-tint mb-3">
            <FileQuestion className="h-6 w-6 text-ink-3" />
          </div>
          <p className="text-sm font-medium text-ink">No resumes saved yet</p>
          <p className="text-xs text-ink-2 mt-1">
            Add at least one resume in your Document Vault before applying.
          </p>
        </div>
      )}
    </Modal>
  );
}
