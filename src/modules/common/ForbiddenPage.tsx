import { useNavigate } from "react-router-dom";
import { useI18n } from "@/app/providers/I18nProvider";
import { ErrorState, backAction, type ErrorAction } from "@/components/ui/ErrorState";

/** The page a person without the permission sees (routes.tsx RequireCan): what happened, and a way home. */
export function ForbiddenPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ErrorState
        icon="shieldLock"
        code={403}
        headingLevel={1}
        title={t("error.403.title")}
        description={t("error.403.desc")}
        actions={[{ label: t("error.home"), onClick: () => nav("/"), primary: true }, backAction(t("error.back"))].filter((a): a is ErrorAction => !!a)}
      />
    </div>
  );
}
