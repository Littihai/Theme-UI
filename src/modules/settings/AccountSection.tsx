import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SettingRow, SettingsBlock } from "./settingsUi";

/**
 * Account: who is signed in and a way out. A real app adds here what the person controls about their own account
 * (a profile picture, a password change, their signature) — each as a SettingsBlock of rows.
 */
export function AccountSection() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  if (!user) return null;

  const codes = user.permissions === "*" ? t("set.permAll") : user.permissions.length ? user.permissions.join(", ") : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Avatar initials={user.initials} size={64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{user.name}</div>
          <div style={{ fontSize: 13, color: "var(--color-neutral-600)", marginTop: 2 }}>{user.username} · {user.role}</div>
        </div>
        <Badge tone="ok">{t("set.active")}</Badge>
      </div>

      <SettingsBlock title={t("set.accountInfo")} desc={t("set.accountInfoDesc")}>
        <InfoRow first label={t("set.username")} value={user.username} />
        <InfoRow label={t("set.position")} value={user.role || "—"} />
        <InfoRow label={t("set.dept")} value={user.dept || "—"} />
        <InfoRow label={t("set.email")} value={user.email || "—"} />
        <InfoRow label={t("set.permissions")} value={codes} />
      </SettingsBlock>

      <SettingsBlock title={t("set.security")}>
        <SettingRow first label={t("set.password")} desc={t("set.passwordDesc")}>
          <Button variant="secondary" disabled title={t("set.notInDemo")}>{t("set.changePassword")}</Button>
        </SettingRow>
        <SettingRow label={t("menu.signOut")} desc={t("set.signOutDesc")}>
          <Button variant="danger" onClick={async () => { await logout(); nav("/login"); }}>{t("menu.signOut")}</Button>
        </SettingRow>
      </SettingsBlock>
    </div>
  );
}

function InfoRow({ label, value, first }: { label: string; value: string; first?: boolean }) {
  return (
    <SettingRow first={first} label={<span style={{ color: "var(--color-neutral-600)", fontWeight: 400 }}>{label}</span>}>
      <span style={{ fontSize: 13.5, fontWeight: 600, overflowWrap: "anywhere" }}>{value}</span>
    </SettingRow>
  );
}
