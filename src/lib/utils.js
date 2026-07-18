import clsx from "clsx";

/**
 * cn — conditional className helper.
 * Engineering: pure passthrough to clsx; we keep our own export so swapping
 * libraries (e.g. to tailwind-merge later) won't break every file.
 */
export const cn = (...args) => clsx(args);

/** Format a number as an Indian-style currency in LPA (lakhs per annum) */
export const formatLPA = (lakhs) => `₹${Number(lakhs).toFixed(1)} LPA`;

/** Convert "2026-05-13" to "May 13, 2026" */
export const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** Relative time: "2h ago", "yesterday", "3d ago" */
export const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
};

/** Initials of a name — "Rahul Verma" -> "RV" */
export const initials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

/** Sleep helper — used to simulate API latency in mock layer */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Pluralize: pluralize("job", 1) -> "1 job"; pluralize("job", 5) -> "5 jobs" */
export const pluralize = (word, count) => `${count} ${word}${count === 1 ? "" : "s"}`;
