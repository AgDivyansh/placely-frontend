import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, Phone, Video, ShieldCheck, Clock, Check,
} from "lucide-react";
import { Card, Button, Avatar, Badge, Modal } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { useToast } from "@/context/ToastContext";
import { ALUMNI, COMPANIES } from "@/data/mockData";
import { cn } from "@/lib/utils";

const QUICK_REPLIES = ["Hi! Can we talk about your role?", "Any tips for the interview?", "Referral help?"];
const SLOTS = ["Today 6:00 PM", "Today 8:30 PM", "Tomorrow 10:00 AM", "Tomorrow 4:00 PM"];

export default function AlumniChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Origin-aware back navigation:
  //  - From JobDetail: state.from = "/jobs/:id", label = "Back to job"
  //  - From CompanyDetail: state.from = "/companies/:id", label = "Back to company"
  //  - Direct from /alumni: no state, label = "Back to alumni", goes to /alumni
  const backTo = location.state?.from || "/alumni";
  const backLabel = location.state?.fromLabel || "Back to alumni";
  const toast = useToast();

  const alumni = ALUMNI.find((a) => a.id === id);
  const company = COMPANIES.find((c) => c.id === alumni?.companyId);

  const [messages, setMessages] = useState([
    { id: 1, mine: false, body: `Hi! I'm ${alumni?.name.split(" ")[0]}. Happy to help — what's on your mind?`, time: "10:24 AM" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callState, setCallState] = useState("idle"); // idle | pending | approved
  const [selectedSlot, setSelectedSlot] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  if (!alumni) {
    return (
      <PageTransition>
        <Card><Card.Body><p className="text-ink-2">Alumni not found.</p></Card.Body></Card>
      </PageTransition>
    );
  }

  const send = (text) => {
    if (!text.trim()) return;
    const mine = { id: Date.now(), mine: true, body: text, time: now() };
    setMessages((m) => [...m, mine]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = pickReply(text);
      setMessages((m) => [...m, { id: Date.now() + 1, mine: false, body: reply, time: now() }]);
      setTyping(false);
    }, 1400);
  };

  const requestCall = () => {
    if (!selectedSlot) return;
    setShowCallModal(false);
    setCallState("pending");
    toast.info("Call request sent", `${alumni.name} will be notified`);
    setTimeout(() => {
      setCallState("approved");
      toast.success("Call approved!", `${selectedSlot} confirmed`);
    }, 2200);
  };

  return (
    <PageTransition>
      <div className="space-y-4">
        <Button variant="ghost" size="sm" leftIcon={ArrowLeft} onClick={() => navigate(backTo)}>{backLabel}</Button>

        <Card className="overflow-hidden">
          {/* Chat header */}
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative">
              <Avatar name={alumni.name} color={company?.color} size="md" />
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface",
                  alumni.available === "online" ? "bg-success" : "bg-warning"
                )}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-ink">{alumni.name}</p>
                {alumni.verified && <ShieldCheck className="h-3.5 w-3.5 text-info" />}
              </div>
              <p className="text-xs text-ink-2">{alumni.role} · {company?.name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              disabled={callState !== "approved"}
              onClick={() => setShowCallModal(true)}
              aria-label="Voice call"
            >
              <Phone className={cn("h-4 w-4", callState === "approved" ? "text-success" : "text-ink-3")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={callState !== "approved"}
              aria-label="Video call"
            >
              <Video className={cn("h-4 w-4", callState === "approved" ? "text-success" : "text-ink-3")} />
            </Button>
          </div>

          {/* Status banner */}
          {callState === "pending" && (
            <div className="px-4 py-2 bg-warning/8 border-b border-warning/20 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-warning" />
              <p className="text-xs text-ink-2">Call request pending — {alumni.name} is reviewing your slot</p>
            </div>
          )}
          {callState === "approved" && (
            <div className="px-4 py-2 bg-success/8 border-b border-success/20 flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-success" />
              <p className="text-xs text-ink-2">Call confirmed for {selectedSlot}</p>
            </div>
          )}

          {/* Messages */}
          <div
            ref={scrollRef}
            className="h-[420px] overflow-y-auto p-4 space-y-3 bg-surface-tint/30"
          >
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn("flex", m.mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-snug shadow-sm",
                      m.mine
                        ? "bg-ink text-bg rounded-br-md"
                        : "bg-surface text-ink border border-border rounded-bl-md"
                    )}
                  >
                    {m.body}
                    <div className={cn("text-[10px] mt-1 opacity-60", m.mine ? "text-bg" : "text-ink-3")}>{m.time}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-surface border border-border px-3.5 py-3 rounded-2xl rounded-bl-md flex gap-1">
                  {[0, 0.15, 0.3].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-ink-3"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: d }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick replies */}
          {messages.length <= 1 && (
            <div className="px-4 pt-3 flex gap-2 flex-wrap">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-surface-tint border border-border text-ink-2 hover:bg-surface hover:text-ink hover:border-border-strong transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <div className="p-3 border-t border-border flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Type your message…"
              className="flex-1 h-10 px-3 rounded-lg bg-surface border border-border focus:border-accent focus:outline-none text-sm placeholder:text-ink-3"
            />
            {callState === "idle" && (
              <Button variant="secondary" size="md" leftIcon={Phone} onClick={() => setShowCallModal(true)}>
                Request call
              </Button>
            )}
            <Button size="icon" onClick={() => send(input)} disabled={!input.trim()} aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <Modal
          open={showCallModal}
          onClose={() => setShowCallModal(false)}
          title="Request a call"
          description={`Pick a slot that works for both of you. ${alumni.name} will confirm.`}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowCallModal(false)}>Cancel</Button>
              <Button onClick={requestCall} disabled={!selectedSlot}>Send request</Button>
            </div>
          }
        >
          <div className="space-y-2">
            {SLOTS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSlot(s)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-colors",
                  selectedSlot === s
                    ? "bg-accent-soft border-accent text-accent-strong"
                    : "border-border hover:bg-surface-tint"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">{s}</span>
                  {selectedSlot === s && <Check className="h-4 w-4 text-accent" />}
                </div>
                <p className="text-xs text-ink-3 mt-0.5">30 minutes · Audio call</p>
              </button>
            ))}
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
}

function now() {
  return new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

function pickReply(text) {
  const t = text.toLowerCase();
  if (t.includes("interview")) return "For the interview, focus on real-world scenarios. They love system design questions about scalability and trade-offs.";
  if (t.includes("referral")) return "Sure! Share your resume here and I'll forward it to the hiring team this week.";
  if (t.includes("oa") || t.includes("test")) return "OA was 3 mediums + 1 hard. Practice LeetCode tagged with the company name — patterns repeat.";
  if (t.includes("dsa")) return "DSA-wise: arrays, graphs, DP. Don't ignore basics — they ask sliding window and binary search a lot.";
  return "Great question! Let me think about that for a moment…";
}
