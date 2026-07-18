/**
 * API ENDPOINTS
 * ============================================================
 * Single source of truth for every backend route the frontend calls.
 *
 * When you build the backend, make your Express routes match these
 * paths (or edit this file to match your routes). Nothing else in the
 * frontend hardcodes a URL — they all come from here.
 *
 * Convention: functions for parameterized routes, strings for static.
 * ============================================================
 */

export const ENDPOINTS = {
  // ---- Auth ----
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    logout: "/auth/logout",
    me: "/auth/me", // GET current user from token
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyOtp: "/auth/verify-otp",
  },

  // ---- Jobs ----
  jobs: {
    list: "/jobs", // GET all (student: eligible+all, admin: their college's)
    detail: (id) => `/jobs/${id}`, // GET one
    create: "/jobs", // POST (admin)
    update: (id) => `/jobs/${id}`, // PATCH (admin)
    remove: (id) => `/jobs/${id}`, // DELETE (admin, 2FA)
  },

  // ---- Companies ----
  companies: {
    list: "/companies",
    detail: (id) => `/companies/${id}`,
    create: "/companies", // POST (admin)
  },

  // ---- Applications (student's own) ----
  applications: {
    list: "/applications", // GET my applications
    create: "/applications", // POST — apply to a job
    withdraw: (id) => `/applications/${id}`, // DELETE — withdraw
  },

  // ---- Applicants (admin view — who applied to a job) ----
  applicants: {
    byJob: (jobId) => `/applicants/job/${jobId}`, // GET
    byCompany: (companyId) => `/applicants/company/${companyId}`, // GET
    updateStage: (id) => `/applicants/${id}/stage`, // PATCH — move stage
    revoke: (id) => `/applicants/${id}`, // DELETE (2FA)
    bulkAdvance: "/applicants/bulk-advance", // PATCH
    bulkRevoke: "/applicants/bulk-revoke", // POST (2FA)
    importStatus: "/applicants/import-status", // POST — CSV rollId→stage
  },

  // ---- Alumni ----
  alumni: {
    list: "/alumni",
    detail: (id) => `/alumni/${id}`,
    messages: (id) => `/alumni/${id}/messages`, // GET/POST chat
    requestCall: (id) => `/alumni/${id}/call-request`, // POST
  },

  // ---- Connect (student ↔ alumnus mentor requests) ----
  connect: {
    create: "/connect", // POST (student)
    mine: "/connect/mine", // GET (student's outgoing)
    inbox: "/connect/inbox", // GET (alumnus)
    respond: (id) => `/connect/${id}`, // PATCH (alumnus accept/decline/complete)
    directory: "/connect/directory", // GET ?company= (alumni open to mentoring)
  },

  // ---- Documents (student vault) ----
  documents: {
    list: "/documents",
    upload: "/documents", // POST (multipart)
    remove: (id) => `/documents/${id}`, // DELETE (2FA)
  },

  // ---- Notifications ----
  notifications: {
    list: "/notifications",
    markRead: (id) => `/notifications/${id}/read`, // PATCH
    markAllRead: "/notifications/read-all", // PATCH
  },

  // ---- Bookmarks ----
  bookmarks: {
    list: "/bookmarks",
    toggle: (jobId) => `/bookmarks/${jobId}`, // PUT to add, DELETE to remove
  },

  // ---- Activity feed (admin audit log) ----
  activity: {
    list: "/activity",
  },

  // ---- Settings ----
  settings: {
    get: "/settings",
    update: "/settings", // PATCH
  },

  // ---- Profile ----
  profile: {
    get: "/profile",
    update: "/profile", // PATCH (also carries socialLinks, projects, isPublic)
    uploadResume: "/profile/resume", // POST (multipart)
  },

  // ---- Public profile (unauthenticated, PII-safe) ----
  publicProfile: {
    get: (slug) => `/public-profile/${slug}`, // GET ?collegeId=...
  },

  // ---- Analytics (admin dashboard) ----
  analytics: {
    overview: "/analytics/overview", // KPIs + charts data
  },

  // ---- Students directory (admin) ----
  students: {
    list: "/students",
    detail: (id) => `/students/${id}`,
    update: (id) => `/students/${id}`, // PATCH — admin edits academic record
    import: "/students/import", // POST — bulk-create from CSV rows
  },

  // ---- Announcements (shared read, admin write) ----
  announcements: {
    list: "/announcements",
    create: "/announcements", // POST (admin)
    pin: (id) => `/announcements/${id}/pin`, // PATCH (admin)
    remove: (id) => `/announcements/${id}`, // DELETE (admin)
  },

  // ---- Email (admin bulk email) ----
  email: {
    send: "/email/send", // POST
  },
};
