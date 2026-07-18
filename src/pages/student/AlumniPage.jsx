import { useState, useMemo, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  Search, Building2, GraduationCap, Phone, Video, MessageCircle, MessageSquareQuote,
} from "lucide-react";
import { Card, Input, Button, Badge, Avatar, Modal } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import { createConnect } from "@/store/slices/connectSlice";
import { connectApi, IS_MOCK } from "@/api";
import { useToast } from "@/context/ToastContext";
import { ALUMNI, COMPANIES } from "@/data/mockData";

const MODES = [
  { key: "video", label: "Video call", icon: Video },
  { key: "audio", label: "Audio call", icon: Phone },
  { key: "chat", label: "Chat / async", icon: MessageCircle },
];

// Map the mock ALUMNI array to the same shape the real directory returns, so
// the page renders identically in both modes.
const mockDirectory = () =>
  ALUMNI.map((a) => {
    const company = COMPANIES.find((c) => c.id === a.companyId);
    return {
      id: a.id,
      name: a.name,
      branch: a.expertise?.[0] || "—",
      graduationYear: a.gradYear,
      currentCompany: company?.name || "—",
      mentorBio: a.role,
    };
  });

export default function AlumniPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [alumni, setAlumni] = useState(IS_MOCK ? mockDirectory() : []);

  const [selected, setSelected] = useState(null); // alumnus being asked
  const [mode, setMode] = useState("video");
  const [topic, setTopic] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  // Real mode: fetch opted-in alumni from the directory, filtered by company.
  const loadDirectory = useCallback(async (company) => {
    if (IS_MOCK) return;
    try {
      const data = await connectApi.directory(company);
      setAlumni(data.alumni || []);
    } catch (err) {
      toast.error("Couldn't load alumni", err.message || "Please try again.");
    }
  }, [toast]);

  useEffect(() => { loadDirectory(debouncedSearch); }, [debouncedSearch, loadDirectory]);

  // Mock mode filters client-side (by name or company).
  const visible = useMemo(() => {
    if (!IS_MOCK) return alumni;
    if (!debouncedSearch) return alumni;
    const q = debouncedSearch.toLowerCase();
    return alumni.filter(
      (a) => a.name.toLowerCase().includes(q) || (a.currentCompany || "").toLowerCase().includes(q)
    );
  }, [alumni, debouncedSearch]);

  const openRequest = (a) => {
    setSelected(a);
    setMode("video");
    setTopic("");
    setNote("");
  };

  const sendRequest = async () => {
    if (!topic.trim()) {
      toast.error("Add a topic", "Tell them briefly what you need help with.");
      return;
    }
    setSending(true);
    try {
      await dispatch(createConnect({ alumniId: selected.id, mode, topic, note })).unwrap();
      toast.success("Request sent", `${selected.name} will be notified.`);
      setSelected(null);
    } catch (err) {
      toast.error("Couldn't send request", err.message || "Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="display-heading text-3xl text-ink">Alumni Connect</h1>
          <p className="text-sm text-ink-2 mt-1">
            Find alumni from your college — search a company to reach someone there for guidance or a referral.
          </p>
        </div>

        <Input
          placeholder="Search by name or company (e.g. Stripe)"
          leftIcon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {visible.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No alumni found"
            description={search ? `No alumni matching "${search}".` : "No alumni are open to mentoring yet."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
            {visible.map((a) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="h-full">
                  <Card.Body className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={a.name} size="md" color="var(--accent)" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink truncate">{a.name}</p>
                        {a.currentCompany && (
                          <p className="text-xs text-ink-2 flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {a.currentCompany}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {a.branch && <Badge tone="neutral" size="sm">{a.branch}</Badge>}
                      {a.graduationYear && (
                        <span className="text-xs text-ink-3 flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" /> {a.graduationYear}
                        </span>
                      )}
                    </div>
                    {a.mentorBio && <p className="text-sm text-ink-2 line-clamp-2">{a.mentorBio}</p>}
                    <Button variant="secondary" size="sm" leftIcon={MessageSquareQuote} onClick={() => openRequest(a)} className="w-full">
                      Request a connect
                    </Button>
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Request a connect"
        description={selected ? `Ask ${selected.name} for help. They'll accept and share a meeting link.` : ""}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={sendRequest} loading={sending} disabled={!topic.trim()}>Send request</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <span className="block text-xs font-medium text-ink-2 mb-2">How would you like to connect?</span>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMode(m.key)}
                  className={
                    "flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition-all " +
                    (mode === m.key
                      ? "border-accent bg-accent/5 text-accent"
                      : "border-border text-ink-3 hover:border-border-strong hover:text-ink-2")
                  }
                >
                  <m.icon className="h-4 w-4" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="block text-xs font-medium text-ink-2 mb-1.5">Topic <span className="text-danger">*</span></span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Referral for the SDE role / interview prep"
              className="w-full h-10 px-3 rounded-lg bg-surface border border-border focus:border-accent focus:outline-none text-sm placeholder:text-ink-3"
              autoFocus
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ink-2 mb-1.5">Note (optional)</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything specific you'd like them to know?"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-border focus:border-accent focus:outline-none text-sm placeholder:text-ink-3 resize-none"
            />
          </label>
        </div>
      </Modal>
    </PageTransition>
  );
}
