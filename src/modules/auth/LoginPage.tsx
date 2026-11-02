import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiStatusBar } from "@/layouts/ApiStatusBar";
import { useAuth } from "@/app/providers/AuthProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { AppLogo } from "@/components/ui/AppLogo";
import { LangToggle } from "@/components/ui/LangToggle";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { BRAND } from "@/constants/brand";

const fieldStyle = {
  border: "1px solid var(--color-neutral-300)",
  borderRadius: "var(--radius-md)",
  padding: "10px 12px",
  fontSize: 13,
  background: "var(--color-surface)",
  width: "100%",
} as const;
const labelStyle = { fontSize: 12, fontWeight: 600, color: "var(--color-neutral-700)" } as const;

/**
 * Sign-in screen: one centred card on a plain page — logo, the two fields, the button. Nothing else competes with it.
 *
 * It is a real <form> with labelled fields and autocomplete hints: that is what lets the browser offer to save the
 * password (and fill it next time), lets Enter submit from either field, and lets a screen reader announce the fields
 * and the error. Where the visitor goes afterwards is decided by the /login route (they land on the page they were
 * headed for), not here. The "Enter as" card lists the sample accounts of the starter; it disappears by itself once
 * authService.demoAccounts() returns none.
 */
export function LoginPage() {
  const { directory, login } = useAuth();
  const { t, pick } = useI18n();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const pwdRef = useRef<HTMLInputElement>(null);

  const doLogin = async (e: FormEvent) => {
    e.preventDefault();   // the form must never reload the page
    if (busy) return;
    setError(null);
    setBusy(true);
    const res = await login(username.trim(), password, remember);
    setBusy(false);
    // success: the /login route sees the signed-in user and sends them on to where they were headed
    if (res.ok) return;
    setError(res.message ?? t("login.failed"));
    // a wrong password is usually a typo: back to the field, text selected, so the next try replaces it
    pwdRef.current?.focus();
    pwdRef.current?.select();
  };

  const enterAs = async (name: string) => {
    if (busy) return;
    setError(null);
    setBusy(true);
    const res = await login(name, "demo", false);
    setBusy(false);
    if (!res.ok) setError(res.message ?? t("login.failed"));
  };

  return (
    <div className="auth-page">
      <ApiStatusBar />
      <div className="auth-lang"><LangToggle /></div>
      <div className="auth-stack">
        <button type="button" onClick={() => nav("/")} aria-label={BRAND.name} className="auth-brand" style={{ border: 0, background: "transparent", padding: "4px 2px" }}>
          <AppLogo size={40} />
          <span>{BRAND.word}</span>
        </button>

        <form className="auth-card" onSubmit={doLogin} noValidate aria-labelledby="login-title" aria-busy={busy}>
          {busy && <div className="auth-progress" aria-hidden="true" />}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <h1 id="login-title" style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 27, fontWeight: 600 }}>{t("login.signIn")}</h1>
            <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>{pick(BRAND.tagline)}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="login-username" style={labelStyle}>{t("login.username")}</label>
            <input
              id="login-username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("login.usernamePh")}
              autoFocus
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              aria-required="true"
              aria-invalid={error ? true : undefined}
              style={fieldStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="login-password" style={labelStyle}>{t("login.password")}</label>
            <div style={{ position: "relative", display: "flex" }}>
              <input
                id="login-password"
                name="password"
                ref={pwdRef}
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.passwordPh")}
                autoComplete="current-password"
                enterKeyHint="go"
                aria-required="true"
                aria-invalid={error ? true : undefined}
                style={{ ...fieldStyle, padding: "10px 40px 10px 12px" }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? t("login.hidePassword") : t("login.showPassword")}
                aria-controls="login-password"
                aria-pressed={showPwd}
                style={{ position: "absolute", right: 4, top: 0, bottom: 0, width: 34, display: "grid", placeItems: "center", background: "transparent", border: 0, cursor: "pointer", color: "var(--color-neutral-500)" }}
              >
                <Icon name={showPwd ? "eyeClosed" : "eye"} size={18} />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--color-neutral-700)" }}>
              <input type="checkbox" name="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ accentColor: "var(--color-accent)" }} /> {t("login.remember")}
            </label>
            <button
              type="button"
              onClick={() => setError(t("login.forgotHint"))}
              style={{ background: "transparent", border: 0, padding: 0, fontSize: 12.5, fontWeight: 600, color: "var(--color-accent-700)", cursor: "pointer" }}
            >
              {t("login.forgot")}
            </button>
          </div>

          {/* always in the page, so a screen reader announces the text the moment it appears */}
          <div className="live-region" role="alert" aria-live="assertive">
            {error && (
              <div
                style={{
                  background: "var(--tone-stop-bg)",
                  color: "var(--tone-stop-fg)",
                  border: "1px solid color-mix(in srgb, var(--tone-stop-solid) 35%, transparent)",
                  borderRadius: "var(--radius-md)",
                  padding: "9px 12px",
                  fontSize: 12.5,
                }}
              >
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={busy}
            style={{
              background: "var(--color-accent)",
              color: "var(--color-on-accent)",
              border: 0,
              borderRadius: "var(--radius-md)",
              padding: 12,
              fontWeight: 600,
              fontSize: 14,
              boxShadow: "var(--shadow-sm)",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? <><span className="spinner" aria-hidden="true" />{t("login.signingIn")}</> : t("login.signIn")}
          </button>
        </form>

        {directory.length > 0 && (
          <section className="auth-card" aria-labelledby="login-demo-title" style={{ gap: 10 }}>
            <div>
              <h2 id="login-demo-title" style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{t("login.demoTitle")}</h2>
              <div style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{t("login.demoHint")}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
              {directory.map((u) => (
                <button key={u.username} type="button" disabled={busy} onClick={() => enterAs(u.username)} className="btn btn-secondary" style={{ justifyContent: "flex-start", gap: 10, whiteSpace: "normal", textAlign: "left", minHeight: 48 }}>
                  <Avatar initials={u.initials} size={26} />
                  <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 400, color: "var(--color-neutral-600)" }}>{u.username} · {u.role}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
