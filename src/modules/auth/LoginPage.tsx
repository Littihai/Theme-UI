import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ApiStatusBar } from "@/layouts/ApiStatusBar";
import { useAuth } from "@/app/providers/AuthProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { clickOrigin, useTheme } from "@/app/providers/ThemeProvider";
import { AppLogo } from "@/components/ui/AppLogo";
import { LangToggle } from "@/components/ui/LangToggle";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { CountUp } from "@/components/ui/CountUp";
import { BRAND } from "@/constants/brand";
import { SUPPORT_EMAIL, supportMailto } from "@/lib/support";

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
 * Sign-in screen, in one of two layouts (BRAND.loginLayout): a dark brand panel beside the card, or the card alone on a
 * plain page. The card itself is the same: a real <form> with labelled fields and autocomplete hints, so the browser
 * offers to save the password, Enter submits from either field, and a screen reader announces the fields and the error.
 * Where the visitor goes afterwards is decided by the /login route (they land on the page they were headed for), not
 * here. The "Enter as" card lists the sample accounts of the starter; it disappears once authService.demoAccounts()
 * returns none.
 */
export function LoginPage() {
  return BRAND.loginLayout === "split" ? <SplitLayout /> : <CenteredLayout />;
}

/** The light/dark button of the sign-in page (the change spreads out of the button). */
function ThemeButton({ light }: { light?: boolean }) {
  const { t } = useI18n();
  const { resolved, setPref } = useTheme();
  const dark = resolved === "dark";
  return (
    <button
      type="button"
      onClick={(e) => setPref(dark ? "light" : "dark", clickOrigin(e))}
      aria-label={t(dark ? "header.themeLight" : "header.themeDark")}
      title={t(dark ? "header.themeLight" : "header.themeDark")}
      className="btn-icon"
      style={light ? { color: "#fff" } : undefined}
    >
      <Icon name={dark ? "sun" : "moon"} size={18} />
    </button>
  );
}

function CenteredLayout() {
  const { t } = useI18n();
  const nav = useNavigate();
  return (
    <div className="auth-page">
      <ApiStatusBar />
      <div className="auth-lang"><ThemeButton /><LangToggle /></div>
      <div className="auth-stack">
        <button type="button" onClick={() => nav("/")} aria-label={BRAND.name} className="auth-brand" style={{ border: 0, background: "transparent", padding: "4px 2px" }}>
          <AppLogo size={40} />
          <span>{BRAND.word}</span>
        </button>
        <SignInCard />
        <DemoAccounts />
        <div className="auth-support">{t("login.supportLine")} <SupportMail /></div>
      </div>
    </div>
  );
}

function SplitLayout() {
  const { t, pick } = useI18n();
  const nav = useNavigate();
  return (
    <div className="auth-split">
      <ApiStatusBar />
      {/* the brand panel */}
      <div className="auth-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <button type="button" onClick={() => nav("/")} aria-label={BRAND.name} style={{ display: "flex", alignItems: "center", gap: 12, border: 0, background: "transparent", padding: 0, color: "#fff", cursor: "pointer" }}>
            <AppLogo size={30} color="#ffffff" />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", fontSize: 13, opacity: 0.85 }}>{BRAND.company}</span>
          </button>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><ThemeButton light /><LangToggle variant="light" /></span>
        </div>
        <div className="auth-hero">
          <div className="auth-title">{BRAND.name}</div>
          <div className="auth-tagline">{pick(BRAND.tagline)}</div>
          {BRAND.stats.length > 0 && (
            <dl className="auth-stats">
              {BRAND.stats.map((s) => (
                <div key={s.labelKey}>
                  <dd><CountUp to={s.value} ms={1100} /></dd>
                  <dt>{t(s.labelKey)}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="auth-copyright">© {new Date().getFullYear()} {BRAND.company}</div>
      </div>

      {/* the way in */}
      <div className="auth-main">
        <div className="auth-stack">
          <SignInCard />
          <DemoAccounts />
        </div>
        <div className="auth-support">{t("login.supportLine")} <SupportMail /></div>
      </div>
    </div>
  );
}

function SupportMail() {
  const { t } = useI18n();
  return (
    <a href={supportMailto({ subject: t("support.subject") })} style={{ fontWeight: 600, color: "var(--color-accent-700)", textDecoration: "none" }}>{SUPPORT_EMAIL}</a>
  );
}

/** The form. On success the /login route sends the person on; a failure focuses the password, selected, for the next try. */
function SignInCard() {
  const { login } = useAuth();
  const { t, pick } = useI18n();
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
    if (res.ok) return;
    setError(res.message ?? t("login.failed"));
    pwdRef.current?.focus();
    pwdRef.current?.select();
  };

  return (
    <form className="auth-card" onSubmit={doLogin} noValidate aria-labelledby="login-title" aria-busy={busy}>
      {busy && <div className="auth-progress" aria-hidden="true" />}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <h1 id="login-title" style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 27, fontWeight: 600 }}>{t("login.signIn")}</h1>
        <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>{BRAND.loginLayout === "split" ? t("login.hint") : pick(BRAND.tagline)}</div>
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
  );
}

/** The sample accounts of the starter: one button each, no password typed. */
function DemoAccounts(): ReactNode {
  const { directory, login } = useAuth();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (directory.length === 0) return null;

  const enterAs = async (name: string) => {
    if (busy) return;
    setError(null);
    setBusy(true);
    const res = await login(name, "demo", false);
    setBusy(false);
    if (!res.ok) setError(res.message ?? t("login.failed"));
  };

  return (
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
      {error && <div role="alert" style={{ fontSize: 12.5, color: "var(--tone-stop-fg)" }}>{error}</div>}
    </section>
  );
}
