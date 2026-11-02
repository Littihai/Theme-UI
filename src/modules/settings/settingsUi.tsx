import type { ReactNode } from "react";
import { Tabs } from "@/components/ui/Tabs";

/**
 * Building blocks for the settings window, in the Claude settings idiom: a quiet
 * heading per block, then rows of "label + one-line explanation" on the left and
 * the control on the right, separated by hairlines rather than boxed in cards.
 */

export function SettingsBlock({ title, desc, children, action }: { title?: string; desc?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {(title || action) && (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
          <div>
            {title && <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h3>}
            {desc && <div style={{ fontSize: 12.5, color: "var(--color-neutral-600)", marginTop: 2 }}>{desc}</div>}
          </div>
          {action}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}

export function SettingRow({ label, desc, children, first, stack }: {
  label: ReactNode;
  desc?: ReactNode;
  children?: ReactNode;
  /** no top hairline (first row of a block) */
  first?: boolean;
  /** put the control under the label — for wide controls on narrow screens */
  stack?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: stack ? "column" : "row",
        alignItems: stack ? "stretch" : "center",
        justifyContent: "space-between",
        gap: stack ? 10 : 20,
        padding: "14px 0",
        borderTop: first ? undefined : "1px solid var(--color-neutral-200)",
        // a wrapping column sizes the control at a narrower width than it ends up
        // with, leaving empty space under it
        flexWrap: stack ? "nowrap" : "wrap",
      }}
    >
      {/* the 240px basis is a width in a row; stacked it would become a 240px-tall
          block that pushes the control out of view */}
      <div style={{ flex: stack ? "none" : "1 1 240px", minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 12.5, color: "var(--color-neutral-600)", marginTop: 2, lineHeight: 1.45 }}>{desc}</div>}
      </div>
      {children !== undefined && <div style={{ flex: "none", maxWidth: "100%" }}>{children}</div>}
    </div>
  );
}

/** Pill-style single choice (e.g. language). */
export function Segmented<T extends string>({ value, options, onChange, ariaLabel }: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{ display: "inline-flex", padding: 3, gap: 2, borderRadius: "var(--radius-md)", background: "var(--color-neutral-100)", border: "1px solid var(--color-neutral-200)" }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            style={{
              border: 0,
              borderRadius: "var(--radius-md)",
              padding: "6px 14px",
              fontSize: 12.5,
              fontWeight: on ? 600 : 500,
              background: on ? "var(--color-surface)" : "transparent",
              color: on ? "var(--color-text)" : "var(--color-neutral-600)",
              boxShadow: on ? "var(--shadow-sm)" : "none",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Underlined sub-tabs inside one section (e.g. Roles | Permissions). */
export function SubTabs<T extends string>({ value, tabs, onChange }: {
  value: T;
  tabs: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Tabs tabs={tabs} active={value} onPick={(id) => onChange(id as T)} />
    </div>
  );
}

export function NoAccess({ text }: { text: string }) {
  return <div style={{ padding: "48px 0", textAlign: "center", color: "var(--color-neutral-500)", fontSize: 13.5 }}>{text}</div>;
}
