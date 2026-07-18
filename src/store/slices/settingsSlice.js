import { createSlice } from "@reduxjs/toolkit";

/**
 * Settings slice — per-user preferences.
 *
 * Persisted so settings survive refresh + session.
 * Migrated to backend user_settings table in production.
 */
const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    notifications: {
      email: true,
      sms: false,
      push: true,
      digest: "daily", // daily | weekly | off
    },
    density: "comfortable", // comfortable | compact
    reducedMotion: false,
    language: "en",
    soundEnabled: true,
  },
  reducers: {
    updateNotifications(state, action) {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    setDensity(state, action) {
      state.density = action.payload;
    },
    setReducedMotion(state, action) {
      state.reducedMotion = action.payload;
    },
    setLanguage(state, action) {
      state.language = action.payload;
    },
    setSoundEnabled(state, action) {
      state.soundEnabled = action.payload;
    },
    resetSettings() {
      return {
        notifications: { email: true, sms: false, push: true, digest: "daily" },
        density: "comfortable",
        reducedMotion: false,
        language: "en",
        soundEnabled: true,
      };
    },
  },
});

export const {
  updateNotifications, setDensity, setReducedMotion,
  setLanguage, setSoundEnabled, resetSettings,
} = settingsSlice.actions;

export const selectSettings = (s) => s.settings;
export default settingsSlice.reducer;
