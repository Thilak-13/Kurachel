/**
 * apiClient.js
 * -----------------------------------------------------------------------------
 * Single, reusable authenticated API client for the Kurachel frontend.
 *
 * Shared foundation for all feature services (drivers, vehicles, trips,
 * dashboard, reports, ...). Use the exported helpers instead of calling
 * `fetch` directly so that base URL, JSON handling, JWT auth and backend
 * error parsing stay consistent across the app.
 *
 * Exports:
 *   Request helpers : apiGet, apiPost, apiPut, apiPatch, apiDelete
 *   Auth flows      : login, logout, fetchProfile
 *   Token helpers   : getToken, setToken, removeToken
 *   User helpers    : getStoredUser, setStoredUser, removeStoredUser
 *   Session helpers : setSession, clearSession, isAuthenticated
 *   Misc            : ApiError, onUnauthorized, API_BASE_URL,
 *                     TOKEN_STORAGE_KEY, USER_STORAGE_KEY
 * -----------------------------------------------------------------------------
 */

// Base URL for every request. Overridable per-environment via Vite env var.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// localStorage keys. Kept in one place so every service agrees on them.
export const TOKEN_STORAGE_KEY = 'kurachel_token';
export const USER_STORAGE_KEY = 'kurachel_user';

/**
 * Error thrown for any non-2xx backend response.
 * Carries the HTTP status, a human-readable message, and the structured
 * field errors the backend returns as `errors: [{ field, message }]`.
 */
export class ApiError extends Error {
  constructor(message, { status, errors = [], payload = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.payload = payload;
  }
}

// ── Token helpers ────────────────────────────────────────────────────────────

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// ── User helpers ─────────────────────────────────────────────────────────────

/**
 * Normalize a user object so `role` is always a plain string.
 * The login endpoint returns `role` as an object ({ id, name, ... }) while the
 * `/auth/profile` (JWT payload) returns `role` as a string. Downstream role
 * checks should only ever compare against this normalized string.
 */
export function normalizeUser(user) {
  if (!user) return null;
  const role =
    user.role && typeof user.role === 'object' ? user.role.name : user.role;
  return { ...user, role: role ?? null };
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  const normalized = normalizeUser(user);
  if (normalized) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function removeStoredUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

// ── Session helpers ──────────────────────────────────────────────────────────

export function setSession(token, user) {
  setToken(token);
  return setStoredUser(user);
}

export function clearSession() {
  removeToken();
  removeStoredUser();
}

export function isAuthenticated() {
  return Boolean(getToken());
}

// ── Unauthorized handling ────────────────────────────────────────────────────
// Lets the app (App.jsx) react when a live session is rejected by the backend
// (expired/invalid JWT) so it can drop state and redirect to /login.
let unauthorizedHandler = null;

export function onUnauthorized(handler) {
  unauthorizedHandler = typeof handler === 'function' ? handler : null;
}

// Default human-readable messages per status, used when the backend does not
// supply its own `message`.
const DEFAULT_STATUS_MESSAGES = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session is invalid or has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  500: 'A server error occurred. Please try again later.',
};

// ── Core request ─────────────────────────────────────────────────────────────

/**
 * Perform a JSON request against the backend API.
 *
 * @param {string} method  HTTP method.
 * @param {string} path    Path relative to API_BASE_URL (e.g. '/auth/login').
 * @param {object} [options]
 * @param {any}    [options.body]  JSON-serializable request body.
 * @param {boolean}[options.auth=true]  Attach the stored JWT when available.
 * @param {object} [options.headers]    Extra headers.
 * @param {object} [options.signal]     AbortSignal.
 * @returns {Promise<any>} Parsed `data` field of the response, or the full body.
 * @throws {ApiError}
 */
async function request(method, path, { body, auth = true, headers = {}, signal } = {}) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const finalHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const token = auth ? getToken() : null;
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (networkError) {
    if (networkError?.name === 'AbortError') throw networkError;
    throw new ApiError(
      'Unable to reach the server. Please check your connection and try again.',
      { status: 0 }
    );
  }

  // Parse body (tolerate empty / non-JSON responses such as 204).
  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const status = response.status;
    const message =
      payload?.message ||
      DEFAULT_STATUS_MESSAGES[status] ||
      `Request failed with status ${status}.`;
    const errors = Array.isArray(payload?.errors) ? payload.errors : [];

    // A rejected *live* session (we sent a token but got 401) means the JWT is
    // no longer valid — clear it and let the app redirect to login.
    if (status === 401 && token) {
      clearSession();
      if (unauthorizedHandler) unauthorizedHandler();
    }

    throw new ApiError(message, { status, errors, payload });
  }

  // Success: unwrap the standard { success, message, data } envelope when
  // present; otherwise return the raw parsed body.
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

// ── Public request helpers ───────────────────────────────────────────────────

export function apiGet(path, options = {}) {
  return request('GET', path, options);
}

export function apiPost(path, body, options = {}) {
  return request('POST', path, { ...options, body });
}

export function apiPut(path, body, options = {}) {
  return request('PUT', path, { ...options, body });
}

export function apiPatch(path, body, options = {}) {
  return request('PATCH', path, { ...options, body });
}

export function apiDelete(path, options = {}) {
  return request('DELETE', path, options);
}

// ── Auth flows ───────────────────────────────────────────────────────────────

/**
 * Log in with an email/username + password.
 * On success, stores the JWT and normalized user, then returns the user.
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function login(loginIdentifier, password) {
  // auth:false — no token exists yet, and a wrong-credentials 401 here must not
  // trigger the global "session expired" redirect.
  const data = await apiPost(
    '/auth/login',
    { loginIdentifier, password },
    { auth: false }
  );
  const user = setSession(data.token, data.user);
  return { user, token: data.token };
}

/**
 * Fetch the authenticated user's profile from the backend, verifying the JWT.
 * Returns the normalized user.
 */
export async function fetchProfile() {
  const data = await apiGet('/auth/profile');
  return normalizeUser(data?.user ?? data);
}

/** Clear all client-side session state. */
export function logout() {
  clearSession();
}

export default {
  API_BASE_URL,
  ApiError,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  login,
  logout,
  fetchProfile,
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  normalizeUser,
  setSession,
  clearSession,
  isAuthenticated,
  onUnauthorized,
};
