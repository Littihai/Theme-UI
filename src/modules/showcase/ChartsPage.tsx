import { useNavigate } from "react-router-dom";
import { useI18n } from "@/app/providers/I18nProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChartCard, chartGrid } from "@/components/ui/ChartCard";
import { Tile } from "@/components/ui/DataKit";
import { fmtMoney } from "@/components/ui/kit";
import { CHART_COLORS, Delta, Donut, RankBars, TrendChart } from "@/components/charts/Charts";
import { ORDERS, WEEKLY_ORDERS, WEEKLY_SHIPPED, WEEK_LABELS, amountByCustomer, amountByStatus } from "./sampleData";

/**
 * The overview pattern: stat tiles, then chart cards in a grid that reflows by width. The charts are hand-drawn SVG
 * (components/charts/Charts.tsx) — no chart library, so they take the theme's colours and print as they are.
 */
export function ChartsPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const total = ORDERS.reduce((n, o) => n + o.amount, 0);
  const pending = ORDERS.filter((o) => o.status === "pending").length;
  const late = ORDERS.filter((o) => o.status === "pending" && Date.now() - new Date(o.createdAt).getTime() > 14 * 86_400_000).length;
  const slices = amountByStatus(ORDERS).map((s, i) => ({ label: t(`demo.status.${s.status}`), value: s.value, count: s.count, color: CHART_COLORS[i % CHART_COLORS.length] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader pretitle={t("navgroup.kit")} title={t("nav.charts")} sub={t("demo.charts.sub")} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(180px, 100%), 1fr))", gap: 12 }}>
        <Tile icon="graph" label={t("demo.charts.total")} value={fmtMoney(total)} sub="THB" />
        <Tile icon="checklist" label={t("demo.t.waiting")} value={String(pending)} tone={pending > 0 ? "warn" : undefined} onClick={() => nav("/tables")} />
        <Tile icon="alert" label={t("demo.t.late")} value={String(late)} tone={late > 0 ? "stop" : "ok"} sub={t("demo.charts.lateSub")} onClick={() => nav("/tables")} />
        <Tile icon="people" label={t("demo.charts.customers")} value={String(new Set(ORDERS.map((o) => o.customer)).size)} />
      </div>

      <div style={chartGrid}>
        <ChartCard title={t("home.c.trend")} sub={t("home.c.trendSub")} span>
          <TrendChart labels={WEEK_LABELS} series={[
            { name: t("home.c.orders"), values: WEEKLY_ORDERS, color: CHART_COLORS[0] },
            { name: t("home.c.shipped"), values: WEEKLY_SHIPPED, color: CHART_COLORS[1] },
          ]} emptyText={t("home.c.empty")} />
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Delta now={WEEKLY_ORDERS[7]} prev={WEEKLY_ORDERS[6]} label={t("home.c.vsLastWeek")} />
            <Delta now={WEEKLY_ORDERS[7] - WEEKLY_SHIPPED[7]} prev={WEEKLY_ORDERS[6] - WEEKLY_SHIPPED[6]} label={t("demo.charts.backlog")} lowerIsBetter />
          </div>
        </ChartCard>
        <ChartCard title={t("home.c.byStatus")} sub={t("home.c.byStatusSub")}>
          <Donut slices={slices} centerTop={fmtMoney(Math.round(total / 1000))} centerBottom={t("home.c.thousand")} />
        </ChartCard>
        <ChartCard title={t("demo.charts.byCustomer")} sub={t("demo.charts.byCustomerSub")}>
          <RankBars rows={amountByCustomer(ORDERS)} onPick={() => nav("/tables")} />
        </ChartCard>
        <ChartCard title={t("demo.charts.emptyTitle")} sub={t("demo.charts.emptySub")}>
          <TrendChart labels={WEEK_LABELS} series={[{ name: t("home.c.orders"), values: WEEK_LABELS.map(() => 0), color: CHART_COLORS[0] }]} emptyText={t("home.c.empty")} />
        </ChartCard>
      </div>
    </div>
  );
}
