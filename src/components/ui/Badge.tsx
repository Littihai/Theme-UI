import { TONE } from "@/constants/icons";
import type { StatusTone } from "@/types";

/** Pill status badge, colored by the platform tone scale. */
export function Badge({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  const t = TONE[tone];
  return (
    <span
      style={{
        justifySelf: "start",
        whiteSpace: "nowrap",
        fontSize: 11.5,
        fontWeight: 600,
        borderRadius: 999,
        padding: "3px 10px",
        background: t.bg,
        color: t.fg,
      }}
    >
      {children}
    </span>
  );
}
