import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useUi } from "@/app/providers/UiProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { useUnreadCount } from "@/lib/notifications";
import { LangToggle } from "@/components/ui/LangToggle";
import { Icon } from "@/components/ui/Icon";
import { BrandLockup } from "@/components/ui/AppLogo";
import { Avatar } from "@/components/ui/Avatar";
import { MegaMenu } from "./MegaMenu";

/**
 * Top bar: brand on the left; search, theme, customize, notifications, language and the account chip on the right.
 * `slim` (the sidebar layouts): the brand lives in the sidebar, so the bar starts with search instead.
 * The account chip opens the account menu below it. On a phone it leads with the menu button that opens
 * the navigation panel, and search shrinks to an icon.
 */
export function Header({ slim = false }: { slim?: boolean }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const { setPaletteOpen, panel, setPanel, mobile, width, navOpen, setNavOpen } = useUi();
  // header-local breakpoints (docs/decisions/0039): the row sheds weight earlier than the shared `tight` (900) —
  // first the search label, then the chip's text
  const iconSearch = width < 1010;
  const compactChip = width < 910;
  const { resolved, setPref } = useTheme();
  const nav = useNavigate();
  const unread = useUnreadCount();

  if (!user) return null;

  const dark = resolved === "dark";

  return (
    <header className="app-header">
      {/* full window width: page content keeps --page-max */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: mobile ? 4 : 10,
          padding: mobile ? "0 10px" : "0 var(--page-pad)",
          minHeight: 56,
        }}
      >
        {mobile && (
          <button
            onClick={() => setNavOpen(!navOpen)}
            aria-label={navOpen ? t("nav.closeMenu") : t("nav.menu")}
            aria-controls="app-nav"
            aria-expanded={navOpen}
            title={navOpen ? t("nav.closeMenu") : t("nav.menu")}
            className="btn-icon"
          >
            <Icon name={navOpen ? "x" : "threeBars"} size={20} />
          </button>
        )}

        {(!slim || mobile) && <BrandLockup onClick={() => nav("/")} />}

        {/* docs/decisions/0038: the navigation lives in this one row — Home plus the application mega menu */}
        {!slim && !mobile && <MegaMenu />}

        {!slim && <div style={{ flex: 1 }} />}

        {/* with Home, the direct links and the mega menu sharing this row, the labelled search no longer
            fits below ~1010px — it shrinks to the same icon the phone uses */}
        {!mobile && !iconSearch && (
          <button
            onClick={() => setPaletteOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--color-surface)",
              border: "1px solid var(--color-neutral-300)",
              borderRadius: "var(--radius-md)",
              padding: "6px 12px",
              color: "var(--color-neutral-700)",
              fontSize: 13.5,
              fontWeight: 500,
              marginRight: 6,
            }}
          >
            <Icon name="search" size={15} />
            <span>{t("header.search")}</span>
            <span
              style={{
                fontSize: 11,
                border: "1px solid var(--color-neutral-300)",
                borderRadius: 3,
                padding: "0 5px",
                color: "var(--color-neutral-600)",
              }}
            >
              Ctrl K
            </span>
          </button>
        )}

        {slim && !mobile && <div style={{ flex: 1 }} />}

        {(mobile || iconSearch) && (
          <button onClick={() => setPaletteOpen(true)} aria-label={t("header.searchAll")} title={t("header.searchAll")} className="btn-icon">
            <Icon name="search" size={18} />
          </button>
        )}

        <button
          onClick={() => setPref(dark ? "light" : "dark")}
          aria-label={t(dark ? "header.themeLight" : "header.themeDark")}
          title={t(dark ? "header.themeLight" : "header.themeDark")}
          className="btn-icon"
        >
          <Icon name={dark ? "sun" : "moon"} size={18} />
        </button>

        {!mobile && (
          <button
            id="hdr-customize"
            onClick={() => setPanel(panel === "customize" ? null : "customize")}
            aria-label={t("cz.title")}
            aria-expanded={panel === "customize"}
            aria-controls="cz-panel"
            title={t("cz.title")}
            className="btn-icon"
          >
            <Icon name="paintbrush" size={18} />
          </button>
        )}

        <button
          id="hdr-bell"
          onClick={() => setPanel(panel === "notif" ? null : "notif")}
          aria-label={unread > 0 ? `${t("notif.title")} (${unread})` : t("notif.title")}
          aria-expanded={panel === "notif"}
          title={t("notif.title")}
          className="btn-icon"
          style={{ position: "relative", ...(panel === "notif" ? { background: "var(--color-neutral-100)" } : {}) }}
        >
          <Icon name="bell" size={18} />
          {unread > 0 && (
            <span
              style={{
                position: "absolute",
                top: 1,
                right: 0,
                minWidth: 16,
                height: 16,
                padding: "0 4px",
                borderRadius: 999,
                background: "var(--tone-stop-solid)",
                border: "2px solid var(--color-surface)",
                color: "var(--tone-on-solid)",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        {!mobile && <LangToggle />}

        <button
          id="hdr-account"
          onClick={() => setPanel(panel === "profile" ? null : "profile")}
          aria-haspopup="menu"
          aria-expanded={panel === "profile"}
          title={mobile || compactChip ? user.name : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: 0,
            borderRadius: "var(--radius-lg)",
            padding: mobile || compactChip ? 2 : "4px 8px",
            marginLeft: 4,
            background: panel === "profile" ? "var(--color-neutral-100)" : "transparent",
            color: "var(--color-text)",
            textAlign: "left",
          }}
        >
          <Avatar initials={user.initials} size={32} />
          {!mobile && !compactChip && (
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, maxWidth: 170 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</span>
              <span style={{ fontSize: 12, color: "var(--color-neutral-600)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.role || user.dept}
              </span>
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
