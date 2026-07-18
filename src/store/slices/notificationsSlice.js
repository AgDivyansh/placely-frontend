import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { INITIAL_NOTIFICATIONS } from "@/data/mockData";
import { notificationsApi, IS_MOCK } from "@/api";

export const fetchNotifications = createAsyncThunk("notifications/fetch", async () => {
  const data = await notificationsApi.list();
  return data.notifications || [];
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { items: IS_MOCK ? INITIAL_NOTIFICATIONS : [] },
  reducers: {
    pushNotification(state, action) {
      state.items.unshift({
        id: `n${Date.now()}`,
        group: "Today",
        read: false,
        time: "just now",
        ...action.payload,
      });
    },
    markRead(state, action) {
      const n = state.items.find((x) => x.id === action.payload);
      if (n) n.read = true;
      if (!IS_MOCK) notificationsApi.markRead(action.payload).catch(() => {});
    },
    markAllRead(state) {
      state.items.forEach((n) => (n.read = true));
      if (!IS_MOCK) notificationsApi.markAllRead().catch(() => {});
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.items = action.payload;
    });
  },
});

export const { pushNotification, markRead, markAllRead } = notificationsSlice.actions;
export const selectNotifications = (s) => s.notifications.items;
export const selectUnreadCount = (s) =>
  s.notifications.items.filter((n) => !n.read).length;
export default notificationsSlice.reducer;
