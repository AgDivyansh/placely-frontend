import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";

import {
  setTheme, toggleTheme, selectTheme,
} from "./slices/themeSlice";
import {
  login as loginThunk, logout as logoutAction, updateUser as updateUserAction,
  selectUser, selectRole, selectIsAuthenticated,
} from "./slices/authSlice";
import {
  applyToJob, advanceStage, withdraw, applyToJobThunk, fetchApplications,
  selectApplications, selectHasAppliedTo, selectApplicationFor,
} from "./slices/applicationsSlice";
import {
  addJob, removeJob, fetchJobs, selectJobs,
} from "./slices/jobsSlice";
import { IS_MOCK } from "@/api";
import {
  pushNotification, markRead, markAllRead,
  selectNotifications, selectUnreadCount,
} from "./slices/notificationsSlice";
import {
  toggleBookmark, clearBookmarks,
  selectBookmarks, selectIsBookmarked,
} from "./slices/bookmarksSlice";
import {
  logActivity,
  selectActivityFeed,
} from "./slices/activityFeedSlice";

/* =========================
   Theme
   ========================= */
export const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  return {
    theme,
    toggle: useCallback(() => dispatch(toggleTheme()), [dispatch]),
    setTheme: useCallback((t) => dispatch(setTheme(t)), [dispatch]),
  };
};

/* =========================
   Auth
   ========================= */
export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const login = useCallback(
    async (creds) => {
      const result = await dispatch(loginThunk(creds));
      if (loginThunk.rejected.match(result)) {
        throw new Error(result.payload || "Login failed");
      }
      return result.payload;
    },
    [dispatch]
  );

  const logout = useCallback(() => dispatch(logoutAction()), [dispatch]);
  const updateUser = useCallback((patch) => dispatch(updateUserAction(patch)), [dispatch]);

  return { user, role, isAuthenticated, login, logout, updateUser };
};

/* =========================
   Applications + jobs + notifications  (was AppDataContext)
   ========================= */
export const useAppData = () => {
  const dispatch = useDispatch();
  const applications = useSelector(selectApplications);
  const jobs = useSelector(selectJobs);
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const user = useSelector(selectUser);

  const apply = useCallback(
    async (job, resumeId) => {
      if (IS_MOCK) {
        // Mock mode: optimistic local apply (instant, no server).
        dispatch(applyToJob(job, resumeId));
        dispatch(
          logActivity({
            actor: user?.name || "Student",
            action: "Applied to",
            target: `${job.role}`,
            kind: "application",
          })
        );
        return { ok: true };
      }
      // Real mode: POST to backend (runs eligibility check server-side).
      const result = await dispatch(applyToJobThunk({ job, resumeId }));
      if (applyToJobThunk.rejected.match(result)) {
        // Surface the server's reason (not eligible, already applied, etc.)
        throw new Error(result.payload || "Could not apply");
      }
      return result.payload;
    },
    [dispatch, user]
  );

  const addJobMemo = useCallback(
    (job) => {
      dispatch(addJob(job));
      dispatch(
        logActivity({
          actor: user?.name || "Admin",
          action: "Created job",
          target: job.role,
          kind: "job",
        })
      );
    },
    [dispatch, user]
  );

  const removeJobMemo = useCallback((id) => dispatch(removeJob(id)), [dispatch]);
  const markAllNotificationsRead = useCallback(() => dispatch(markAllRead()), [dispatch]);
  const markNotificationRead = useCallback((id) => dispatch(markRead(id)), [dispatch]);

  // Coerce both sides to strings: the backend jobId is an ObjectId that
  // serializes to a string, and job.id is already a string — a strict ===
  // would silently miss if the types ever differ, leaving the button stuck.
  const hasAppliedTo = useCallback(
    (jobId) => applications.some((a) => String(a.jobId) === String(jobId)),
    [applications]
  );
  const getApplicationFor = useCallback(
    (jobId) => applications.find((a) => String(a.jobId) === String(jobId)) || null,
    [applications]
  );

  return useMemo(
    () => ({
      applications, jobs, notifications, unreadCount,
      apply, addJob: addJobMemo, removeJob: removeJobMemo,
      markAllNotificationsRead, markNotificationRead,
      hasAppliedTo, getApplicationFor,
    }),
    [
      applications, jobs, notifications, unreadCount,
      apply, addJobMemo, removeJobMemo,
      markAllNotificationsRead, markNotificationRead,
      hasAppliedTo, getApplicationFor,
    ]
  );
};

/* =========================
   Bookmarks (NEW)
   ========================= */
export const useBookmarks = () => {
  const dispatch = useDispatch();
  const jobIds = useSelector(selectBookmarks);
  return {
    jobIds,
    isBookmarked: useCallback((id) => jobIds.includes(id), [jobIds]),
    toggle: useCallback((id) => dispatch(toggleBookmark(id)), [dispatch]),
    clearAll: useCallback(() => dispatch(clearBookmarks()), [dispatch]),
  };
};

/* =========================
   Activity feed (NEW)
   ========================= */
export const useActivityFeed = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectActivityFeed);
  return {
    items,
    log: useCallback((entry) => dispatch(logActivity(entry)), [dispatch]),
  };
};
