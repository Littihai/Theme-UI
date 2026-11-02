import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/app/providers/I18nProvider";
import { usePermissions } from "@/app/providers/PermissionProvider";
import { useUi } from "@/app/providers/UiProvider";
import {
  SETTINGS_GROUPS,
  SETTINGS_SECTIONS,
  visibleSettingsSections,
  type SettingsLocationState,
  type SettingsSectionDef,
  type SettingsSectionId,
} from "./settingsNav";
import { GeneralSection } from "./GeneralSection";
import { AccountSection } from "./AccountSection";
import { AboutSection } from "./AboutSection";
import { NoAccess } from "./settingsUi";
import { useEscapeLayer } from "@/hooks/useEscapeLayer";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/constants/icons";
import { lockPageScroll } from "@/lib/scrollLock";

/**
 * The Settings window: a large overlay with a grouped left nav and one section on the right. It is route-driven —
 * rendered by AppRoutes whenever the URL is /settings/<section> — so the section survives a refresh and can be
 * deep-linked. See settingsNav.ts for the routing pattern.
 *
 * On a phone: /settings is a full-screen list of sections, and a section opens as its own screen with a back button.
 */
export function SettingsModal() {
  const location = useLocation();
  const nav = useNavigate();
  const { t } = useI18n();
  const { can } = usePermissions();
  const { tight, mobile, closeAll, setNavOpen } = useUi();
  // the phone layout (phones and touch tablets, even a wide landscape one) and narrow
  // windows use the whole screen, stacked top to bottom
  const fullScreen = tight || mobile;
  const dialogRef = useRef<HTMLDivElement>(null);

  const state = location.state as SettingsLocationState | null;
  const requested = location.pathname.split("/")[2] as SettingsSectionId | undefined;
  const def = SETTINGS_SECTIONS.find((s) => s.id === requested);
  const visible = visibleSettingsSections(can);
  const allowed = !!def && visible.some((s) => s.id === def.id);

  const close = useCallback(() => {
    // opened over a page → step back to it; cold-loaded → go home
    if (state?.backgroundLocation) nav(-1);
    else nav("/", { replace: true });
  }, [nav, state]);

  const go = (id: SettingsSectionId) => nav(`/settings/${id}`, { replace: true, state });

  // phone: list → section is a real step (the system back gesture returns to the list)
  const openFromList = (id: SettingsSectionId) =>
    nav(`/settings/${id}`, { state: { ...state, fromList: true } satisfies SettingsLocationState });
  const backToList = () => {
    if (state?.fromList) nav(-1);
    else nav("/settings", { replace: true, state });
  };

  // one overlay at a time (the phone nav drawer included); lock the page scroll behind the window
  useEffect(() => {
    closeAll();
    setNavOpen(false);
    const release = lockPageScroll();
    dialogRef.current?.focus();
    return release;
  }, [closeAll, setNavOpen]);

  // Esc closes — unless a dialog opened on top of this window owns it (the escape layer stack), or the user is
  // typing in a field (unsaved edits)
  useEscapeLayer((e) => {
    const el = e.target as HTMLElement | null;
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) return false;
    close();
  });

  // bare /settings is the phone's section list; elsewhere it opens General
  if (!def && !(mobile && !requested)) return <Navigate to="/settings/general" replace state={state} />;

  return (
    <div
      role="presentation"
      style={{
        position: "fixed", inset: 0, zIndex: 55, background: "var(--color-scrim)",
        display: "grid", placeItems: "center", padding: fullScreen ? 0 : 24, animation: "fade .14s ease",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
        style={{
          width: fullScreen ? "100%" : "min(1240px, 100%)",
          height: fullScreen ? "100%" : "min(880px, 100%)",
          background: "var(--color-surface)",
          color: "var(--color-text)",
          borderRadius: fullScreen ? 0 : "calc(var(--radius-xl) * 2)",
          boxShadow: "var(--shadow-lg)",
          border: fullScreen ? 0 : "1px solid var(--color-neutral-200)",
          display: "flex",
          flexDirection: fullScreen ? "column" : "row",
          overflow: "hidden",
          outline: "none",
          position: "relative",
          animation: "pop .16s ease",
        }}
      >
        {mobile ? (
          def ? (
            <MobileSection def={def} allowed={allowed} onBack={backToList} />
          ) : (
            <MobileList sections={visible} onPick={openFromList} onClose={close} />
          )
        ) : def && (
        <>
        <button
          onClick={close}
          aria-label={t("common.close")}
          title={`${t("common.close")} (Esc)`}
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 2, width: 34, height: 34, borderRadius: "var(--radius-md)",
            border: 0, background: "transparent", color: "var(--color-neutral-600)", display: "grid", placeItems: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-neutral-100)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Icon name="x" size={18} />
        </button>

        <SettingsNav sections={visible} current={def.id} onPick={go} tight={tight} />

        <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: tight ? "14px 16px 10px" : "26px 64px 14px 36px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 600, fontFamily: "var(--font-heading)", letterSpacing: ".01em" }}>
              <Icon name={def.icon} size={22} color="var(--color-neutral-600)" /> {t(def.labelKey)}
            </div>
            <div style={{ fontSize: 13, color: "var(--color-neutral-600)", marginTop: 2 }}>{t(def.descKey)}</div>
          </div>
          <div className="scroll-thin" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: tight ? "8px 16px 40px" : "10px 36px 48px" }}>
            {allowed ? <SectionBody key={def.id} id={def.id} /> : <NoAccess text={t("set.denied")} />}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

/** Phone header bar: a button on each side and the title centred between them. */
function MobileBar({ title, left, right }: { title: string; left?: ReactNode; right?: ReactNode }) {
  return (
    <div
      style={{
        display: "grid", gridTemplateColumns: "48px 1fr 48px", alignItems: "center", flex: "none",
        minHeight: 52, padding: "0 4px", borderBottom: "1px solid var(--color-neutral-200)", background: "var(--color-surface)",
      }}
    >
      <span>{left}</span>
      <h2 id="settings-title" style={{ margin: 0, textAlign: "center", fontSize: 16, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {title}
      </h2>
      <span style={{ justifySelf: "end" }}>{right}</span>
    </div>
  );
}

function BarButton({ label, icon, onClick }: { label: string; icon: IconName; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{ width: 44, height: 44, display: "grid", placeItems: "center", border: 0, borderRadius: "var(--radius-lg)", background: "transparent", color: "var(--color-text)" }}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

/** Phone, first screen: the sections as grouped rows. */
function MobileList({ sections, onPick, onClose }: {
  sections: SettingsSectionDef[];
  onPick: (id: SettingsSectionId) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <>
      <MobileBar title={t("set.title")} right={<BarButton label={t("common.close")} icon="x" onClick={onClose} />} />
      <nav aria-label={t("set.title")} className="scroll-thin" style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "var(--color-neutral-50)", padding: "12px 16px 40px" }}>
        {/* on a tablet the rows would stretch edge to edge — keep them phone-width */}
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {SETTINGS_GROUPS.map((g) => {
          const items = sections.filter((s) => s.group === g.id);
          if (items.length === 0) return null;
          return (
            <section key={g.id} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-neutral-500)", padding: "0 4px 6px" }}>{t(g.labelKey)}</div>
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                {items.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => onPick(s.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 50, padding: "0 14px",
                      border: 0, borderTop: i === 0 ? 0 : "1px solid var(--color-neutral-200)", background: "transparent",
                      textAlign: "left", color: "var(--color-text)", fontSize: 15,
                    }}
                  >
                    <Icon name={s.icon} size={18} color="var(--color-neutral-600)" />
                    <span style={{ flex: 1, minWidth: 0 }}>{t(s.labelKey)}</span>
                    <Icon name="chevronRight" color="var(--color-neutral-400)" />
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        </div>
      </nav>
    </>
  );
}

/** Phone, second screen: one section with a back button to the list. */
function MobileSection({ def, allowed, onBack }: { def: SettingsSectionDef; allowed: boolean; onBack: () => void }) {
  const { t } = useI18n();
  return (
    <>
      <MobileBar title={t(def.labelKey)} left={<BarButton label={t("common.back")} icon="chevronLeft" onClick={onBack} />} />
      <div className="scroll-thin" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "12px 16px 40px" }}>
        <div style={{ fontSize: 13, color: "var(--color-neutral-600)", marginBottom: 8 }}>{t(def.descKey)}</div>
        {allowed ? <SectionBody key={def.id} id={def.id} /> : <NoAccess text={t("set.denied")} />}
      </div>
    </>
  );
}

function SettingsNav({ sections, current, onPick, tight }: {
  sections: SettingsSectionDef[];
  current: SettingsSectionId;
  onPick: (id: SettingsSectionId) => void;
  tight: boolean;
}) {
  const { t } = useI18n();

  const item = (s: SettingsSectionDef) => {
    const on = s.id === current;
    return (
      <button
        key={s.id}
        onClick={() => onPick(s.id)}
        aria-current={on ? "page" : undefined}
        style={{
          display: "flex", alignItems: "center", gap: 10, width: tight ? "auto" : "100%", flex: "none",
          textAlign: "left", border: 0, borderRadius: "var(--radius-md)", padding: tight ? "7px 12px" : "8px 11px",
          fontSize: 13.5, fontWeight: on ? 600 : 400, whiteSpace: "nowrap",
          background: on ? "var(--color-neutral-100)" : "transparent",
          color: on ? "var(--color-text)" : "var(--color-neutral-700)",
        }}
      >
        <Icon name={s.icon} color={on ? "var(--color-text)" : "var(--color-neutral-500)"} />
        {t(s.labelKey)}
      </button>
    );
  };

  if (tight) {
    return (
      <nav aria-label={t("set.title")} style={{ borderBottom: "1px solid var(--color-neutral-200)", padding: "14px 56px 10px 12px" }}>
        <div id="settings-title" style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, padding: "0 4px 8px" }}>{t("set.title")}</div>
        <div className="scroll-thin" style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
          {sections.map(item)}
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label={t("set.title")}
      className="scroll-thin"
      style={{
        width: 256, flex: "none", overflowY: "auto", padding: "24px 14px",
        borderRight: "1px solid var(--color-neutral-200)", background: "var(--color-neutral-50)",
        display: "flex", flexDirection: "column", gap: 18,
      }}
    >
      <div id="settings-title" style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 600, padding: "0 10px" }}>{t("set.title")}</div>
      {SETTINGS_GROUPS.map((g) => {
        const items = sections.filter((s) => s.group === g.id);
        if (items.length === 0) return null;
        return (
          <div key={g.id} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div className="eyebrow" style={{ fontWeight: 700, color: "var(--color-neutral-500)", padding: "0 11px 5px" }}>
              {t(g.labelKey)}
            </div>
            {items.map(item)}
          </div>
        );
      })}
    </nav>
  );
}

/** One section's content. Keyed by id so each section starts with fresh state. */
function SectionBody({ id }: { id: SettingsSectionId }) {
  switch (id) {
    case "general": return <GeneralSection />;
    case "account": return <AccountSection />;
    case "about": return <AboutSection />;
  }
}
