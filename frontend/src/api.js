export const API_BASE = "http://localhost:8080";

/**
 * Silently exchanges the stored refresh token for a new token pair.
 *
 * On success: updates localStorage and returns the new access token.
 * On failure: returns null (caller decides what to do next).
 */
const tryRefresh = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;

    const data = await res.json();
    localStorage.setItem("token",        data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data.token;
  } catch {
    return null;
  }
};

/**
 * Drop-in replacement for fetch() that:
 *  1. Prefixes API_BASE so callers only write paths  e.g. "/tasks"
 *  2. Injects "Authorization: Bearer <token>" automatically
 *  3. Forces "Content-Type: application/json" (override via options.headers)
 *  4. On 401: attempts a silent token refresh, retries once with the new token
 *  5. If refresh also fails: clears localStorage and reloads → shows login screen
 */
export const authFetch = async (path, options = {}) => {
  const makeRequest = (accessToken) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers ?? {}),
      },
    });

  let response = await makeRequest(localStorage.getItem("token"));

  if (response.status === 401) {
    const newToken = await tryRefresh();

    if (newToken) {
      // Retry the original request with the fresh access token
      response = await makeRequest(newToken);
      if (response.status !== 401) return response;
    }

    // Refresh failed (expired, revoked, or absent) — force re-login
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.reload();
  }

  return response;
};
