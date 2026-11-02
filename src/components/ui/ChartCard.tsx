import type { ReactNode } from "react";

/** The frame of an overview chart: a title, one line of explanation, the chart. Sized by its grid cell. */
export function ChartCard({ title, sub, children, span }: { title: string; sub?: string; children: ReactNode; span?: boolean }) {
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, minWidth: 0, gridColumn: span ? "1 / -1" : undefined }}>
      <div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

/** The grid the chart cards sit in. */
export const chartGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: 12 } as const;
