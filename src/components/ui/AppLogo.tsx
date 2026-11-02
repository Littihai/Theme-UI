import { BRAND } from "@/constants/brand";

/**
 * The product mark, drawn as SVG so it needs no image file and takes any colour. Replace the two paths with your own
 * brand artwork (keep the 1000×1000 view box) and update public/favicon.svg to match.
 *
 *   `size`  – rendered height and width in px.
 *   `color` – fill of the mark; defaults to the surrounding text colour (so it follows the theme).
 *   `tile`  – put the white mark on the dark rounded square that the favicon and the home-screen icon use,
 *             so the mark reads the same on a light header, a dark header and a browser tab.
 */
export const LOGO_MARK =
  // two stacked layers: a diamond on top of a half-diamond (the "theme on a base" idea)
  "M500 60 L900 320 L500 580 L100 320 Z " +
  "M100 560 L500 820 L900 560 L900 700 L500 960 L100 700 Z";

export function AppLogo({ size = 30, color = "currentColor", tile = false }: { size?: number; color?: string; tile?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1000 1000" role="img" aria-label={BRAND.name} style={{ display: "block", flex: "none" }}>
      {tile && (
        <rect x="12" y="12" width="976" height="976" rx="210" fill="var(--color-brand-deep)" stroke="var(--color-neutral-300)" strokeWidth="24" />
      )}
      <path fill={tile ? "#ffffff" : color} fillRule="evenodd" transform={tile ? "translate(170 170) scale(0.66)" : undefined} d={LOGO_MARK} />
    </svg>
  );
}

/** The mark and the wordmark together, as a button that goes home (header, sidebar) or a plain span. */
export function BrandLockup({ size = 30, onClick, className, wordClassName }: { size?: number; onClick?: () => void; className?: string; wordClassName?: string }) {
  const inner = (
    <>
      <AppLogo size={size} tile />
      <span className={wordClassName} style={wordClassName ? undefined : { fontSize: 20, fontWeight: 700, letterSpacing: "-.01em" }}>{BRAND.word}</span>
    </>
  );
  if (!onClick) return <span className={className} style={{ display: "flex", alignItems: "center", gap: 10 }}>{inner}</span>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={BRAND.name}
      className={className}
      style={className ? undefined : { display: "flex", alignItems: "center", gap: 10, border: 0, background: "transparent", padding: "4px 2px", color: "var(--color-text)", cursor: "pointer" }}
    >
      {inner}
    </button>
  );
}
