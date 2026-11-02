import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { tr } from "@/i18n/dict";
import type { IconName } from "@/constants/icons";

export type ToastTone = "success" | "info" | "warn" | "error";

export interface ToastOptions {
  tone: ToastTone;
  title: string;
  text?: string;
  /** a button on the toast (Undo, Retry, Open); a toast with one waits for the user instead of closing itself */
  action?: { label: string; onClick: () => void };
  /** the whole message opens something (a notification) — it still closes itself */
  onOpen?: () => void;
}

interface Item extends ToastOptions {
  id: number;
}

const MAX = 3;
const LIFE = 5000;
const ICON: Record<ToastTone, IconName> = { success: "checkCircle", info: "info", warn: "alert", error: "alert" };
const COLOR: Record<ToastTone, string> = {
  success: "var(--tone-ok-solid)",
  info: "var(--color-accent)",
  warn: "var(--tone-warn-solid)",
  error: "var(--tone-stop-solid)",
};

let push: ((t: Item) => void) | null = null;
let queued: Item[] = [];
let seq = 0;

/** Shows a toast in the corner. Works before the host mounts (the first ones wait for it). */
export function toast(opts: ToastOptions) {
  const item = { ...opts, id: ++seq };
  if (push) push(item);
  else queued.push(item);
}

function ToastCard({ t, onClose }: { t: Item; onClose: () => void }) {
  const sticky = t.tone === "error" || !!t.action;
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const left = useRef(LIFE);
  const started = useRef(0);

  const close = () => {
    setLeaving(true);
    window.setTimeout(onClose, 180);
  };

  // the countdown stops while the pointer or the keyboard focus is on the toast, and resumes with the time left
  useEffect(() => {
    if (sticky || paused || leaving) return;
    started.current = Date.now();
    const id = window.setTimeout(close, left.current);
    return () => {
      window.clearTimeout(id);
      left.current -= Date.now() - started.current;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sticky, paused, leaving]);

  const body = (
    <>
      <span className="toast-title">{t.title}</span>
      {t.text && <span className="toast-text">{t.text}</span>}
    </>
  );

  return (
    <div
      className="toast"
      data-tone={t.tone}
      data-leaving={leaving ? "" : undefined}
      role={t.tone === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false); }}
    >
      <span className="toast-icon" aria-hidden style={{ color: COLOR[t.tone] }}><Icon name={ICON[t.tone]} size={18} /></span>
      {t.onOpen ? (
        <button type="button" className="toast-body toast-open" onClick={() => { t.onOpen?.(); close(); }}>{body}</button>
      ) : (
        <span className="toast-body">{body}</span>
      )}
      {t.action && (
        <button type="button" className="toast-action" data-tone={t.tone} onClick={() => { t.action?.onClick(); close(); }}>
          {t.action.label}
        </button>
      )}
      <button type="button" className="btn-icon toast-close" aria-label={tr("toast.close")} onClick={close}>
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}

/** The one place toasts appear (mounted once in App): bottom-right, newest at the bottom, at most three. */
export function ToastHost() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    push = (t) => setItems((xs) => [...xs, t].slice(-MAX));
    if (queued.length) { setItems(queued.slice(-MAX)); queued = []; }
    return () => { push = null; };
  }, []);

  // the stack stays in the page even when empty, so a screen reader is already watching it when a toast arrives
  return (
    <div className="toast-stack" aria-live="polite">
      {items.map((t) => (
        <ToastCard key={t.id} t={t} onClose={() => setItems((xs) => xs.filter((x) => x.id !== t.id))} />
      ))}
    </div>
  );
}
