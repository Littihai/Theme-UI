import { useI18n } from "@/app/providers/I18nProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { BRAND } from "@/constants/brand";
import { SettingRow, SettingsBlock } from "./settingsUi";
import { dateLocale } from "@/lib/dates";
import { SUPPORT_EMAIL, supportMailto } from "@/lib/support";

/**
 * What support asks first: which build is this, on which device. Every value here is read from the build or the
 * browser — nothing is typed in by hand. A real app adds a block of what its API reports (GET /config/system-info).
 */
export function AboutSection() {
  const { t, lang } = useI18n();
  const { resolved } = useTheme();
  const { user } = useAuth();

  const built = new Date(__BUILD_TIME__);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <SettingsBlock title={t("set.about.app")}>
        <Row first label={t("set.about.product")} value={BRAND.name} />
        <Row label={t("set.about.company")} value={BRAND.company} />
        <Row label={t("set.about.version")} value={`v${__APP_VERSION__}`} />
        <Row label={t("set.about.built")} value={Number.isNaN(built.getTime()) ? "—" : built.toLocaleString(dateLocale(lang))} />
      </SettingsBlock>

      <SettingsBlock title={t("set.about.support")} desc={t("set.about.supportDesc")}>
        <SettingRow first label={<span style={{ color: "var(--color-neutral-600)", fontWeight: 400 }}>Email</span>}>
          <a href={supportMailto({ subject: t("support.subject"), who: user?.username })}
            style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-accent-700)", textDecoration: "none" }}>{SUPPORT_EMAIL}</a>
        </SettingRow>
      </SettingsBlock>

      <SettingsBlock title={t("set.about.device")}>
        <Row first label={t("set.about.theme")} value={resolved === "dark" ? t("set.theme.dark") : t("set.theme.light")} />
        <Row label={t("set.about.lang")} value={lang === "th" ? "ไทย" : "English"} />
        <Row label={t("set.about.browser")} value={browserName()} />
      </SettingsBlock>
    </div>
  );
}

function Row({ label, value, first }: { label: string; value: string; first?: boolean }) {
  return (
    <SettingRow first={first} label={<span style={{ color: "var(--color-neutral-600)", fontWeight: 400 }}>{label}</span>}>
      <span style={{ fontSize: 13.5, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </SettingRow>
  );
}

function browserName(): string {
  const ua = navigator.userAgent;
  const m = /Edg\/([\d.]+)/.exec(ua) ?? /Chrome\/([\d.]+)/.exec(ua) ?? /Firefox\/([\d.]+)/.exec(ua) ?? /Version\/([\d.]+).*Safari/.exec(ua);
  const name = ua.includes("Edg/") ? "Edge" : ua.includes("Chrome/") ? "Chrome" : ua.includes("Firefox/") ? "Firefox" : ua.includes("Safari/") ? "Safari" : "—";
  return m ? `${name} ${m[1].split(".")[0]}` : name;
}
