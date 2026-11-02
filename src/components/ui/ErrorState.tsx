import { useState, type ReactNode } from "react";
import type { IconName } from "@/constants/icons";
import { useI18n } from "@/app/providers/I18nProvider";
import { Icon } from "./Icon";
import { Button } from "./Button";

export interface ErrorAction { label: string; onClick: () => void; primary?: boolean; icon?: IconName }

type Tone = "neutral" | "warn" | "stop";

/** 401 and 503 ask the user to wait or sign in (amber); a crash or a 5xx is ours (red); the rest are neutral. */
function toneOf(code: number | string | undefined): Tone {
  if (code === 401 || code === 503) return "warn";
  if (typeof code === "number" && code >= 500) return "stop";
  if (code === "crash") return "stop";
  return "neutral";
}

/**
 * The whole-page error card: what happened, what to do, and a way forward. It never shows an exception or other
 * internals — only a reference ID the user can copy for support. Used for 404/403 pages, a crash, and a module that
 * cannot load.
 */
export function ErrorState({
  icon = "alert", code, title, description, actions = [], reference, headingLevel = 2,
}: {
  icon?: IconName;
  /** 404, 403…, or a word such as "NETWORK"; "crash" for the error boundary (shown as ERROR) */
  code?: number | string;
  title: string;
  description?: ReactNode;
  actions?: ErrorAction[];
  /** a support reference the user can copy (a crash, a server error) */
  reference?: string;
  /** 1 when this panel is the whole page (a 404), 2 when it sits inside a page that has its own title */
  headingLevel?: 1 | 2;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const tone = toneOf(code);
  const label = code == null ? null : code === "crash" ? "ERROR" : typeof code === "number" ? `ERROR ${code}` : String(code).toUpperCase();
  const H = headingLevel === 1 ? "h1" : "h2";

  const copy = async () => {
    if (!reference) return;
    try { await navigator.clipboard.writeText(reference); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* the text is on screen to copy by hand */ }
  };

  return (
    <div className="err-card" data-tone={tone}>
      <div className="err-head">
        <span className="err-tile" aria-hidden="true"><Icon name={icon} size={24} /></span>
        {label && <span className="err-code">{label}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <H className="err-title">{title}</H>
        {description && <p className="err-desc">{description}</p>}
        {reference && (
          <div className="err-ref">
            <span>{t("error.ref")}: {reference}</span>
            <button type="button" className="btn-icon" onClick={copy} aria-label={t("error.copyRef")} title={t("error.copyRef")} style={{ padding: 5 }}>
              <Icon name={copied ? "check" : "copy"} size={14} />
            </button>
            <span className="sr-only" aria-live="polite">{copied ? t("error.copied") : ""}</span>
          </div>
        )}
      </div>
      {actions.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {actions.map((a) => (
            <Button key={a.label} variant={a.primary ? "primary" : "secondary"} onClick={a.onClick}>
              {a.icon && <Icon name={a.icon} size={16} />}{a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

/** "Go back" for an error page, when there is somewhere to go back to inside the app. */
export function backAction(label: string): ErrorAction | null {
  return window.history.length > 1 ? { label, onClick: () => window.history.back() } : null;
}
