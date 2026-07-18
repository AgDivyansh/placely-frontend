import { useState, useMemo } from "react";
import { Mail, Eye, Send, FileText, Users } from "lucide-react";
import { Modal, Button, Input, Badge } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

/**
 * EmailComposerModal — bulk email applicants with templates.
 *
 * Templates use {{variable}} syntax. Available variables:
 *   {{name}}, {{role}}, {{company}}
 *
 * In production:
 *   - Send via SendGrid (transactional API)
 *   - Render per-recipient on the server (don't blast templates to client)
 *   - Track open/click rates per template
 */
const TEMPLATES = [
  {
    id: "oa_scheduled",
    label: "OA scheduled",
    subject: "Online Assessment — {{role}} at {{company}}",
    body: `Hi {{name}},

Your Online Assessment for {{role}} at {{company}} is scheduled.

Date: <fill in>
Time: <fill in>
Link: <fill in>
Duration: 90 minutes

Please test your camera and microphone in advance. Best of luck!

— Placement Cell`,
  },
  {
    id: "shortlisted",
    label: "Shortlisted",
    subject: "Congratulations! Shortlisted for {{role}}",
    body: `Hi {{name}},

Great news — you have been shortlisted for the {{role}} role at {{company}}.

The next round details will be shared by EOD tomorrow. Please keep your calendar open between <date range>.

— Placement Cell`,
  },
  {
    id: "rejected",
    label: "Not selected (compassionate)",
    subject: "Update on your {{company}} application",
    body: `Hi {{name}},

Thank you for applying to {{role}} at {{company}}. After careful review, your application will not advance to the next round.

This decision reflects the specific role's needs, not your overall potential. Please continue applying to other opportunities on Placely — many of which match your profile.

If you would like personalized feedback, you can request a 1:1 with the placement cell.

— Placement Cell`,
  },
  {
    id: "offer",
    label: "Offer extended",
    subject: "Offer letter — {{company}}",
    body: `Hi {{name}},

We are delighted to share that {{company}} has extended an offer for the {{role}} role.

Offer details and next steps will be shared in a separate email from the company within 48 hours. Please respond to this email confirming your interest.

Congratulations!

— Placement Cell`,
  },
  {
    id: "blank",
    label: "Blank template",
    subject: "",
    body: "",
  },
];

const interpolate = (text, vars) =>
  text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);

export function EmailComposerModal({ open, onClose, job, company, recipients = [] }) {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const setTemplate = (id) => {
    const t = TEMPLATES.find((x) => x.id === id);
    setTemplateId(id);
    setSubject(t.subject);
    setBody(t.body);
  };

  // Preview for the currently-selected recipient
  const previewVars = useMemo(() => {
    const r = recipients[previewIdx];
    return {
      name: r?.name || "Student",
      role: job?.role || "Role",
      company: company?.name || "Company",
    };
  }, [previewIdx, recipients, job, company]);

  const previewSubject = interpolate(subject, previewVars);
  const previewBody = interpolate(body, previewVars);

  const send = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Cannot send", "Subject and body are required");
      return;
    }
    setSending(true);
    // Simulate batch send
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    onClose();
    toast.success(
      `Sent to ${recipients.length} applicant${recipients.length === 1 ? "" : "s"}`,
      `Template: ${TEMPLATES.find((t) => t.id === templateId)?.label}`
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Email applicants"
      description={`${recipients.length} recipient${recipients.length === 1 ? "" : "s"} · ${company?.name} — ${job?.role}`}
      size="xl"
      footer={
        <div className="flex items-center justify-between">
          <div className="text-xs text-ink-3 flex items-center gap-2">
            <Users className="h-3.5 w-3.5" />
            Will be sent to {recipients.length} student{recipients.length === 1 ? "" : "s"}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={send} loading={sending} leftIcon={Send} disabled={recipients.length === 0}>
              Send to {recipients.length}
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Composer */}
        <div className="lg:col-span-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-2">Template</label>
            <div className="flex gap-1.5 flex-wrap">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    "h-8 px-3 rounded-full text-xs font-medium border transition-colors",
                    templateId === t.id
                      ? "bg-ink text-bg border-ink"
                      : "bg-surface text-ink-2 border-border hover:border-border-strong"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line"
          />

          <label className="block">
            <span className="block text-xs font-medium text-ink-2 mb-1.5">Body</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="Type the email body. Use {{name}}, {{role}}, {{company}} as variables."
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border focus:border-accent focus:outline-none text-sm placeholder:text-ink-3 resize-none font-mono"
            />
          </label>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-ink-3 uppercase tracking-widest font-semibold">Variables:</span>
            {["{{name}}", "{{role}}", "{{company}}"].map((v) => (
              <Badge key={v} tone="info" size="sm">{v}</Badge>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-2 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </span>
            {recipients.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-ink-3">Recipient</span>
                <select
                  value={previewIdx}
                  onChange={(e) => setPreviewIdx(Number(e.target.value))}
                  className="h-7 px-2 rounded bg-surface border border-border text-xs"
                >
                  {recipients.map((r, i) => (
                    <option key={r.id} value={i}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="surface-card p-4 space-y-3 text-sm h-[330px] overflow-y-auto">
            <div className="pb-2 border-b border-border">
              <p className="text-[10px] uppercase tracking-widest text-ink-3 font-semibold">To</p>
              <p className="text-ink mt-0.5 font-medium">{previewVars.name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink-3 font-semibold">Subject</p>
              <p className="text-ink font-semibold mt-0.5">{previewSubject || <span className="text-ink-3 italic">No subject</span>}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink-3 font-semibold">Body</p>
              <pre className="text-ink mt-1 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                {previewBody || <span className="text-ink-3 italic">Empty body</span>}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
