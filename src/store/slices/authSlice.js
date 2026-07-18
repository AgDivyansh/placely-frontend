import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi, tokenStore } from "@/api";

/**
 * Auth slice — current user + role + login/logout.
 *
 * API-ready: the login thunk calls authApi.login(), which today returns
 * mock data and tomorrow (once VITE_USE_MOCK=false) hits your real
 * /auth/login endpoint. The slice code below does NOT change when you
 * switch — only the api layer does.
 */
export const login = createAsyncThunk(
  "auth/login",
   async (credentials, { rejectWithValue }) => {
    try {
      // authApi.login stores the JWT in localStorage automatically
      const data = await authApi.login(credentials);
      return { user: data.user, role: data.role };
    } catch (err) {
      return rejectWithValue(err.message || "Login failed");
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await authApi.signup(payload);
      return { user: data.user, role: data.role };
    } catch (err) {
      return rejectWithValue(err.message || "Signup failed");
    }
  }
);

const initialState = {
  user: null,
  role: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout() {
      // Clear the stored JWT too
      tokenStore.clear();
      return initialState;
    },
    updateUser(state, action) {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.role = action.payload.role;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.role = action.payload.role;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, updateUser } = authSlice.actions;
export const selectUser = (s) => s.auth.user;
export const selectRole = (s) => s.auth.role;
export const selectIsAuthenticated = (s) => !!s.auth.user;
export const selectAuthStatus = (s) => s.auth.status;
export const selectAuthError = (s) => s.auth.error;
export default authSlice.reducer;
