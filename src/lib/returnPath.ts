/**
 * Where to go after signing in. A page that needs a session sends the visitor to /login and remembers where
 * they were headed (e.g. the link in a "PR waiting for you" notification), so signing in lands them there
 * instead of on the home page.
 *
 * The remembered value is only ever an in-app path: never another site, never the sign-in pages themselves.
 */
export interface ReturnTo {
  pathname: string;
  search?: string;
  hash?: string;
}

const AUTH_PAGES = ["/login", "/loginadmin","/forgot-password", "/reset-password", "/change-password"];

/** The path to open after sign-in, or "/" when what was remembered is missing or not a safe in-app path. */
export function safeReturnPath(from: unknown): string {
  if (!from || typeof from !== "object") return "/";
  const { pathname, search = "", hash = "" } = from as ReturnTo;
  if (typeof pathname !== "string" || typeof search !== "string" || typeof hash !== "string") return "/";
  // must be a plain absolute path of this app: "/x", not "//host", not "/\host", not "https://…"
  if (!pathname.startsWith("/") || pathname.startsWith("//") || pathname.includes("\\") || /[\u0000-\u001f]/.test(pathname)) return "/";
  if (AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return "/";
  return pathname + (search.startsWith("?") ? search : "") + (hash.startsWith("#") ? hash : "");
}
