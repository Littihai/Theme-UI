import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "@/app/providers/I18nProvider";
import { useUi } from "@/app/providers/UiProvider";
import { Icon } from "@/components/ui/Icon";
import { card, field } from "@/components/ui/kit";

/** A bilingual string of a manual. */
export type L = { th: string; en: string };
/** One block of a section: a paragraph, numbered steps, a tip, or a warning. */
export type Block = { p: L } | { steps: L[] } | { tip: L } | { warn: L };
export interface ManualSection { id: string; title: L; blocks: Block[] }

/**
 * A module's manual tab: a table of contents, a search and the steps of each task; the "?" of a tab opens it at that
 * page's section (#id). Print / PDF opens a clean printable page. The words of each manual live beside the module
 * (manual.<module>.ts); the frame is shared, so every module's manual reads the same way.
 */
export function ManualPage({ sections, prefix, title }: { sections: ManualSection[]; prefix: string; title: string }) {
  const { t, lang } = useI18n();
  const { mobile } = useUi();
  const loc = useLocation();
  const [q, setQ] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const tx = (x: L) => (lang === "en" ? x.en : x.th);

  const textOf = (s: ManualSection) =>
    [tx(s.title), ...s.blocks.flatMap((b) => ("p" in b ? [tx(b.p)] : "steps" in b ? b.steps.map(tx) : "tip" in b ? [tx(b.tip)] : [tx(b.warn)]))].join(" ").toLowerCase();
  const shown = useMemo(
    () => (q.trim() ? sections.filter((s) => textOf(s).includes(q.trim().toLowerCase())) : sections),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, lang, sections],
  );

  useEffect(() => {
    const id = loc.hash.replace("#", "");
    if (id) window.setTimeout(() => document.getElementById(`${prefix}-man-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, [loc.hash, prefix]);

  function print() {
    const w = window.open("", "_blank", "width=900,height=800");
    if (!w || !bodyRef.current) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
      body{font:14px/1.6 "Noto Sans Thai",system-ui,sans-serif;margin:24px;color:#111} h1{font-size:22px} h2{font-size:17px;margin:22px 0 6px;border-bottom:1px solid #ccc;padding-bottom:3px}
      ol{padding-left:22px} .tip,.warn{border-left:3px solid #888;padding:4px 10px;margin:8px 0;background:#f5f5f5} .warn{border-color:#b45309} nav{display:none}
    </style></head><body><h1>${title}</h1>${bodyRef.current.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  const block = (b: Block, i: number) => {
    if ("p" in b) return <p key={i} style={{ margin: "6px 0", lineHeight: 1.65 }}>{tx(b.p)}</p>;
    if ("steps" in b) return <ol key={i} style={{ margin: "6px 0", paddingLeft: 22, display: "flex", flexDirection: "column", gap: 5, lineHeight: 1.6 }}>{b.steps.map((s, k) => <li key={k}>{tx(s)}</li>)}</ol>;
    const warn = "warn" in b;
    return (
      <div key={i} className={warn ? "warn" : "tip"} style={{ margin: "8px 0", padding: "8px 12px", borderRadius: 8, fontSize: 13, lineHeight: 1.6,
        borderLeft: `3px solid ${warn ? "var(--tone-warn-solid)" : "var(--color-accent)"}`, background: warn ? "var(--tone-warn-bg)" : "var(--color-accent-100)" }}>
        <b>{warn ? t("manual.warn") : t("manual.tip")}: </b>{tx(warn ? b.warn : b.tip)}
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "minmax(0,1fr)" : "220px minmax(0,1fr)", gap: 16, alignItems: "start" }}>
      <nav aria-label={t("manual.toc")} style={{ ...card, padding: 12, display: "flex", flexDirection: "column", gap: 2, position: mobile ? "static" : "sticky", top: 76 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("manual.search")} aria-label={t("manual.search")} style={{ ...field, marginBottom: 6 }} />
        {sections.map((s) => (
          <a key={s.id} href={`#${prefix}-man-${s.id}`}
            onClick={(e) => { e.preventDefault(); document.getElementById(`${prefix}-man-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
            style={{ padding: "6px 8px", borderRadius: 6, fontSize: 13, color: "var(--color-neutral-700)", textDecoration: "none" }}>
            {tx(s.title)}
          </a>
        ))}
        <button onClick={print} style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center", justifyContent: "center", padding: "6px 10px", borderRadius: 7, border: "1px solid var(--color-neutral-300)", background: "var(--color-surface)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", color: "var(--color-text)" }}>
          <Icon name="file" size={13} />{t("manual.print")}
        </button>
      </nav>

      <div ref={bodyRef} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {shown.length === 0 && <div style={{ ...card, padding: 24, textAlign: "center", color: "var(--color-neutral-500)", fontSize: 13.5 }}>{t("manual.none")}</div>}
        {shown.map((s) => (
          <section key={s.id} id={`${prefix}-man-${s.id}`} style={{ ...card, padding: "16px 18px", scrollMarginTop: 80 }}>
            <h2 style={{ margin: "0 0 4px", fontFamily: "var(--font-heading)", fontSize: 19, fontWeight: 600 }}>{tx(s.title)}</h2>
            {s.blocks.map(block)}
          </section>
        ))}
      </div>
    </div>
  );
}
