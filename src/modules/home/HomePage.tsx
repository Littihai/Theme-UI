import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChartCard, chartGrid } from "@/components/ui/ChartCard";
import { CountUp } from "@/components/ui/CountUp";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Timeline, type TimelineEvent } from "@/components/ui/Timeline";
import { CHART_COLORS, Delta, Donut, TrendChart } from "@/components/charts/Charts";
import { fmtMoney, When } from "@/components/ui/kit";
import { mono, td, th, tdNum, thNum, tableWrap } from "@/components/ui/DataKit";
import { NAV_GROUPS } from "@/constants/nav";
import type { IconName } from "@/types";
import { ORDERS, STATUS_TONE, WEEKLY_ORDERS, WEEKLY_SHIPPED, WEEK_LABELS, amountByStatus } from "@/modules/showcase/sampleData";

/**
 * Home = "my overview": what is waiting on me and how things are going. Everything here is a pattern a real module
 * fills with its own data: the welcome card, the stat tiles (one independent load each, see DataKit's useLoad), a
 * chart row, the latest rows, and the recent activity. The numbers are the demo's sample data.
 */
function Tile({ icon, label, n, hot, onClick, i = 0 }: { icon: IconName; label: string; n: number; hot?: boolean; onClick: () => void; i?: number }) {
  return (
    <button
      onClick={onClick}
      className="fx-tile fx-rise"
      style={{
        animationDelay: `${i * 70}ms`,
        textAlign: "left", cursor: "pointer", font: "inherit", color: "inherit",
        background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)", boxShadow: "var(--shadow-sm)",
        borderRadius: "var(--radius-lg)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10,
      }}
    >
      <span className="eyebrow" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        {label}
        <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: "var(--radius-md)", background: hot ? "var(--color-accent-100)" : "var(--color-neutral-100)", color: hot ? "var(--color-accent)" : "var(--color-neutral-600)" }}>
          <Icon name={icon} size={16} />
        </span>
      </span>
      <span style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-3xl)", fontWeight: 600, lineHeight: 1.1, color: hot ? "var(--color-accent)" : undefined }}>
        <CountUp to={n} />
      </span>
    </button>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const nav = useNavigate();
  if (!user) return null;

  const pending = ORDERS.filter((o) => o.status === "pending");
  const approved = ORDERS.filter((o) => o.status === "approved");
  const shipped = ORDERS.filter((o) => o.status === "shipped");
  const latest = ORDERS.slice(0, 5);
  const slices = amountByStatus(ORDERS).map((s, i) => ({ label: t(`demo.status.${s.status}`), value: s.value, count: s.count, color: CHART_COLORS[i % CHART_COLORS.length] }));
  const total = ORDERS.reduce((n, o) => n + o.amount, 0);

  const activity: TimelineEvent[] = [
    { when: ORDERS[0].createdAt, title: t("home.act.created", { id: ORDERS[0].id }), by: ORDERS[0].owner, icon: "plus", tone: "accent" },
    { when: approved[0]?.createdAt ?? null, title: t("home.act.approved", { id: approved[0]?.id ?? "—" }), by: approved[0]?.owner, icon: "checkCircle", tone: "ok" },
    { when: shipped[0]?.createdAt ?? null, title: t("home.act.shipped", { id: shipped[0]?.id ?? "—" }), by: shipped[0]?.owner, icon: "paperAirplane", tone: "accent" },
    { when: null, title: t("home.act.next"), pending: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        pretitle={t("nav.home")}
        title={t("home.title")}
        sub={t("home.sub")}
        actions={<Button onClick={() => nav("/components")}><Icon name="beaker" size={15} /> {t("home.openKit")}</Button>}
      />

      {/* what is waiting on me */}
      <div className="dash-top">
        <Card pad="22px 24px" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14, background: "linear-gradient(135deg, var(--color-accent-100), var(--color-surface) 75%)" }}>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600 }}>{t("home.welcome", { name: user.first })}</div>
            <div style={{ fontSize: 13.5, color: "var(--color-neutral-600)", marginTop: 6, maxWidth: 420 }}>
              {t("home.welcomeBody", { n: pending.length })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{user.dept ? `${user.dept} · ` : ""}{user.role}</span>
            <Button variant="secondary" size="sm" onClick={() => nav("/manual")} style={{ marginLeft: "auto" }}><Icon name="note" size={14} /> {t("home.readManual")}</Button>
          </div>
        </Card>
        <Tile i={0} icon="checklist" label={t("home.t.pending")} n={pending.length} hot={pending.length > 0} onClick={() => nav("/tables")} />
        <Tile i={1} icon="paperAirplane" label={t("home.t.shipped")} n={shipped.length} onClick={() => nav("/tables")} />
      </div>

      {/* how things are going */}
      <div style={chartGrid}>
        <ChartCard title={t("home.c.trend")} sub={t("home.c.trendSub")} span>
          <TrendChart
            labels={WEEK_LABELS}
            series={[
              { name: t("home.c.orders"), values: WEEKLY_ORDERS, color: CHART_COLORS[0] },
              { name: t("home.c.shipped"), values: WEEKLY_SHIPPED, color: CHART_COLORS[1] },
            ]}
            emptyText={t("home.c.empty")}
          />
          <Delta now={WEEKLY_ORDERS[WEEKLY_ORDERS.length - 1]} prev={WEEKLY_ORDERS[WEEKLY_ORDERS.length - 2]} label={t("home.c.vsLastWeek")} />
        </ChartCard>
        <ChartCard title={t("home.c.byStatus")} sub={t("home.c.byStatusSub")}>
          <Donut slices={slices} centerTop={fmtMoney(Math.round(total / 1000))} centerBottom={t("home.c.thousand")} />
        </ChartCard>
        <ChartCard title={t("home.c.activity")} sub={t("home.c.activitySub")}>
          <Timeline events={activity} />
        </ChartCard>
      </div>

      {/* the latest rows, as every list page draws them */}
      <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 600 }}>{t("home.latest")}</div>
            <div style={{ fontSize: 13, color: "var(--color-neutral-500)" }}>{t("home.latestSub")}</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => nav("/tables")}>{t("home.openAll")} <Icon name="arrowRight" size={13} /></Button>
        </div>
        <div style={tableWrap}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={th}>{t("demo.col.id")}</th>
                <th style={th}>{t("demo.col.customer")}</th>
                <th style={th}>{t("demo.col.status")}</th>
                <th style={thNum}>{t("demo.col.amount")}</th>
                <th style={th}>{t("demo.col.when")}</th>
              </tr>
            </thead>
            <tbody>
              {latest.map((o) => (
                <tr key={o.id} className="row-click" onClick={() => nav("/document")} style={{ cursor: "pointer" }}>
                  <td style={{ ...td, ...mono, fontWeight: 600 }}>{o.id}</td>
                  <td style={td}>{o.customer}</td>
                  <td style={td}><Badge tone={STATUS_TONE[o.status]}>{t(`demo.status.${o.status}`)}</Badge></td>
                  <td style={{ ...tdNum, fontWeight: 600 }}>{fmtMoney(o.amount)}</td>
                  <td style={td}><When iso={o.createdAt} lang={lang} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* where to go next: the pages of the menu */}
      <Card>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{t("home.explore")}</div>
        <div style={{ fontSize: 13, color: "var(--color-neutral-500)" }}>{t("home.exploreSub")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, 100%), 1fr))", gap: 10, marginTop: 12 }}>
          {NAV_GROUPS.flatMap((g) => g.entries).map((e) => (
            <button key={e.id} type="button" className="row-click" onClick={() => nav(e.path)}
              style={{ display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left", padding: "10px 12px", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-md)", background: "var(--color-neutral-50)", color: "inherit", font: "inherit", cursor: "pointer" }}>
              <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: "var(--radius-md)", background: "var(--color-accent-100)", color: "var(--color-accent-700)", flex: "none" }}><Icon name={e.icon} size={15} /></span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>{t(e.labelKey)}</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--color-neutral-600)" }}>{t(e.descKey)}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
