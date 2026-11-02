import { useEffect } from "react";

/**
 * Every clickable table row (class row-click) can be reached with Tab and opened with Enter or Space, without each
 * page having to say so: rows get tabindex as they appear, and one listener handles the keys.
 */
export function useRowKeys() {
  useEffect(() => {
    const mark = () => document.querySelectorAll<HTMLElement>(".row-click:not([tabindex])").forEach((el) => { el.tabIndex = 0; });
    mark();
    const mo = new MutationObserver(mark);
    mo.observe(document.body, { childList: true, subtree: true });
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || !el.classList?.contains("row-click") || el !== document.activeElement) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { mo.disconnect(); document.removeEventListener("keydown", onKey); };
  }, []);
}
