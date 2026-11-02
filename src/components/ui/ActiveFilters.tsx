import { useI18n } from "@/app/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";

export interface ActiveFilter { label: string; onRemove: () => void }

/**
 * Under a filter bar while something filters the list: how many rows are left, one chip per filter (× removes it)
 * and "clear all". Nothing shows when the list is unfiltered.
 */
export function ActiveFilters({ items, count, onClearAll }: { items: ActiveFilter[]; count?: number; onClearAll: () => void }) {
  const { t } = useI18n();
  if (!items.length) return null;
  return (
    <div className="active-filters">
      {count != null && <span className="af-count" aria-live="polite">{t("filter.found", { n: count.toLocaleString() })} ·</span>}
      {items.map((f) => (
        <span key={f.label} className="af-chip">
          {f.label}
          <button type="button" aria-label={t("filter.remove", { name: f.label })} onClick={f.onRemove}><Icon name="x" size={12} /></button>
        </span>
      ))}
      <button type="button" className="btn btn-link" style={{ fontSize: "var(--text-xs)" }} onClick={onClearAll}>{t("filter.clearAll")}</button>
    </div>
  );
}
