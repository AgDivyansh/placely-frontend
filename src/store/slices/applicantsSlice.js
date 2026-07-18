import { createSlice } from "@reduxjs/toolkit";

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

const applicantsSlice = createSlice({
  name: "applicants",
  initialState: { items: seed() },
  reducers: {
    revokeApplication(state, action) {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
    bulkRevoke(state, action) {
      const ids = new Set(action.payload);
      state.items = state.items.filter((a) => !ids.has(a.id));
    },
    advanceApplicantStage(state, action) {
      const a = state.items.find((x) => x.id === action.payload.id);
      if (a) a.currentStage = action.payload.stage;
    },
    bulkAdvance(state, action) {
      const ids = new Set(action.payload.ids);
      state.items.forEach((a) => {
        if (ids.has(a.id)) {
          const idx = STAGES.indexOf(a.currentStage);
          if (idx < STAGES.length - 1) a.currentStage = STAGES[idx + 1];
        }
      });
    },
  },
});

export const { revokeApplication, bulkRevoke, advanceApplicantStage, bulkAdvance } = applicantsSlice.actions;

export const selectAllApplicants = (s) => s.applicants.items;
export const selectApplicantsByJob = (jobId) => (s) =>
  s.applicants.items.filter((a) => a.jobId === jobId);
export const selectApplicantById = (id) => (s) =>
  s.applicants.items.find((a) => a.id === id) || null;
export const selectApplicantsByStage = (stage) => (s) =>
  s.applicants.items.filter((a) => a.currentStage === stage);

export default applicantsSlice.reducer;
