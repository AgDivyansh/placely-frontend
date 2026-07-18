import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FileText, Upload, Check, Clock, AlertCircle, Eye, Trash2,
  Shield, Download, FileQuestion, Plus, Star, Pencil,
} from "lucide-react";
import { Card, Button, Badge, Progress, Input, Modal } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import {
  selectDocuments, uploadDocument, deleteDocument,
} from "@/store/slices/documentsSlice";
import { useAuth } from "@/store/hooks";
import { profileApi, IS_MOCK } from "@/api";
import { useToast } from "@/context/ToastContext";
import { useTwoStep } from "@/context/TwoStepContext";
import { cn, formatDate } from "@/lib/utils";

const MAX_RESUMES = 4;

/**
 * DocumentsPage — student's document vault.
 *
 * Status semantics:
 *   verified  — placement cell has marked authentic (green)
 *   uploaded  — uploaded but awaiting cell verification (amber)
 *   missing   — student hasn't uploaded (gray)
 *
 * Why this matters: in real placement cycles, 70% of admin email
 * volume is "send your 10th marksheet" / "upload your NOC" — the
 * vault eliminates that.
 */
const STATUS_META = {
  verified: { tone: "success", label: "Verified", icon: Check },
  uploaded: { tone: "warning", label: "Pending verification", icon: Clock },
  missing: { tone: "neutral", label: "Not uploaded", icon: AlertCircle },
  rejected: { tone: "danger", label: "Rejected", icon: AlertCircle },
};

