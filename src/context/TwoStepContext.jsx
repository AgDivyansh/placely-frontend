import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X, AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const TwoStepContext = createContext(null);

/**
 * TwoStepProvider — manages a global 2-step verification flow.
 *
 * Usage pattern:
 *   const { request } = useTwoStep();
 *   request({
 *     title: "Delete job",
 *     description: "This action cannot be undone.",
 *     actionLabel: "Delete",
 *     danger: true,
 *     onConfirm: () => removeJob(id)
 *   });
 *
 * Flow:
 *   1. Caller dispatches request() with config
 *   2. Modal opens, shows description + 6-digit OTP input
 *   3. Demo: a fake code is generated and shown in the modal so judges
 *      can complete the flow without real email infrastructure.
 *      In production: send real OTP via SendGrid/MSG91, never display it.
 *   4. On correct OTP, run onConfirm and close modal
 */
export function TwoStepProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [code, setCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const request = useCallback((cfg) => {
    // Generate a fresh 6-digit demo code per request
    const fakeOtp = String(Math.floor(100000 + Math.random() * 900000));
    setCode(fakeOtp);
    setConfig(cfg);
    setEnteredCode("");
    setError("");
  }, []);

  const close = useCallback(() => {
    setConfig(null);
    setCode("");
    setEnteredCode("");
    setError("");
    setVerifying(false);
  }, []);

  const verify = async () => {
    setError("");
    if (enteredCode.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }
    if (enteredCode !== code) {
      setError("Incorrect code. Try again.");
      return;
    }
    setVerifying(true);
    // Simulate small server round-trip
    await new Promise((r) => setTimeout(r, 400));
    config.onConfirm?.();
    close();
  };

  // Auto-focus the input when modal opens
  useEffect(() => {
    if (config) setTimeout(() => inputRef.current?.focus(), 100);
  }, [config]);

  // Esc to cancel
  useEffect(() => {
    if (!config) return;
    const handler = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [config, close]);

  return (
    <TwoStepContext.Provider value={{ request }}>
      {children}
      <AnimatePresence>
        {config && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-ink/50 backdrop-blur-md"
              onClick={close}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="relative w-full max-w-md surface-card-elev overflow-hidden"
            >
              {/* Accent header strip */}
              <div className={cn(
                "h-1 w-full",
                config.danger ? "bg-danger" : "bg-accent"
              )} />

              <div className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
                    config.danger ? "bg-danger/10" : "bg-accent/10"
                  )}>
                    {config.danger ? (
                      <AlertTriangle className="h-5 w-5 text-danger" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 text-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display italic text-xl text-ink leading-tight">
                      {config.title}
                    </h2>
                    {config.description && (
                      <p className="text-sm text-ink-2 mt-1.5">{config.description}</p>
                    )}
                  </div>
                  <button onClick={close} className="p-1 rounded hover:bg-surface-tint">
                    <X className="h-4 w-4 text-ink-3" />
                  </button>
                </div>

                {/* OTP delivery info — demo mode shows the actual code */}
                <div className="rounded-lg bg-info/8 border border-info/20 px-3 py-2.5">
                  <div className="flex items-start gap-2.5">
                    <Mail className="h-4 w-4 text-info shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="text-ink-2">
                        We sent a 6-digit code to <span className="font-medium text-ink">your registered email</span>.
                      </p>
                      <p className="text-ink-3 mt-1">
                        <span className="font-semibold text-info">Demo mode:</span>{" "}
                        the code is <span className="font-mono font-bold text-ink">{code}</span>{" "}
                        <button
                          onClick={() => setEnteredCode(code)}
                          className="ml-1 text-info underline hover:no-underline"
                        >
                          (auto-fill)
                        </button>
                      </p>
                    </div>
                  </div>
                </div>

                {/* OTP input */}
                <div>
                  <label className="block text-xs font-medium text-ink-2 mb-2">
                    Verification code
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={enteredCode}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setEnteredCode(v);
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && verify()}
                    placeholder="••••••"
                    className={cn(
                      "w-full h-14 text-center text-2xl font-mono tracking-[0.6em] rounded-lg border transition-colors",
                      "bg-surface focus:outline-none",
                      error
                        ? "border-danger"
                        : "border-border focus:border-accent"
                    )}
                  />
                  {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="secondary" onClick={close}>Cancel</Button>
                  <Button
                    variant={config.danger ? "danger" : "primary"}
                    onClick={verify}
                    loading={verifying}
                    leftIcon={ShieldCheck}
                  >
                    {config.actionLabel || "Verify and continue"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TwoStepContext.Provider>
  );
}

export const useTwoStep = () => {
  const ctx = useContext(TwoStepContext);
  if (!ctx) throw new Error("useTwoStep must be used within TwoStepProvider");
  return ctx;
};
