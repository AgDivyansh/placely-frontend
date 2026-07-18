import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FileText, Upload, Check, Clock, AlertCircle, Eye, Trash2,
  Shield, Download, FileQuestion,
} from "lucide-react";
import { Card, Button, Badge, Progress } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import {
  selectDocuments, uploadDocument, deleteDocument,
} from "@/store/slices/documentsSlice";
import { useToast } from "@/context/ToastContext";
import { useTwoStep } from "@/context/TwoStepContext";
import { cn, formatDate } from "@/lib/utils";

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
  const toast = useToast();
  const { request: requestTwoStep } = useTwoStep();
  const [uploadingId, setUploadingId] = useState(null);
  const inputRefs = useRef({});

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
      </div>
    </PageTransition>
  );
}
