/**
 * MOCK API
 * ============================================================
 * Simulates the backend by matching endpoint paths and returning
 * demo data after a realistic delay. This file (and mockData.js)
 * is what you DELETE once the real backend is live — everything
 * else in src/api/ stays.
 *
 * It intentionally mirrors real REST semantics:
 *   - returns plain JSON-shaped objects
 *   - throws Error(message) for failures (like a 4xx/5xx)
 *   - honors path params and query params
 *
 * NOTE: This is a lightweight in-memory store seeded from mockData.
 * Mutations (apply, create job, etc.) persist for the session so the
 * demo feels real. A refresh resets to seed (redux-persist handles
 * cross-refresh continuity on the client side separately).
 * ============================================================
 */

import {
  JOBS, COMPANIES, ALUMNI, DEMO_STUDENT, DEMO_ADMIN, DEMO_ALUMNI,
  INITIAL_APPLICATIONS, INITIAL_NOTIFICATIONS,
} from "@/data/mockData";

// ---- Simulated latency ----
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ---- In-memory session store (seeded from mock data) ----
const db = {
  jobs: [...JOBS],
  companies: [...COMPANIES],
  alumni: [...ALUMNI],
  applications: [...INITIAL_APPLICATIONS],
  notifications: [...INITIAL_NOTIFICATIONS],
  // Connect (mentor) requests. One seeded so the alumni inbox demo isn't empty.
  connect: [
    {
      id: "cn1",
      mode: "video",
      topic: "System design interview prep",
      note: "Interviewing at a fintech next week — would love a mock round.",
      status: "pending",
      student: { name: "Riya Sharma", branch: "CSE", collegeRollId: "21CS1101" },
      createdAt: new Date().toISOString(),
    },
  ],
};

/**
 * Match a request against known routes and return demo data.
 * Falls through to a generic success for unmapped mutation routes so
 * the UI never breaks in demo mode.
 */
