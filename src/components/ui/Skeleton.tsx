import type { CSSProperties, ReactNode } from "react";
import { useI18n } from "@/app/providers/I18nProvider";

/**
 * Skeleton loader: grey shapes that stand where the content will be, instead of a line of
 * "Loading…". The shimmer is the `.skeleton` class (global.css) — it stops with the motion setting.
 * Every composite announces itself once to screen readers (role="status") and hides the shapes.
 *
 *   <Skeleton w={120} h={16} />        one block
 *   <SkeletonText lines={3} />         a paragraph
 *   <SkeletonRows cols={grid} cells={6} />   table rows laid out on the real grid
 *   <SkeletonList />                   stacked cards (a phone's list)
 *   <SkeletonCards />                  a grid of tiles
 *   <SkeletonDetail />                 a drawer / dialog: title, chips, info grid, text
 *   <SkeletonPage />                   a whole screen: title, stat tiles, rows
 */

/** deterministic "random" widths, so a list does not look like a barcode and does not jump on re-render */
const WIDTHS = [78, 56, 90, 64, 72, 48, 84, 60];
const w = (i: number, lo = 0) => `${Math.max(lo, WIDTHS[i % WIDTHS.length])}%`;

export function Skeleton({ w, h = 14, r, style }: { w?: number | string; h?: number | string; r?: number | string; style?: CSSProperties }) {
  return <span className="skeleton" aria-hidden="true" style={{ width: w ?? "100%", height: h, borderRadius: r, ...style }} />;
}

/** The accessible shell: one polite "Loading…" for the whole group. */
function Busy({ children, style, bare }: { children: ReactNode; style?: CSSProperties; bare?: boolean }) {
  const { t } = useI18n();
  // bare: inside another skeleton that already announces itself
  if (bare) return <div style={style}>{children}</div>;
  return (
    <div role="status" aria-busy="true" aria-live="polite" style={style}>
      {children}
      <span className="sr-only">{t("common.loading")}</span>
    </div>
  );
}

export function SkeletonText({ lines = 3, style }: { lines?: number; style?: CSSProperties }) {
  return (
    <Busy style={{ display: "flex", flexDirection: "column", gap: 10, ...style }}>
      {Array.from({ length: lines }, (_, i) => <Skeleton key={i} h={13} w={i === lines - 1 && lines > 1 ? "55%" : w(i, 60)} />)}
    </Busy>
  );
}

/** Rows of a table / list. Pass the page's own `cols` (grid-template-columns) so the shapes sit in the real columns. */
export function SkeletonRows({ rows = 6, cells = 4, cols, pad = "11px 14px", style, bare }: {
  rows?: number; cells?: number; cols?: string; pad?: string; style?: CSSProperties; bare?: boolean;
}) {
  return (
    <Busy style={style} bare={bare}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} style={{ display: "grid", gridTemplateColumns: cols ?? `repeat(${cells}, minmax(0, 1fr))`, gap: 10, alignItems: "center", padding: pad, borderBottom: "1px solid var(--color-neutral-200)" }}>
          {Array.from({ length: cols ? cols.split(/\s+(?![^(]*\))/).length : cells }, (_, c) => (
            <Skeleton key={c} h={c === 0 ? 14 : 13} w={w(r + c * 3, c === 0 ? 70 : 40)} />
          ))}
        </div>
      ))}
    </Busy>
  );
}

/** Stacked cards: the phone layout of a list (two lines and a pill on the right). */
export function SkeletonList({ n = 5, style }: { n?: number; style?: CSSProperties }) {
  return (
    <Busy style={style}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "13px 14px", borderBottom: "1px solid var(--color-neutral-200)" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <Skeleton h={14} w={w(i, 45)} />
            <Skeleton h={12} w={w(i + 2, 35)} />
          </div>
          <Skeleton h={22} w={64} r={999} />
        </div>
      ))}
    </Busy>
  );
}

/** A grid of tiles (dashboard cards, machine cards). */
export function SkeletonCards({ n = 4, h = 92, min = 200, style, bare }: { n?: number; h?: number; min?: number; style?: CSSProperties; bare?: boolean }) {
  return (
    <Busy bare={bare} style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))`, gap: 12, ...style }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)", padding: 14, display: "flex", flexDirection: "column", gap: 12, background: "var(--color-surface)" }}>
          <Skeleton h={12} w="50%" />
          <Skeleton h={Math.max(20, h - 56)} w="38%" />
          <Skeleton h={11} w="70%" />
        </div>
      ))}
    </Busy>
  );
}

/** The inside of a drawer or dialog while its record loads. */
export function SkeletonDetail({ fields = 6, style }: { fields?: number; style?: CSSProperties }) {
  return (
    <Busy style={{ display: "flex", flexDirection: "column", gap: 16, ...style }}>
      <Skeleton h={22} w="55%" />
      <div style={{ display: "flex", gap: 8 }}><Skeleton h={24} w={70} r={999} /><Skeleton h={24} w={90} r={999} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(180px, 100%), 1fr))", gap: "14px 18px" }}>
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Skeleton h={10} w="40%" />
            <Skeleton h={15} w={w(i, 55)} />
          </div>
        ))}
      </div>
      <Skeleton h={13} w="92%" />
      <Skeleton h={13} w="70%" />
    </Busy>
  );
}

/** A whole screen before its first data: heading, stat tiles, a few rows. */
export function SkeletonPage({ tiles = 4, rows = 5, style }: { tiles?: number; rows?: number; style?: CSSProperties }) {
  return (
    <Busy style={{ display: "flex", flexDirection: "column", gap: 18, padding: "6px 0", ...style }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><Skeleton h={26} w="32%" /><Skeleton h={13} w="52%" /></div>
      {tiles > 0 && <SkeletonCards n={tiles} bare />}
      {rows > 0 && <div style={{ border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--color-surface)" }}><SkeletonRows rows={rows} cells={5} bare /></div>}
    </Busy>
  );
}
