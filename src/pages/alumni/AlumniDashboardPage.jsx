import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Megaphone, Building2, MessageSquareQuote, ArrowRight } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { PageTransition } from "@/components/feedback/PageTransition";
import { useAuth } from "@/store/hooks";

/**
 * AlumniDashboardPage — the landing page for graduated users (persona=alumni).
 * Alumni help current students rather than seek jobs, so this points at the
 * things they can do here. Mentor-request stats land here in a later phase.
 */
export default function AlumniDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const actions = [
    { icon: MessageSquareQuote, label: "Mentor requests", desc: "Help students prep for interviews", to: "/announcements", soon: true },
    { icon: Building2, label: "Companies", desc: "Browse companies your college works with", to: "/companies" },
    { icon: Megaphone, label: "Announcements", desc: "Post a job opening or update", to: "/announcements" },
    { icon: Users, label: "Student directory", desc: "Reach students to offer help", to: "/companies", soon: true },
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="display-heading text-4xl text-ink leading-tight">
            Welcome back, <em className="text-accent">{user?.name?.split(" ")[0]}</em>
          </h1>
          <p className="mt-2 text-ink-2">
            As an alumnus you can guide current students — answer their questions, help with
            interviews, and share opportunities from where you work now.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
          {actions.map((a) => (
            <Card key={a.label} interactive={!a.soon} onClick={a.soon ? undefined : () => navigate(a.to)}>
              <Card.Body className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <a.icon className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink">{a.label}</h3>
                    {a.soon && <span className="text-[10px] uppercase tracking-widest text-ink-3 border border-border rounded px-1.5 py-0.5">Soon</span>}
                  </div>
                  <p className="text-sm text-ink-2 mt-0.5">{a.desc}</p>
                </div>
                {!a.soon && <ArrowRight className="h-4 w-4 text-ink-3 mt-1" />}
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
