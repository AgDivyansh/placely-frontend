import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { applicantsApi, IS_MOCK } from "@/api";

/**
 * Applicants slice — students who applied to each job (admin view).
 *
 * Each applicant has a foreign key to a job (jobId). This is distinct
 * from the `applications` slice (which is the student's own applications).
 * In production both are derived from the same `applications` table.
 *
 * Engineering: data seeded synthetically — ~6 applicants per job with
 * varied stages. Enough volume to demo bulk operations.
 */

// Indian student names for realistic demo
const NAMES = [
  "Aarav Mehta", "Diya Krishnan", "Ishaan Patel", "Riya Sharma",
  "Krishna Iyer", "Ananya Desai", "Arjun Reddy", "Sneha Banerjee",
  "Vihaan Kapoor", "Saanvi Joshi", "Aditya Nair", "Kavya Bhat",
  "Reyansh Singh", "Mira Pillai", "Karan Malhotra", "Aanya Roy",
  "Shaurya Gupta", "Tara Chatterjee", "Veer Sinha", "Aisha Khan",
  "Yash Goyal", "Ira Mukherjee", "Aryan Bose", "Naina Mishra",
  "Vivaan Rao", "Pari Kulkarni", "Ayaan Saxena", "Zara Verma",
  "Dhruv Agarwal", "Myra Iyengar", "Kabir Trivedi", "Anika Pandit",
];

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "ME", "AIML", "AIDS"];
const STAGES = ["applied", "shortlist", "oa", "tech", "hr", "offer"];

let _id = 1;
const makeApplicant = (jobId, stageBias) => {
  const branch = BRANCHES[Math.floor(Math.random() * BRANCHES.length)];
  const cgpa = +(7 + Math.random() * 3).toFixed(1);
  const stageIdx = Math.min(STAGES.length - 1,
    Math.max(0, stageBias + Math.floor(Math.random() * 3) - 1));
  return {
    id: `app${_id++}`,
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    roll: `21${branch.slice(0, 2).toUpperCase()}${5000 + Math.floor(Math.random() * 1000)}`,
    branch,
    cgpa,
    jobId,
    currentStage: STAGES[stageIdx],
    appliedAt: new Date(Date.now() - Math.floor(Math.random() * 14) * 86400000).toISOString().slice(0, 10),
  };
};

// 6 applicants per job, mixed stages
const seed = () => {
  const list = [];
  const jobIds = ["j1", "j2", "j3", "j4", "j5", "j6", "j7", "j8"];
  jobIds.forEach((jid) => {
    list.push(makeApplicant(jid, 0));
    list.push(makeApplicant(jid, 1));
    list.push(makeApplicant(jid, 2));
    list.push(makeApplicant(jid, 3));
    list.push(makeApplicant(jid, 4));
    list.push(makeApplicant(jid, 5));
  });
  return list;
};

// Load a job's real applicants from the backend (admin drill-down).
export const fetchApplicantsByJob = createAsyncThunk(
  "applicants/fetchByJob",
  async (jobId) => {
    const data = await applicantsApi.byJob(jobId);
    return data.applicants || [];
  }
);

// Mutations call the API in real mode, then apply the change locally so the
// UI updates instantly. In mock mode they only touch local synthetic state.
export const revokeApplicant = createAsyncThunk(
  "applicants/revoke",
  async (id) => {
    if (!IS_MOCK) await applicantsApi.revoke(id);
    return id;
  }
);

export const bulkRevokeApplicants = createAsyncThunk(
  "applicants/bulkRevoke",
  async (ids) => {
    if (!IS_MOCK) await applicantsApi.bulkRevoke(ids);
    return ids;
  }
);

export const bulkAdvanceApplicants = createAsyncThunk(
  "applicants/bulkAdvance",
  async (ids) => {
    if (!IS_MOCK) await applicantsApi.bulkAdvance(ids);
    return ids;
  }
);

const applicantsSlice = createSlice({
  name: "applicants",
  // Only seed synthetic applicants in mock mode; real mode fetches per job.
  initialState: { items: IS_MOCK ? seed() : [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplicantsByJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Replace this job's applicants, keep any others already loaded.
        const jobIds = new Set(action.payload.map((a) => a.jobId));
        const incomingJob = action.payload[0]?.jobId;
        state.items = [
          ...state.items.filter((a) => (incomingJob ? a.jobId !== incomingJob : true) && !jobIds.has(a.jobId)),
          ...action.payload,
        ];
      })
      .addCase(revokeApplicant.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      })
      .addCase(bulkRevokeApplicants.fulfilled, (state, action) => {
        const ids = new Set(action.payload);
        state.items = state.items.filter((a) => !ids.has(a.id));
      })
      .addCase(bulkAdvanceApplicants.fulfilled, (state, action) => {
        const ids = new Set(action.payload);
        state.items.forEach((a) => {
          if (ids.has(a.id)) {
            const idx = STAGES.indexOf(a.currentStage);
            if (idx < STAGES.length - 1) a.currentStage = STAGES[idx + 1];
          }
        });
      });
  },
});

export const selectAllApplicants = (s) => s.applicants.items;
export const selectApplicantsByJob = (jobId) => (s) =>
  s.applicants.items.filter((a) => a.jobId === jobId);
export const selectApplicantById = (id) => (s) =>
  s.applicants.items.find((a) => a.id === id) || null;
export const selectApplicantsByStage = (stage) => (s) =>
  s.applicants.items.filter((a) => a.currentStage === stage);

export default applicantsSlice.reducer;
