import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Lock, IdCard, Phone, ArrowRight, GraduationCap, Check,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { Button, Input, Card } from "@/components/ui";
import { AuthShell } from "./AuthShell";
import { signup } from "@/store/slices/authSlice";
import { useToast } from "@/context/ToastContext";
import { BRANCHES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * SignupPage — student account creation.
 *
 * Validation is client-side for UX; the backend must re-validate.
 * On success the signup thunk logs the user in (returns user + token).
 */
export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const gradYears = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 1 + i);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    collegeId: "",
    branch: "CSE",
    graduationYear: String(new Date().getFullYear() + 4),
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  // Password strength: 0-4
  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["bg-danger", "bg-danger", "bg-warning", "bg-info", "bg-success"][strength];

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = "Enter a valid email";
    if (!/^[+\d][\d\s-]{8,}$/.test(form.phone)) er.phone = "Enter a valid phone number";
    if (!form.collegeId.trim()) er.collegeId = "College ID is required";
    if (form.password.length < 8) er.password = "At least 8 characters";
    if (form.password !== form.confirm) er.confirm = "Passwords don't match";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await dispatch(signup({
        name: form.name,
        email: form.email,
        phone: form.phone,
        collegeId: form.collegeId,
        branch: form.branch,
        graduationYear: Number(form.graduationYear),
        password: form.password,
      }));
      if (signup.rejected.match(result)) {
        throw new Error(result.payload || "Signup failed");
      }
      toast.success("Account created", "Welcome to Placely!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error("Signup failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <Card elevated className="w-full max-w-md">
        <Card.Body className="p-8">
          <h2 className="display-heading text-3xl text-ink">Create your account</h2>
          <p className="text-sm text-ink-2 mt-1.5">Join Placely and start applying to top companies</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
            <Input
              label="Full name"
              placeholder="Divyansh Sharma"
              leftIcon={User}
              value={form.name}
              onChange={set("name")}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@college.edu"
              leftIcon={Mail}
              value={form.email}
              onChange={set("email")}
              error={errors.email}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                type="tel"
                placeholder="+91 98765..."
                leftIcon={Phone}
                value={form.phone}
                onChange={set("phone")}
                error={errors.phone}
              />
              <Input
                label="College ID"
                placeholder="21CS1234"
                leftIcon={IdCard}
                value={form.collegeId}
                onChange={set("collegeId")}
                error={errors.collegeId}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Branch select */}
              <label className="block">
                <span className="block text-xs font-medium text-ink-2 mb-1.5">Branch</span>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3 pointer-events-none" />
                  <select
                    value={form.branch}
                    onChange={set("branch")}
                    className="w-full h-10 pl-10 pr-3 rounded-lg bg-surface border border-border focus:border-accent focus:outline-none text-sm text-ink appearance-none"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </label>

              {/* Graduation year — determines when the account becomes alumni */}
              <label className="block">
                <span className="block text-xs font-medium text-ink-2 mb-1.5">Graduation year</span>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3 pointer-events-none" />
                  <select
                    value={form.graduationYear}
                    onChange={set("graduationYear")}
                    className="w-full h-10 pl-10 pr-3 rounded-lg bg-surface border border-border focus:border-accent focus:outline-none text-sm text-ink appearance-none"
                  >
                    {gradYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </label>
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                leftIcon={Lock}
                value={form.password}
                onChange={set("password")}
                error={errors.password}
              />
              {/* Strength meter */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          i < strength ? strengthColor : "bg-border"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-ink-3 mt-1">{strengthLabel}</p>
                </div>
              )}
            </div>

            <Input
              label="Confirm password"
              type="password"
              placeholder="Re-enter password"
              leftIcon={Lock}
              value={form.confirm}
              onChange={set("confirm")}
              error={errors.confirm}
            />

            <Button type="submit" size="lg" loading={loading} rightIcon={ArrowRight} className="w-full !mt-5">
              Create account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-2">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:text-accent-strong font-medium">
              Sign in
            </Link>
          </p>
        </Card.Body>
      </Card>
    </AuthShell>
  );
}
