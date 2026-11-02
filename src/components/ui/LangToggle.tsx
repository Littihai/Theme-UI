import { useI18n, type Lang } from "@/app/providers/I18nProvider";

/**
 * TH / EN language switch. `variant="light"` for dark backgrounds (login panel),
 * default for the app header (light background).
 */
export function LangToggle({ variant = "default" }: { variant?: "default" | "light" }) {
  const { lang, setLang } = useI18n();
  const light = variant === "light";

  const opts: { code: Lang; label: string }[] = [
    { code: "th", label: "ไทย" },
    { code: "en", label: "EN" },
  ];

  return (
    <div
      role="group"
      aria-label="Language"
      style={{
        display: "inline-flex",
        flexShrink: 0,   // in a crowded header row the toggle must overflow, never silently vanish
        border: `1px solid ${light ? "rgba(255,255,255,.35)" : "var(--color-neutral-300)"}`,
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        fontFamily: "var(--font-heading)",
      }}
    >
      {opts.map((o) => {
        const active = lang === o.code;
        return (
          <button
            key={o.code}
            type="button"
            onClick={() => setLang(o.code)}
            aria-pressed={active}
            style={{
              border: 0,
              cursor: "pointer",
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.4,
              background: active
                ? light
                  ? "rgba(255,255,255,.92)"
                  : "var(--color-text)"
                : "transparent",
              color: active
                ? light
                  ? "#1d2530"
                  : "var(--color-surface)"
                : light
                  ? "rgba(255,255,255,.85)"
                  : "var(--color-neutral-600)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
