import { useState, useRef } from "react";
import { Pencil, ShieldCheck, Mail, Phone, GraduationCap, BookOpen, FileText, MapPin, Upload, CheckCircle2 } from "lucide-react";
import { Card, Button, Avatar, Badge, Input, Modal } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { useAuth } from "@/store/hooks";
import { useToast } from "@/context/ToastContext";

export default function ProfilePage() {
  const { user, role, updateUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // field name or null
  const [draftValue, setDraftValue] = useState("");

  const startEdit = (field, current) => {
    setEditing(field);
    setDraftValue(current || "");
  };

  const saveEdit = () => {
    updateUser({ [editing]: draftValue });
    toast.success("Profile updated", `Your ${editing} has been saved.`);
    setEditing(null);
  };

  if (!user) return null;

  const fields = role === "student" ? [
    { key: "email", icon: Mail, label: "Email", value: user.email, secure: true },
    { key: "phone", icon: Phone, label: "Phone", value: user.phone, secure: true },
    { key: "branch", icon: BookOpen, label: "Branch", value: user.branch },
    { key: "cgpa", icon: GraduationCap, label: "CGPA", value: user.cgpa },
    { key: "tenth", icon: GraduationCap, label: "10th %", value: `${user.tenth}%` },
    { key: "twelfth", icon: GraduationCap, label: "12th %", value: `${user.twelfth}%` },
    { key: "resume", icon: FileText, label: "Resume", value: user.resume },
    { key: "city", icon: MapPin, label: "City", value: user.city },
  ] : [
    { key: "email", icon: Mail, label: "Email", value: user.email, secure: true },
    { key: "phone", icon: Phone, label: "Phone", value: user.phone, secure: true },
    { key: "department", icon: BookOpen, label: "Department", value: user.department },
    { key: "college", icon: GraduationCap, label: "College", value: user.college },
    { key: "city", icon: MapPin, label: "City", value: user.city },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="display-heading text-3xl text-ink">Profile</h1>
          <p className="text-sm text-ink-2 mt-1">Keep this up to date so we can match you with the right roles.</p>
        </div>

        {/* Hero card */}
        <Card elevated>
          <Card.Body className="flex items-center gap-4">
            <Avatar name={user.name} size="xl" color="var(--accent)" />
            <div className="flex-1">
              <h2 className="font-display italic text-2xl text-ink">{user.name}</h2>
              <p className="text-sm text-ink-2 mt-1">
                {role === "student" ? `${user.rollNo} · ${user.branch} · Year ${user.year}` : user.role}
              </p>
              <p className="text-xs text-ink-3 mt-0.5">{user.college}</p>
            </div>
            {role === "student" && user.skills?.length > 0 && (
              <div className="hidden md:block">
                <p className="text-xs text-ink-3 mb-1">Skills</p>
                <div className="flex gap-1 flex-wrap">
                  {user.skills.slice(0, 4).map((s) => (
                    <Badge key={s} tone="neutral" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Field list */}
        <Card>
          <Card.Header><h3 className="font-semibold text-ink">Personal information</h3></Card.Header>
          <div className="divide-y divide-border">
            {fields.map((f) => (
              <div key={f.key} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-tint transition-colors">
                <div className="h-8 w-8 rounded-lg bg-surface-tint flex items-center justify-center shrink-0">
                  <f.icon className="h-4 w-4 text-ink-2" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs text-ink-3">{f.label}</p>
                    {f.secure && <ShieldCheck className="h-3 w-3 text-info" />}
                  </div>
                  <p className="text-sm text-ink mt-0.5 truncate">{f.value}</p>
                </div>
                <Button variant="ghost" size="sm" leftIcon={Pencil} onClick={() => startEdit(f.key, f.value)}>
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Resume upload (student only) */}
        {role === "student" && <ResumeUploadCard user={user} updateUser={updateUser} toast={toast} />}

        <Modal
          open={editing !== null}
          onClose={() => setEditing(null)}
          title={`Edit ${editing}`}
          description={fields.find((f) => f.key === editing)?.secure ? "Verification required for sensitive fields" : null}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={saveEdit}>Save changes</Button>
            </div>
          }
        >
          <Input
            label={`New ${editing}`}
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            autoFocus
          />
          {fields.find((f) => f.key === editing)?.secure && (
            <div className="mt-4 p-3 rounded-lg bg-info/8 border border-info/20">
              <p className="text-xs text-ink-2">
                <ShieldCheck className="h-3 w-3 inline text-info mr-1" />
                In production, this field requires an OTP sent to your registered phone/email.
              </p>
            </div>
          )}
        </Modal>
      </div>
    </PageTransition>
  );
}

/**
 * ResumeUploadCard — drag/drop or click to upload, with parse animation.
 * Mocked: in production this calls POST /api/students/me/resume which
 * runs the PDF through a parser (Affinda, Sovren, or in-house LLM extractor)
 * and populates skills, experience, education.
 */
function ResumeUploadCard({ user, updateUser, toast }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsedSkills, setParsedSkills] = useState([]);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.match(/\.(pdf|docx?)$/i)) {
      toast.error("Unsupported file", "Please upload a PDF or Word document");
      return;
    }
    setUploading(true);
    setParsedSkills([]);
    // Simulate upload + parse latency
    setTimeout(() => {
      updateUser({ resume: file.name });
      // Pretend we extracted these from the PDF
      const detected = ["React", "TypeScript", "Node.js", "PostgreSQL", "System Design"];
      setParsedSkills(detected);
      setUploading(false);
      toast.success("Resume uploaded", `Extracted ${detected.length} skills automatically`);
    }, 1400);
  };

  return (
    <Card>
      <Card.Header>
        <h3 className="font-semibold text-ink">Resume</h3>
        <p className="text-xs text-ink-3 mt-0.5">
          PDF or DOCX. We auto-extract skills using an AI parser.
        </p>
      </Card.Header>
      <Card.Body>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer p-8 text-center ${
            dragging ? "border-accent bg-accent/5" : "border-border hover:border-border-strong hover:bg-surface-tint"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 border border-accent/20 mb-3">
            {uploading ? (
              <svg className="animate-spin h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
                <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              <Upload className="h-5 w-5 text-accent" />
            )}
          </div>
          {uploading ? (
            <p className="text-sm text-ink-2">Parsing your resume…</p>
          ) : (
            <>
              <p className="text-sm font-medium text-ink">
                {user.resume ? "Replace resume" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-ink-3 mt-1">PDF or Word, up to 10 MB</p>
              {user.resume && (
                <p className="mt-2 text-xs text-ink-2 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  Current: <span className="font-mono">{user.resume}</span>
                </p>
              )}
            </>
          )}
        </div>

        {parsedSkills.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-success/5 border border-success/20">
            <p className="text-xs font-semibold text-success uppercase tracking-widest">
              ✓ Skills detected
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {parsedSkills.map((s) => (
                <Badge key={s} tone="success" size="sm">{s}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
