import { useState } from "react";
import {
  Pencil, ShieldCheck, Mail, Phone, GraduationCap, BookOpen, MapPin,
  Github, Linkedin, Code, ChefHat, Zap, Shield, Globe,
  Plus, Trash2, ExternalLink, Link2, Eye, EyeOff, Copy,
} from "lucide-react";
import { Card, Button, Avatar, Badge, Input, Modal } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { useAuth } from "@/store/hooks";
import { useToast } from "@/context/ToastContext";
import { profileApi, IS_MOCK } from "@/api";

// Fields safe to persist verbatim to the backend PATCH (clean strings it accepts).
const PERSISTABLE_FIELDS = new Set(["name", "phone", "branch"]);

// Ordered platform config for the Links section. `prefix` is shown as a hint
// and the stored value is the full canonical URL the backend validates.
const LINK_PLATFORMS = [
  { key: "github", label: "GitHub", icon: Github, prefix: "https://github.com/" },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, prefix: "https://linkedin.com/in/" },
  { key: "leetcode", label: "LeetCode", icon: Code, prefix: "https://leetcode.com/u/" },
  { key: "codeforces", label: "Codeforces", icon: Zap, prefix: "https://codeforces.com/profile/" },
  { key: "codechef", label: "CodeChef", icon: ChefHat, prefix: "https://www.codechef.com/users/" },
  { key: "hackerrank", label: "HackerRank", icon: Shield, prefix: "https://www.hackerrank.com/profile/" },
  { key: "website", label: "Website", icon: Globe, prefix: "https://" },
];

