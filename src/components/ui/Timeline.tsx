import type { ReactNode } from "react";
import { useI18n } from "@/app/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/constants/icons";
import { fmtDateTime } from "@/components/ui/kit";

/** One thing that happened to a document: when, what, by whom. `tone` colours the dot; `pending` draws a hollow dot for a step not reached yet. */
export interface TimelineEvent { when: string | null; title: ReactNode; sub?: ReactNode; by?: string | null; icon?: IconName; tone?: "ok" | "accent" | "warn" | "stop" | "neutral"; pending?: boolean }

const DOT: Record<NonNullable<TimelineEvent["tone"]>, string> = {
  ok: "var(--tone-ok-fg, #15803d)", accent: "var(--color-accent)", warn: "var(--tone-warn-fg, #b45309)", stop: "var(--tone-stop-fg, #b91c1c)", neutral: "var(--color-neutral-400)",
};

/** The history of a document as a vertical line of events, newest last. */
export function Timeline({ events, title }: { events: TimelineEvent[]; title?: ReactNode }) {
  const { lang } = useI18n();
  return (
    <section aria-label={typeof title === "string" ? title : undefined} style={{ background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)", padding: "12px 14px" }}>
      {title && <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Icon name="history" size={14} /> {title}</div>}
      <ol style={{ listStyle: "none", margin: 0, padding: 0, position: "relative" }}>
        {events.map((e, i) => {
          const color = e.pending ? "var(--color-neutral-300)" : DOT[e.tone ?? "neutral"];
          const last = i === events.length - 1;
          return (
            <li key={i} style={{ display: "grid", gridTemplateColumns: "18px 1fr", columnGap: 10, position: "relative", paddingBottom: last ? 0 : 10 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span aria-hidden style={{ width: 12, height: 12, borderRadius: "50%", marginTop: 3, flex: "none", background: e.pending ? "var(--color-surface)" : color, border: `2px solid ${color}` }} />
                {!last && <span aria-hidden style={{ flex: 1, width: 2, background: "var(--color-neutral-200)", marginTop: 2 }} />}
              </div>
              <div style={{ minWidth: 0, color: e.pending ? "var(--color-neutral-500)" : undefined }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap", fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{e.icon && <Icon name={e.icon} size={13} style={{ marginRight: 4, verticalAlign: -2 }} />}{e.title}</span>
                  {e.when && <span style={{ fontSize: 12, color: "var(--color-neutral-500)", whiteSpace: "nowrap" }}>{fmtDateTime(e.when, lang)}{e.by ? ` · ${e.by}` : ""}</span>}
                </div>
                {e.sub && <div style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{e.sub}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
