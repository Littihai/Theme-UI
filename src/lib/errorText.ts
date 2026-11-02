import { BAD_RESPONSE_TEXT, CODE_TEXT, GENERIC_CODES, RETRY_IN_TEXT, STATUS_TEXT, UNKNOWN_TEXT } from "@/i18n/errors";
import { getLang } from "@/i18n/dict";

/**
 * Human-friendly text for HTTP / network errors: the single source used by the API client (outside React) and
 * the error UI components. The words live in `i18n/errors.ts`; this decides which of them applies.
 */
const lang = getLang;

/** Friendly message for an HTTP status (an unlisted 5xx reads as 500, an unlisted 4xx as 400). */
export function statusMessage(status: number): string {
  const p = STATUS_TEXT[status] ?? (status >= 500 ? STATUS_TEXT[500] : status >= 400 ? STATUS_TEXT[400] : UNKNOWN_TEXT);
  return p[lang()];
}

/** Friendly message for a server-given code, or null when the code has no text of its own. */
export function codeMessage(code: string | undefined | null): string | null {
  if (!code) return null;
  const p = CODE_TEXT[code];
  return p ? p[lang()] : null;
}

/** Friendly message when the answer was not the JSON envelope at all. */
export function badResponseMessage(): string {
  return BAD_RESPONSE_TEXT[lang()];
}

/** Friendly message when the request never reached the server (offline / DNS / CORS). */
export function offlineMessage(): string {
  return CODE_TEXT.OFFLINE[lang()];
}

/** Friendly message when the server did not answer before the client gave up. */
export function timeoutMessage(): string {
  return CODE_TEXT.TIMEOUT[lang()];
}

/** "You can try again in n s", for a 429 / 503 that sent Retry-After. */
export function retryInMessage(seconds: number): string {
  return RETRY_IN_TEXT[lang()].replace("{n}", String(seconds));
}

/**
 * The message a failed response should show. The server's own sentence wins when it is specific (a rule it
 * checked, a field it rejected); the framework-level codes and an empty message are replaced by our wording so a
 * person reads the same sentence whether the body was JSON, HTML from a proxy, or nothing at all.
 */
export function failureMessage(status: number, code: string | undefined, serverMessage: string | undefined, retryAfter?: number): string {
  const own = codeMessage(code);
  const generic = !code || GENERIC_CODES.has(code);
  const server = serverMessage?.trim();
  let text = own ?? (server && !(generic && code) ? server : statusMessage(status));
  if (retryAfter && retryAfter > 0 && (status === 429 || status === 503)) text = `${text} ${retryInMessage(retryAfter)}`;
  return text;
}
