import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookmarksApi, IS_MOCK } from "@/api";

/**
 * Bookmarks slice — saved jobs (stored as an array of jobIds).
 *
 * In mock mode: persisted locally via redux-persist.
 * In real mode: fetchBookmarks loads them; toggle syncs to the backend
 * optimistically (update UI immediately, then call the API).
 */
export const fetchBookmarks = createAsyncThunk("bookmarks/fetch", async () => {
  const data = await bookmarksApi.list();
  // Backend returns { bookmarks: [{jobId,...}], jobs: [...] }.
  return (data.bookmarks || []).map((b) => String(b.jobId));
});

const bookmarksSlice = createSlice({
  name: "bookmarks",
  initialState: { jobIds: [] },
  reducers: {
    toggleBookmark(state, action) {
      const id = action.payload;
      const has = state.jobIds.includes(id);
      if (has) {
        state.jobIds = state.jobIds.filter((x) => x !== id);
      } else {
        state.jobIds.push(id);
      }
      // In real mode, sync to backend (fire-and-forget; UI already updated).
      if (!IS_MOCK) {
        if (has) bookmarksApi.remove(id).catch(() => {});
        else bookmarksApi.add(id).catch(() => {});
      }
    },
    clearBookmarks(state) {
      state.jobIds = [];
    },
    setBookmarks(state, action) {
      state.jobIds = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBookmarks.fulfilled, (state, action) => {
      state.jobIds = action.payload;
    });
  },
});

export const { toggleBookmark, clearBookmarks, setBookmarks } = bookmarksSlice.actions;
export const selectBookmarks = (s) => s.bookmarks.jobIds;
export const selectIsBookmarked = (jobId) => (s) =>
  s.bookmarks.jobIds.includes(jobId);
export default bookmarksSlice.reducer;
