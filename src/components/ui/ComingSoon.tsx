import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/app/providers/I18nProvider";
import type { IconName } from "@/types";

/**
 * Placeholder shown for modules whose backend/data is not built yet.
 * Keeps the platform look consistent instead of faking data.
 */
export function ComingSoon({ name, icon }: { name: string; icon?: IconName }) {
  const { t } = useI18n();
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: 320,
        background: "var(--color-surface)",
        border: "1px dashed var(--color-neutral-300)",
        borderRadius: "var(--radius-lg)",
        padding: "48px 24px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", maxWidth: 380 }}>
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--radius-lg)",
            background: "var(--color-accent-100)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon name={icon ?? "package"} size={26} color="var(--color-accent-700)" />
        </span>
        <span
          className="eyebrow"
          style={{
            fontWeight: 700,
            color: "var(--color-accent-700)",
            background: "var(--color-accent-100)",
            borderRadius: 999,
            padding: "4px 12px",
          }}
        >
          {t("soon.badge")}
        </span>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 600 }}>
          {t("soon.title", { name })}
        </div>
        <div style={{ fontSize: 13.5, color: "var(--color-neutral-600)", lineHeight: 1.6 }}>
          {t("soon.body")}
        </div>
      </div>
    </div>
  );
}
