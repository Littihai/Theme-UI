import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useAuth } from "@/app/providers/AuthProvider";

interface PermissionContextValue {
  /** Does the signed-in person hold this permission code (APP.MODULE.ACTION)? */
  can: (code: string) => boolean;
  /** True if they hold ANY of the codes. */
  canAny: (...codes: string[]) => boolean;
  /** All effective permission codes ("*" = everything). */
  codes: Set<string> | "*";
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

/**
 * Permissions are checked in ONE place on the client (here) and again on the server for every call; a menu entry
 * or a button hidden here is a courtesy, never the security. The codes come with the session (SessionUser.permissions);
 * an app that loads them separately (GET /me/permissions) feeds them into this provider instead.
 */
export function PermissionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const codes = useMemo<Set<string> | "*">(() => (!user ? new Set() : user.permissions === "*" ? "*" : new Set(user.permissions)), [user]);

  const can = useCallback((code: string) => codes === "*" || codes.has(code), [codes]);
  const canAny = useCallback((...list: string[]) => list.some((c) => can(c)), [can]);

  const value = useMemo<PermissionContextValue>(() => ({ can, canAny, codes }), [can, canAny, codes]);
  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePermissions(): PermissionContextValue {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("usePermissions must be used within PermissionProvider");
  return ctx;
}

/** Shorthand for a single check: `const canApprove = useCan("PRFLOW.PR.APPROVE")`. */
// eslint-disable-next-line react-refresh/only-export-components
export function useCan(code: string): boolean {
  return usePermissions().can(code);
}
