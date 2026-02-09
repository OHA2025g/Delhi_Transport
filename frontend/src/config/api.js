/**
 * API Configuration
 * Centralized API endpoint configuration
 */

// In development we ALWAYS use CRA dev-server proxy (avoids CORS + LAN hostname issues).
// In production you can set REACT_APP_BACKEND_URL to a full backend origin.
const _isDev = process.env.NODE_ENV !== "production";
const _rawBackendUrl = (process.env.REACT_APP_BACKEND_URL || "").trim();
const _hasExplicitBackend =
  !!_rawBackendUrl && !["undefined", "null"].includes(_rawBackendUrl.toLowerCase());
const BACKEND_URL = _hasExplicitBackend ? _rawBackendUrl.replace(/\/+$/, "") : "";
export const API = _isDev ? "/api" : _hasExplicitBackend ? `${BACKEND_URL}/api` : "/api";

export default {
  API,
  BACKEND_URL,
  isDev: _isDev,
};

