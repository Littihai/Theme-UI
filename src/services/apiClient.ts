import type { ApiResponse } from "@/types";
import { badResponseMessage, failureMessage, offlineMessage, timeoutMessage } from "@/lib/errorText";
import { eventName, storageKey } from "@/constants/brand";

/**
 * Thin fetch wrapper speaking the standard API envelope (types/index.ts ApiResponse, docs/decisions/0024).
 * Holds the access + refresh tokens and transparently refreshes an expired
 * access token once on a 401 before giving up.
 */
const BASE = import.meta.env.VITE_API_BASE ?? "/api/v1";

const ACCESS_KEY = storageKey("at");
const REFRESH_KEY = storageKey("rt");

// Remember Me = WHERE the tokens live, never the password. Persistent → localStorage
// (survives closing the browser); non-persistent → sessionStorage (cleared on close).
// Read checks both so either mode rehydrates on refresh.
function readToken(key: string): string | null {
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeToken(key: string, value: string | null, persistent: boolean) {
  try {
    const store = persistent ? localStorage : sessionStorage;
    const other = persistent ? sessionStorage : localStorage;
    other.removeItem(key); // avoid a stale copy in the other store
    if (value) store.setItem(key, value);
    else store.removeItem(key);
  } catch {
    /* storage unavailable (private mode) — fall back to in-memory only */
  }
}

// remember which store the live session used (localStorage present at boot ⇒ persistent)
let persistent: boolean = (() => {
  try {
    return localStorage.getItem(ACCESS_KEY) !== null || localStorage.getItem(REFRESH_KEY) !== null;
  } catch {
    return true;
  }
})();

// hydrate from storage so a page refresh keeps the session
let accessToken: string | null = readToken(ACCESS_KEY);
let refreshToken: string | null = readToken(REFRESH_KEY);

/** Store tokens. `persist` (Remember Me) chooses local vs session storage; when
 *  omitted the current session's mode is kept (e.g. on a silent refresh). */
export function setTokens(access: string | null, refresh?: string | null, persist?: boolean) {
  if (persist !== undefined) persistent = persist;
  accessToken = access;
  writeToken(ACCESS_KEY, access, persistent);
  if (refresh !== undefined) {
    refreshToken = refresh;
    writeToken(REFRESH_KEY, refresh, persistent);
  }
}
export function getRefreshToken() {
  return refreshToken;
}
export function getAccessToken() {
  return accessToken;
}
export function hasSession() {
  return !!accessToken || !!refreshToken;
}

interface BackendLoginData {
  accessToken: string;
  refreshToken: string;
}

/** Fired when the server refuses a call because the account still has to set a new password. */
export const PASSWORD_CHANGE_REQUIRED_EVENT = eventName("password-change-required");
/** Fired when a call came back 401 and the session could not be refreshed: the app sends the person to sign in. */
export const SESSION_EXPIRED_EVENT = eventName("session-expired");
/** Fired when a call came back 403 MODULE_DISABLED: the feature flags are re-read so the module page says so. */
export const MODULE_DISABLED_EVENT = eventName("module-disabled");

/** Fired on every answer (or the lack of one): layouts/ApiStatusBar listens and shows the bar when the API is unreachable. */
export const API_EVENT = eventName("api");

/** How long a call may take before the page gives up and says so (a stuck proxy otherwise spins forever). */
const REQUEST_TIMEOUT_MS = 60_000;

/** The sign-in family answers 401 for a wrong password or a dead refresh token; that is not "your session expired". */
const AUTH_PATHS = new Set(["/auth/login", "/auth/refresh", "/auth/forgot-password", "/auth/reset-password"]);

function timeoutSignal(): AbortSignal | undefined {
  try {
    return typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(REQUEST_TIMEOUT_MS) : undefined;
  } catch {
    return undefined;
  }
}

/** The envelope for a request that never got an answer: offline, DNS, CORS, or our own timeout. */
function unreachable<T>(e: unknown): ApiResponse<T> {
  const timedOut = e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError");
  try { window.dispatchEvent(new CustomEvent(API_EVENT, { detail: timedOut ? "TIMEOUT" : "OFFLINE" })); } catch { /* no window */ }
  return { success: false, message: timedOut ? timeoutMessage() : offlineMessage(), data: null as T, errors: [], status: 0, code: timedOut ? "TIMEOUT" : "OFFLINE" };
}

function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const n = Number(header);
  if (Number.isFinite(n) && n >= 0) return Math.ceil(n);
  const at = Date.parse(header);
  return Number.isNaN(at) ? undefined : Math.max(0, Math.ceil((at - Date.now()) / 1000));
}

let lastExpiredAt = 0;
function dispatch(name: string, detail?: unknown) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

/**
 * Turn any response into the envelope the pages expect. A failure always has a readable `message`, its HTTP
 * `status`, a stable `code` when the server (or this client) knows the reason, the support `ref` and
 * `retryAfter` when given. Framework-level bodies (HTML from a proxy, nothing at all) are mapped by status.
 */
