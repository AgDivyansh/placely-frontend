import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const TITLES = {
  "/dashboard": "Dashboard",
  "/jobs": "Jobs",
  "/bookmarks": "Saved jobs",
  "/calendar": "Calendar",
  "/companies": "Companies",
  "/alumni": "Alumni Connect",
  "/documents": "Documents",
  "/interview-experiences": "Interview Prep",
  "/placement-stats": "Placement Stats",
  "/announcements": "Announcements",
  "/settings": "Settings",
  "/profile": "Profile",
  "/admin": "Analytics",
  "/admin/jobs": "Job Postings",
  "/admin/applicants": "Applicants",
  "/admin/students": "Student Directory",
  "/admin/announcements": "Announcements",
  "/admin/activity": "Activity feed",
};

/**
 * Shell — the authenticated app layout.
 * Sidebar (collapsible on mobile) + Topbar (glass) + content (animated).
 */
export function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Derive title from the current path (or its parent for detail pages)
  const getTitle = (path) => {
    if (TITLES[path]) return TITLES[path];
    if (path.startsWith("/jobs/")) return "Job Details";
    if (path.startsWith("/companies/")) return "Company";
    if (path.startsWith("/alumni/")) return "Mentor Chat";
    if (path.startsWith("/admin/applicants/")) return "Applicants";
    return "Placely";
  };

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={getTitle(location.pathname)} />

        <main className="px-4 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
