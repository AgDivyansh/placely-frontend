/**
 * API CLIENT
 * ============================================================
 * The ONE place where the frontend talks to the network.
 *
 * ── HOW THE MOCK/REAL SWITCH WORKS ──
 * Right now USE_MOCK is true, so every request is served by the mock
 * handlers in `mockApi.js` (which return demo data after a small delay).
 *
 * When your backend is ready:
 *   1. Set VITE_USE_MOCK=false in your .env
 *   2. Set VITE_API_BASE_URL=https://your-api.com/api
 *   3. That's it. Every api.* call now hits the real backend.
 *
 * No page or component changes needed — they all call the same
 * `api.get/post/patch/delete` methods regardless of mock or real.
 *
 * ── AUTH ──
 * The real client attaches the JWT from localStorage as a Bearer token.
 * Adjust to cookies if your backend uses httpOnly cookies instead.
 * ============================================================
 */

import { mockRequest } from "./mockApi";

// Vite exposes env vars prefixed with VITE_. Fallbacks keep dev working
// even without a .env file.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false"; // default: mock ON
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const TOKEN_KEY = "placely:token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/**
 * Core request function.
 * @param {string} method - GET | POST | PATCH | PUT | DELETE
 * @param {string} path   - endpoint path (from endpoints.js)
 * @param {object} opts   - { body, params, isMultipart }
 */
async function request(method, path, opts = {}) {
  if (USE_MOCK) {
    // Route to the mock handler — simulates latency + can throw errors.
    return mockRequest(method, path, opts);
  }

  // ---- REAL BACKEND PATH ----
  const url = new URL(BASE_URL + path);
  if (opts.params) {
    Object.entries(opts.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.append(k, v);
    });
  }

  const headers = {};
  const token = tokenStore.get();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let body;
  if (opts.body) {
    if (opts.isMultipart) {
      body = opts.body; // FormData — let the browser set Content-Type
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.body);
    }
  }

  const res = await fetch(url.toString(), { method, headers, body });

  // Parse JSON if present
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    // Normalize error shape so callers can rely on err.message
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  // The backend wraps every success response as { success, message, data }.
  // Unwrap `data` here so the rest of the app receives the same shape the
  // mock layer returns (services never see the envelope).
  if (data && typeof data === "object" && "success" in data && "data" in data) {
    return data.data;
  }
  return data;
}

export const api = {
  get: (path, params) => request("GET", path, { params }),
  post: (path, body, opts) => request("POST", path, { body, ...opts }),
  patch: (path, body, opts) => request("PATCH", path, { body, ...opts }),
  put: (path, body, opts) => request("PUT", path, { body, ...opts }),
  delete: (path, body) => request("DELETE", path, { body }),
};

export const IS_MOCK = USE_MOCK;
