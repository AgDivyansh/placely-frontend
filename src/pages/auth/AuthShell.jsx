import { motion } from "framer-motion";
import { Sparkles, Users, TrendingUp } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PageTransition } from "@/components/feedback/PageTransition";

/**
 * AuthShell — the split-screen frame shared by Login, Signup, and
 * Forgot-password pages. Keeps the branded left panel consistent so the
 * auth flow feels like one cohesive experience.
 *
 * @param {ReactNode} children - the form card for the right side
 */
export function AuthShell({ children }) {
  return (
    <PageTransition className="min-h-screen flex">
      {/* Left: branded panel */}
      <div className="hidden lg:flex w-1/2 bg-ink relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 30% 80%, var(--accent) 0%, transparent 50%), radial-gradient(circle at 80% 20%, #2C5BB8 0%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(245,241,232,0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 p-12 flex flex-col w-full">
          <Logo size="lg" />

          <div className="flex-1 flex flex-col justify-center max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="display-heading text-5xl text-bg leading-[1.05]"
            >
              Placement,<br />
              <em className="text-accent not-italic font-display italic">reimagined.</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-bg/70 leading-relaxed"
            >
              One unified workspace for jobs, applications, and verified alumni mentorship.
              No more lost emails, no more Excel sheets.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 space-y-4"
            >
              {[
                { icon: Sparkles, label: "Eligibility engine", desc: "Real-time qualification check across all jobs" },
                { icon: Users, label: "Verified alumni", desc: "Mentor calls with seniors at top companies" },
                { icon: TrendingUp, label: "Analytics", desc: "Live placement insights for TPOs" },
              ].map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg glass border border-bg/10 flex items-center justify-center shrink-0">
                    <f.icon className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-bg">{f.label}</p>
                    <p className="text-xs text-bg/60">{f.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="text-xs text-bg/40">© 2026 Placely · Bengaluru, India</div>
        </div>
      </div>

      {/* Right: form area */}
      <div className="w-full lg:w-1/2 flex flex-col bg-bg">
        <div className="flex items-center justify-between p-6">
          <Logo className="lg:hidden" />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">{children}</div>
      </div>
    </PageTransition>
  );
}
