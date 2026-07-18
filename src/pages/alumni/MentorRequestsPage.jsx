import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  MessageSquareQuote, Phone, Video, MessageCircle, Check, X, Link2, Clock,
} from "lucide-react";
import { Card, Button, Badge, Avatar, Input, Modal, Chip } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { EmptyState } from "@/components/feedback/EmptyState";
import { fetchInbox, respondConnect, selectConnectInbox } from "@/store/slices/connectSlice";
import { useToast } from "@/context/ToastContext";

const MODE_ICON = { video: Video, audio: Phone, chat: MessageCircle };
const STATUS_TONE = { pending: "warning", accepted: "success", declined: "danger", completed: "neutral" };
const FILTERS = [
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "completed", label: "Completed" },
  { key: "declined", label: "Declined" },
];

export default function MentorRequestsPage() {
  const dispatch = useDispatch();
  const inbox = useSelector(selectConnectInbox);
  const toast = useToast();

  const [filter, setFilter] = useState("pending");
  const [accepting, setAccepting] = useState(null); // request being accepted
  const [meetingLink, setMeetingLink] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { dispatch(fetchInbox()); }, [dispatch]);

  const filtered = useMemo(
    () => inbox.filter((r) => r.status === filter),
    [inbox, filter]
  );
  const pendingCount = useMemo(() => inbox.filter((r) => r.status === "pending").length, [inbox]);

  const respond = async (req, status, link) => {
    setBusy(true);
    try {
      await dispatch(respondConnect({ id: req.id, status, meetingLink: link })).unwrap();
      toast.success(`Request ${status}`, req.student?.name || "");
      setAccepting(null);
      setMeetingLink("");
    } catch (err) {
      toast.error("Couldn't update", err.message || "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onAccept = (req) => {
    // Chat requests need no meeting link; calls do.
    if (req.mode === "chat") respond(req, "accepted");
    else setAccepting(req);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="display-heading text-3xl text-ink flex items-center gap-3">
            <MessageSquareQuote className="h-7 w-7 text-accent" />
            Mentor requests
          </h1>
          <p className="text-sm text-ink-2 mt-1">
            {pendingCount > 0
              ? `${pendingCount} student${pendingCount === 1 ? "" : "s"} waiting for your help.`
              : "Requests from students you can help appear here."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
            </Chip>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title={`No ${filter} requests`}
            description={filter === "pending" ? "You're all caught up." : "Nothing here yet."}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => {
              const ModeIcon = MODE_ICON[req.mode] || MessageCircle;
              return (
                <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <Card.Body className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar name={req.student?.name || "Student"} size="md" color="var(--accent)" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-ink">{req.student?.name || "Student"}</p>
                            {req.student?.branch && <Badge tone="neutral" size="sm">{req.student.branch}</Badge>}
                            <Badge tone={STATUS_TONE[req.status]} size="sm">{req.status}</Badge>
                          </div>
                          <p className="text-sm text-ink mt-1.5 font-medium flex items-center gap-1.5">
                            <ModeIcon className="h-3.5 w-3.5 text-accent" /> {req.topic}
                          </p>
                          {req.note && <p className="text-sm text-ink-2 mt-1">{req.note}</p>}
                          {req.status === "accepted" && req.meetingLink && (
                            <a
                              href={req.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-accent hover:text-accent-strong mt-2 inline-flex items-center gap-1"
                            >
                              <Link2 className="h-3 w-3" /> {req.meetingLink}
                            </a>
                          )}
                        </div>
                      </div>

                      {req.status === "pending" && (
                        <div className="flex justify-end gap-2 pt-1">
                          <Button variant="secondary" size="sm" leftIcon={X} onClick={() => respond(req, "declined")} disabled={busy}>
                            Decline
                          </Button>
                          <Button size="sm" leftIcon={Check} onClick={() => onAccept(req)} disabled={busy}>
                            Accept
                          </Button>
                        </div>
                      )}
                      {req.status === "accepted" && (
                        <div className="flex justify-end pt-1">
                          <Button variant="secondary" size="sm" leftIcon={Clock} onClick={() => respond(req, "completed")} disabled={busy}>
                            Mark completed
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Accept modal — capture the meeting link for a call */}
        <Modal
          open={!!accepting}
          onClose={() => setAccepting(null)}
          title="Share a meeting link"
          description={accepting ? `Accept ${accepting.student?.name || "the student"}'s ${accepting.mode} request and paste your Meet/Zoom link.` : ""}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAccepting(null)}>Cancel</Button>
              <Button
                onClick={() => respond(accepting, "accepted", meetingLink)}
                loading={busy}
                disabled={!meetingLink.trim()}
              >
                Accept &amp; send
              </Button>
            </div>
          }
        >
          <Input
            label="Meeting link"
            leftIcon={Link2}
            placeholder="https://meet.google.com/…"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            hint="The student sees this link once you accept."
            autoFocus
          />
        </Modal>
      </div>
    </PageTransition>
  );
}
