import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { Shell } from "@/components/layout/Shell";
import { Preloader } from "@/components/feedback/Preloader";

// Lazy-loaded pages — code-split per route for smaller initial bundle.
// Engineering: improves Time-to-Interactive on slow connections; pages
// load only when navigated to.
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const SignupPage = lazy(() => import("@/pages/auth/SignupPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const PlacementStatsPage = lazy(() => import("@/pages/student/PlacementStatsPage"));
const InterviewExperiencesPage = lazy(() => import("@/pages/student/InterviewExperiencesPage"));
const AnnouncementsPage = lazy(() => import("@/pages/shared/AnnouncementsPage"));
const StudentDirectoryPage = lazy(() => import("@/pages/admin/StudentDirectoryPage"));
const DashboardPage = lazy(() => import("@/pages/student/DashboardPage"));
const JobsPage = lazy(() => import("@/pages/student/JobsPage"));
const JobDetailPage = lazy(() => import("@/pages/student/JobDetailPage"));
const CompaniesPage = lazy(() => import("@/pages/student/CompaniesPage"));
const CompanyDetailPage = lazy(() => import("@/pages/student/CompanyDetailPage"));
const AlumniPage = lazy(() => import("@/pages/student/AlumniPage"));
const AlumniChatPage = lazy(() => import("@/pages/student/AlumniChatPage"));
const ProfilePage = lazy(() => import("@/pages/student/ProfilePage"));
const BookmarksPage = lazy(() => import("@/pages/student/BookmarksPage"));
const SettingsPage = lazy(() => import("@/pages/student/SettingsPage"));
const CalendarPage = lazy(() => import("@/pages/student/CalendarPage"));
const DocumentsPage = lazy(() => import("@/pages/student/DocumentsPage"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminJobsPage = lazy(() => import("@/pages/admin/AdminJobsPage"));
const ActivityFeedPage = lazy(() => import("@/pages/admin/ActivityFeedPage"));
const JobApplicantsPage = lazy(() => import("@/pages/admin/JobApplicantsPage"));
const PublicProfilePage = lazy(() => import("@/pages/public/PublicProfilePage"));

export function AppRouter() {
  return (
    <Suspense fallback={<Preloader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Public, unauthenticated shareable profile — outside the Shell */}
        <Route path="/u/:slug" element={<PublicProfilePage />} />

        {/* Student routes — share the Shell layout */}
        <Route
          element={
            <ProtectedRoute allowedRole="student">
              <Shell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/alumni" element={<AlumniPage />} />
          <Route path="/alumni/:id" element={<AlumniChatPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/placement-stats" element={<PlacementStatsPage />} />
          <Route path="/interview-experiences" element={<InterviewExperiencesPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Admin routes */}
        <Route
          element={
            <ProtectedRoute allowedRole="admin">
              <Shell />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
          <Route path="/admin/jobs/:id/applicants" element={<JobApplicantsPage />} />
          {/* Merged into the People hub; keep a redirect for old links */}
          <Route path="/admin/applicants" element={<Navigate to="/admin/students" replace />} />
          <Route path="/admin/students" element={<StudentDirectoryPage />} />
          <Route path="/admin/announcements" element={<AnnouncementsPage />} />
          <Route path="/admin/activity" element={<ActivityFeedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
