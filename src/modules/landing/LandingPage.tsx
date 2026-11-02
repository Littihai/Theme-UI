import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/app/providers/I18nProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { Icon } from "@/components/ui/Icon";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { PublicFrame } from "@/layouts/PublicFrame";
import { BRAND } from "@/constants/brand";
import { CONTACT_GITHUB } from "@/lib/support";
import type { IconName } from "@/constants/icons";
import { Reveal, Tilt } from "./Reveal";
import { HeroMock, MiniApi, MiniKit, MiniLang, MiniRoles, MiniTable, MiniTheme } from "./Mini";
import "./landing.css";

/**
 * The page at "/" for someone who has not signed in: what the starter is, what is inside, how a project starts from it,
 * and the way in. Blocks tip up out of the page as they come into view (Reveal), the cards lean toward the pointer
 * (Tilt), the steps light up as they scroll past, and the header turns to glass once the page has scrolled. Everything
 * is CSS and the app's own tokens — no 3D scene, no extra dependency — so it follows the theme, accent and font.
 */

const FEATURES: { k: string; icon: IconName; wide?: boolean; art: ReactNode }[] = [
  { k: "f1", icon: "paintbrush", wide: true, art: <MiniTheme /> },
  { k: "f2", icon: "globe", art: <MiniLang /> },
  { k: "f3", icon: "shieldLock", art: <MiniRoles /> },
  { k: "f4", icon: "beaker", wide: true, art: <MiniKit /> },
  { k: "f5", icon: "log", art: <MiniTable /> },
  { k: "f6", icon: "server", art: <MiniApi /> },
];
const STEPS: { k: string; icon: IconName }[] = [
  { k: "h1", icon: "copy" },
  { k: "h2", icon: "pencil" },
  { k: "h3", icon: "key" },
  { k: "h4", icon: "plus" },
];
const SECTIONS = ["lp-features", "lp-how", "lp-built"] as const;

const smooth = (reduce: boolean): ScrollBehavior => (reduce || document.documentElement.dataset.motion === "reduce" ? "auto" : "smooth");

