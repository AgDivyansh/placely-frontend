import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IS_MOCK } from "@/api";
import { selectIsAuthenticated, selectRole } from "@/store/slices/authSlice";
import { fetchJobs } from "@/store/slices/jobsSlice";
import { fetchApplications } from "@/store/slices/applicationsSlice";
import { fetchBookmarks } from "@/store/slices/bookmarksSlice";
import { fetchNotifications } from "@/store/slices/notificationsSlice";
import { fetchCompanies } from "@/store/slices/companiesSlice";

/**
 * DataBootstrap — loads the core data sets from the backend once the user
 * is authenticated. Renders nothing.
 *
 * In mock mode (IS_MOCK) it does nothing: the slices already carry mock
 * data, so there's no need to fetch.
 *
 * In real mode, on login it fetches jobs (everyone) plus the student's
 * applications, bookmarks, and notifications. Admin-only and page-specific
 * data (applicants, analytics, student directory) is fetched by those
 * pages themselves, not here, to avoid over-fetching on every login.
 */
export function DataBootstrap() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectRole);

  useEffect(() => {
    if (IS_MOCK || !isAuthenticated) return;

    // Everyone gets jobs + companies (company names are shown on job cards).
    dispatch(fetchJobs());
    dispatch(fetchCompanies());

    // Student-specific data.
    if (role === "student") {
      dispatch(fetchApplications());
      dispatch(fetchBookmarks());
    }

    // Notifications for everyone.
    dispatch(fetchNotifications());
  }, [dispatch, isAuthenticated, role]);

  return null;
}
