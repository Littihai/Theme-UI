import type { IconName } from "@/constants/icons";

/* Shared types of the platform shell. Module-specific types live beside their module (modules/<name>/types.ts). */

/** The standard API envelope every endpoint answers with (services/apiClient.ts speaks it; docs/decisions/0024). */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: ApiFieldError[];
  /** HTTP status of the response (set by apiClient). 0 = the request never got an answer. */
  status?: number;
  /** Stable reason from the server (ENDPOINT_NOT_FOUND, MODULE_DISABLED, DB_UNAVAILABLE…) or the client (OFFLINE, TIMEOUT). */
  code?: string;
  /** Short reference to quote to support, when the server logged the failure. */
  ref?: string;
  /** Seconds the server asked us to wait (Retry-After) on a 429 / 503. */
  retryAfter?: number;
}
export interface ApiFieldError {
  field: string;
  message: string;
}

/** A bilingual string (Thai / English) resolved at render via useI18n().pick. */
export interface LangText {
  th: string;
  en: string;
}

/** The signed-in person, as the shell needs them (header chip, account menu, permission checks). */
export interface SessionUser {
  /** the sign-in name (an employee code, a user name) */
  username: string;
  name: string;
  /** first name, for "Welcome, {first}" */
  first: string;
  initials: string;
  role: string;
  dept?: string;
  email?: string;
  /** permission codes (APP.MODULE.ACTION) the person holds, or "*" for all of them */
  permissions: string[] | "*";
}

export type StatusTone = "warn" | "accent" | "ok" | "stop" | "neutral";

/** An in-app notification (the bell). */
export interface AppNotification {
  id: number;
  title: string;
  body?: string;
  /** ISO instant */
  createdAt: string;
  tone: StatusTone;
  isRead: boolean;
  /** where a click goes */
  linkUrl?: string;
}

/** Names of the platform icons (GitHub Octicons) — see constants/icons.ts. */
export type { IconName };