export default function DocumentsPage() {
  const dispatch = useDispatch();
  const documents = useSelector(selectDocuments);
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const { request: requestTwoStep } = useTwoStep();
  const [uploadingId, setUploadingId] = useState(null);
  const inputRefs = useRef({});

  // ── Resumes (a small named set the student picks from when applying) ──
  const resumes = user?.resumes || [];
  const resumeInputRef = useRef(null);
  const [renaming, setRenaming] = useState(null); // resume id or null
  const [renameDraft, setRenameDraft] = useState("");

  // Update Redux instantly; in real mode also PATCH so resumes exist
  // server-side (the apply gate validates the chosen resume against these).
  const persistResumes = async (next) => {
    updateUser({ resumes: next });
    if (!IS_MOCK) {
      try {
        await profileApi.update({ resumes: next });
      } catch (err) {
        toast.error("Couldn't save resume", err.message || "Please try again.");
      }
    }
  };

  const handleResumeFile = (file) => {
    if (!file) return;
    if (resumes.length >= MAX_RESUMES) {
      toast.error("Limit reached", `You can store up to ${MAX_RESUMES} resumes.`);
      return;
    }
    if (resumes.some((r) => r.filename?.toLowerCase() === file.name.toLowerCase())) {
      toast.error("Already added", `"${file.name}" is already in your resumes.`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", "Maximum 10 MB");
      return;
    }
    const next = [
      ...resumes,
      {
        id: `r${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ""),
        filename: file.name,
        isDefault: resumes.length === 0,
      },
    ];
    persistResumes(next);
    toast.success("Resume added", file.name);
  };

  const saveRename = () => {
    const next = resumes.map((r) => (r.id === renaming ? { ...r, name: renameDraft.trim() || r.name } : r));
    persistResumes(next);
    setRenaming(null);
  };

  const setDefaultResume = (id) => {
    persistResumes(resumes.map((r) => ({ ...r, isDefault: r.id === id })));
  };

  const removeResume = (resume) => {
    requestTwoStep({
      title: "Delete resume",
      description: `Remove "${resume.name}". Applications already submitted keep the resume they used.`,
      actionLabel: "Delete resume",
      danger: true,
      onConfirm: () => {
        let next = resumes.filter((r) => r.id !== resume.id);
        // Keep a default if one existed and we removed it.
        if (resume.isDefault && next.length > 0 && !next.some((r) => r.isDefault)) {
          next = next.map((r, i) => (i === 0 ? { ...r, isDefault: true } : r));
        }
        persistResumes(next);
        toast.warning("Resume deleted", resume.name);
      },
    });
  };

  // Completion: required docs that are verified or uploaded
  const required = documents.filter((d) => d.required);
  const completedRequired = required.filter((d) => d.status === "verified" || d.status === "uploaded").length;
  const completionPct = required.length > 0
    ? Math.round((completedRequired / required.length) * 100)
    : 100;

  const handleFile = (docId, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", "Maximum 10 MB");
      return;
    }
    setUploadingId(docId);
    setTimeout(() => {
      dispatch(uploadDocument({
        id: docId,
        filename: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
      }));
      setUploadingId(null);
      toast.success("Uploaded", "Awaiting verification by the placement cell");
    }, 900);
  };

  // Deletion gated by 2FA (since these are documents of record)
  const handleDelete = (doc) => {
    requestTwoStep({
      title: "Delete document",
      description: `Remove ${doc.name} (${doc.filename}). You'll need to re-upload and re-verify.`,
      actionLabel: "Delete document",
      danger: true,
      onConfirm: () => {
        dispatch(deleteDocument(doc.id));
        toast.warning("Document deleted", doc.name);
      },
    });
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="display-heading text-3xl text-ink flex items-center gap-3">
            <Shield className="h-7 w-7 text-accent" />
            Document Vault
          </h1>
          <p className="text-sm text-ink-2 mt-1">
            All your placement documents in one secure place. Auto-attached when you apply.
          </p>
        </div>

        {/* Completion banner */}
        <Card elevated>
          <Card.Body className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-ink">Document completeness</h3>
                <p className="text-xs text-ink-3 mt-0.5">
                  {completedRequired} of {required.length} required documents on file
                </p>
              </div>
              <span className="num text-3xl font-semibold text-ink">{completionPct}%</span>
            </div>
            <Progress
              value={completionPct}
              tone={completionPct === 100 ? "success" : completionPct >= 70 ? "accent" : "warning"}
            />
            {completionPct < 100 && (
              <p className="text-xs text-warning flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                Missing required documents may block your application to top companies.
              </p>
            )}
          </Card.Body>
        </Card>

        {/* Resumes — the set a student picks from when applying */}
        <Card>
          <Card.Header className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-ink">Resumes</h3>
              <p className="text-xs text-ink-3 mt-0.5">
                Store up to {MAX_RESUMES}. You choose one each time you apply.
              </p>
            </div>
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleResumeFile(e.target.files?.[0])}
              className="hidden"
            />
            <Button
              size="sm"
              leftIcon={Plus}
              disabled={resumes.length >= MAX_RESUMES}
              onClick={() => resumeInputRef.current?.click()}
            >
              Add resume
            </Button>
          </Card.Header>
          <Card.Body className="space-y-2">
            {resumes.length === 0 && (
              <p className="text-sm text-ink-3">
                No resumes yet. Add at least one so you can apply to jobs.
              </p>
            )}
            {resumes.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink truncate">{r.name}</p>
                    {r.isDefault && <Badge tone="accent" size="sm">Default</Badge>}
                  </div>
                  {r.filename && <p className="text-xs text-ink-3 truncate font-mono">{r.filename}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {!r.isDefault && (
                    <Button variant="ghost" size="iconSm" aria-label="Set as default" onClick={() => setDefaultResume(r.id)}>
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="iconSm" aria-label="Rename" onClick={() => { setRenaming(r.id); setRenameDraft(r.name); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="iconSm" aria-label="Delete" onClick={() => removeResume(r)}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>

        {/* Document grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
          {documents.map((doc) => {
            const meta = STATUS_META[doc.status] || STATUS_META.missing;
            const StatusIcon = meta.icon;
            const isUploading = uploadingId === doc.id;
            const hasFile = doc.status !== "missing";

            return (
              <Card key={doc.id} className="group">
                <Card.Body className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-11 w-11 rounded-lg flex items-center justify-center shrink-0",
                      hasFile ? "bg-accent/10" : "bg-surface-tint"
                    )}>
                      {hasFile ? (
                        <FileText className="h-5 w-5 text-accent" />
                      ) : (
                        <FileQuestion className="h-5 w-5 text-ink-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-ink truncate">{doc.name}</h3>
                        {doc.required && (
                          <Badge tone="danger" size="sm">Required</Badge>
                        )}
                      </div>
                      {hasFile ? (
                        <p className="text-xs text-ink-2 mt-0.5 font-mono truncate">
                          {doc.filename}
                        </p>
                      ) : (
                        <p className="text-xs text-ink-3 mt-0.5 italic">Not uploaded yet</p>
                      )}
                      {doc.uploadedAt && (
                        <p className="text-[10px] text-ink-3 mt-1">
                          {doc.size} · Uploaded {formatDate(doc.uploadedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge tone={meta.tone} size="md" icon={StatusIcon}>
                      {meta.label}
                    </Badge>

                    <div className="flex items-center gap-1">
                      {hasFile && (
                        <>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label="Preview"
                            onClick={() => toast.info("Preview", "In production opens the file viewer")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label="Download"
                            onClick={() => toast.info("Download", "Would download " + doc.filename)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label="Delete"
                            onClick={() => handleDelete(doc)}
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </>
                      )}
                      <input
                        ref={(el) => (inputRefs.current[doc.id] = el)}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => handleFile(doc.id, e.target.files?.[0])}
                        className="hidden"
                      />
                      <Button
                        variant={hasFile ? "secondary" : "primary"}
                        size="sm"
                        leftIcon={Upload}
                        loading={isUploading}
                        onClick={() => inputRefs.current[doc.id]?.click()}
                      >
                        {hasFile ? "Replace" : "Upload"}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>

        <Modal
          open={renaming !== null}
          onClose={() => setRenaming(null)}
          title="Rename resume"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRenaming(null)}>Cancel</Button>
              <Button onClick={saveRename}>Save</Button>
            </div>
          }
        >
          <Input
            label="Resume name"
            value={renameDraft}
            onChange={(e) => setRenameDraft(e.target.value)}
            placeholder="e.g. Product roles, Backend-focused"
            autoFocus
          />
        </Modal>
      </div>
    </PageTransition>
  );
}
