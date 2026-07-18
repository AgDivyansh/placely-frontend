import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { JOBS } from "@/data/mockData";
import { jobsApi, IS_MOCK } from "@/api";

/**
 * fetchJobs — loads jobs from the backend. In mock mode the initial
 * state already has JOBS, but calling this still works (mockApi returns
 * them), so the flow is identical in both modes.
 */
export const fetchJobs = createAsyncThunk("jobs/fetch", async () => {
  const data = await jobsApi.list();
  return data.jobs || [];
});

// Persist a new job to the DB (real mode) so students actually see it and it
// survives refresh. Mock mode keeps the local-only insert with a client id.
export const createJobThunk = createAsyncThunk(
  "jobs/create",
  async (job, { rejectWithValue }) => {
    try {
      if (IS_MOCK) return { ...job, id: `j${Date.now()}` };
      const data = await jobsApi.create(job);
      return data.job;
    } catch (err) {
      return rejectWithValue(err.message || "Could not create job");
    }
  }
);

export const removeJobThunk = createAsyncThunk(
  "jobs/remove",
  async (id, { rejectWithValue }) => {
    try {
      if (!IS_MOCK) await jobsApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Could not delete job");
    }
  }
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState: { items: IS_MOCK ? JOBS : [], status: "idle" },
  reducers: {
    setJobs(state, action) {
      state.items = action.payload;
    },
    addJob(state, action) {
      state.items.unshift(action.payload);
    },
    removeJob(state, action) {
      state.items = state.items.filter((j) => j.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchJobs.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(createJobThunk.fulfilled, (state, action) => {
        if (action.payload) state.items.unshift(action.payload);
      })
      .addCase(removeJobThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((j) => String(j.id) !== String(action.payload));
      });
  },
});

export const { setJobs, addJob, removeJob } = jobsSlice.actions;
export const selectJobs = (s) => s.jobs.items;
export const selectJobsStatus = (s) => s.jobs.status;
export default jobsSlice.reducer;
