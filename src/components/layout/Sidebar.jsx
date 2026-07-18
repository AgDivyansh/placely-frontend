import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Briefcase, Building2, GraduationCap, User,
  LogOut, BarChart3, FileText, Users, Bookmark, Settings, Activity,
  Calendar, Shield, TrendingUp, MessageSquareQuote, Megaphone,
} from "lucide-react";
import { useAuth } from "@/store/hooks";
import { Logo } from "./Logo";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

const STUDENT_NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/jobs", icon: Briefcase, label: "Jobs" },
  { to: "/bookmarks", icon: Bookmark, label: "Saved jobs" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/companies", icon: Building2, label: "Companies" },
  { to: "/alumni", icon: GraduationCap, label: "Alumni Connect" },
  { to: "/interview-experiences", icon: MessageSquareQuote, label: "Interview Prep" },
  { to: "/placement-stats", icon: TrendingUp, label: "Placement Stats" },
  { to: "/announcements", icon: Megaphone, label: "Announcements" },
  { to: "/documents", icon: Shield, label: "Documents" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const ADMIN_NAV = [
  { to: "/admin", icon: BarChart3, label: "Analytics" },
  { to: "/admin/jobs", icon: FileText, label: "Job Postings" },
  { to: "/admin/students", icon: Users, label: "People" },
  { to: "/admin/announcements", icon: Megaphone, label: "Announcements" },
  { to: "/admin/activity", icon: Activity, label: "Activity feed" },
];

// Alumni help students rather than seek jobs — no Jobs/Saved/Calendar.
// Mentor Requests + People directory join in later phases (no dead links now).
const ALUMNI_NAV = [
  { to: "/mentor", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/mentor/requests", icon: MessageSquareQuote, label: "Mentor requests" },
  { to: "/alumni", icon: GraduationCap, label: "Alumni Connect" },
  { to: "/companies", icon: Building2, label: "Companies" },
  { to: "/announcements", icon: Megaphone, label: "Announcements" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ open, onClose }) {
  const { user, persona, logout } = useAuth();
  const navigate = useNavigate();
  const nav = persona === "admin" ? ADMIN_NAV : persona === "alumni" ? ALUMNI_NAV : STUDENT_NAV;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 flex flex-col",
          "bg-surface border-r border-border",
          "transition-transform duration-300 ease-smooth",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 px-5 flex items-center border-b border-border">
          <Logo />
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-ink text-bg shadow-md"
                    : "text-ink-2 hover:bg-surface-tint hover:text-ink"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg bg-ink -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card + logout */}
        <div className="p-3 border-t border-border space-y-2">
          <button
            onClick={() => {
              navigate("/profile");
              onClose?.();
            }}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-tint transition-colors text-left"
          >
            <Avatar name={user?.name} color="var(--accent)" size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
              <p className="text-xs text-ink-3 truncate">{persona === "admin" ? "Admin" : persona === "alumni" ? "Alumni" : "Student"}</p>
            </div>
            <User className="h-4 w-4 text-ink-3" />
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-2 hover:bg-danger/10 hover:text-danger transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
