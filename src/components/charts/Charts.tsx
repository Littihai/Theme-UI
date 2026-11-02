import { useEffect, useState } from "react";
import { fmtMoney } from "@/components/ui/kit";

/** Series / slice colours — readable on both themes. */
export const CHART_COLORS = ["var(--color-accent)", "var(--tone-ok-solid)", "var(--tone-warn-solid)", "#6b7fd7", "#2aa6a0", "#b565c9", "var(--color-neutral-400)"];

/** True when the viewport is wide enough for a two-column dashboard row. */
export function useWide(min = 1100) {
  const q = `(min-width: ${min}px)`;
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setWide(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [q]);
  return wide;
}

/** Week-by-week lines (one per series) with dots, gridlines and a legend with this week's value. */
export function TrendChart({ labels, series, emptyText }: {
  labels: string[]; series: { name: string; values: number[]; color: string }[]; emptyText: string;
}) {
  const W = 640, H = 200, L = 34, R = 10, T = 12, B = 26;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const nice = niceMax(max);
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(1, labels.length - 1);
  const y = (v: number) => T + (H - T - B) * (1 - v / nice);
  const empty = series.every((s) => s.values.every((v) => v === 0));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12.5 }}>
        {series.map((s) => (
          <span key={s.name} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
            <span style={{ color: "var(--color-neutral-600)" }}>{s.name}</span>
            <b style={{ fontVariantNumeric: "tabular-nums" }}>{(s.values[s.values.length - 1] ?? 0).toLocaleString()}</b>
          </span>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" style={{ width: "100%", height: "auto", display: "block" }}>
          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line x1={L} x2={W - R} y1={y(nice * f)} y2={y(nice * f)} stroke="var(--color-neutral-200)" strokeDasharray={f === 0 ? undefined : "3 4"} />
              <text x={L - 6} y={y(nice * f) + 4} textAnchor="end" fontSize="10" fill="var(--color-neutral-500)">{Math.round(nice * f).toLocaleString()}</text>
            </g>
          ))}
          {labels.map((l, i) => (
            <text key={i} x={x(i)} y={H - 8} textAnchor={i === labels.length - 1 && labels.length > 1 ? "end" : "middle"} fontSize="10" fill="var(--color-neutral-500)">{l}</text>
          ))}
          {series.map((s) => (
            <g key={s.name}>
              <polyline fill="none" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"
                points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={i === s.values.length - 1 ? 4 : 2.6} fill={s.color}>
                  <title>{`${s.name} · ${labels[i]}: ${v.toLocaleString()}`}</title>
                </circle>
              ))}
            </g>
          ))}
        </svg>
        {empty && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 12.5, color: "var(--color-neutral-500)" }}>
            <span style={{ background: "var(--color-surface)", padding: "3px 10px", borderRadius: 999 }}>{emptyText}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Donut with the total in the middle and a legend of value and share. */
export function Donut({ slices, centerTop, centerBottom }: {
  slices: { label: string; value: number; count: number; color: string }[]; centerTop: string; centerBottom: string;
}) {
  const total = slices.reduce((n, s) => n + s.value, 0);
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <svg viewBox="0 0 140 140" style={{ width: 150, height: 150, flex: "none" }} role="img">
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--color-neutral-100)" strokeWidth="18" />
        {total > 0 && slices.map((s) => {
          const len = (s.value / total) * C;
          const el = (
            <circle key={s.label} cx="70" cy="70" r={R} fill="none" stroke={s.color} strokeWidth="18"
              strokeDasharray={`${Math.max(0, len - 1.2)} ${C}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)">
              <title>{`${s.label}: ${fmtMoney(Math.round(s.value))} (${pctOf(s.value, total)})`}</title>
            </circle>
          );
          acc += len;
          return el;
        })}
        <text x="70" y="67" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--color-text)">{centerTop}</text>
        <text x="70" y="84" textAnchor="middle" fontSize="10" fill="var(--color-neutral-500)">{centerBottom}</text>
      </svg>
      <div style={{ flex: "1 1 180px", display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        {slices.map((s) => (
          <div key={s.label} style={{ display: "grid", gridTemplateColumns: "10px minmax(0,1fr) auto auto", gap: 8, alignItems: "center", fontSize: 12.5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={s.label}>{s.label}</span>
            <span style={{ color: "var(--color-neutral-500)", fontVariantNumeric: "tabular-nums" }}>{s.count.toLocaleString()}</span>
            <b style={{ minWidth: 40, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{pctOf(s.value, total)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Ranked horizontal bars: label, bar scaled to the largest, value. */
export function RankBars({ rows, onPick }: { rows: { key: string; label: string; value: number; sub?: string }[]; onPick?: (key: string) => void }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {rows.map((r, i) => (
        <button key={r.key} onClick={() => onPick?.(r.key)} disabled={!onPick}
          style={{ display: "grid", gridTemplateColumns: "18px minmax(0,1fr)", gap: 8, alignItems: "center", border: 0, padding: 0, background: "transparent", color: "var(--color-text)", cursor: onPick ? "pointer" : "default", textAlign: "left", fontFamily: "inherit" }}>
          <span style={{ fontSize: 11.5, color: "var(--color-neutral-500)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
          <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
            <span style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12.5 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.label}>{r.label}</span>
              <b style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtMoney(Math.round(r.value))}{r.sub && <span style={{ fontWeight: 400, color: "var(--color-neutral-500)" }}> · {r.sub}</span>}</b>
            </span>
            <span style={{ height: 6, borderRadius: 999, background: "var(--color-neutral-100)", overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: `${(r.value / max) * 100}%`, background: i === 0 ? "var(--color-accent)" : "color-mix(in srgb, var(--color-accent) 60%, transparent)" }} />
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

/** "▲ 12 vs last week" in green, "▼" in red, "—" when flat; lowerIsBetter flips the colours. */
export function Delta({ now, prev, label, lowerIsBetter = false }: { now: number; prev: number; label: string; lowerIsBetter?: boolean }) {
  const d = now - prev;
  const good = lowerIsBetter ? d < 0 : d > 0;
  const color = d === 0 ? "var(--color-neutral-500)" : good ? "var(--tone-ok-fg)" : "var(--tone-stop-fg)";
  return (
    <span style={{ fontSize: 11.5, color, display: "inline-flex", gap: 4, alignItems: "center", fontVariantNumeric: "tabular-nums" }}>
      <span aria-hidden="true">{d > 0 ? "▲" : d < 0 ? "▼" : "—"}</span>
      {d !== 0 && Math.abs(d).toLocaleString()} <span style={{ color: "var(--color-neutral-500)" }}>{label}</span>
    </span>
  );
}

export const pctOf = (v: number, total: number) => `${total > 0 ? ((v / total) * 100).toFixed(v / total < 0.1 && v > 0 ? 1 : 0) : 0}%`;
function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= v) ?? v;
}
