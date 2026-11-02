import type { CSSProperties, ReactNode } from "react";

/** Surface card — white, hairline border, sm elevation, rounded. */
export function Card({
  children,
  style,
  pad = "16px 18px",
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  pad?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-neutral-200)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        padding: pad,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
