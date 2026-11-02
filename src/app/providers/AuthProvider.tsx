import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { SessionUser } from "@/types";
import { authService, getStoredUser } from "@/services/authService";
import { SESSION_EXPIRED_EVENT } from "@/services/apiClient";
import { toastError } from "@/lib/notify";
import { statusMessage } from "@/lib/errorText";
import { tr } from "@/i18n/dict";

export interface LoginOutcome {
  ok: boolean;
  message?: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  /** True while the stored session is being validated on boot. */
  booting: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<LoginOutcome>;
  logout: () => Promise<void>;
  /** the sample accounts the sign-in page may offer (empty with a real API) */
  directory: SessionUser[];
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Who is signed in. The session is restored synchronously from storage (no flash of the sign-in page on refresh),
 * then verified in the background; a call the API answers 401 ends it (SESSION_EXPIRED_EVENT from apiClient).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => getStoredUser());
  const [booting, setBooting] = useState<boolean>(() => !!getStoredUser());
  const directory = useMemo(() => authService.demoAccounts(), []);

  useEffect(() => {
    if (!getStoredUser()) return;
    let alive = true;
    (async () => {
      const verified = await authService.verify();
      if (!alive) return;
      setUser(verified);
      setBooting(false);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const on = () => {
      if (getStoredUser()) toastError(statusMessage(401));
      authService.forgetSession();
      setUser(null);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, on);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, on);
  }, []);

  const login = useCallback(async (username: string, password: string, rememberMe = false): Promise<LoginOutcome> => {
    const res = await authService.login(username, password, rememberMe);
    if (res.success && res.data) {
      setUser(res.data.user);
      return { ok: true };
    }
    return { ok: false, message: res.message === "INVALID_CREDENTIALS" ? tr("login.invalid") : res.message };
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, booting, login, logout, directory }),
    [user, booting, login, logout, directory],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
