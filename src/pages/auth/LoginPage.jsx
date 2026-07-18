import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, IdCard, Phone, AtSign } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { AuthShell } from "./AuthShell";
import { useAuth } from "@/store/hooks";
import { useToast } from "@/context/ToastContext";
import { DEMO_CREDS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Login identifier types — students may sign in with any of these.
 * The backend accepts a single `identifier` field + `identifierType`
 * so it knows which column to look up.
 */
const IDENTIFIERS = [
  { key: "email", label: "Email", icon: Mail, placeholder: "you@college.edu", type: "email" },
  { key: "collegeId", label: "College ID", icon: IdCard, placeholder: "e.g. 21CS1234", type: "text" },
  { key: "phone", label: "Phone", icon: Phone, placeholder: "+91 98765 43210", type: "tel" },
];

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [identifierType, setIdentifierType] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const activeId = IDENTIFIERS.find((i) => i.key === identifierType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please enter your credentials.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // We pass identifier as `email` for backwards-compat with the mock;
      // the real backend reads identifier + identifierType.
      const { role: actualRole, user: loggedInUser } = await login({
        email: identifier,
        identifier,
        identifierType,
        password,
        requestedRole: role,
      });
      toast.success("Welcome back", `Logged in as ${actualRole}.`);
      const from = location.state?.from?.pathname;
      // Land on the persona's home: admin → /admin, graduated (alumni) →
      // /mentor, else student dashboard.
      const home =
        actualRole === "admin" ? "/admin" : loggedInUser?.isAlumni ? "/mentor" : "/dashboard";
      navigate(from || home, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    const creds = role === "admin" ? DEMO_CREDS.admin : DEMO_CREDS.student;
    setIdentifierType("email");
    setIdentifier(creds.email);
    setPassword("placely2026");
  };

  return (
    <AuthShell>
      <Card elevated className="w-full max-w-md">
        <Card.Body className="p-8">
          <h2 className="display-heading text-3xl text-ink">Welcome back</h2>
          <p className="text-sm text-ink-2 mt-1.5">Sign in to continue to Placely</p>

          {/* Role toggle */}
          <div className="mt-7 flex bg-surface-tint rounded-lg p-1">
            {["student", "admin"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 h-9 rounded-md text-sm font-medium capitalize transition-all",
                  role === r ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink-2"
                )}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Identifier type selector (students get all 3; admin uses email) */}
          {role === "student" && (
            <div className="mt-4">
              <p className="text-xs font-medium text-ink-2 mb-2">Sign in with</p>
              <div className="grid grid-cols-3 gap-2">
                {IDENTIFIERS.map((id) => (
                  <button
                    key={id.key}
                    type="button"
                    onClick={() => {
                      setIdentifierType(id.key);
                      setIdentifier("");
                      setError("");
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition-all",
                      identifierType === id.key
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border text-ink-3 hover:border-border-strong hover:text-ink-2"
                    )}
                  >
                    <id.icon className="h-4 w-4" />
                    {id.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Input
              label={role === "admin" ? "Email" : activeId.label}
              type={role === "admin" ? "email" : activeId.type}
              placeholder={role === "admin" ? "admin@college.edu" : activeId.placeholder}
              leftIcon={role === "admin" ? Mail : activeId.icon}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                leftIcon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password" className="text-xs text-accent hover:text-accent-strong font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && <p className="text-xs text-danger">{error}</p>}

            <Button type="submit" size="lg" loading={loading} rightIcon={ArrowRight} className="w-full">
              Sign in as {role}
            </Button>
          </form>

          {/* Signup link (students) */}
          {role === "student" && (
            <p className="mt-5 text-center text-sm text-ink-2">
              New to Placely?{" "}
              <Link to="/signup" className="text-accent hover:text-accent-strong font-medium">
                Create an account
              </Link>
            </p>
          )}

          <div className="mt-5 p-3 rounded-lg bg-surface-tint border border-border">
            <p className="text-[11px] text-ink-3 uppercase tracking-widest font-semibold">Demo credentials</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-ink-2 font-mono">
                {role === "admin" ? DEMO_CREDS.admin.email : DEMO_CREDS.student.email}
              </p>
              <Button variant="link" size="sm" onClick={fillDemo}>Fill</Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </AuthShell>
  );
}
