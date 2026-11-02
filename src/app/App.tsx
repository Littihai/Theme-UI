import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { FontSizeProvider } from "@/app/providers/FontSizeProvider";
import { AppearanceProvider } from "@/app/providers/AppearanceProvider";
import { I18nProvider } from "@/app/providers/I18nProvider";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { PermissionProvider } from "@/app/providers/PermissionProvider";
import { UiProvider } from "@/app/providers/UiProvider";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { AppRoutes } from "@/app/routes";
import { ConfirmHost } from "@/overlays/ConfirmDialog";
import { ToastHost } from "@/overlays/Toast";

// Vite injects the deploy base ("/" in dev, "/myapp/" when hosted under a path); Router wants no trailing slash.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

/**
 * Root: the platform providers, outermost first — look (theme, text size, customize), words (i18n), who (auth,
 * permissions), then the shell's own state (UiProvider) — around the router and the two global hosts (confirm
 * dialog, toasts). A module never adds a provider here; it keeps its state in its own pages.
 */
export function App() {
  return (
    <BrowserRouter basename={basename}>
      <ThemeProvider>
      <FontSizeProvider>
      <AppearanceProvider>
      <I18nProvider>
        <AuthProvider>
          <PermissionProvider>
            <UiProvider>
              <ErrorBoundary>
                <AppRoutes />
                <ConfirmHost />
                <ToastHost />
              </ErrorBoundary>
            </UiProvider>
          </PermissionProvider>
        </AuthProvider>
      </I18nProvider>
      </AppearanceProvider>
      </FontSizeProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
