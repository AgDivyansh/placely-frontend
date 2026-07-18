import { createSlice } from "@reduxjs/toolkit";

/**
 * Theme slice — light/dark theme.
 * Persisted via redux-persist so user preference survives refresh.
 */
const initialState = {
  theme: typeof window !== "undefined"
    && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export const selectTheme = (state) => state.theme.theme;
export default themeSlice.reducer;
