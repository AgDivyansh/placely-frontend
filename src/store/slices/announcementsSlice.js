import { createSlice } from "@reduxjs/toolkit";

/**
 * Announcements slice — the notices board.
 *
 * Admins post announcements; students read them. Each has a category
 * and an optional "pinned" flag so important notices stay on top.
 *
 * API-ready: in production these come from GET /announcements. The
 * reducers below mirror what the backend endpoints will do so the
 * switch is a matter of replacing the seed + wiring thunks.
 */
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
  initialState: { items: SEED },
  reducers: {
    addAnnouncement: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare({ title, body, category, pinned, author }) {
        return {
          payload: {
            id: `an${Date.now()}`,
            title,
            body,
            category: category || "general",
            pinned: !!pinned,
            author: author || "Placement Cell",
            createdAt: new Date().toISOString(),
          },
        };
      },
    },
    deleteAnnouncement(state, action) {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
    togglePin(state, action) {
      const a = state.items.find((x) => x.id === action.payload);
      if (a) a.pinned = !a.pinned;
    },
  },
});

export const { addAnnouncement, deleteAnnouncement, togglePin } = announcementsSlice.actions;

// Selector — pinned first, then newest first
export const selectAnnouncements = (s) =>
  [...s.announcements.items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

export default announcementsSlice.reducer;
