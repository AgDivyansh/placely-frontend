import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { INITIAL_APPLICATIONS } from "@/data/mockData";
import { applicationsApi, IS_MOCK } from "@/api";

/**
 * fetchApplications — loads the student's own applications from the API.
 * Backend returns { applications: [...] } each with nested job + company.
 */
export const fetchApplications = createAsyncThunk("applications/fetch", async () => {
  const data = await applicationsApi.list();
  return data.applications || [];
});

/**
 * applyToJobThunk — the REAL apply. POSTs to the backend, which runs the
 * authoritative eligibility check and creates the application. We add the
 * returned record to state. Throws (rejected) if the server refuses
 * (not eligible, already applied, deadline passed) — the component shows
 * the message via a toast.
 */
export const applyToJobThunk = createAsyncThunk(
  "applications/apply",
  async ({ job, resumeId }, { rejectWithValue }) => {
    try {
      const data = await applicationsApi.create(job.id, resumeId);
      return data.application;
    } catch (err) {
      return rejectWithValue(err.message || "Could not apply");
    }
  }
);

const applicationsSlice = createSlice({
  name: "applications",
  initialState: { items: IS_MOCK ? INITIAL_APPLICATIONS : [], status: "idle" },
  reducers: {
    // Local optimistic apply — still used in mock mode via the hook.
    applyToJob: {
      reducer(state, action) {
        if (state.items.some((a) => a.jobId === action.payload.jobId)) return;
        state.items.push(action.payload);
      },
      prepare(job, resumeId) {
        return {
          payload: {
            id: `ap${Date.now()}`,
            jobId: job.id,
            companyId: job.companyId,
            currentStage: "applied",
            appliedAt: new Date().toISOString().slice(0, 10),
            selectedResumeId: resumeId,
          },
        };
      },
    },
    advanceStage(state, action) {
      const app = state.items.find((a) => a.id === action.payload.id);
      if (app) app.currentStage = action.payload.stage;
    },
    withdraw(state, action) {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(applyToJobThunk.fulfilled, (state, action) => {
        // Avoid dupes; add the server-created application.
        if (action.payload && !state.items.some((a) => String(a.jobId) === String(action.payload.jobId))) {
          state.items.push(action.payload);
        }
      });
  },
});

export const { applyToJob, advanceStage, withdraw } = applicationsSlice.actions;

export const selectApplications = (s) => s.applications.items;
export const selectHasAppliedTo = (jobId) => (s) =>
  s.applications.items.some((a) => String(a.jobId) === String(jobId));
export const selectApplicationFor = (jobId) => (s) =>
  s.applications.items.find((a) => String(a.jobId) === String(jobId)) || null;

export default applicationsSlice.reducer;