async function finish<T>(res: Response, path: string): Promise<ApiResponse<T>> {
  // an answer is the server being there — unless a proxy in front answered for it (502/503/504: the API itself is down)
  try { window.dispatchEvent(new CustomEvent(API_EVENT, { detail: res.status === 502 || res.status === 503 || res.status === 504 ? "GATEWAY" : "up" })); } catch { /* no window */ }
  const retryAfter = parseRetryAfter(res.headers.get("Retry-After"));
  let json: (Partial<ApiResponse<T>> & { errors?: unknown }) | null = null;
  try {
    const parsed: unknown = await res.json();
    if (parsed && typeof parsed === "object") json = parsed as Partial<ApiResponse<T>>;
  } catch {
    json = null;
  }
  if (res.ok) {
    if (json && typeof json.success === "boolean") return { ...(json as ApiResponse<T>), status: res.status };
    // a 200 that is not the envelope: the SPA shell served for an API path, or a proxy page
    return { success: false, message: badResponseMessage(), data: null as T, errors: [], status: res.status, code: "BAD_RESPONSE" };
  }

  // the reason: `code` from a current server, the first string of `errors` from an older one, or a guess at an
  // older server's plain 404 ("ไม่พบ endpoint …") so the page can still say "the server is out of date"
  const rawErrors = Array.isArray(json?.errors) ? (json.errors as unknown[]) : [];
  const legacyCode = typeof rawErrors[0] === "string" ? (rawErrors[0] as string) : undefined;
  let code = json?.code ?? legacyCode;
  if (!code && res.status === 404 && /endpoint/i.test(json?.message ?? "")) code = "ENDPOINT_NOT_FOUND";
  const fieldErrors = rawErrors.filter((e): e is ApiResponse<T>["errors"][number] => !!e && typeof e === "object");

  const out: ApiResponse<T> = {
    success: false,
    message: failureMessage(res.status, code, json?.message, retryAfter),
    data: null as T,
    errors: fieldErrors,
    status: res.status,
    code,
    ref: json?.ref,
    retryAfter,
  };

  if (res.status === 401 && !AUTH_PATHS.has(path)) {
    // the token is dead and could not be refreshed: forget it and let the app go to the sign-in page (once)
    setTokens(null, null);
    const now = Date.now();
    if (now - lastExpiredAt > 3000) { lastExpiredAt = now; dispatch(SESSION_EXPIRED_EVENT); }
  } else if (res.status === 403 && code === "PASSWORD_CHANGE_REQUIRED") {
    dispatch(PASSWORD_CHANGE_REQUIRED_EVENT);
  } else if (res.status === 403 && code === "MODULE_DISABLED") {
    dispatch(MODULE_DISABLED_EVENT, { module: path.split("/")[1] ?? "" });
  }
  return out;
}

/** Attempt a single refresh; updates tokens on success. */
async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return false;
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    setTokens(null, null);
    return false;
  }
  const json = (await res.json()) as ApiResponse<BackendLoginData>;
  if (json.success && json.data) {
    setTokens(json.data.accessToken, json.data.refreshToken);
    return true;
  }
  setTokens(null, null);
  return false;
}

async function doFetch(method: string, path: string, body?: unknown): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: timeoutSignal(),
  });
}

/** Swap the access token for a fresh one (the server re-reads the account, e.g. after the password was changed). */
export function refreshSession(): Promise<boolean> {
  return tryRefresh();
}

async function request<T>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await doFetch(method, path, body);
    // access token expired → refresh once and retry (but never on the refresh/login calls themselves)
    if (res.status === 401 && refreshToken && !AUTH_PATHS.has(path)) {
      if (await tryRefresh()) res = await doFetch(method, path, body);
    }
  } catch (e) {
    // fetch rejected before any response — server unreachable / offline / CORS / our timeout
    return unreachable<T>(e);
  }
  return finish<T>(res, path);
}

/** Multipart upload (auth + one refresh retry). Browser sets the boundary. */
async function uploadRequest<T>(path: string, fd: FormData): Promise<ApiResponse<T>> {
  const send = () =>
    fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: fd,
    });
  let res: Response;
  try {
    res = await send();
    if (res.status === 401 && refreshToken) {
      if (await tryRefresh()) res = await send();
    }
  } catch (e) {
    return unreachable<T>(e);
  }
  return finish<T>(res, path);
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
  upload: <T>(path: string, file: File, fields?: Record<string, string>) => {
    const fd = new FormData();
    fd.append("file", file);
    if (fields) for (const k in fields) fd.append(k, fields[k]);
    return uploadRequest<T>(path, fd);
  },
  /** Download a protected file (an Excel report) under the name the server gives it. */
  download: async (path: string, fallbackName: string): Promise<ApiResponse<null>> => {
    const send = () => fetch(`${BASE}${path}`, { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} });
    let res: Response;
    try {
      res = await send();
      if (res.status === 401 && refreshToken) {
        if (await tryRefresh()) res = await send();
      }
    } catch (e) {
      return unreachable<null>(e);
    }
    if (!res.ok) return finish<null>(res, path);
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(res.headers.get("Content-Disposition") ?? "");
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = m ? decodeURIComponent(m[1] ?? m[2]) : fallbackName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return { success: true, message: "", data: null, errors: [] };
  },
  /** Fetch a protected binary as an object URL (for &lt;img&gt;/&lt;video&gt; src). Caller revokes it. */
  blobUrl: async (path: string): Promise<string | null> => {
    const send = () => fetch(`${BASE}${path}`, { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} });
    let res: Response;
    try {
      res = await send();
      if (res.status === 401 && refreshToken) {
        if (await tryRefresh()) res = await send();
      }
    } catch {
      return null;
    }
    if (!res.ok) return null;
    return URL.createObjectURL(await res.blob());
  },
};

/** True when the server refused for lack of permission (HTTP 403). */
export function isForbidden(r: { status?: number }): boolean {
  return r.status === 403;
}

/** True when the failure is worth trying again as it is (a hiccup), as opposed to a refusal or a bad input. */
export function isTransient(r: { status?: number; code?: string }): boolean {
  return r.status === 0 || r.status === 408 || r.status === 429 || (r.status ?? 0) >= 500;
}
