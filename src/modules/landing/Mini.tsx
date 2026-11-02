import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { ACCENTS } from "@/lib/appearance";

/**
 * Small illustrations for the landing page, drawn with the app's own tokens so they follow the theme, the accent and
 * the corner radius like everything else. Decorative: every one is aria-hidden by its card.
 */

const line = (w: string | number, extra?: CSSProperties): CSSProperties => ({ height: 6, width: w, borderRadius: 3, background: "var(--color-neutral-300)", ...extra });
const surface: CSSProperties = { background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)" };

/** A tiny app window: the top bar, the sidebar, two tiles and a chart — what the shell looks like, at a glance. */
export function HeroMock() {
  const bars = [38, 52, 44, 66, 58, 74, 70, 86];
  return (
    <div className="lp-mock" aria-hidden>
      <div className="lp-mock-top">
        <span className="lp-mock-dot" /><span className="lp-mock-dot" /><span className="lp-mock-dot" />
        <span style={{ ...line(90), marginLeft: 10, background: "var(--color-neutral-200)" }} />
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "var(--color-neutral-200)" }} />
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "var(--color-neutral-200)" }} />
          <span style={{ width: 14, height: 14, borderRadius: 999, background: "var(--color-accent-200)" }} />
        </span>
      </div>
      <div className="lp-mock-body">
        <div className="lp-mock-side">
          <span style={{ ...line("70%"), background: "var(--color-accent)" }} />
          {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ ...line(i === 1 ? "85%" : "60%"), opacity: i === 1 ? 1 : 0.7 }} />)}
        </div>
        <div className="lp-mock-main">
          <span style={{ ...line("40%", { height: 9, background: "var(--color-text)", opacity: 0.8 }) }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["var(--color-accent)", "58%"], ["var(--tone-ok-solid)", "44%"], ["var(--tone-warn-solid)", "36%"]].map(([c, w], i) => (
              <div key={i} style={{ ...surface, padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={line("55%", { height: 4 })} />
                <span style={{ ...line(w, { height: 10, background: c }) }} />
              </div>
            ))}
          </div>
          <div style={{ ...surface, padding: "10px 10px 6px", display: "flex", alignItems: "flex-end", gap: 5, height: 78 }}>
            {bars.map((h, i) => <span key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 3, background: i === bars.length - 1 ? "var(--color-accent)" : "var(--color-accent-200)" }} />)}
          </div>
          <div style={{ ...surface, padding: 8, display: "flex", flexDirection: "column", gap: 7 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={line(42, { height: 5, background: "var(--color-neutral-400)" })} />
                <span style={line("40%", { height: 5 })} />
                <span style={{ marginLeft: "auto", width: 34, height: 9, borderRadius: 999, background: i === 0 ? "var(--tone-warn-bg)" : "var(--tone-ok-bg)" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The accents as swatches, and a light/dark tile. */
export function MiniTheme() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 18px)", gap: 7 }}>
        {ACCENTS.slice(0, 10).map((a) => <span key={a.id} style={{ width: 18, height: 18, borderRadius: 999, background: a.swatch, outline: a.id === "steel" ? `2px solid ${a.swatch}` : undefined, outlineOffset: 2 }} />)}
      </div>
      <div style={{ display: "flex", width: 92, height: 60, borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--color-neutral-300)" }}>
        <span className="theme-light" style={{ flex: 1, background: "var(--color-bg)", display: "grid", placeItems: "center" }}><span style={{ width: 28, height: 8, borderRadius: 4, background: "var(--color-text)" }} /></span>
        <span className="theme-dark" style={{ flex: 1, background: "var(--color-bg)", display: "grid", placeItems: "center" }}><span style={{ width: 28, height: 8, borderRadius: 4, background: "var(--color-text)" }} /></span>
      </div>
    </div>
  );
}

/** Two languages, one key. */
export function MiniLang() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      <div style={{ display: "inline-flex", padding: 3, gap: 2, borderRadius: "var(--radius-md)", background: "var(--color-neutral-100)", border: "1px solid var(--color-neutral-200)" }}>
        <span style={{ padding: "4px 12px", borderRadius: "var(--radius-md)", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", fontSize: 12, fontWeight: 700 }}>ไทย</span>
        <span style={{ padding: "4px 12px", fontSize: 12, fontWeight: 600, color: "var(--color-neutral-600)" }}>EN</span>
      </div>
      <code style={{ fontSize: 11, color: "var(--color-neutral-600)" }}>{'t("common.save")'}</code>
    </div>
  );
}

/** People and the lock between them and a page. */
export function MiniRoles() {
  const people = [["AD", "var(--color-accent-200)", "var(--color-accent-800)"], ["SD", "var(--tone-ok-bg)", "var(--tone-ok-fg)"], ["NK", "var(--tone-warn-bg)", "var(--tone-warn-fg)"]];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex" }}>
        {people.map(([i, bg, fg], n) => <span key={i} style={{ width: 30, height: 30, borderRadius: 999, background: bg, color: fg, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, marginLeft: n ? -8 : 0, border: "2px solid var(--color-surface)" }}>{i}</span>)}
      </div>
      <span style={{ width: 22, height: 2, background: "var(--color-neutral-300)" }} />
      <span style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: "var(--radius-md)", background: "var(--color-accent-100)", color: "var(--color-accent-700)" }}><Icon name="shieldLock" size={18} /></span>
      <code style={{ fontSize: 11, color: "var(--color-neutral-600)" }}>APP.MODULE.VIEW</code>
    </div>
  );
}

