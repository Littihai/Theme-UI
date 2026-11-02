import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { tr } from "@/i18n/dict";
import type { IconName } from "@/constants/icons";
import { lockPageScroll } from "@/lib/scrollLock";

export interface ConfirmOptions {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  /** `danger` for an action that destroys or refuses something; `primary` for an ordinary "are you sure" */
  tone?: "primary" | "danger";
  /** with `danger`: the action deletes something — a trash tile, and the words drop into it on confirm */
  trash?: boolean;
  icon?: "warning" | "question" | "info";
  /** a text the user must type before confirming (why a request is not approved) */
  input?: { placeholder?: string; initial?: string; requiredText: string; maxLength?: number };
}

export interface ConfirmResult {
  ok: boolean;
  value?: string;
}

interface Request extends ConfirmOptions {
  resolve: (r: ConfirmResult) => void;
}

let show: ((r: Request) => void) | null = null;

/** Opens the platform's confirmation dialog; resolves the moment the user decides (the closing motion plays on its own). */
export function openConfirm(opts: ConfirmOptions): Promise<ConfirmResult> {
  return new Promise((resolve) => {
    if (show) show({ ...opts, resolve });
    else resolve({ ok: window.confirm(opts.title) });
  });
}

function reducedMotion() {
  const m = document.documentElement.dataset.motion;
  if (m === "reduce") return true;
  if (m === "full") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Segmenter = new (locale?: string, o?: { granularity: "word" }) => { segment(s: string): Iterable<{ segment: string }> };

/** Splits text into at most `max` pieces that fly separately; Thai has no spaces, so it is cut at word boundaries. */
function pieces(s: string, max: number): string[] {
  const Seg = (Intl as unknown as { Segmenter?: Segmenter }).Segmenter;
  const segs = Seg ? Array.from(new Seg(undefined, { granularity: "word" }).segment(s), (x) => x.segment) : s.split(/(\s+)/).filter(Boolean);
  const words = segs.filter((x) => /\S/.test(x)).length;
  const k = Math.max(1, Math.ceil(words / max));
  const out: string[] = [];
  let buf = "";
  let n = 0;
  for (const x of segs) {
    if (!/\S/.test(x)) {
      if (buf) { out.push(buf); buf = ""; n = 0; }
      out.push(x);
      continue;
    }
    buf += x;
    if (++n >= k) { out.push(buf); buf = ""; n = 0; }
  }
  if (buf) out.push(buf);
  return out;
}

const Words = ({ text, max }: { text: string; max: number }) => (
  <>{pieces(text, max).map((p, i) => (/\S/.test(p) ? <span key={i} className="dz-word">{p}</span> : p))}</>
);

function tileIcon(r: Request): { icon: IconName; tone: "stop" | "warn" | "accent" } {
  if (r.trash) return { icon: "trash", tone: "stop" };
  if (r.tone === "danger") return { icon: "alert", tone: "stop" };
  if (r.icon === "warning") return { icon: "alert", tone: "warn" };
  if (r.icon === "info") return { icon: "info", tone: "accent" };
  return { icon: "question", tone: "accent" };
}

/**
 * The one confirmation dialog (mounted once in App). Danger starts the focus on Cancel, the safe choice; an
 * ordinary confirmation starts on its confirm button, a reason prompt in the text box. Tab stays inside; Esc or
 * a click on the backdrop cancels; the focus goes back to the button that opened it.
 */
export function ConfirmHost() {
  const [req, setReq] = useState<Request | null>(null);
  const [phase, setPhase] = useState<"open" | "sucking" | "leaving">("open");
  const [value, setValue] = useState("");
  const [missing, setMissing] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const tile = useRef<HTMLSpanElement>(null);
  const cancelBtn = useRef<HTMLButtonElement>(null);
  const okBtn = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const timers = useRef<number[]>([]);
  const errId = useId();

  useEffect(() => {
    show = (r) => {
      opener.current = document.activeElement as HTMLElement | null;
      setValue(r.input?.initial ?? "");
      setMissing(false);
      setPhase("open");
      setReq(r);
    };
    return () => { show = null; };
  }, []);

  useEffect(() => {
    if (!req || phase !== "open") return;
    if (req.input) field.current?.focus();
    else if (req.tone === "danger") cancelBtn.current?.focus();
    else okBtn.current?.focus();
  }, [req, phase]);

  useEffect(() => {
    if (!req) return;
    return lockPageScroll();
  }, [req]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  function finish() {
    setReq(null);
    const back = opener.current;
    if (back?.isConnected) back.focus();
  }

  function leave() {
    if (reducedMotion()) { finish(); return; }
    setPhase("leaving");
    later(finish, 200);
  }

  function cancel() {
    if (!req || phase !== "open") return;
    req.resolve({ ok: false });
    leave();
  }

  function confirm() {
    if (!req || phase !== "open") return;
    if (req.input && !value.trim()) {
      setMissing(true);
      field.current?.focus();
      return;
    }
    req.resolve({ ok: true, value: req.input ? value.trim() : undefined });
    if (!req.trash || reducedMotion() || !dialog.current || !tile.current?.animate) { leave(); return; }
    setPhase("sucking");
    // the pieces fly from where they are to the trash tile, measured now so wrapped lines still land in it
    const t = tile.current.getBoundingClientRect();
    const tx = t.left + t.width / 2;
    const ty = t.top + t.height * 0.4;
    const els = Array.from(dialog.current.querySelectorAll<HTMLElement>(".dz-word"));
    const STEP = Math.min(75, 700 / Math.max(1, els.length));
    const DUR = 640;
    const START = 140;
    els.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const dx = tx - (r.left + r.width / 2);
      const dy = ty - (r.top + r.height / 2);
      const lift = -16 - Math.min(i, 8) * 1.5;
      el.animate([
        { transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 },
        { offset: 0.5, transform: `translate(${dx * 0.5}px,${dy * 0.5 + lift}px) scale(.72) rotate(-8deg)`, opacity: 1 },
        { offset: 0.85, transform: `translate(${dx}px,${dy - 7}px) scale(.22) rotate(-12deg)`, opacity: 0.9 },
        { transform: `translate(${dx}px,${dy + 3}px) scale(.05) rotate(-12deg)`, opacity: 0 },
      ], { duration: DUR, delay: START + i * STEP, easing: "cubic-bezier(.4,0,.6,1)", fill: "both" });
    });
    const end = START + (els.length - 1) * STEP + DUR;
    const glyph = tile.current.firstElementChild as HTMLElement | null;
    glyph?.animate([
      { transform: "rotate(0)" },
      { offset: 0.12, transform: "rotate(-14deg) translateY(-1px)" },
      { offset: 0.85, transform: "rotate(-14deg) translateY(-1px)" },
      { transform: "rotate(0)" },
    ], { duration: end + 120, easing: "ease-out" });
    tile.current.animate([
      { transform: "scale(1)" },
      { offset: 0.4, transform: "scale(1.12) rotate(-3deg)" },
      { offset: 0.7, transform: "scale(.96)" },
      { transform: "scale(1)" },
    ], { duration: 300, delay: end + 120, easing: "ease-out" });
    later(leave, end + 480);
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") { e.stopPropagation(); cancel(); return; }
    if (e.key !== "Tab" || !dialog.current) return;
    const f = Array.from(dialog.current.querySelectorAll<HTMLElement>("button:not(:disabled), textarea:not(:disabled)"));
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  if (!req) return null;
  const busy = phase !== "open";
  const { icon, tone } = tileIcon(req);
  const danger = req.tone === "danger";

  return (
    <div className="dz-scrim" data-leaving={phase === "leaving" ? "" : undefined} onMouseDown={(e) => { if (e.target === e.currentTarget) cancel(); }}>
      <div
        ref={dialog}
        className="dz-dialog"
        role={danger ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby="dz-title"
        aria-describedby={req.text ? "dz-desc" : undefined}
        aria-busy={busy || undefined}
        tabIndex={-1}
        onKeyDown={onKey}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span ref={tile} className="dz-tile" data-tone={tone} data-active={phase === "sucking" ? "" : undefined} aria-hidden>
            <span style={{ display: "inline-flex", transformOrigin: "20% 30%" }}><Icon name={icon} size={20} /></span>
          </span>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            <h2 id="dz-title" style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 600, lineHeight: 1.4 }}>
              {req.trash ? <Words text={req.title} max={6} /> : req.title}
            </h2>
            {req.text && (
              <p id="dz-desc" style={{ margin: 0, fontSize: "var(--text-sm)", lineHeight: 1.6, color: "var(--color-neutral-700)", whiteSpace: "pre-line" }}>
                {req.trash ? <Words text={req.text} max={10} /> : req.text}
              </p>
            )}
          </div>
          <button type="button" className="btn-icon" aria-label={tr("common.close")} onClick={cancel} disabled={busy} style={{ margin: "-6px -6px 0 0" }}>
            <Icon name="x" size={18} />
          </button>
        </div>
        {req.input && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <textarea
              ref={field}
              rows={4}
              value={value}
              maxLength={req.input.maxLength ?? 500}
              placeholder={req.input.placeholder}
              aria-label={req.input.placeholder ?? req.title}
              aria-required="true"
              aria-invalid={missing || undefined}
              aria-describedby={missing ? errId : undefined}
              onChange={(e) => { setValue(e.target.value); if (missing && e.target.value.trim()) setMissing(false); }}
              className="dz-input"
            />
            {missing && (
              <span id={errId} role="alert" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)", color: "var(--tone-stop-fg)" }}>
                <Icon name="alert" size={14} /> {req.input.requiredText}
              </span>
            )}
          </div>
        )}
        <div className="dz-actions" data-busy={busy ? "" : undefined} style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button ref={cancelBtn} type="button" className="btn btn-secondary" onClick={cancel} disabled={busy}>
            {req.cancelText ?? tr("common.cancel")}
          </button>
          <button ref={okBtn} type="button" className={danger ? "btn btn-danger" : "btn btn-primary"} onClick={confirm} disabled={busy}>
            {danger && <Icon name={icon} size={16} />}
            {req.confirmText ?? tr("common.ok")}
          </button>
        </div>
      </div>
    </div>
  );
}
