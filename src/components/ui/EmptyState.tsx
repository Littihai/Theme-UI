import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/constants/icons";

/**
 * An empty list that says what to do about it: an icon, the sentence, and the one action that fills it (or a hint
 * when the person cannot act). Used inside a table (one cell across the row) or on its own.
 */
export function EmptyState({ icon = "inbox", text, hint, action }: { icon?: IconName; text: string; hint?: string; action?: ReactNode }) {
  return (
    <div style={{ padding: "32px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <span style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 999, background: "var(--color-neutral-100)", color: "var(--color-neutral-500)" }}>
        <Icon name={icon} size={18} />
      </span>
      <div style={{ fontSize: 13.5, color: "var(--color-neutral-700)", fontWeight: 600 }}>{text}</div>
      {hint && <div style={{ fontSize: 12.5, color: "var(--color-neutral-500)", maxWidth: 460 }}>{hint}</div>}
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}
