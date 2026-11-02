import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useI18n } from "@/app/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/constants/icons";

/**
 * One stage of a document on its page. A stage that is done folds to one line (its summary) and opens on a click;
 * the current stage is open and stays open; a stage not reached yet is dimmed and folded. Keeps long documents
 * readable: what matters now is open, the rest is a line each.
 */
export function StageCard({ icon, title, summary, state, children, style }: {
  icon: IconName; title: ReactNode; summary?: ReactNode; state: "done" | "now" | "next" | "off"; children: ReactNode; style?: CSSProperties;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(state === "now");
  useEffect(() => { setOpen(state === "now"); }, [state]);
  const folded = !open && state !== "now";
  const color = state === "done" ? "var(--tone-ok-fg, #15803d)" : state === "now" ? "var(--color-accent)" : "var(--color-neutral-400)";
  return (
    <section style={{ background: "var(--color-surface)", border: `1px solid ${state === "now" ? "var(--color-accent-200, var(--color-neutral-200))" : "var(--color-neutral-200)"}`, borderRadius: "var(--radius-lg)", padding: folded ? "8px 14px" : 14, display: "grid", gap: 10, opacity: state === "off" ? 0.7 : 1, ...style }}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={!folded} disabled={state === "now"}
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", border: 0, background: "none", padding: 0, font: "inherit", textAlign: "left", cursor: state === "now" ? "default" : "pointer", color: "inherit" }}>
        <span style={{ display: "grid", placeItems: "center", width: 22, height: 22, borderRadius: "50%", background: state === "done" ? "var(--tone-ok-bg, #ecfdf5)" : state === "now" ? "var(--color-accent-100)" : "var(--color-neutral-100)", color, flex: "none" }}>
          {state === "done" ? <Icon name="check" size={13} /> : <Icon name={icon} size={13} />}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
        {folded && summary && <span style={{ fontSize: 12.5, color: "var(--color-neutral-600)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>· {summary}</span>}
        {state !== "now" && <span style={{ marginLeft: "auto", color: "var(--color-neutral-500)", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 }} aria-hidden>{folded ? t("stage.open") : t("stage.fold")}<Icon name={folded ? "chevronDown" : "chevronUp"} size={14} /></span>}
      </button>
      {!folded && children}
    </section>
  );
}

/**
 * The primary action of the stage in a bar that stays at the bottom of the window while the page scrolls, so the one
 * thing to do now is never out of reach on a long document. Renders nothing without children.
 */
export function ActionBar({ children, note }: { children: ReactNode; note?: ReactNode }) {
  if (!children) return null;
  return (
    <div role="toolbar" style={{ position: "sticky", bottom: 0, zIndex: 20, marginTop: 4, padding: "10px 14px", background: "color-mix(in srgb, var(--color-surface) 92%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      {note && <span style={{ fontSize: 12.5, color: "var(--color-neutral-600)", flex: 1, minWidth: 160 }}>{note}</span>}
      <span style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</span>
    </div>
  );
}
