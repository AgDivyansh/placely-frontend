/**
 * API — public entry point.
 *
 * Usage across the app:
 *   import { authApi, jobsApi, applicationsApi } from "@/api";
 *
 * To switch from mock to real backend, you don't touch this file or
 * any caller — just set env vars (see .env.example):
 *   VITE_USE_MOCK=false
 *   VITE_API_BASE_URL=https://your-api.com/api
 */
export * from "./services";
export { ENDPOINTS } from "./endpoints";
export { IS_MOCK, tokenStore } from "./client";
