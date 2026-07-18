import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistReducer, persistStore,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage

import theme from "./slices/themeSlice";
import auth from "./slices/authSlice";
import applications from "./slices/applicationsSlice";
import jobs from "./slices/jobsSlice";
import notifications from "./slices/notificationsSlice";
import bookmarks from "./slices/bookmarksSlice";
import activityFeed from "./slices/activityFeedSlice";
import settings from "./slices/settingsSlice";
import applicants from "./slices/applicantsSlice";
import documents from "./slices/documentsSlice";
import announcements from "./slices/announcementsSlice";
import companies from "./slices/companiesSlice";
import connect from "./slices/connectSlice";

/**
 * Redux store with selective persistence.
 *
 * Engineering decisions:
 *   • Persist theme + bookmarks + settings + applications + auth.
 *     User-facing state that should survive refresh.
 *   • Don't persist activityFeed (server-side in production) or
 *     jobs (refetched from API).
 *   • Single combineReducers → one persistReducer for control over
 *     which slices get persisted via the `whitelist`.
 *   • Toolkit's serializability middleware turned off for persist
 *     action types since redux-persist emits non-serializable
 *     `register` actions.
 */
const rootReducer = combineReducers({
  theme, auth, applications, jobs, notifications,
  bookmarks, activityFeed, settings, applicants, documents,
  announcements, companies, connect,
});

const persistConfig = {
  key: "placely:root",
  storage,
  version: 1,
  whitelist: ["theme", "auth", "applications", "bookmarks", "settings"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
