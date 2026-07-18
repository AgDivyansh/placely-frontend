import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { announcementsApi, IS_MOCK } from "@/api";

/**
 * Announcements slice — the notices board.
 *
 * Admins and alumni post; students read. In real mode this is backed by the
 * API (fetch on login, create/pin/delete via thunks) so posts persist and are
 * visible to the whole college. Mock mode keeps the local SEED + sync reducers.
 */
export const fetchAnnouncements = createAsyncThunk("announcements/fetch", async () => {
  const data = await announcementsApi.list();
  return data.announcements || [];
});

export const createAnnouncementThunk = createAsyncThunk(
  "announcements/create",
  async (payload, { rejectWithValue }) => {
    try {
      if (IS_MOCK) {
        return {
          id: `an${Date.now()}`,
          ...payload,
          category: payload.category || "general",
          pinned: !!payload.pinned,
          authorName: payload.authorName || "Placement Cell",
          createdAt: new Date().toISOString(),
        };
      }
      const data = await announcementsApi.create(payload);
      return data.announcement;
    } catch (err) {
      return rejectWithValue(err.message || "Could not post announcement");
    }
  }
);

export const removeAnnouncementThunk = createAsyncThunk(
  "announcements/remove",
  async (id, { rejectWithValue }) => {
    try {
      if (!IS_MOCK) await announcementsApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Could not delete announcement");
    }
  }
);

export const togglePinThunk = createAsyncThunk(
  "announcements/togglePin",
  async (id, { rejectWithValue }) => {
    try {
      // Real mode returns the updated announcement — trust its pinned value.
      // Mock mode has no server, so signal a local flip with pinned undefined.
      if (!IS_MOCK) {
        const data = await announcementsApi.togglePin(id);
        return { id, pinned: data.announcement?.pinned };
      }
      return { id, pinned: undefined };
    } catch (err) {
      return rejectWithValue(err.message || "Could not update pin");
    }
  }
);

const SEED = [
  {
    id: "an1",
    title: "Razorpay drive — pre-placement talk on Monday",
    body: "All shortlisted students must attend the pre-placement talk on Monday 10 AM in the seminar hall. Attendance is mandatory for the OA on Tuesday.",
    category: "drive",
    pinned: true,
    author: "Placement Cell",
    createdAt: "2026-07-14T10:00:00Z",
  },
  {
    id: "an2",
    title: "Resume submission deadline extended to Friday",
    body: "Due to multiple requests, the deadline for uploading your final resume to the document vault has been extended to Friday 6 PM. No further extensions will be granted.",
    category: "deadline",
    pinned: true,
    author: "Placement Cell",
    createdAt: "2026-07-13T14:30:00Z",
  },
  {
    id: "an3",
    title: "Mock interview sessions with alumni — register now",
    body: "We are organizing mock interview sessions with verified alumni from top product companies. Limited slots. Register through the Alumni Connect page.",
    category: "event",
    pinned: false,
    author: "Placement Cell",
    createdAt: "2026-07-11T09:00:00Z",
  },
  {
    id: "an4",
    title: "Important: update your CGPA before the next drive",
    body: "Students whose latest semester results are out must update their CGPA in their profile. Eligibility for upcoming drives is calculated from your profile CGPA.",
    category: "general",
    pinned: false,
    author: "Placement Cell",
    createdAt: "2026-07-08T16:00:00Z",
  },
];

const announcementsSlice = createSlice({
  name: "announcements",
  // Seed only in mock mode; real mode fetches the college's board on login.
  initialState: { items: IS_MOCK ? SEED : [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(createAnnouncementThunk.fulfilled, (state, action) => {
        if (action.payload) state.items.unshift(action.payload);
      })
      .addCase(removeAnnouncementThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => String(a.id) !== String(action.payload));
      })
      .addCase(togglePinThunk.fulfilled, (state, action) => {
        const { id, pinned } = action.payload;
        const a = state.items.find((x) => String(x.id) === String(id));
        // Apply the server's authoritative value; mock mode (undefined) flips.
        if (a) a.pinned = pinned === undefined ? !a.pinned : pinned;
      });
  },
});

// Selector — pinned first, then newest first
export const selectAnnouncements = (s) =>
  [...s.announcements.items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

export default announcementsSlice.reducer;