export function LandingPage() {
  const { t } = useI18n();
  const { directory } = useAuth();
  const nav = useNavigate();
  const reduce = useReducedMotion();
  const [reached, setReached] = useState(0);
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const [far, setFar] = useState(false);   // past the hero: the back-to-top button shows
  const stepsRef = useRef<HTMLOListElement>(null);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: smooth(reduce), block: "start" });

  // on scroll: how many steps are reached (they light up and fill the line), and whether the header has left the top
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const line = vh * 0.62;
      const steps = stepsRef.current;
      if (steps) {
        const r = steps.getBoundingClientRect();
        steps.style.setProperty("--p", String(Math.min(1, Math.max(0, (line - r.top) / r.height))));
        let n = 0;
        for (const li of Array.from(steps.children)) if (li.getBoundingClientRect().top + 24 < line) n++;
        setReached(n);
      }
      setScrolled(window.scrollY > 8);
      setFar(window.scrollY > vh * 0.9);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);

  // the header's links show which section is on screen
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) setActive(e.target.id);
    }, { rootMargin: "-40% 0px -55% 0px" });
    SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  const links = [
    { id: "lp-features", label: t("lp.nav.features") },
    { id: "lp-how", label: t("lp.nav.how") },
    { id: "lp-built", label: t("lp.nav.built") },
  ];

  return (
    <PublicFrame
      className="lp-page"
      headerClassName={scrolled ? "lp-hdr-on" : undefined}
      nav={
        <nav className="lp-nav" aria-label={t("nav.menu")}>
          {links.map((l) => <button key={l.id} onClick={() => go(l.id)} aria-current={active === l.id ? "true" : undefined}>{l.label}</button>)}
        </nav>
      }
    >
      <button type="button" className={far ? "lp-top on" : "lp-top"} aria-label={t("lp.top")} title={t("lp.top")} tabIndex={far ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: smooth(reduce) })}>
        <Icon name="chevronUp" size={18} />
      </button>

      <div className="lp">
        {/* hero: the copy on the left, the shell in miniature on the right */}
        <section className="lp-sec lp-hero" aria-labelledby="lp-title">
          <div className="lp-wrap lp-hero-grid">
            <div className="lp-hero-copy">
              <Reveal><span className="lp-eyebrow"><i className="lp-dot" aria-hidden />{t("lp.eyebrow", { v: __APP_VERSION__ })}</span></Reveal>
              <Reveal delay={80}>
                <h1 id="lp-title" className="lp-h1">{t("lp.hero.t1")} <em className="lp-em">{t("lp.hero.t2")}</em></h1>
              </Reveal>
              <Reveal delay={160}><p className="lp-sub">{t("lp.hero.sub")}</p></Reveal>
              <Reveal delay={240}>
                <div className="lp-cta">
                  <Button className="lp-btn" onClick={() => nav("/login")}>{t("login.signIn")}<Icon name="arrowRight" size={15} /></Button>
                  <Button className="lp-btn" variant="secondary" onClick={() => go("lp-how")}>{t("lp.cta.how")}</Button>
                </div>
              </Reveal>
              {BRAND.stats.length > 0 && (
                <Reveal delay={320}>
                  <dl className="lp-stats">
                    {BRAND.stats.map((s) => (
                      <div key={s.labelKey}>
                        <dt>{t(s.labelKey)}</dt>
                        <dd><CountUp to={s.value} ms={1100} /></dd>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              )}
              <Reveal delay={400}>
                <div className="lp-hint" aria-hidden><span className="lp-mouse"><i /></span>{t("lp.hint")}</div>
              </Reveal>
            </div>
            <Reveal from="right" delay={120} className="lp-hero-art">
              <Tilt max={4}><HeroMock /></Tilt>
            </Reveal>
          </div>
        </section>

        {/* what is inside: a bento of six, each with a small illustration built from the system's own pieces */}
        <section id="lp-features" className="lp-sec" aria-labelledby="lp-f-title">
          <div className="lp-wrap">
            <Reveal><span className="lp-kicker">01</span><h2 id="lp-f-title" className="lp-h2">{t("lp.f.title")}</h2></Reveal>
            <Reveal delay={60}><p className="lp-lead">{t("lp.f.sub")}</p></Reveal>
            <div className="lp-bento">
              {FEATURES.map((f, i) => (
                <Reveal key={f.k} delay={(i % 3) * 90} from={i % 3 === 0 ? "left" : i % 3 === 2 ? "right" : "up"} className={f.wide ? "lp-cell lp-cell-wide" : "lp-cell"}>
                  <Tilt max={3}>
                    <article className="lp-glass lp-card">
                      <div className="lp-card-art" aria-hidden>{f.art}</div>
                      <span className="lp-ico"><Icon name={f.icon} size={20} /></span>
                      <h3>{t(`lp.${f.k}.t`)}</h3>
                      <p>{t(`lp.${f.k}.d`)}</p>
                    </article>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* how a project starts from this: the steps light up as they scroll past */}
        <section id="lp-how" className="lp-sec lp-sec-tint" aria-labelledby="lp-h-title">
          <div className="lp-wrap lp-split-grid">
            <div className="lp-col">
              <Reveal><span className="lp-kicker">02</span><h2 id="lp-h-title" className="lp-h2">{t("lp.h.title")}</h2></Reveal>
              <Reveal delay={60}><p className="lp-lead">{t("lp.h.sub")}</p></Reveal>
              <ol className="lp-steps" ref={stepsRef}>
                {STEPS.map((s, i) => (
                  <li key={s.k} className={i < reached ? "lp-step on" : "lp-step"}>
                    <Reveal from="left" delay={i * 40}>
                      <div className="lp-glass lp-step-body">
                        <span className="lp-num" aria-hidden>{i + 1}</span>
                        <span className="lp-step-ico" aria-hidden><Icon name={s.icon} size={17} /></span>
                        <h3>{t(`lp.${s.k}.t`)}</h3>
                        <p>{t(`lp.${s.k}.d`)}</p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
            <Reveal from="right" className="lp-col lp-col-side">
              <div className="lp-glass lp-panel">
                <span className="lp-kicker">{t("lp.h.rules")}</span>
                <ul className="lp-rules">
                  {["r1", "r2", "r3", "r4", "r5"].map((k) => (
                    <li key={k}><Icon name="check" size={14} /> {t(`lp.rule.${k}`)}</li>
                  ))}
                </ul>
                <p className="lp-note">{t("lp.h.note")}</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* built with + the way in */}
        <section id="lp-built" className="lp-sec" aria-labelledby="lp-b-title">
          <div className="lp-wrap">
            <Reveal>
              <div className="lp-glass lp-final">
                <span className="lp-kicker">03</span>
                <h2 id="lp-b-title" className="lp-h2">{t("lp.b.title")}</h2>
                <ul className="lp-chips">{BRAND.builtWith.map((b) => <li key={b}>{b}</li>)}</ul>
                <p className="lp-note">{t("lp.b.note")}</p>
                <hr className="lp-rule" />
                <h2 className="lp-h2">{t("lp.c.title")}</h2>
                <p className="lp-lead" style={{ marginBottom: 14 }}>{t("lp.c.sub")}</p>
                {directory.length > 0 && (
                  <p className="lp-roles">
                    <span>{t("lp.c.try")}</span>
                    {directory.map((u) => <span key={u.username} className="lp-role">{u.username} · {u.role}</span>)}
                  </p>
                )}
                <div className="lp-cta">
                  <Button className="lp-btn" onClick={() => nav("/login")}>{t("login.signIn")}<Icon name="arrowRight" size={15} /></Button>
                  {CONTACT_GITHUB && (
                    <a className="btn btn-secondary lp-btn" href={CONTACT_GITHUB} target="_blank" rel="noopener noreferrer"><Icon name="github" size={15} />GitHub</a>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </PublicFrame>
  );
}
