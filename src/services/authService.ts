import type { ApiResponse, SessionUser } from "@/types";
import { storageKey } from "@/constants/brand";

/**
 * Sign-in for the shell. This starter ships with an IN-MEMORY implementation (the demo accounts below) so the app
 * runs without a backend. To connect a real API keep the same four functions and have them call it through
 * services/apiClient.ts, e.g.
 *
 *   login:  POST /auth/login  → { user, accessToken, refreshToken }  then setTokens(...) from apiClient
 *   verify: GET  /auth/me     → the user, or null when the token is dead
 *   logout: POST /auth/logout then setTokens(null, null)
 *
 * The AuthProvider does not care which one it is talking to.
 */

/** Sample accounts of the demo (fictional). Remove them when a real sign-in is wired up. */
export const DEMO_ACCOUNTS: (SessionUser & { password: string })[] = [
  { username: "admin", password: "demo", name: "Arisa Demo", first: "Arisa", initials: "AD", role: "Administrator", dept: "IT", email: "admin@example.com", permissions: "*" },
  { username: "staff", password: "demo", name: "Somchai Demo", first: "Somchai", initials: "SD", role: "Staff", dept: "Operations", email: "staff@example.com", permissions: ["DEMO.VIEW"] },
];

const USER_KEY = storageKey("user");

// Remember Me = WHERE the session lives, never the password. Persistent → localStorage (survives closing the
// browser); non-persistent → sessionStorage (cleared on close). Read checks both so either mode rehydrates.
function read(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}
function write(user: SessionUser | null, persistent: boolean) {
  try {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    if (user) (persistent ? localStorage : sessionStorage).setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable (private mode): the session lasts while the page is open */
  }
}

/** The session restored from storage, synchronously, so a page refresh does not bounce to /login. */
export function getStoredUser(): SessionUser | null {
  return read();
}

const ok = <T,>(data: T, message = ""): ApiResponse<T> => ({ success: true, message, data, errors: [] });
const fail = <T,>(message: string, status = 401): ApiResponse<T> => ({ success: false, message, data: null as T, errors: [], status });

/** a short pause, so the busy state of the sign-in button can be seen in the demo */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const authService = {
  async login(username: string, password: string, rememberMe = false): Promise<ApiResponse<{ user: SessionUser }>> {
    await wait(350);
    const hit = DEMO_ACCOUNTS.find((a) => a.username.toLowerCase() === username.trim().toLowerCase() && a.password === password);
    if (!hit) return fail("INVALID_CREDENTIALS");
    const { password: _pw, ...user } = hit;
    void _pw;
    write(user, rememberMe);
    return ok({ user });
  },

  /** Re-checks a restored session on boot; null when it is no longer valid. */
  async verify(): Promise<SessionUser | null> {
    return read();
  },

  async logout(): Promise<void> {
    write(null, false);
  },

  /** Forget the session without telling the server (the server already refused it). */
  forgetSession() {
    write(null, false);
  },

  /** The sample accounts the sign-in page offers (the "Enter as" buttons); empty once a real API is wired up. */
  demoAccounts(): SessionUser[] {
    return DEMO_ACCOUNTS.map(({ password: _pw, ...u }) => { void _pw; return u; });
  },
};
