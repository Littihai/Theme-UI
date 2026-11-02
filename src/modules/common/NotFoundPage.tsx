import { useNavigate } from "react-router-dom";
import { useI18n } from "@/app/providers/I18nProvider";
import { ErrorState, backAction, type ErrorAction } from "@/components/ui/ErrorState";

/** Friendly 404 for unknown routes. */
export function NotFoundPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ErrorState
        icon="telescope"
        code={404}
        headingLevel={1}
        title={t("error.404.title")}
        description={t("error.404.desc")}
        actions={[{ label: t("error.home"), onClick: () => nav("/"), primary: true }, backAction(t("error.back"))].filter((a): a is ErrorAction => !!a)}
      />
    </div>
  );
}
