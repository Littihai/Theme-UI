import type { ReactNode } from "react";

/**
 * Page title block: a small pre-title above the title, an optional line of context, and the page's actions on the
 * right. Every page opens with it so the title is always in the same place and the same size.
 */
export function PageHeader({ pretitle, title, sub, actions }: { pretitle?: ReactNode; title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0 }}>
        {pretitle && <div className="eyebrow" style={{ marginBottom: 2 }}>{pretitle}</div>}
        <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "var(--text-2xl)", fontWeight: 600, lineHeight: 1.4, color: "var(--color-text)" }}>{title}</h1>
        {sub && <div style={{ fontSize: "var(--text-sm)", color: "var(--color-neutral-600)", marginTop: 3 }}>{sub}</div>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>{actions}</div>}
    </div>
  );
}
