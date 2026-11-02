import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/app/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import { field } from "@/components/ui/kit";
import type { IconName } from "@/constants/icons";
import { useEscapeLayer } from "@/hooks/useEscapeLayer";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";
import type { ApiResponse, StatusTone } from "@/types";

/* ── tables: sorting by a header, export to CSV ─────────────────────────────────────────────────────── */

export type SortDir = "asc" | "desc";
export interface SortState { key: string; dir: SortDir }
export interface SortApi { sort: SortState | null; toggle: (key: string) => void }

const cmp = (a: unknown, b: unknown): number => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;                                   // empties last, whichever direction
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
};

/**
 * Sorting for a list already in memory: click a header once for ascending, again for descending, a third time to
 * go back to the server's order. `get` reads the value of a key when it is not a plain field (a computed column).
 */
export function useSort<T>(rows: readonly T[], get?: (row: T, key: string) => unknown, initial: SortState | null = null) {
  const [sort, setSort] = useState<SortState | null>(initial);
  const read = get ?? ((row: T, key: string) => (row as Record<string, unknown>)[key]);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...rows].map((r, i) => [r, i] as const).sort((x, y) => cmp(read(x[0], sort.key), read(y[0], sort.key)) * sign || x[1] - y[1]).map((x) => x[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort]);
  const toggle = useCallback((key: string) => setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null)), []);
  return { rows: sorted, sort, toggle };
}

/** A sortable header cell: the label with the direction arrow; `num` right-aligns like thNum. */
export function SortTh({ k, s, num, children, style }: { k: string; s: SortApi; num?: boolean; children: ReactNode; style?: CSSProperties }) {
  const { t } = useI18n();
  const active = s.sort?.key === k ? s.sort.dir : null;
  return (
    <th style={{ ...(num ? thNum : th), ...style }} aria-sort={active === "asc" ? "ascending" : active === "desc" ? "descending" : "none"}>
      {/* a real button, so the sort can be reached with Tab and pressed with Enter or Space */}
      <button type="button" className="sort-btn" data-active={active ? "" : undefined} title={t("table.sortHint")} onClick={() => s.toggle(k)}>
        {children}
        <Icon name={active === "desc" ? "chevronDown" : active === "asc" ? "chevronUp" : "unfold"} size={12} style={{ opacity: active ? 1 : 0.45 }} />
      </button>
    </th>
  );
}

export interface CsvColumn<T> { h: string; v: (row: T) => unknown }

/** Writes the rows as UTF-8 CSV (with the byte-order mark Excel needs for Thai) and downloads it. */
export function exportCsv<T>(name: string, columns: CsvColumn<T>[], rows: readonly T[]) {
  const cell = (v: unknown) => {
    if (v == null) return "";
    const s = v instanceof Date ? v.toISOString() : typeof v === "boolean" ? (v ? "1" : "0") : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.map((c) => cell(c.h)).join(","), ...rows.map((r) => columns.map((c) => cell(c.v(r))).join(","))];
  const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** The small "CSV" button of a table's toolbar: exports what the filters left (every page, not just the one shown). */
export function ExportButton<T>({ name, columns, rows, style }: { name: string; columns: CsvColumn<T>[]; rows: readonly T[]; style?: CSSProperties }) {
  const { t } = useI18n();
  return (
    <button type="button" className="btn btn-ghost btn-sm" disabled={rows.length === 0} title={t("table.exportHint", { n: rows.length.toLocaleString() })} onClick={() => exportCsv(name, columns, rows)} style={{ whiteSpace: "nowrap", ...style }}>
      <Icon name="download" size={13} /> {t("table.export")}
    </button>
  );
}

/* ── shared looks of data pages ─────────────────────────────────────────────────────────── */

/* table cells (design canvas "Data Table"): a 44px header row on a soft fill, 56px body rows; 12px sides (not the
   canvas's 16) because business tables run to ten columns and more */
export const th = { textAlign: "left", height: 44, padding: "8px 12px", fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--color-neutral-600)", borderBottom: "1px solid var(--color-neutral-200)", whiteSpace: "nowrap", background: "var(--color-neutral-50, #f8fafc)" } as const;
export const thNum = { ...th, textAlign: "right" } as const;
export const td = { height: 56, padding: "8px 12px", borderBottom: "1px solid var(--color-neutral-100)", verticalAlign: "middle" } as const;
export const tdNum = { ...td, textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } as const;
export const empty = { padding: 36, textAlign: "center", color: "var(--color-neutral-500)", fontSize: 13.5 } as const;
export const labelStyle = { fontSize: 12, fontWeight: 600, color: "var(--color-neutral-700)" } as const;
export const mono = { fontFamily: "var(--font-mono, ui-monospace, monospace)", fontSize: 12.5 } as const;
export const tableWrap: CSSProperties = { background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", overflow: "auto hidden" };

/** quantities: up to 3 decimals, never trailing zeros */
export const fmtQty = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: 3 }));
export const fmtMoney2 = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

