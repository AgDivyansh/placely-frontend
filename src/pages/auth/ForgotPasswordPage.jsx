import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, Lock, ShieldCheck, Check } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { AuthShell } from "./AuthShell";
import { authApi } from "@/api";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

/**
 * ForgotPasswordPage — two-step reset.
 *   Step 1: enter email → backend sends OTP
 *   Step 2: enter OTP + new password → backend verifies + updates
 *
 * Demo mode: the mock "sends" an OTP and accepts any 6-digit code.
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const requestReset = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.info("Code sent", `Check ${email} for a 6-digit code`);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("Enter the 6-digit code");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords don't match");
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, password });
      setDone(true);
      toast.success("Password reset", "You can now sign in");
      setTimeout(() => navigate("/login", { replace: true }), 1600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <Card elevated className="w-full max-w-md">
        <Card.Body className="p-8">
          {done ? (
            <div className="text-center py-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/10 border border-success/30 mb-4">
                <Check className="h-7 w-7 text-success" />
              </div>
              <h2 className="display-heading text-2xl text-ink">Password reset</h2>
              <p className="text-sm text-ink-2 mt-2">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-ink-2 mb-4">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>

              <h2 className="display-heading text-3xl text-ink">
                {step === 1 ? "Reset password" : "Enter code"}
              </h2>
              <p className="text-sm text-ink-2 mt-1.5">
                {step === 1
                  ? "We'll send a 6-digit code to your email"
                  : `Enter the code sent to ${email} and choose a new password`}
              </p>

              {step === 1 ? (
                <form onSubmit={requestReset} className="mt-6 space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@college.edu"
                    leftIcon={Mail}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    error={error}
                  />
                  <Button type="submit" size="lg" loading={loading} rightIcon={ArrowRight} className="w-full">
                    Send reset code
                  </Button>
                </form>
              ) : (
                <form onSubmit={resetPassword} className="mt-6 space-y-4">
                  {/* OTP */}
                  <div>
                    <label className="block text-xs font-medium text-ink-2 mb-2">Verification code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                      placeholder="••••••"
                      className="w-full h-14 text-center text-2xl font-mono tracking-[0.5em] rounded-lg border border-border focus:border-accent focus:outline-none bg-surface"
                    />
                    <p className="text-[10px] text-info mt-1.5">
                      <ShieldCheck className="h-3 w-3 inline mr-1" />
                      Demo mode: enter any 6 digits
                    </p>
                  </div>
                  <Input
                    label="New password"
                    type="password"
                    placeholder="At least 8 characters"
                    leftIcon={Lock}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  />
                  <Input
                    label="Confirm new password"
                    type="password"
                    placeholder="Re-enter password"
                    leftIcon={Lock}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                  />
                  {error && <p className="text-xs text-danger">{error}</p>}
                  <Button type="submit" size="lg" loading={loading} rightIcon={ArrowRight} className="w-full">
                    Reset password
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(""); }}
                    className="w-full text-center text-xs text-ink-3 hover:text-ink-2"
                  >
                    Didn't get a code? Try again
                  </button>
                </form>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </AuthShell>
  );
}