export async function mockRequest(method, path, opts = {}) {
  await delay();

  // ---- AUTH ----
  if (path === "/auth/login") {
    const { email, requestedRole } = opts.body || {};
    if (requestedRole === "admin") {
      if (email !== DEMO_ADMIN.email) {
        throw new Error("Admin email mismatch. Use divyansh@admin.com");
      }
      return { user: DEMO_ADMIN, role: "admin", token: "mock-jwt-admin" };
    }
    // Demo alumni: a graduated student whose persona resolves to "alumni".
    if (email === DEMO_ALUMNI.email) {
      return { user: DEMO_ALUMNI, role: "student", token: "mock-jwt-alumni" };
    }
    return { user: DEMO_STUDENT, role: "student", token: "mock-jwt-student" };
  }
  if (path === "/auth/signup") {
    // Pretend we created an account and return the student profile
    const { name, email } = opts.body || {};
    return {
      user: { ...DEMO_STUDENT, name: name || DEMO_STUDENT.name, email: email || DEMO_STUDENT.email },
      role: "student",
      token: "mock-jwt-student",
    };
  }
  if (path === "/auth/me") {
    return { user: DEMO_STUDENT, role: "student" };
  }
  if (path === "/auth/forgot-password") return { sent: true };
  if (path === "/auth/reset-password") return { reset: true };
  if (path === "/auth/verify-otp") return { verified: true };
  if (path === "/auth/logout") return { ok: true };

  // ---- JOBS ----
  if (path === "/jobs" && method === "GET") return { jobs: db.jobs };
  if (path === "/jobs" && method === "POST") {
    const job = { ...opts.body, id: `j${Date.now()}` };
    db.jobs.unshift(job);
    return { job };
  }
  const jobDetailMatch = path.match(/^\/jobs\/([^/]+)$/);
  if (jobDetailMatch && method === "GET") {
    const job = db.jobs.find((j) => j.id === jobDetailMatch[1]);
    if (!job) throw new Error("Job not found");
    return { job };
  }
  if (jobDetailMatch && method === "DELETE") {
    db.jobs = db.jobs.filter((j) => j.id !== jobDetailMatch[1]);
    return { ok: true };
  }
  if (jobDetailMatch && method === "PATCH") {
    const idx = db.jobs.findIndex((j) => j.id === jobDetailMatch[1]);
    if (idx >= 0) db.jobs[idx] = { ...db.jobs[idx], ...opts.body };
    return { job: db.jobs[idx] };
  }

  // ---- COMPANIES ----
  if (path === "/companies" && method === "GET") return { companies: db.companies };
  const compMatch = path.match(/^\/companies\/([^/]+)$/);
  if (compMatch) {
    const company = db.companies.find((c) => c.id === compMatch[1]);
    if (!company) throw new Error("Company not found");
    return { company };
  }

  // ---- APPLICATIONS ----
  if (path === "/applications" && method === "GET") return { applications: db.applications };
  if (path === "/applications" && method === "POST") {
    const { jobId, resumeId } = opts.body || {};
    const job = db.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error("Job not found");
    if (db.applications.some((a) => a.jobId === jobId)) {
      throw new Error("Already applied to this job");
    }
    const application = {
      id: `ap${Date.now()}`,
      jobId,
      companyId: job.companyId,
      currentStage: "applied",
      appliedAt: new Date().toISOString().slice(0, 10),
      selectedResumeId: resumeId,
    };
    db.applications.push(application);
    return { application };
  }
  const appWithdrawMatch = path.match(/^\/applications\/([^/]+)$/);
  if (appWithdrawMatch && method === "DELETE") {
    db.applications = db.applications.filter((a) => a.id !== appWithdrawMatch[1]);
    return { ok: true };
  }

  // ---- ALUMNI ----
  if (path === "/alumni" && method === "GET") return { alumni: db.alumni };
  const alumniMatch = path.match(/^\/alumni\/([^/]+)$/);
  if (alumniMatch) {
    const alum = db.alumni.find((a) => a.id === alumniMatch[1]);
    if (!alum) throw new Error("Alumni not found");
    return { alumni: alum };
  }

  // ---- NOTIFICATIONS ----
  if (path === "/notifications" && method === "GET") return { notifications: db.notifications };
  if (path === "/notifications/read-all") {
    db.notifications = db.notifications.map((n) => ({ ...n, read: true }));
    return { ok: true };
  }

  // ---- PUBLIC PROFILE (PII-safe subset, mirrors the real shaper) ----
  const publicProfileMatch = path.match(/^\/public-profile\/([^/]+)$/);
  if (publicProfileMatch && method === "GET") {
    const s = DEMO_STUDENT;
    if (publicProfileMatch[1] !== s.slug) throw new Error("Profile not found");
    return {
      profile: {
        id: s.id,
        name: s.name,
        avatar: s.avatar,
        branch: s.branch,
        graduationYear: s.graduationYear,
        isAlumni: s.isAlumni,
        skills: s.skills,
        resumeUrl: s.resume,
        socialLinks: s.socialLinks,
        projects: s.projects,
      },
    };
  }

  // ---- CONNECT (mentor requests) ----
  if (path === "/connect" && method === "POST") {
    const request = {
      id: `cn${Date.now()}`,
      ...opts.body,
      status: "pending",
      student: { name: DEMO_STUDENT.name, branch: DEMO_STUDENT.branch },
      createdAt: new Date().toISOString(),
    };
    db.connect.unshift(request);
    return { request };
  }
  if (path === "/connect/mine" && method === "GET") return { requests: db.connect };
  if (path === "/connect/inbox" && method === "GET") return { requests: db.connect };
  const connectRespondMatch = path.match(/^\/connect\/([^/]+)$/);
  if (connectRespondMatch && method === "PATCH") {
    const r = db.connect.find((x) => x.id === connectRespondMatch[1]);
    if (r) {
      r.status = opts.body?.status || r.status;
      if (opts.body?.meetingLink) r.meetingLink = opts.body.meetingLink;
    }
    return { request: r };
  }

  // ---- ANALYTICS (static demo payload) ----
  if (path === "/analytics/overview") {
    return {
      kpis: { activeJobs: 42, totalApplicants: 1080, selectionRate: 13, avgPackage: 18 },
    };
  }

  // ---- Generic fallthrough for unmapped mutations ----
  // Keeps demo mode from breaking on routes we didn't explicitly mock.
  if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
    return { ok: true };
  }

  // Unmapped GET — return empty so UI degrades gracefully.
  return {};
}
