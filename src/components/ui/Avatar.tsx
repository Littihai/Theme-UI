/** Circular avatar: the person's picture when there is one, else their initials (accent tinted). */
export function Avatar({ initials, size = 30, src }: { initials: string; size?: number; src?: string | null }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        background: "var(--color-accent-200)",
        color: "var(--color-accent-800)",
        display: "grid",
        placeItems: "center",
        fontSize: Math.round(size * 0.4),
        fontWeight: 700,
        overflow: "hidden",
      }}
    >
      {src ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : initials}
    </span>
  );
}
