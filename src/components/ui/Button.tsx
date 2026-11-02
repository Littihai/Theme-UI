import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * `primary` at most one per page · `secondary` the usual action · `tertiary` a quiet one beside a primary (Cancel) ·
 * `link` an action that reads as text · `danger` only for what cannot be undone · `warning` asks for care ·
 * `neutral` a quiet alert such as a bell with a count · `ghost` a compact text action inside tables and cards.
 */
type Variant = "primary" | "secondary" | "tertiary" | "link" | "ghost" | "success" | "danger" | "warning" | "neutral";
type Size = "md" | "sm" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** `sm` (36) for tables and dense toolbars, `lg` (52) for a page's one big call to action; `md` (44) everywhere else */
  size?: Size;
  /** the action is running: a spinner replaces the icon and the button cannot be pressed again */
  busy?: boolean;
  /** a red count after the label (unread, waiting); hidden at 0 */
  count?: number;
  children: ReactNode;
}

/**
 * The platform's action primitive. Looks (hover, pressed, focus ring, disabled) live in styles/ui.css as `.btn`,
 * so every button on every page behaves the same; `style` still wins for one-off layout (width, margin).
 */
export function Button({ variant = "primary", size = "md", className, children, busy, count, disabled, ...rest }: ButtonProps) {
  const cls = ["btn", `btn-${variant}`, size !== "md" ? `btn-${size}` : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <button {...rest} className={cls} disabled={disabled || busy} aria-busy={busy || undefined}>
      {busy && <span aria-hidden style={{ width: 12, height: 12, border: "2px solid currentColor", borderRightColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", flex: "none" }} />}
      {children}
      {!!count && <span className="btn-count">{count > 99 ? "99+" : count}</span>}
    </button>
  );
}
