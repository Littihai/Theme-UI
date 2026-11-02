import { useEffect, type ReactNode } from "react";
import { useI18n } from "@/app/providers/I18nProvider";
import { useTheme, type ThemePref } from "@/app/providers/ThemeProvider";
import { useAppearance } from "@/app/providers/AppearanceProvider";
import {
  ACCENTS, CHOICES, RADIUS_PREVIEW,
  type Accent, type Container, type Edges, type FontFamily, type GreyBase, type NavLayout, type Radius, type Sticky,
} from "@/lib/appearance";
import { FONT_SAMPLE_STACK, loadAllFonts } from "@/lib/fonts";
import { Icon } from "@/components/ui/Icon";
import { Segmented, SettingsBlock } from "./settingsUi";
import { BRAND } from "@/constants/brand";

/**
 * Every Customize choice, drawn once and used twice: in the Customize panel (opened from the brush in the top bar) and at the
 * top of Settings > General. A choice applies the moment it is picked and is remembered on this device (lib/appearance.ts).
 * The two groups follow the order people expect from a theme builder: how it looks, then how it is laid out.
 */

/** A row of radio cards: a small picture above a label. */
export function OptionCards<T extends string>({ value, options, onChange, ariaLabel, min = 104 }: {
  value: T;
  options: { value: T; label: ReactNode; preview: ReactNode }[];
  onChange: (v: T) => void;
  ariaLabel: string;
  min?: number;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 12, paddingTop: 8 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} role="radio" aria-checked={on} onClick={() => onChange(o.value)} className="opt-card">
            <span className="opt-preview">{o.preview}</span>
            <span className="opt-label">{on && <Icon name="check" size={13} color="var(--color-accent)" />}{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** A tiny app window drawn with the target palette's own tokens (the grey base is applied on the tile itself). */
export function ThemePreview({ scope, half, base }: { scope: "theme-light" | "theme-dark"; half?: "left" | "right"; base?: GreyBase }) {
  return (
    <span
      className={scope}
      data-base={base && base !== CHOICES.base.default ? base : undefined}
      aria-hidden
      style={{
        flex: 1, height: "100%", display: "flex", background: "var(--color-bg)",
        borderLeft: half === "right" ? "1px solid var(--color-neutral-300)" : undefined,
      }}
    >
      <span style={{ width: half ? "30%" : "26%", background: "var(--color-surface)", borderRight: "1px solid var(--color-neutral-200)", padding: 7, display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ height: 5, borderRadius: 3, background: "var(--color-accent)" }} />
        <span style={{ height: 4, borderRadius: 3, background: "var(--color-neutral-300)" }} />
        <span style={{ height: 4, borderRadius: 3, background: "var(--color-neutral-300)" }} />
      </span>
      <span style={{ flex: 1, padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ height: 6, width: "55%", borderRadius: 3, background: "var(--color-text)", opacity: 0.8 }} />
        <span style={{ flex: 1, borderRadius: "var(--radius-md)", background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)" }} />
      </span>
    </span>
  );
}

/** The three menu layouts as wireframes. */
function NavPreview({ kind }: { kind: NavLayout }) {
  const line = { height: 4, borderRadius: 3, background: "var(--color-neutral-300)" } as const;
  const strip = { background: "var(--color-surface)", borderBottom: "1px solid var(--color-neutral-200)" } as const;
  const card = <span style={{ flex: 1, borderRadius: "var(--radius-md)", background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)" }} />;
  if (kind === "top") {
    return (
      <span aria-hidden style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--color-bg)" }}>
        <span style={{ ...strip, height: 11, padding: "3px 7px", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 7, height: 5, borderRadius: 2, background: "var(--color-accent)" }} />
        </span>
        <span style={{ ...strip, height: 10, padding: "3px 7px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ ...line, width: 16, background: "var(--color-text)", opacity: 0.7 }} /><span style={{ ...line, width: 16 }} /><span style={{ ...line, width: 16 }} />
        </span>
        <span style={{ flex: 1, padding: 7, display: "flex" }}>{card}</span>
      </span>
    );
  }
  const wide = kind === "side";
  return (
    <span aria-hidden style={{ display: "flex", height: "100%", background: "var(--color-bg)" }}>
      <span style={{ width: wide ? "30%" : "13%", background: "var(--color-surface)", borderRight: "1px solid var(--color-neutral-200)", padding: "7px 6px", display: "flex", flexDirection: "column", gap: 6, alignItems: wide ? "stretch" : "center" }}>
        <span style={{ height: 5, width: wide ? "60%" : 8, borderRadius: 2, background: "var(--color-accent)" }} />
        {[0, 1, 2].map((i) => <span key={i} style={wide ? { ...line, opacity: i === 0 ? 1 : 0.8 } : { height: 5, width: 5, borderRadius: 2, background: "var(--color-neutral-300)" }} />)}
      </span>
      <span style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <span style={{ ...strip, height: 11 }} />
        <span style={{ flex: 1, padding: 7, display: "flex" }}>{card}</span>
      </span>
    </span>
  );
}

function FontSample({ id }: { id: FontFamily }) {
  return (
    <span aria-hidden style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, height: "100%", background: "var(--color-surface)", fontFamily: FONT_SAMPLE_STACK[id] }}>
      <span style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}>Aa กข</span>
      <span style={{ fontSize: 11, color: "var(--color-neutral-600)" }}>{BRAND.name} 0123</span>
    </span>
  );
}

function RadiusSample({ id }: { id: Radius }) {
  return (
    <span aria-hidden style={{ display: "grid", placeItems: "center", height: "100%", background: "var(--color-neutral-50)" }}>
      <span style={{ width: 38, height: 38, borderTop: "3px solid var(--color-accent)", borderLeft: "3px solid var(--color-accent)", borderTopLeftRadius: Math.round(RADIUS_PREVIEW[id] * 1.6), background: "var(--color-surface)" }} />
    </span>
  );
}

/** A group heading inside the panel / the page: a quiet label that separates "looks" from "layout". */
function Group({ title }: { title: string }) {
  return <div className="eyebrow" style={{ fontWeight: 700, color: "var(--color-neutral-500)", paddingBottom: 2, borderBottom: "1px solid var(--color-neutral-200)" }}>{title}</div>;
}

export function AppearanceControls({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const { pref, setPref, resolved } = useTheme();
  const ap = useAppearance();
  const min = compact ? 96 : 130;
  const fontMin = compact ? 150 : 150;

  // the font cards show each typeface in its own face, so their files are needed while this is on screen
  useEffect(() => { void loadAllFonts(); }, []);

  const schemes: { v: ThemePref; label: string }[] = [
    { v: "light", label: t("set.theme.light") },
    { v: "dark", label: t("set.theme.dark") },
    { v: "system", label: t("set.theme.system") },
  ];
  const scope = resolved === "dark" ? "theme-dark" : "theme-light";
  const seg = <T extends string>(key: string, value: T, onChange: (v: T) => void, labels: Record<T, string>, values: readonly T[]) => (
    <Segmented<T> ariaLabel={t(key)} value={value} onChange={onChange} options={values.map((v) => ({ value: v, label: labels[v] }))} />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Group title={t("cz.group.appearance")} />

      <SettingsBlock title={t("cz.scheme")} desc={t("cz.scheme.desc")}>
        <OptionCards<ThemePref>
          ariaLabel={t("cz.scheme")} value={pref} onChange={setPref} min={min}
          options={schemes.map((s) => ({
            value: s.v, label: s.label,
            preview: s.v === "system"
              ? <span style={{ display: "flex", height: "100%" }}><ThemePreview scope="theme-light" half="left" /><ThemePreview scope="theme-dark" half="right" /></span>
              : <ThemePreview scope={s.v === "dark" ? "theme-dark" : "theme-light"} />,
          }))}
        />
      </SettingsBlock>

      <SettingsBlock title={t("set.accent")} desc={t("set.accentDesc")}>
        <div role="radiogroup" aria-label={t("set.accent")} style={{ display: "flex", flexWrap: "wrap", gap: "12px 10px", paddingTop: 8 }}>
          {ACCENTS.map((a) => {
            const on = ap.accent === a.id;
            return (
              <button
                key={a.id} role="radio" aria-checked={on} onClick={() => ap.setAccent(a.id as Accent)} title={t(`set.accent.${a.id}`)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 0, border: 0, background: "transparent", color: "var(--color-text)", width: compact ? 56 : 66 }}
              >
                <span aria-hidden style={{
                  width: 34, height: 34, borderRadius: "50%", background: a.swatch, display: "grid", placeItems: "center", color: "var(--tone-on-solid)",
                  outline: on ? `2px solid ${a.swatch}` : "1px solid var(--color-neutral-300)", outlineOffset: on ? 3 : 0,
                }}>
                  {on && <Icon name="check" size={16} />}
                </span>
                <span style={{ fontSize: 12, fontWeight: on ? 600 : 500, textAlign: "center", lineHeight: 1.25 }}>{t(`set.accent.${a.id}`)}</span>
              </button>
            );
          })}
        </div>
      </SettingsBlock>

      <SettingsBlock title={t("cz.font")} desc={t("cz.font.desc")}>
        <OptionCards<FontFamily>
          ariaLabel={t("cz.font")} value={ap.font} onChange={(v) => ap.set("font", v)} min={fontMin}
          options={CHOICES.font.values.map((v) => ({ value: v, label: t(`cz.font.${v}`), preview: <FontSample id={v} /> }))}
        />
      </SettingsBlock>

      <SettingsBlock title={t("cz.base")} desc={t("cz.base.desc")}>
        <OptionCards<GreyBase>
          ariaLabel={t("cz.base")} value={ap.base} onChange={(v) => ap.set("base", v)} min={compact ? 96 : 110}
          options={CHOICES.base.values.map((v) => ({ value: v, label: t(`cz.base.${v}`), preview: <ThemePreview scope={scope} base={v} /> }))}
        />
      </SettingsBlock>

      <SettingsBlock title={t("cz.radius")} desc={t("cz.radius.desc")}>
        <OptionCards<Radius>
          ariaLabel={t("cz.radius")} value={ap.radius} onChange={(v) => ap.set("radius", v)} min={compact ? 54 : 84}
          options={CHOICES.radius.values.map((v) => ({ value: v, label: t(`cz.radius.${v}`), preview: <RadiusSample id={v} /> }))}
        />
      </SettingsBlock>

      <Group title={t("cz.group.layout")} />

      <SettingsBlock title={t("cz.nav")} desc={t("cz.nav.desc")}>
        <OptionCards<NavLayout>
          ariaLabel={t("cz.nav")} value={ap.nav} onChange={(v) => ap.set("nav", v)} min={min}
          options={CHOICES.nav.values.map((v) => ({ value: v, label: t(`cz.nav.${v}`), preview: <NavPreview kind={v} /> }))}
        />
      </SettingsBlock>

      <SettingsBlock title={t("cz.container")} desc={t("cz.container.desc")}>
        <div style={{ paddingTop: 6 }}>
          {seg<Container>("cz.container", ap.container, (v) => ap.set("container", v),
            { narrow: t("cz.container.narrow"), standard: t("cz.container.standard"), wide: t("cz.container.wide"), fluid: t("cz.container.fluid") }, CHOICES.container.values)}
        </div>
      </SettingsBlock>

      <SettingsBlock title={t("cz.sticky")} desc={t("cz.sticky.desc")}>
        <div style={{ paddingTop: 6 }}>
          {seg<Sticky>("cz.sticky", ap.sticky, (v) => ap.set("sticky", v),
            { header: t("cz.sticky.header"), all: t("cz.sticky.all"), none: t("cz.sticky.none") }, CHOICES.sticky.values)}
        </div>
      </SettingsBlock>

      <SettingsBlock title={t("cz.navStyle")} desc={t("cz.navStyle.desc")}>
        <div style={{ paddingTop: 6 }}>
          {seg<Edges>("cz.navStyle", ap.navStyle, (v) => ap.set("navStyle", v),
            { attached: t("cz.edges.attached"), floating: t("cz.edges.floating") }, CHOICES.navStyle.values)}
        </div>
      </SettingsBlock>

      <SettingsBlock title={t("cz.panelStyle")} desc={t("cz.panelStyle.desc")}>
        <div style={{ paddingTop: 6 }}>
          {seg<Edges>("cz.panelStyle", ap.panelStyle, (v) => ap.set("panelStyle", v),
            { attached: t("cz.edges.attached"), floating: t("cz.edges.floating") }, CHOICES.panelStyle.values)}
        </div>
      </SettingsBlock>
    </div>
  );
}
