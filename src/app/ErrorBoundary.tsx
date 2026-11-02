import { Component, type ReactNode } from "react";
import { useI18n } from "@/app/providers/I18nProvider";
import { ErrorState } from "@/components/ui/ErrorState";

/** Functional fallback so we can use i18n inside the class boundary. */
function CrashFallback({ reference }: { reference: string }) {
  const { t } = useI18n();
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ErrorState
        icon="bug"
        code="crash"
        title={t("error.crash.title")}
        description={t("error.crash.desc")}
        reference={reference}
        actions={[
          { label: t("error.reload"), icon: "sync", onClick: () => window.location.reload(), primary: true },
          { label: t("error.home"), onClick: () => { window.location.href = import.meta.env.BASE_URL || "/"; } },
        ]}
      />
    </div>
  );
}

/** Catches render/runtime crashes anywhere below and shows a friendly page
 *  instead of a blank white screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null; reference: string }> {
  state = { error: null as Error | null, reference: "" };

  static getDerivedStateFromError(error: Error) {
    // the page shows only this reference (never the exception); the console pairs it with the error for support
    return { error, reference: `UI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}` };
  }

  componentDidCatch(error: Error) {
    // surface for debugging; a real telemetry sink can hook in here later
    console.error(`Unhandled UI error [${this.state.reference}]:`, error);
  }

  render() {
    if (this.state.error) return <CrashFallback reference={this.state.reference} />;
    return this.props.children;
  }
}
