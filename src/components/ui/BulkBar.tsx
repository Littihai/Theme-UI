import type { ReactNode } from "react";
import { useI18n } from "@/app/providers/I18nProvider";

/**
 * Shown above a list while rows are ticked: how many, a way to untick them all, and what can be done to them.
 * It replaces "do X to the selected" buttons that would otherwise sit there with nothing selected.
 */
export function BulkBar({ count, onClear, children }: { count: number; onClear: () => void; children: ReactNode }) {
  const { t } = useI18n();
  if (count <= 0) return null;
  return (
    <div className="bulk-bar" role="region" aria-label={t("bulk.label")}>
      <span className="bulk-count" aria-live="polite">{t("bulk.selected", { n: count.toLocaleString() })}</span>
      <button type="button" className="btn btn-tertiary btn-sm" onClick={onClear}>{t("bulk.clear")}</button>
      <span style={{ flex: 1 }} />
      <span className="bulk-actions">{children}</span>
    </div>
  );
}
