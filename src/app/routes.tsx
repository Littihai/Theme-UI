import { useEffect, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation, type Location } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { usePermissions } from "@/app/providers/PermissionProvider";
import { finishBoot } from "@/lib/boot";
import { safeReturnPath } from "@/lib/returnPath";
import { AppShell } from "@/layouts/AppShell";
import { LoginPage } from "@/modules/auth/LoginPage";
import { NotFoundPage } from "@/modules/common/NotFoundPage";
import { ForbiddenPage } from "@/modules/common/ForbiddenPage";
import { HomePage } from "@/modules/home/HomePage";
import { ComponentsPage } from "@/modules/showcase/ComponentsPage";
import { TablesPage } from "@/modules/showcase/TablesPage";
import { ChartsPage } from "@/modules/showcase/ChartsPage";
import { DocumentPage } from "@/modules/showcase/DocumentPage";
import { ManualDemoPage } from "@/modules/showcase/ManualDemoPage";
import { AdminDemoPage } from "@/modules/showcase/AdminDemoPage";
import { SettingsModal } from "@/modules/settings/SettingsModal";
import { isSettingsPath, RealLocationContext, type SettingsLocationState } from "@/modules/settings/settingsNav";

/** Requires a session; remembers where the visitor was headed so signing in lands them there. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: { pathname: location.pathname, search: location.search, hash: location.hash } }} />;
  return <>{children}</>;
}

/** Requires a permission code on top of the session; a person without it gets the 403 page, not a blank screen. */
function RequireCan({ code, children }: { code: string; children: ReactNode }) {
  const { can } = usePermissions();
  return can(code) ? <>{children}</> : <ForbiddenPage />;
}

/** /login: the form for a visitor, or — once signed in — straight to where they were headed. */
function LoginRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (isAuthenticated) return <Navigate to={safeReturnPath((location.state as { from?: unknown } | null)?.from)} replace />;
  return <LoginPage />;
}

/** Where the page behind the Settings window should come from (see settingsNav.ts). */
function pageLocation(location: Location): Location {
  if (!isSettingsPath(location.pathname)) return location;
  const bg = (location.state as SettingsLocationState | null)?.backgroundLocation;
  return bg ?? { ...location, pathname: "/", search: "", hash: "", state: null };
}

/**
 * The routes. Pages of the signed-in app sit under <AppShell>; a new module adds its routes there (and its entry in
 * constants/nav.ts). The Settings window floats over whatever page is behind it (the background-location pattern).
 */
export function AppRoutes() {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();
  const inSettings = isSettingsPath(location.pathname);

  // the loading screen (index.html) stays up until the saved session has been checked
  useEffect(() => { if (!booting) finishBoot(); }, [booting]);
  if (booting) return null;

  return (
    <RealLocationContext.Provider value={location}>
      <Routes location={pageLocation(location)}>
        <Route path="/login" element={<LoginRoute />} />
        <Route element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/components" element={<ComponentsPage />} />
          <Route path="/components/:tab" element={<ComponentsPage />} />
          <Route path="/tables" element={<TablesPage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/document" element={<DocumentPage />} />
          <Route path="/manual" element={<ManualDemoPage />} />
          <Route path="/admin" element={<RequireCan code="ADMIN.PANEL.VIEW"><AdminDemoPage /></RequireCan>} />
          {/* unknown path while signed in → friendly 404 inside the app shell */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {inSettings && isAuthenticated && <SettingsModal />}
    </RealLocationContext.Provider>
  );
}
