import { Link } from "react-router-dom";
import { useI18n } from "@/app/providers/I18nProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { useOpenSettings } from "@/modules/settings/settingsNav";
import { BRAND } from "@/constants/brand";
import { NAV_DIRECT, NAV_GROUPS } from "@/constants/nav";
import { CONTACT_GITHUB, CONTACT_GITHUB_LABEL, SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_TEL, supportMailto } from "@/lib/support";
import { Icon } from "./Icon";
import { AppLogo } from "./AppLogo";
import type { IconName } from "@/constants/icons";

/**
 * The foot of every page, in the app and on the public pages: the brand and what the system is, two short link lists,
 * how to reach support, and the small print. The same component both places; `signedIn` only changes which links make
 * sense (a visitor is offered the sign-in, a signed-in person the pages and the About section of Settings).
 * It follows the page width choice (--page-max) unless a fixed `maxWidth` is given (the public pages are a fixed width).
 */
export function AppFooter({ signedIn, maxWidth }: { signedIn: boolean; maxWidth?: number | string }) {
  const { t, pick } = useI18n();
  const { user } = useAuth();
  const openSettings = useOpenSettings();

  const contact: { icon: IconName; label: string; node: React.ReactNode }[] = [
    {
      icon: "mail", label: t("ft.email"),
      node: <a className="ft-link" href={supportMailto({ subject: t("support.subject"), who: user?.username })}>{SUPPORT_EMAIL}</a>,
    },
    { icon: "clock", label: t("ft.hours"), node: <span>{t("ft.hours.value")}</span> },
    { icon: "commentDiscussion", label: t("ft.phone"), node: <a className="ft-link" href={SUPPORT_PHONE_TEL}>{SUPPORT_PHONE}</a> },
    ...(CONTACT_GITHUB ? [{
      icon: "github" as const, label: "GitHub",
      node: <a className="ft-link" href={CONTACT_GITHUB} target="_blank" rel="noopener noreferrer">{CONTACT_GITHUB_LABEL}</a>,
    }] : []),
  ];

  // the first few pages of the menu, so the footer never disagrees with the navigation
  const pages = [...NAV_DIRECT, ...NAV_GROUPS.flatMap((g) => g.entries)].filter((e, i, all) => all.findIndex((x) => x.id === e.id) === i).slice(0, 4);

  return (
    <footer className="app-footer">
      <div className="ft-inner" style={maxWidth ? { maxWidth } : undefined}>
        <div className="ft-grid">
          <div className="ft-brand">
            <Link to="/" className="ft-logo" aria-label={BRAND.name}>
              <AppLogo size={28} tile />
              <span>{BRAND.word}</span>
            </Link>
            <p>{pick(BRAND.tagline)}</p>
          </div>

          <nav aria-label={t("ft.platform")}>
            <h2 className="ft-title">{t("ft.platform")}</h2>
            <ul className="ft-list">
              {signedIn ? (
                <>
                  <li><Link className="ft-link" to="/">{t("nav.home")}</Link></li>
                  {pages.map((p) => <li key={p.id}><Link className="ft-link" to={p.path}>{t(p.labelKey)}</Link></li>)}
                </>
              ) : (
                <>
                  <li><Link className="ft-link" to="/">{t("nav.home")}</Link></li>
                  <li><Link className="ft-link" to="/login">{t("login.signIn")}</Link></li>
                </>
              )}
            </ul>
          </nav>

          <nav aria-label={t("ft.help")}>
            <h2 className="ft-title">{t("ft.help")}</h2>
            <ul className="ft-list">
              {signedIn && <li><Link className="ft-link" to="/manual">{t("nav.manual")}</Link></li>}
              {signedIn && <li><button className="ft-link" onClick={() => openSettings("about")}>{t("ft.about")}</button></li>}
              <li><a className="ft-link" href={supportMailto({ subject: t("support.subject"), who: user?.username })}>{t("ft.contactUs")}</a></li>
            </ul>
          </nav>

          <div>
            <h2 className="ft-title">{t("ft.contactUs")}</h2>
            <ul className="ft-list ft-contact">
              {contact.map((c) => (
                <li key={c.label}>
                  <Icon name={c.icon} size={15} className="ft-ico" />
                  <span className="sr-only">{c.label}: </span>
                  {c.node}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ft-bottom">
          <span>© {new Date().getFullYear()} {BRAND.company} · {t("footer.rights")}</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>v{__APP_VERSION__}</span>
        </div>
      </div>
    </footer>
  );
}
