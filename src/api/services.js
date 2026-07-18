/**
 * API SERVICES
 * ============================================================
 * Clean, named functions grouped by resource. This is the public
 * surface the rest of the app imports:
 *
 *    import { authApi, jobsApi } from "@/api";
 *    const { jobs } = await jobsApi.list();
 *
 * These functions never change when you move from mock to real backend
 * — only client.js (the transport) and mockApi.js (the fake data) do.
 *
 * Each function returns a Promise that resolves to the response data,
 * or rejects with an Error(message) on failure. Wire straight into
 * Redux thunks or call directly from components.
 * ============================================================
 */

import { api, tokenStore } from "./client";
import { ENDPOINTS as E } from "./endpoints";
import { normalize } from "./normalize";

/**
 * n() — normalize a real-backend response (_id → id). In mock mode the
 * data already uses `id`, and normalize() is a safe no-op there too, so
 * we can wrap unconditionally.
 */
const n = normalize;

export const authApi = {
  login: async (credentials) => {
    const data = await api.post(E.auth.login, credentials);
    if (data.token) tokenStore.set(data.token);
    return data; // { user, role, token }
  },
  signup: async (payload) => {
    const data = await api.post(E.auth.signup, payload);
    if (data.token) tokenStore.set(data.token);
    return data;
  },
  logout: async () => {
    try {
      await api.post(E.auth.logout);
    } finally {
      tokenStore.clear();
    }
    return { ok: true };
  },
  me: () => api.get(E.auth.me),
  forgotPassword: (email) => api.post(E.auth.forgotPassword, { email }),
  resetPassword: (payload) => api.post(E.auth.resetPassword, payload),
  verifyOtp: (payload) => api.post(E.auth.verifyOtp, payload),
};

export const jobsApi = {
  list: async () => n(await api.get(E.jobs.list)),
  detail: async (id) => n(await api.get(E.jobs.detail(id))),
  create: async (job) => n(await api.post(E.jobs.create, job)),
  update: async (id, patch) => n(await api.patch(E.jobs.update(id), patch)),
  remove: (id) => api.delete(E.jobs.remove(id)),
};

export const companiesApi = {
  list: async () => n(await api.get(E.companies.list)),
  detail: async (id) => n(await api.get(E.companies.detail(id))),
  create: async (company) => n(await api.post(E.companies.create, company)),
};

export const applicationsApi = {
  list: async () => n(await api.get(E.applications.list)),
  create: async (jobId, resumeId) => n(await api.post(E.applications.create, { jobId, resumeId })),
  withdraw: (id) => api.delete(E.applications.withdraw(id)),
};

export const applicantsApi = {
  byJob: async (jobId) => n(await api.get(E.applicants.byJob(jobId))),
  byCompany: async (companyId) => n(await api.get(E.applicants.byCompany(companyId))),
  updateStage: (id, stage) => api.patch(E.applicants.updateStage(id), { stage }),
  revoke: (id) => api.delete(E.applicants.revoke(id)),
  bulkAdvance: (ids) => api.patch(E.applicants.bulkAdvance, { ids }),
  bulkRevoke: (ids) => api.post(E.applicants.bulkRevoke, { ids }),
  importStatus: (jobId, rows) => api.post(E.applicants.importStatus, { jobId, rows }),
};

export const alumniApi = {
  list: async () => n(await api.get(E.alumni.list)),
  detail: async (id) => n(await api.get(E.alumni.detail(id))),
  messages: async (id) => n(await api.get(E.alumni.messages(id))),
  sendMessage: (id, text) => api.post(E.alumni.messages(id), { text }),
  requestCall: (id, slot) => api.post(E.alumni.requestCall(id), { slot }),
};

export const connectApi = {
  create: async (payload) => n(await api.post(E.connect.create, payload)),
  mine: async () => n(await api.get(E.connect.mine)),
  inbox: async () => n(await api.get(E.connect.inbox)),
  respond: async (id, patch) => n(await api.patch(E.connect.respond(id), patch)),
  directory: async (company) => n(await api.get(E.connect.directory, company ? { company } : undefined)),
};

export const documentsApi = {
  list: async () => n(await api.get(E.documents.list)),
  upload: (formData) => api.post(E.documents.upload, formData, { isMultipart: true }),
  remove: (id) => api.delete(E.documents.remove(id)),
};

export const notificationsApi = {
  list: async () => n(await api.get(E.notifications.list)),
  markRead: (id) => api.patch(E.notifications.markRead(id)),
  markAllRead: () => api.patch(E.notifications.markAllRead),
};

export const bookmarksApi = {
  list: async () => n(await api.get(E.bookmarks.list)),
  add: (jobId) => api.put(E.bookmarks.toggle(jobId)),
  remove: (jobId) => api.delete(E.bookmarks.toggle(jobId)),
};

export const activityApi = {
  list: async () => n(await api.get(E.activity.list)),
};

export const settingsApi = {
  get: async () => n(await api.get(E.settings.get)),
  update: (patch) => api.patch(E.settings.update, patch),
};

export const profileApi = {
  get: async () => n(await api.get(E.profile.get)),
  update: async (patch) => n(await api.patch(E.profile.update, patch)),
  uploadResume: (formData) => api.post(E.profile.uploadResume, formData, { isMultipart: true }),
};

export const publicProfileApi = {
  get: async (slug, collegeId) => n(await api.get(E.publicProfile.get(slug), { collegeId })),
};

export const analyticsApi = {
  overview: () => api.get(E.analytics.overview),
};

export const studentsApi = {
  list: async () => n(await api.get(E.students.list)),
  detail: async (id) => n(await api.get(E.students.detail(id))),
  update: async (id, patch) => n(await api.patch(E.students.update(id), patch)),
  import: (rows, defaultPassword) => api.post(E.students.import, { rows, defaultPassword }),
  importDocuments: (rows) => api.post(E.students.importDocuments, { rows }),
};

export const announcementsApi = {
  list: async () => n(await api.get(E.announcements.list)),
  create: async (payload) => n(await api.post(E.announcements.create, payload)),
  togglePin: async (id) => n(await api.patch(E.announcements.pin(id))),
  remove: (id) => api.delete(E.announcements.remove(id)),
};

export const emailApi = {
  send: (payload) => api.post(E.email.send, payload),
};