/* ── loading ───────────────────────────────────────────────────────────────────────────────────────── */

/** One request, remembered with its error; `reload()` runs it again. The loader runs again when `deps` change. */
/** What a failed call left behind: the readable message plus what the error UI decides on. */
export interface ApiFail { message: string; status?: number; code?: string; ref?: string; retryAfter?: number }

export function useLoad<T>(load: () => Promise<ApiResponse<T>>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [fail, setFail] = useState<ApiFail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;
  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadRef.current().then((res) => {
      if (!alive) return;
      if (res.success) { setData(res.data); setFail(null); } else { setFail({ message: res.message, status: res.status, code: res.code, ref: res.ref, retryAfter: res.retryAfter }); }
      setLoading(false);
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  const reload = useCallback(() => setTick((x) => x + 1), []);
  return { data, error: fail?.message ?? null, fail, loading, reload, setData };
}

/* ── errors ────────────────────────────────────────────────────────────────────────────────────────── */

type FailKind = "offline" | "timeout" | "input" | "signin" | "forbidden" | "disabled" | "outdated" | "missing" | "stale" | "busy" | "down" | "server";

/** Which family a failure belongs to; the family decides the icon, the title, the hint and the actions. */
export function failKind(f: ApiFail): FailKind {
  const c = f.code, st = f.status ?? 0;
  if (c === "TIMEOUT") return "timeout";
  if (st === 0 || c === "OFFLINE") return "offline";
  if (c === "MODULE_DISABLED") return "disabled";
  if (c === "ENDPOINT_NOT_FOUND" || c === "BAD_RESPONSE" || st === 405 || st === 406 || st === 415 || st === 501) return "outdated";
  if (c === "DB_UNAVAILABLE" || st === 502 || st === 503 || st === 504) return "down";
  if (st === 401) return "signin";
  if (st === 403) return "forbidden";
  if (st === 404 || st === 410) return "missing";
  if (st === 409) return "stale";
  if (st === 429 || st === 408) return "busy";
  if (st >= 500) return "server";
  return "input";
}

const KIND_LOOK: Record<FailKind, { icon: IconName; title: string; hint?: string; retry: boolean }> = {
  offline: { icon: "server", title: "error.k.offline", retry: true },
  timeout: { icon: "hourglass", title: "error.k.timeout", retry: true },
  input: { icon: "alert", title: "error.k.input", retry: false },
  signin: { icon: "key", title: "error.k.signin", retry: false },
  forbidden: { icon: "shieldLock", title: "error.k.forbidden", hint: "error.h.forbidden", retry: false },
  disabled: { icon: "blocked", title: "module.disabled.title", hint: "module.disabled.desc", retry: false },
  outdated: { icon: "server", title: "error.k.outdated", hint: "error.h.outdated", retry: false },
  missing: { icon: "telescope", title: "error.k.missing", retry: true },
  stale: { icon: "sync", title: "error.k.stale", retry: true },
  busy: { icon: "hourglass", title: "error.k.busy", retry: true },
  down: { icon: "server", title: "error.k.down", hint: "error.h.server", retry: true },
  server: { icon: "bug", title: "error.k.server", hint: "error.h.server", retry: true },
};

/**
 * A failed load, inside the card or table it belongs to. With `fail` it says what kind of failure it is (icon,
 * title, the message, a hint, the status and the support reference) and offers only the actions that make sense:
 * retry for a hiccup, sign in for a dead session, home for a refusal, reload for a server that is out of step.
 * Without `fail` it is the plain one-line message with a retry button.
 */
/**
 * Why a form could not be saved, shown inside the form just above its buttons (not as a toast: the user has to
 * fix something here). Spans the whole row of a grid form.
 */
export function FormAlert({ text, style }: { text: string; style?: CSSProperties }) {
  return (
    <div role="alert" className="form-alert" style={{ gridColumn: "1 / -1", ...style }}>
      <Icon name="alert" size={16} style={{ marginTop: 1 }} />
      <span style={{ whiteSpace: "pre-line" }}>{text}</span>
    </div>
  );
}

export function InlineError({ text, onRetry, fail }: { text: string; onRetry?: () => void; fail?: ApiFail | null }) {
  const { t } = useI18n();
  const nav = useNavigate();
  if (!fail) {
    return (
      <div role="alert" style={{ ...empty, color: "var(--tone-stop-fg, #b91c1c)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="alert" size={16} />{text}</span>
        {onRetry && <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>{t("error.retry")}</button>}
      </div>
    );
  }
  const kind = failKind(fail);
  const look = KIND_LOOK[kind];
  const chip: CSSProperties = { fontSize: 11, fontWeight: 600, color: "var(--color-neutral-600)", background: "var(--color-neutral-100)", border: "1px solid var(--color-neutral-200)", borderRadius: 999, padding: "1px 8px", whiteSpace: "nowrap" };
  return (
    <div role="alert" data-fail-kind={kind} style={{ ...empty, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "var(--color-text)" }}>
      <Icon name={look.icon} size={28} color="var(--color-neutral-400)" />
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600 }}>{t(look.title)}</div>
      <div style={{ fontSize: 13, color: "var(--tone-stop-fg, #b91c1c)", maxWidth: 520 }}>{fail.message || text}</div>
      {look.hint && <div style={{ fontSize: 12.5, color: "var(--color-neutral-600)", maxWidth: 520 }}>{t(look.hint)}</div>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {fail.status ? <span style={chip}>HTTP {fail.status}</span> : null}
        {fail.code && <span style={{ ...chip, fontFamily: "var(--font-mono, ui-monospace, monospace)" }}>{fail.code}</span>}
        {fail.ref && <span style={chip}>{t("error.ref")}: <span style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)" }}>{fail.ref}</span></span>}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
        {look.retry && onRetry && <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>{kind === "stale" ? t("error.reload") : t("error.retry")}</button>}
        {kind === "signin" && <button type="button" className="btn btn-primary btn-sm" onClick={() => nav("/login")}>{t("error.signIn")}</button>}
        {kind === "outdated" && <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>{t("error.reload")}</button>}
        {(kind === "forbidden" || kind === "disabled") && <button type="button" className="btn btn-secondary btn-sm" onClick={() => nav("/")}>{t("error.home")}</button>}
      </div>
    </div>
  );
}

/* ── forms ─────────────────────────────────────────────────────────────────────────────────────────── */

/** A labelled input. `error` shows under it in the stop colour and turns the input's border (styles/ui.css, `label[data-invalid]`). */
export function Field({ label, children, span, hint, error, style }: { label: ReactNode; children: ReactNode; span?: number; hint?: ReactNode; error?: ReactNode; style?: CSSProperties }) {
  return (
    <label data-invalid={error ? "" : undefined} style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0, gridColumn: span ? `span ${span}` : undefined, ...style }}>
      <span style={labelStyle}>{label}</span>
      {children}
      {error ? <span role="alert" style={{ fontSize: 11.5, color: "var(--tone-stop-fg, #b91c1c)" }}>{error}</span> : hint && <span style={{ fontSize: 11.5, color: "var(--color-neutral-500)" }}>{hint}</span>}
    </label>
  );
}

export const inputStyle: CSSProperties = { ...field };
export const selectStyle: CSSProperties = { ...field, appearance: "auto" };

export function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/** A centred dialog over a scrim. Esc and a click on the scrim close it (the top-most layer only). */
export function Dialog({ title, sub, onClose, children, footer, width = 760, labelId }: {
  title: ReactNode; sub?: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: number; labelId: string;
}) {
  const { t } = useI18n();
  useEscapeLayer(() => onClose());
  useScrollLock();
  const panel = useRef<HTMLDivElement>(null);
  useFocusTrap(panel);
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 1000, padding: 16, background: "var(--color-scrim)", display: "grid", placeItems: "center" }}>
      <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={labelId}
        style={{ width: `min(${width}px, calc(100vw - 32px))`, maxHeight: "90vh", overflowY: "auto", background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", padding: 20, display: "flex", flexDirection: "column", gap: 14, animation: "pop .16s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <h2 id={labelId} style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600 }}>{title}</h2>
            {sub && <div style={{ fontSize: 12.5, color: "var(--color-neutral-600)", marginTop: 2 }}>{sub}</div>}
          </div>
          <button type="button" onClick={onClose} aria-label={t("common.close")} className="btn-icon" style={{ color: "var(--color-neutral-500)" }}>
            <Icon name="x" size={17} />
          </button>
        </div>
        {children}
        {footer && <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>{footer}</div>}
      </div>
    </div>
  );
}

/** Stat tile of the overview. */
export function Tile({ icon, label, value, sub, tone, onClick }: { icon: IconName; label: string; value: string; sub?: string; tone?: StatusTone; onClick?: () => void }) {
  const toneColor = tone === "stop" ? "var(--tone-stop-fg, #b91c1c)" : tone === "warn" ? "var(--tone-warn-fg, #b45309)" : tone === "ok" ? "var(--tone-ok-fg, #15803d)" : "var(--color-text)";
  const inner = (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-neutral-600)", fontSize: 12 }}>
        <Icon name={icon} size={15} color="var(--color-accent-700)" />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      </div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: value.length > 7 ? 21 : 26, fontWeight: 700, lineHeight: 1.1, color: toneColor, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--color-neutral-500)" }}>{sub}</div>}
    </>
  );
  const base: CSSProperties = { display: "flex", flexDirection: "column", gap: 6, padding: "14px 16px", background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", minWidth: 0, textAlign: "left" };
  if (onClick) return <button type="button" onClick={onClick} className="row-click" style={{ ...base, cursor: "pointer", fontFamily: "inherit", color: "inherit" }}>{inner}</button>;
  return <div style={base}>{inner}</div>;
}
