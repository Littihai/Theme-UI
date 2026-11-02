import { useI18n, type Lang } from "@/app/providers/I18nProvider";
import { useFontSize } from "@/app/providers/FontSizeProvider";
import { useAppearance } from "@/app/providers/AppearanceProvider";
import type { Contrast, Motion } from "@/lib/appearance";
import type { FontSize } from "@/lib/fontSize";
import { Button } from "@/components/ui/Button";
import { Segmented, SettingRow, SettingsBlock } from "./settingsUi";
import { AppearanceControls } from "./AppearanceControls";

/** General: every look-and-layout choice, contrast and motion, text size, language, and the keyboard shortcuts. */
export function GeneralSection() {
  const { t, lang, setLang } = useI18n();
  const { size, setSize } = useFontSize();
  const ap = useAppearance();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <AppearanceControls />

      <SettingsBlock title={t("set.contrast")} desc={t("set.contrastDesc")}>
        <SettingRow first label={t("set.contrast")}>
          <Segmented<Contrast>
            ariaLabel={t("set.contrast")}
            value={ap.contrast}
            onChange={ap.setContrast}
            options={[{ value: "standard", label: t("set.contrast.standard") }, { value: "high", label: t("set.contrast.high") }]}
          />
        </SettingRow>
      </SettingsBlock>

      <SettingsBlock title={t("set.motion")} desc={t("set.motionDesc")}>
        <SettingRow first label={t("set.motion")}>
          <Segmented<Motion>
            ariaLabel={t("set.motion")}
            value={ap.motion}
            onChange={ap.setMotion}
            options={[
              { value: "auto", label: t("set.motion.auto") },
              { value: "reduce", label: t("set.motion.reduce") },
              { value: "full", label: t("set.motion.full") },
            ]}
          />
        </SettingRow>
        <SettingRow label={t("set.appearanceReset")} desc={t("set.appearanceResetHint")}>
          <Button variant="secondary" onClick={ap.reset} disabled={!ap.changed}>{t("set.appearanceReset")}</Button>
        </SettingRow>
      </SettingsBlock>

      <SettingsBlock title={t("set.fontSize")} desc={t("set.fontSizeDesc")}>
        <SettingRow first label={t("set.fontSizeLabel")}>
          <Segmented<FontSize>
            ariaLabel={t("set.fontSize")}
            value={size}
            onChange={setSize}
            options={[
              { value: "s", label: <span title={t("set.fontSizeS")}>S</span> },
              { value: "m", label: <span title={t("set.fontSizeM")}>M</span> },
              { value: "l", label: <span title={t("set.fontSizeL")}>L</span> },
            ]}
          />
        </SettingRow>
        <div style={{ padding: "10px 2px 0", fontSize: 14, color: "var(--color-neutral-700)" }}>{t("set.fontSizeSample")}</div>
      </SettingsBlock>

      <SettingsBlock title={t("set.language")}>
        <SettingRow first label={t("set.languageLabel")} desc={t("set.languageDesc")}>
          <Segmented<Lang>
            ariaLabel={t("set.language")}
            value={lang}
            onChange={setLang}
            options={[{ value: "th", label: "ไทย" }, { value: "en", label: "English" }]}
          />
        </SettingRow>
      </SettingsBlock>

      <SettingsBlock title={t("set.shortcuts")} desc={t("set.shortcutsDesc")}>
        <SettingRow first label={t("set.sc.search")}><Kbd keys={["Ctrl", "K"]} /></SettingRow>
        <SettingRow label={t("set.sc.settings")}><Kbd keys={["Ctrl", ","]} /></SettingRow>
        <SettingRow label={t("set.sc.close")}><Kbd keys={["Esc"]} /></SettingRow>
      </SettingsBlock>
    </div>
  );
}

export function Kbd({ keys }: { keys: string[] }) {
  return (
    <span style={{ display: "inline-flex", gap: 4 }}>
      {keys.map((k) => (
        <kbd key={k} style={{
          fontFamily: "var(--font-heading)", fontSize: 12, padding: "2px 8px", borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-neutral-300)", borderBottomWidth: 2, background: "var(--color-neutral-100)", color: "var(--color-neutral-700)",
        }}>{k}</kbd>
      ))}
    </span>
  );
}
