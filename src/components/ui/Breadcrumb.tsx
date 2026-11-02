import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/app/providers/I18nProvider";

export interface Crumb { label: string; to?: string }

/**
 * Where this page sits: links up the path, the current page last (not a link). Past four levels the middle folds
 * into "…", which opens it; a long name is cut with an ellipsis and shown whole on hover. `heading` makes the
 * current page the page's h1 (a document page whose title is its place in the path).
 */
export function Breadcrumb({ items, heading }: { items: Crumb[]; heading?: boolean }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const fold = !open && items.length > 4;
  const shown: (Crumb | "fold")[] = fold ? [items[0], "fold", ...items.slice(-2)] : items;
  const last = items[items.length - 1];
  return (
    <nav aria-label={t("crumb.label")} className="crumb">
      <ol>
        {shown.map((c, i) => (
          <li key={i}>
            {i > 0 && <span className="crumb-sep" aria-hidden="true">/</span>}
            {c === "fold" ? (
              <button type="button" className="crumb-fold" aria-label={t("crumb.more")} onClick={() => setOpen(true)}>…</button>
            ) : c === last ? (
              heading
                ? <h1 className="crumb-current" aria-current="page" title={c.label}>{c.label}</h1>
                : <span className="crumb-current" aria-current="page" title={c.label}>{c.label}</span>
            ) : c.to ? (
              <Link to={c.to} className="crumb-link" title={c.label}>{c.label}</Link>
            ) : (
              <span className="crumb-link" title={c.label}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
