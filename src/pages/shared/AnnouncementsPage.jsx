import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone, Pin, Plus, Trash2, X, Calendar, Tag, AlertCircle,
} from "lucide-react";
import { Card, Button, Badge, Input, Modal, Chip } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  selectAnnouncements, fetchAnnouncements,
  createAnnouncementThunk, removeAnnouncementThunk, togglePinThunk,
} from "@/store/slices/announcementsSlice";
import { IS_MOCK } from "@/api";
import { useAuth } from "@/store/hooks";
import { useToast } from "@/context/ToastContext";
import { useTwoStep } from "@/context/TwoStepContext";
import { cn, formatDate } from "@/lib/utils";

/**
 * AnnouncementsPage — the notices board, shared by students and admins.
 *
 *   • Students: read-only list, pinned notices on top.
 *   • Admins: can post new announcements and delete existing ones
 *     (delete is gated by 2-step verification).
 *
 * API-ready: list via GET /announcements, create via POST, delete via
 * DELETE /announcements/:id. Wired through the announcements slice today.
 */

const CATEGORIES = [
  { key: "general", label: "General", tone: "neutral" },
  { key: "drive", label: "Drive", tone: "accent" },
  { key: "deadline", label: "Deadline", tone: "danger" },
  { key: "event", label: "Event", tone: "info" },
];

const categoryTone = (key) => CATEGORIES.find((c) => c.key === key)?.tone || "neutral";
const categoryLabel = (key) => CATEGORIES.find((c) => c.key === key)?.label || "General";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(iso);
}

export default function AnnouncementsPage() {
  const dispatch = useDispatch();
  const announcements = useSelector(selectAnnouncements);
  const { role, persona } = useAuth();
  const toast = useToast();
  const { request: requestTwoStep } = useTwoStep();
  const isAdmin = role === "admin";
  // Alumni may post too (e.g. job openings); pin/delete stay admin-only.
  const canPost = isAdmin || persona === "alumni";

  const [filter, setFilter] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "general", pinned: false });

  const filtered = filter ? announcements.filter((a) => a.category === filter) : announcements;

  // Load the college's board from the API on mount (real mode).
  useEffect(() => {
    if (!IS_MOCK) dispatch(fetchAnnouncements());
  }, [dispatch]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Missing fields", "Title and body are required");
      return;
    }
    try {
      // Non-admins can't pin; the backend enforces this too.
      await dispatch(createAnnouncementThunk({ ...form, pinned: isAdmin ? form.pinned : false })).unwrap();
      toast.success("Announcement posted", "Students can now see it");
      setForm({ title: "", body: "", category: "general", pinned: false });
      setShowCreate(false);
    } catch (err) {
      toast.error("Couldn't post", err.message || "Please try again.");
    }
  };

  const handleDelete = (a) => {
    requestTwoStep({
      title: "Delete announcement",
      description: `Remove "${a.title}"? Students will no longer see it.`,
      actionLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        try {
          await dispatch(removeAnnouncementThunk(a.id)).unwrap();
          toast.warning("Announcement deleted", a.title);
        } catch (err) {
          toast.error("Couldn't delete", err.message || "Please try again.");
        }
      },
    });
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="display-heading text-3xl text-ink flex items-center gap-3">
              <Megaphone className="h-7 w-7 text-accent" />
              Announcements
            </h1>
            <p className="text-sm text-ink-2 mt-1">
              {canPost
                ? "Post notices and updates for students."
                : "Latest notices from the placement cell."}
            </p>
          </div>
          {canPost && (
            <Button leftIcon={Plus} onClick={() => setShowCreate(true)}>
              New announcement
            </Button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Chip active={!filter} onClick={() => setFilter(null)}>All</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.key} active={filter === c.key} onClick={() => setFilter(c.key)}>
              {c.label}
            </Chip>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements"
            description={filter ? "None in this category." : "Check back later for updates."}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={cn(a.pinned && "ring-1 ring-accent/30")}>
                  <Card.Body>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                        a.pinned ? "bg-accent/10" : "bg-surface-tint"
                      )}>
                        {a.pinned
                          ? <Pin className="h-5 w-5 text-accent" />
                          : <Megaphone className="h-5 w-5 text-ink-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {a.pinned && <Badge tone="accent" size="sm" icon={Pin}>Pinned</Badge>}
                          <Badge tone={categoryTone(a.category)} size="sm">
                            {categoryLabel(a.category)}
                          </Badge>
                          <span className="text-xs text-ink-3">{timeAgo(a.createdAt)}</span>
                        </div>
                        <h3 className="font-semibold text-ink mt-2">{a.title}</h3>
                        <p className="text-sm text-ink-2 mt-1 leading-relaxed">{a.body}</p>
                        <p className="text-xs text-ink-3 mt-2">— {a.authorName || a.author}</p>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label={a.pinned ? "Unpin" : "Pin"}
                            onClick={async () => {
                              try {
                                await dispatch(togglePinThunk(a.id)).unwrap();
                              } catch (err) {
                                toast.error("Couldn't update pin", err.message || "Please try again.");
                              }
                            }}
                          >
                            <Pin className={cn("h-4 w-4", a.pinned ? "text-accent" : "text-ink-3")} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            aria-label="Delete"
                            onClick={() => handleDelete(a)}
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal (admin) */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New announcement"
        description="This will be visible to all students immediately."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} leftIcon={Megaphone}>Post announcement</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Razorpay drive — pre-placement talk"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <label className="block">
            <span className="block text-xs font-medium text-ink-2 mb-1.5">Body</span>
            <textarea
              rows={5}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Write the announcement details…"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border focus:border-accent focus:outline-none text-sm placeholder:text-ink-3 resize-none"
            />
          </label>
          <div>
            <span className="block text-xs font-medium text-ink-2 mb-2">Category</span>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: c.key }))}
                  className={cn(
                    "h-8 px-3 rounded-full text-xs font-medium border transition-colors",
                    form.category === c.key
                      ? "bg-ink text-bg border-ink"
                      : "bg-surface text-ink-2 border-border hover:border-border-strong"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))}
              className="h-4 w-4 rounded accent-accent"
            />
            <span className="text-sm text-ink-2 flex items-center gap-1.5">
              <Pin className="h-3.5 w-3.5" /> Pin to top
            </span>
          </label>
        </div>
      </Modal>
    </PageTransition>
  );
}
