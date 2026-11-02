import { useEffect, useState } from "react";
import { useI18n } from "@/app/providers/I18nProvider";
import { DEFAULT_PAGE_SIZE, storageKey } from "@/constants/brand";
import { Icon } from "./Icon";
import { Select } from "./Select";

const SIZES = [10, 25, 50, 100];
const SIZE_KEY = storageKey("pageSize");

function savedSize(): number | null {
  try { const n = Number(localStorage.getItem(SIZE_KEY)); return SIZES.includes(n) ? n : null; } catch { return null; }
}

/**
 * Client-side paging for lists already in memory (house rule: any list that can
 * pass 10 rows is paged; the size starts at DEFAULT_PAGE_SIZE and the person may pick
 * another, remembered on this device).
 * Jumps back to page 1 when the number of rows or the page size changes.
 */
export function usePaged<T>(rows: readonly T[]) {
  const [chosen, setChosen] = useState<number | null>(savedSize);
  const pageSize = chosen ?? DEFAULT_PAGE_SIZE;
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [rows.length, pageSize]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  return {
    pageRows: rows.slice(start, start + pageSize),
    pager: {
      page: current,
      totalPages,
      total: rows.length,
      from: rows.length ? start + 1 : 0,
      to: Math.min(start + pageSize, rows.length),
      onPage: setPage,
      pageSize,
      onPageSize: (n: number) => {
        setChosen(n);
        try { localStorage.setItem(SIZE_KEY, String(n)); } catch { /* the choice lasts for this visit only */ }
      },
    },
  };
}

export interface PagerProps {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  onPage: (p: number) => void;
  /** with onPageSize: a "rows per page" choice (lists paged in the browser) */
  pageSize?: number;
  onPageSize?: (n: number) => void;
}

/** The page numbers to show: first, last, and the neighbours of the current page, with gaps as null. */
function pageList(page: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set([1, total, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => keep.add(n));
  if (page >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => keep.add(n));
  const out: (number | null)[] = [];
  let last = 0;
  for (const n of [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)) {
    if (n - last > 1) out.push(null);
    out.push(n);
    last = n;
  }
  return out;
}

/**
 * The foot of a list: "Showing 1–25 of 87", rows per page, and the pages. Renders nothing when everything fits on
 * the smallest page.
 */
export function Pager({ page, totalPages, total, from, to, onPage, pageSize, onPageSize }: PagerProps) {
  const { t } = useI18n();
  const canResize = !!onPageSize && !!pageSize;
  if (totalPages <= 1 && (!canResize || total <= SIZES[0])) return null;
  return (
    <nav className="pager" aria-label={t("pager.label")}>
      <span className="pager-count">{t("log.showing", { from, to, total: total.toLocaleString() })}</span>
      {canResize && (
        <span className="pager-size">
          <span aria-hidden="true">{t("pager.perPage")}</span>
          <Select
            size="sm"
            style={{ width: "auto" }}
            aria-label={t("pager.perPage")}
            value={String(pageSize)}
            onChange={(v) => onPageSize!(Number(v))}
            options={[...new Set([...SIZES, pageSize!])].sort((a, b) => a - b).map((n) => ({ value: String(n), label: String(n) }))}
          />
        </span>
      )}
      {totalPages > 1 && (
        <span className="pager-pages">
          <button type="button" className="pager-btn" aria-label={t("log.prev")} title={t("log.prev")} disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <Icon name="chevronLeft" size={16} />
          </button>
          {pageList(page, totalPages).map((n, i) => n === null
            ? <span key={`gap-${i}`} className="pager-gap" aria-hidden="true">…</span>
            : (
              <button key={n} type="button" className="pager-btn" aria-current={n === page ? "page" : undefined}
                aria-label={t("pager.page", { n })} onClick={() => onPage(n)}>{n}</button>
            ))}
          <button type="button" className="pager-btn" aria-label={t("log.next")} title={t("log.next")} disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
            <Icon name="chevronRight" size={16} />
          </button>
        </span>
      )}
    </nav>
  );
}
