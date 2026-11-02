import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/app/providers/I18nProvider";
import { clickOrigin, useTheme } from "@/app/providers/ThemeProvider";
import { AppFooter } from "@/components/ui/AppFooter";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LangToggle } from "@/components/ui/LangToggle";
import { BrandLockup } from "@/components/ui/AppLogo";

/**
 * The frame of a page a visitor can open before signing in (a landing page, a contact page): a slim top bar with the
 * brand, the language, the theme and the sign-in button, the page itself, and the footer. The page supplies its own <main>.
 * `nav` is a slot for in-page links beside the brand; `className` goes on the frame and `headerClassName` on the bar.
 */
export function PublicFrame({ children, maxWidth = 1180, nav: links, className, headerClassName }: {
  children: ReactNode;
  maxWidth?: number;
  nav?: ReactNode;
  className?: string;
  headerClassName?: string;
}) {
  const { t } = useI18n();
  const { resolved, setPref } = useTheme();
  const nav = useNavigate();
  const dark = resolved === "dark";

  return (
    <div className={className} style={{ minHeight: "var(--vh100)", display: "flex", flexDirection: "column", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
      <header className={headerClassName ? `app-header ${headerClassName}` : "app-header"}>
        <div style={{ maxWidth, margin: "0 auto", padding: "0 var(--page-pad)", minHeight: 56, display: "flex", alignItems: "center", gap: 10 }}>
          <BrandLockup onClick={() => nav("/")} />
          {links}
          <div style={{ flex: 1 }} />
          <LangToggle />
          <button
            onClick={(e) => setPref(dark ? "light" : "dark", clickOrigin(e))}
            aria-label={t(dark ? "header.themeLight" : "header.themeDark")}
            title={t(dark ? "header.themeLight" : "header.themeDark")}
            className="btn-icon"
          >
            <Icon name={dark ? "sun" : "moon"} size={18} />
          </button>
          <Button onClick={() => nav("/login")}>{t("login.signIn")}</Button>
        </div>
      </header>
      {children}
      <AppFooter signedIn={false} maxWidth={maxWidth} />
    </div>
  );
}