/** A few pieces of the kit side by side. */
export function MiniKit() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
      <span className="btn btn-primary btn-sm" style={{ pointerEvents: "none" }}>Save</span>
      <span className="btn btn-secondary btn-sm" style={{ pointerEvents: "none" }}>Cancel</span>
      <span style={{ fontSize: 11.5, fontWeight: 600, borderRadius: 999, padding: "3px 10px", background: "var(--tone-ok-bg)", color: "var(--tone-ok-fg)" }}>Approved</span>
      <span className="switch" style={{ pointerEvents: "none" }}><input type="checkbox" readOnly checked tabIndex={-1} aria-hidden /><span className="switch-track" /></span>
    </div>
  );
}

/** Rows with a sort arrow and a pager. */
export function MiniTable() {
  return (
    <div style={{ ...surface, width: "100%", maxWidth: 230, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 10, padding: "6px 10px", background: "var(--color-neutral-50)", borderBottom: "1px solid var(--color-neutral-200)" }}>
        <span style={line(40, { height: 5, background: "var(--color-neutral-400)" })} /><span style={line(60, { height: 5, background: "var(--color-neutral-400)" })} /><span style={{ marginLeft: "auto", color: "var(--color-neutral-500)", display: "flex" }}><Icon name="chevronDown" size={10} /></span>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 10px", borderBottom: "1px solid var(--color-neutral-100)" }}>
          <span style={line(40, { height: 5, background: "var(--color-neutral-400)" })} /><span style={line(50 + i * 12, { height: 5 })} />
          <span style={{ marginLeft: "auto", width: 30, height: 9, borderRadius: 999, background: i === 1 ? "var(--tone-warn-bg)" : "var(--tone-ok-bg)" }} />
        </div>
      ))}
      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", padding: "6px 8px" }}>
        {[1, 2, 3].map((n) => <span key={n} style={{ width: 16, height: 16, borderRadius: 4, fontSize: 9, display: "grid", placeItems: "center", background: n === 1 ? "var(--color-text)" : "var(--color-neutral-100)", color: n === 1 ? "var(--color-surface)" : "var(--color-neutral-600)" }}>{n}</span>)}
      </div>
    </div>
  );
}

/** The envelope every endpoint answers with. */
export function MiniApi() {
  const row = (k: string, v: string, c: string) => (
    <div key={k} style={{ display: "flex", gap: 6 }}><span style={{ color: "var(--color-neutral-500)" }}>{k}:</span><span style={{ color: c }}>{v}</span></div>
  );
  return (
    <div style={{ ...surface, padding: "10px 14px", fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace", fontSize: 11.5, lineHeight: 1.6 }}>
      <div style={{ color: "var(--color-neutral-500)" }}>{"{"}</div>
      <div style={{ paddingLeft: 12 }}>
        {row("success", "true", "var(--tone-ok-fg)")}
        {row("message", '""', "var(--color-neutral-600)")}
        {row("data", "{ … }", "var(--color-accent-700)")}
        {row("errors", "[]", "var(--color-neutral-600)")}
      </div>
      <div style={{ color: "var(--color-neutral-500)" }}>{"}"}</div>
    </div>
  );
}
