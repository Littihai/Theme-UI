import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";
import { Header } from "./Header";
import { SideNav } from "./SideNav";
import { useHotkeys } from "@/hooks/useHotkeys";
import { useUi } from "@/app/providers/UiProvider";
import { useAppearance } from "@/app/providers/AppearanceProvider";
import { CommandPalette } from "@/overlays/CommandPalette";
import { ApiStatusBar } from "@/layouts/ApiStatusBar";
import { useRowKeys } from "@/hooks/useRowKeys";
import { NotificationsPanel } from "@/overlays/NotificationsPanel";
import { AccountMenu } from "@/overlays/AccountMenu";
import { CustomizePanel } from "@/overlays/CustomizePanel";
import { AppFooter } from "@/components/ui/AppFooter";
import { useEffect } from "react";
import { useI18n } from "@/app/providers/I18nProvider";
import { seedDemoNotifications } from "@/lib/notifications";

/**
 * Authenticated application frame: top bar + navigation + routed content + overlays.
 * The menu is a bar under the top bar (default) or a sidebar / icon rail (Customize > Navigation); a phone always gets the
 * top bar with a menu panel, whatever was chosen.
 */
export function AppShell() {
  useRowKeys();
  const { tight, mobile } = useUi();
  const { nav: navLayout } = useAppearance();
  useHotkeys(true);
  const side = !mobile && navLayout !== "top";

  // the starter's sample notifications, so the bell has something to show; a real app feeds the store from its API
  const { lang } = useI18n();
  useEffect(() => { seedDemoNotifications(lang); }, [lang]);

  const content = (
    <>
      <main
        style={{
          flex: 1,
          padding: tight ? "20px 16px 48px" : "28px var(--page-pad) 60px",
          width: "100%",
          maxWidth: "var(--page-max)",
          margin: "0 auto",
        }}
      >
        <Outlet />
        <ApiStatusBar />
      </main>
      <AppFooter signedIn />
    </>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "var(--vh100)",
        fontFamily: "var(--font-body)",
        color: "var(--color-text)",
        background: "var(--color-bg)",
      }}
    >
      {side ? (
        <div className="app-frame">
          <SideNav rail={navLayout === "rail"} />
          <div className="app-col">
            <Header slim />
            {content}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div className="app-top">
            <Header />
            <NavBar />
          </div>
          {content}
        </div>
      )}

      <CommandPalette />
      <NotificationsPanel />
      <AccountMenu />
      <CustomizePanel />
    </div>
  );
}
