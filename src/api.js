/**
 * Centralized API Client Configuration
 *
 * Automatically resolves the backend base URL:
 * 1. Checks VITE_API_BASE_URL environment variable.
 * 2. In production builds, falls back to the deployed Render backend URL.
 * 3. In local development, falls back to http://localhost:4040.
 */

const PRODUCTION_API_URL = "https://ai-lost-found-backend-1.onrender.com";
const LOCAL_API_URL = "http://localhost:4040";

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL);

// Ensure no trailing slash on base URL to avoid double slashes when joining paths
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

/**
 * Helper to build an absolute API endpoint URL cleanly.
 * @param {string} path - e.g. "/api/auth/login" or "api/auth/login"
 * @returns {string} - Full URL
 */
export function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export const ENDPOINTS = {
  HEALTH: buildApiUrl("/api/health"),
  LOGIN: buildApiUrl("/api/auth/login"),
  REGISTER: buildApiUrl("/api/auth/register"),
  LOST_ITEMS: buildApiUrl("/api/lost-items"),
  FOUND_ITEMS: buildApiUrl("/api/found-items"),
  MATCHES: (lostItemId) => buildApiUrl(`/api/matches/${lostItemId}`),
};
