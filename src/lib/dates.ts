import type { Lang } from "@/i18n/dict";

/**
 * Locale for dates and times shown in the UI: Thai (Buddhist era) when the UI is
 * Thai, day/month/year otherwise. Take `lang` from useI18n() so switching language
 * re-renders the date too. Printed forms (PR/MMS documents) keep their own formats.
 */
export const dateLocale = (lang: Lang) => (lang === "th" ? "th-TH" : "en-GB");

/**
 * Today (or `d`) as YYYY-MM-DD in the VIEWER'S time zone. `toISOString().slice(0, 10)` is the UTC
 * date, which is yesterday between midnight and 07:00 in Thailand. Calendar dates the SPA sends
 * or compares (report ranges, count cycles, daily buckets) must use this.
 */
export const localDay = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** The instant (ISO, UTC) at which a local date-time typed as YYYY-MM-DDTHH:mm:ss happens in the viewer's zone. */
export const localToUtcIso = (local: string): string => new Date(local).toISOString();
