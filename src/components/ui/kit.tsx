import type { CSSProperties } from "react";
import { dateLocale } from "@/lib/dates";
import type { Lang } from "@/i18n/dict";

// Small shared helpers for module pages: number/date formatting and a few style objects.

export const fmtDate = (s: string | null | undefined, lang: Lang) =>
  s ? new Date(s).toLocaleDateString(dateLocale(lang), { day: "2-digit", month: "short", year: "numeric" }) : "—";
export const fmtDateTime = (s: string | null | undefined, lang: Lang) =>
  s ? new Date(s).toLocaleString(dateLocale(lang), { dateStyle: "medium", timeStyle: "short" }) : "—";
export const fmtMoney = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: 2 });

export const card: CSSProperties = { background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", overflow: "hidden" };
export const field: CSSProperties = { padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-neutral-300)", fontSize: "var(--text-sm)", fontFamily: "inherit", background: "var(--color-surface)", color: "var(--color-text)", width: "100%" };
export const muted: CSSProperties = { fontSize: 12.5, color: "var(--color-neutral-600)", overflowWrap: "anywhere" };

/** Grid columns that never force a phone to scroll sideways (a column is at most 100% wide). */
export const fitCols = (min: number, mode: "auto-fit" | "auto-fill" = "auto-fit") =>
  `repeat(${mode}, minmax(min(${min}px, 100%), 1fr))`;

export function Empty({ text }: { text: string }) {
  return <div style={{ padding: 32, textAlign: "center", color: "var(--color-neutral-500)", fontSize: 13.5 }}>{text}</div>;
}

/** "3 นาทีที่แล้ว" / "3 min ago", for a list column where the distance matters more than the clock; the full stamp goes in a title. */
export function fmtRelative(iso: string | null | undefined, lang: Lang, now = Date.now()): string {
  if (!iso) return "—";
  const ms = new Date(iso).getTime() - now;
  const abs = Math.abs(ms);
  const rtf = new Intl.RelativeTimeFormat(lang === "th" ? "th" : "en", { numeric: "auto" });
  if (abs < 60_000) return rtf.format(0, "minute").replace(/^0 .*|.*0.*/u, lang === "th" ? "เมื่อสักครู่" : "just now");
  if (abs < 3_600_000) return rtf.format(Math.round(ms / 60_000), "minute");
  if (abs < 86_400_000) return rtf.format(Math.round(ms / 3_600_000), "hour");
  if (abs < 30 * 86_400_000) return rtf.format(Math.round(ms / 86_400_000), "day");
  return fmtDate(iso, lang);
}

/** A time shown as a distance ("2 hours ago") with the full date and time on hover and for screen readers. */
export function When({ iso, lang }: { iso: string | null | undefined; lang: Lang }) {
  if (!iso) return <>—</>;
  return <time dateTime={iso} title={fmtDateTime(iso, lang)} style={{ whiteSpace: "nowrap" }}>{fmtRelative(iso, lang)}</time>;
}
