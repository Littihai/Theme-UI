/**
 * Who to contact when something is wrong (the footer, the account menu, About). The repository holds only a
 * placeholder; the real address of whoever runs the build comes from the environment at build time
 * (.env.local, which git ignores; see .env.example): VITE_CONTACT_EMAIL, VITE_CONTACT_PHONE, VITE_CONTACT_GITHUB.
 */
import { BRAND } from "@/constants/brand";

const fromEnv = (v: string | undefined) => (v ?? "").trim() || null;
const emailEnv = fromEnv(import.meta.env.VITE_CONTACT_EMAIL);
const phoneEnv = fromEnv(import.meta.env.VITE_CONTACT_PHONE);
const githubEnv = fromEnv(import.meta.env.VITE_CONTACT_GITHUB);

export const SUPPORT_EMAIL = emailEnv ?? "support@example.com";
/** Placeholder by default: a number that cannot be dialled. */
export const SUPPORT_PHONE = phoneEnv ?? "000-000-0000";
export const SUPPORT_PHONE_TEL = `tel:${SUPPORT_PHONE.replace(/[^\d+]/g, "")}`;
/** Only an https GitHub address is accepted; anything else is ignored (no link shown). */
export const CONTACT_GITHUB = githubEnv && /^https:\/\/github\.com\/[\w.-]+(\/[\w.-]+)?\/?$/.test(githubEnv) ? githubEnv : null;
/** "github.com/name" for display. */
export const CONTACT_GITHUB_LABEL = CONTACT_GITHUB ? CONTACT_GITHUB.replace(/^https:\/\//, "").replace(/\/$/, "") : null;
/** True while the contact details are the repository's placeholders. */
export const CONTACT_IS_PLACEHOLDER = !emailEnv && !phoneEnv;

/**
 * What a support person asks first, as lines of text: the build, the page, the language and theme, the browser, and
 * who is signed in. Nothing secret (no password, token or session).
 */
export function supportDetails(opts: { who?: string | null; lang: string; theme: string }): string[] {
  return [
    `${BRAND.name} v${__APP_VERSION__}`,
    `Built: ${__BUILD_TIME__}`,
    ...(opts.who ? [`User: ${opts.who}`] : []),
    `Page: ${typeof location === "undefined" ? "-" : location.pathname}`,
    `Language: ${opts.lang}`,
    `Theme: ${opts.theme}`,
    `Browser: ${typeof navigator === "undefined" ? "-" : navigator.userAgent}`,
  ];
}

/**
 * A mail to support that opens in the person's own mail app with the version and page filled in, so a report
 * arrives with what support asks first. Nothing secret goes in: no password, token or session data.
 */
export function supportMailto(opts: { subject: string; who?: string | null; lines?: string[] }): string {
  const subject = `${BRAND.name} v${__APP_VERSION__} — ${opts.subject}${opts.who ? ` (${opts.who})` : ""}`;
  const body = [
    "", "", "",
    "— — —",
    `${BRAND.name} v${__APP_VERSION__}`,
    ...(opts.who ? [`User: ${opts.who}`] : []),
    `Page: ${typeof location === "undefined" ? "-" : location.pathname}`,
    `Browser: ${typeof navigator === "undefined" ? "-" : navigator.userAgent}`,
    ...(opts.lines ?? []),
  ].join("\n");
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
