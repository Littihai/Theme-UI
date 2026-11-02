import { useAuth } from "@/app/providers/AuthProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { usePermissions } from "@/app/providers/PermissionProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { mono, td, th, tableWrap } from "@/components/ui/DataKit";
import { DEMO_ACCOUNTS } from "@/services/authService";

/**
 * A page only a person with ADMIN.PANEL.VIEW may open (routes.tsx wraps it in RequireCan; constants/nav.ts hides
 * the entry from everyone else). Sign in as "staff" to see the menu entry disappear and /admin answer 403.
 */
export function AdminDemoPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { can } = usePermissions();
  const codes = ["ADMIN.PANEL.VIEW", "ADMIN.USER.EDIT", "DEMO.VIEW", "DEMO.EDIT"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader pretitle={t("navgroup.pages")} title={t("nav.admin")} sub={t("demo.admin.sub")} />

      <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600 }}>{t("demo.admin.mine")}</div>
        <div style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{t("demo.admin.mineDesc", { name: user?.name ?? "" })}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {codes.map((c) => (
            <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, padding: "4px 10px", borderRadius: 999, border: "1px solid var(--color-neutral-200)", background: can(c) ? "var(--tone-ok-bg)" : "var(--color-neutral-50)", color: can(c) ? "var(--tone-ok-fg)" : "var(--color-neutral-500)" }}>
              <Icon name={can(c) ? "check" : "blocked"} size={13} /><span style={mono}>{c}</span>
            </span>
          ))}
        </div>
        <code style={{ fontSize: 12, color: "var(--color-neutral-600)", background: "var(--color-neutral-50)", padding: "6px 10px", borderRadius: "var(--radius-md)" }}>
          {'const canEdit = useCan("ADMIN.USER.EDIT");  ·  <RequireCan code="ADMIN.PANEL.VIEW">…</RequireCan>'}
        </code>
      </Card>

      <div style={tableWrap}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr><th style={th}>{t("demo.admin.account")}</th><th style={th}>{t("set.username")}</th><th style={th}>{t("set.position")}</th><th style={th}>{t("set.permissions")}</th></tr></thead>
          <tbody>
            {DEMO_ACCOUNTS.map((a) => (
              <tr key={a.username}>
                <td style={td}><span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar initials={a.initials} size={28} />{a.name}</span></td>
                <td style={{ ...td, ...mono }}>{a.username}</td>
                <td style={td}>{a.role}</td>
                <td style={td}>{a.permissions === "*" ? <Badge tone="accent">{t("set.permAll")}</Badge> : a.permissions.map((p) => <Badge key={p} tone="neutral">{p}</Badge>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
