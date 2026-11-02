import { useI18n } from "@/app/providers/I18nProvider";
import { localDay } from "@/lib/dates";
import { Icon } from "@/components/ui/Icon";

type Preset = "7d" | "month" | "quarter";

/** The from/to of a preset, as local calendar dates (today included). */
function presetRange(p: Preset, now = new Date()): [string, string] {
  const to = localDay(now);
  if (p === "7d") return [localDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)), to];
  if (p === "month") return [localDay(new Date(now.getFullYear(), now.getMonth(), 1)), to];
  const q = Math.floor(now.getMonth() / 3) * 3;
  return [localDay(new Date(now.getFullYear(), q, 1)), to];
}

/**
 * A from–to date filter in one field, with one-tap presets underneath (last 7 days, this month, this quarter).
 * A preset is shown as pressed while the range still matches it. Either end may be left empty.
 */
export function DateRange({ from, to, onChange, label, presets = true, inline }: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  /** the field's name, for a screen reader (the box is a group of two date inputs) */
  label: string;
  presets?: boolean;
  /** presets beside the box instead of under it (a one-row filter bar) */
  inline?: boolean;
}) {
  const { t } = useI18n();
  return (
    <fieldset className={inline ? "date-range date-range-inline" : "date-range"}>
      <legend className="sr-only">{label}</legend>
      <div className="date-range-box">
        <Icon name="calendar" size={15} color="var(--color-neutral-600)" />
        <input type="date" value={from} max={to || undefined} onChange={(e) => onChange(e.target.value, to)} aria-label={t("range.from")} />
        <span aria-hidden="true">–</span>
        <input type="date" value={to} min={from || undefined} onChange={(e) => onChange(from, e.target.value)} aria-label={t("range.to")} />
      </div>
      {presets && (
        <div className="date-range-presets">
          {(["7d", "month", "quarter"] as Preset[]).map((p) => {
            const [f, tt] = presetRange(p);
            return (
              <button key={p} type="button" className="chip" aria-pressed={from === f && to === tt} onClick={() => onChange(f, tt)}>
                {t(`range.${p}`)}
              </button>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

/** "12 / 500" under a text area with a limit; turns amber in the last tenth so the limit is no surprise. */
export function CharCount({ value, max, id }: { value: string; max: number; id?: string }) {
  const near = value.length >= max * 0.9;
  return (
    <div id={id} className="char-count" data-near={near || undefined} aria-live={near ? "polite" : "off"}>
      {value.length.toLocaleString()} / {max.toLocaleString()}
    </div>
  );
}