export default function ProfilePage() {
  const { user, role, updateUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // field name or null
  const [draftValue, setDraftValue] = useState("");

  const startEdit = (field, current) => {
    setEditing(field);
    setDraftValue(current || "");
  };

  // Single persistence path: update Redux instantly, and in real mode also
  // PATCH the backend so the change survives refresh and is server-visible
  // (e.g. resumes must exist server-side to be selectable at apply time).
  const persistProfile = async (patch) => {
    updateUser(patch);
    if (!IS_MOCK) {
      try {
        await profileApi.update(patch);
      } catch (err) {
        toast.error("Couldn't save", err.message || "Please try again.");
      }
    }
  };

  const saveEdit = () => {
    const patch = { [editing]: draftValue };
    // Only name/phone/branch are accepted by the backend PATCH; other rows
    // (cgpa, tenth, city, resume…) stay local to avoid invalid patches.
    if (PERSISTABLE_FIELDS.has(editing)) persistProfile(patch);
    else updateUser(patch);
    toast.success("Profile updated", `Your ${editing} has been saved.`);
    setEditing(null);
  };

  // Links are a keyed object; an empty value clears that platform.
  const [editingLink, setEditingLink] = useState(null); // platform key or null
  const [linkDraft, setLinkDraft] = useState("");

  const saveLink = () => {
    const next = { ...(user.socialLinks || {}) };
    const trimmed = linkDraft.trim();
    if (trimmed) next[editingLink] = trimmed;
    else delete next[editingLink];
    persistProfile({ socialLinks: next });
    toast.success("Link saved", `Your ${editingLink} link has been updated.`);
    setEditingLink(null);
  };

  const addProject = () => {
    const projects = [...(user.projects || []), { title: "New project", description: "", url: "", tech: [] }];
    updateUser({ projects });
  };

  const updateProject = (idx, patch) => {
    const projects = (user.projects || []).map((p, i) => (i === idx ? { ...p, ...patch } : p));
    updateUser({ projects });
  };

  const removeProject = (idx) => {
    updateUser({ projects: (user.projects || []).filter((_, i) => i !== idx) });
  };

  const togglePublic = () => {
    const next = !user.isPublic;
    // Mirror the backend: a slug is minted the first time a profile goes public.
    const patch = { isPublic: next };
    if (next && !user.slug) {
      const base = user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "user";
      patch.slug = `${base}-${Math.random().toString(16).slice(2, 6)}`;
    }
    updateUser(patch);
    toast.success(next ? "Profile is public" : "Profile is private", next ? "Anyone with your link can view it." : "Your public link is disabled.");
  };

  // The public link carries collegeId (`c`) since an unauthenticated visitor
  // has no session for the backend to scope the slug lookup by.
  const publicUrl = user?.slug
    ? `${window.location.origin}/u/${user.slug}${user.collegeId ? `?c=${user.collegeId}` : ""}`
    : "";

  const copyPublicLink = () => {
    navigator.clipboard?.writeText(publicUrl);
    toast.success("Link copied", publicUrl);
  };

  if (!user) return null;

  // API returns tenthPercent/twelfthPercent/collegeRollId; mock uses tenth/twelfth/rollNo.
  // Read the API name first, fall back to the mock name so both modes render.
  const tenth = user.tenthPercent ?? user.tenth;
  const twelfth = user.twelfthPercent ?? user.twelfth;
  const isAlum = user.isAlumni ?? false;

  // College email is issued by the college and read-only. Its badge flips to
  // an "expired" state once the account has graduated into alumni status.
  const collegeEmailBadge = user.collegeEmail
    ? isAlum
      ? { text: "Alumni · expired", tone: "warning" }
      : { text: "Verified", tone: "success" }
    : null;

  const fields = role === "student" ? [
    { key: "name", icon: Pencil, label: "Full name", value: user.name },
    { key: "email", icon: Mail, label: "Personal email", value: user.email, secure: true },
    { key: "collegeEmail", icon: Mail, label: "College email", value: user.collegeEmail || "Not linked", readOnly: true, badge: collegeEmailBadge },
    { key: "phone", icon: Phone, label: "Phone", value: user.phone, secure: true },
    { key: "branch", icon: BookOpen, label: "Branch", value: user.branch },
    { key: "graduationYear", icon: GraduationCap, label: "Graduation year", value: user.graduationYear, readOnly: true },
    { key: "cgpa", icon: GraduationCap, label: "CGPA", value: user.cgpa },
    { key: "tenth", icon: GraduationCap, label: "10th %", value: tenth != null ? `${tenth}%` : "—" },
    { key: "twelfth", icon: GraduationCap, label: "12th %", value: twelfth != null ? `${twelfth}%` : "—" },
    { key: "city", icon: MapPin, label: "City", value: user.city },
  ] : [
    { key: "name", icon: Pencil, label: "Full name", value: user.name },
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
                    {f.badge && <Badge tone={f.badge.tone} size="sm">{f.badge.text}</Badge>}
                  </div>
                  <p className="text-sm text-ink mt-0.5 truncate">{f.value}</p>
                </div>
                {f.readOnly ? (
                  <span className="text-xs text-ink-3 pr-2">Read-only</span>
                ) : (
                  <Button variant="ghost" size="sm" leftIcon={Pencil} onClick={() => startEdit(f.key, f.value)}>
                    Edit
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {role === "student" && (
          <>
            {/* Links */}
            <Card>
              <Card.Header><h3 className="font-semibold text-ink">Links</h3></Card.Header>
              <div className="divide-y divide-border">
                {LINK_PLATFORMS.map((p) => {
                  const value = user.socialLinks?.[p.key];
                  return (
                    <div key={p.key} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-tint transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-surface-tint flex items-center justify-center shrink-0">
                        <p.icon className="h-4 w-4 text-ink-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-ink-3">{p.label}</p>
                        {value ? (
                          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent-strong truncate flex items-center gap-1">
                            <span className="truncate">{value}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        ) : (
                          <p className="text-sm text-ink-3">Not added</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" leftIcon={value ? Pencil : Plus} onClick={() => { setEditingLink(p.key); setLinkDraft(value || ""); }}>
                        {value ? "Edit" : "Add"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Projects */}
            <Card>
              <Card.Header className="flex items-center justify-between">
                <h3 className="font-semibold text-ink">Projects</h3>
                <Button variant="secondary" size="sm" leftIcon={Plus} onClick={addProject}>Add project</Button>
              </Card.Header>
              <Card.Body className="space-y-4">
                {(user.projects || []).length === 0 && (
                  <p className="text-sm text-ink-3">No projects yet. Add one to showcase your work.</p>
                )}
                {(user.projects || []).map((proj, idx) => (
                  <div key={idx} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <Input label="Title" value={proj.title} onChange={(e) => updateProject(idx, { title: e.target.value })} />
                        <Input label="Description" value={proj.description} onChange={(e) => updateProject(idx, { description: e.target.value })} />
                        <Input label="URL" leftIcon={Link2} placeholder="https://..." value={proj.url || ""} onChange={(e) => updateProject(idx, { url: e.target.value })} />
                      </div>
                      <Button variant="ghost" size="iconSm" onClick={() => removeProject(idx)} aria-label="Remove project">
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>

            {/* Public profile share */}
            <Card>
              <Card.Header><h3 className="font-semibold text-ink">Public profile</h3></Card.Header>
              <Card.Body className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-ink">Share a public, recruiter-friendly version of your profile.</p>
                    <p className="text-xs text-ink-3 mt-0.5">Only your name, branch, skills, links and projects are shown — never email, phone, or CGPA.</p>
                  </div>
                  <Button variant={user.isPublic ? "secondary" : "primary"} size="sm" leftIcon={user.isPublic ? EyeOff : Eye} onClick={togglePublic}>
                    {user.isPublic ? "Make private" : "Make public"}
                  </Button>
                </div>
                {user.isPublic && user.slug && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-tint border border-border">
                    <Link2 className="h-4 w-4 text-ink-3 shrink-0" />
                    <span className="text-sm text-ink-2 truncate flex-1">{publicUrl}</span>
                    <Button variant="ghost" size="sm" leftIcon={Copy} onClick={copyPublicLink}>Copy</Button>
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" leftIcon={ExternalLink}>View</Button>
                    </a>
                  </div>
                )}
              </Card.Body>
            </Card>
          </>
        )}

        {/* Link edit modal */}
        <Modal
          open={editingLink !== null}
          onClose={() => setEditingLink(null)}
          title={`${user.socialLinks?.[editingLink] ? "Edit" : "Add"} ${LINK_PLATFORMS.find((p) => p.key === editingLink)?.label || ""} link`}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingLink(null)}>Cancel</Button>
              <Button onClick={saveLink}>Save</Button>
            </div>
          }
        >
          <Input
            label="Full URL"
            leftIcon={Link2}
            placeholder={LINK_PLATFORMS.find((p) => p.key === editingLink)?.prefix}
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            hint="Paste the full profile URL. Leave blank to remove."
            autoFocus
          />
        </Modal>

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

