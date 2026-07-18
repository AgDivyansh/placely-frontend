import { createSlice } from "@reduxjs/toolkit";

/**
 * Activity feed slice — audit trail of admin + student actions.
 *
 * Used by:
 *  - Admin Activity Feed page (compliance / transparency)
 *  - Many reducers across the app dispatch `logActivity` when they
 *    perform a noteworthy action (apply, create job, etc.)
 */
const SEED = [
  { id: "act1", actor: "Dr. Anita Verma", action: "Created job", target: "Microsoft SDE Intern", at: Date.now() - 3 * 60 * 60 * 1000, kind: "job" },
  { id: "act2", actor: "Aarav Mehta", action: "Applied to", target: "Razorpay — SWE", at: Date.now() - 4 * 60 * 60 * 1000, kind: "application" },
  { id: "act3", actor: "Dr. Anita Verma", action: "Moved 3 applicants forward", target: "Razorpay — Tech round", at: Date.now() - 24 * 60 * 60 * 1000, kind: "stage" },
  { id: "act4", actor: "Diya Krishnan", action: "Applied to", target: "Razorpay — SWE", at: Date.now() - 26 * 60 * 60 * 1000, kind: "application" },
  { id: "act5", actor: "Dr. Anita Verma", action: "Published job", target: "Atlassian — SWE", at: Date.now() - 2 * 24 * 60 * 60 * 1000, kind: "job" },
];

const activityFeedSlice = createSlice({
  name: "activityFeed",
  initialState: { items: SEED },
  reducers: {
    logActivity: {
      reducer(state, action) {
        state.items.unshift(action.payload);
        // Cap to 200 entries to bound memory
        if (state.items.length > 200) state.items.pop();
      },
      prepare({ actor, action, target, kind = "info" }) {
        return {
          payload: {
            id: `act${Date.now()}`,
            actor,
            action,
            target,
            kind,
            at: Date.now(),
          },
        };
      },
    },
    clearFeed(state) {
      state.items = [];
    },
  },
});

export const { logActivity, clearFeed } = activityFeedSlice.actions;
export const selectActivityFeed = (s) => s.activityFeed.items;
export default activityFeedSlice.reducer;
