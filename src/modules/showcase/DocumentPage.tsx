import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/app/providers/I18nProvider";
import { useUi } from "@/app/providers/UiProvider";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ActionBar, StageCard } from "@/components/ui/StageCard";
import { Timeline, type TimelineEvent } from "@/components/ui/Timeline";
import { Field, inputStyle, mono, td, th, tdNum, thNum } from "@/components/ui/DataKit";
import { fmtMoney } from "@/components/ui/kit";
import { confirmDialog, reasonDialog, toastSuccess } from "@/lib/notify";
import { pushNotification } from "@/lib/notifications";
import { ORDERS, STATUS_TONE, type OrderStatus } from "./sampleData";

type Step = "draft" | "review" | "done";

/**
 * The document pattern (a request, an order, a ticket) on its own page: where it sits (breadcrumb), its status, the
 * stages as cards — done ones folded to a line, the current one open — the history, and the one action to take now in
 * a bar that stays at the bottom. The approval flow here is local state; a module calls its service in its place.
 */
export function DocumentPage() {
  const { t } = useI18n();
  const { tight } = useUi();
  const nav = useNavigate();
  const order = ORDERS.find((o) => o.status === "pending") ?? ORDERS[0];
  const [step, setStep] = useState<Step>("review");
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [events, setEvents] = useState<TimelineEvent[]>([
    { when: order.createdAt, title: t("demo.tl.created"), by: order.owner, icon: "plus", tone: "accent" },
    { when: order.createdAt, title: t("demo.tl.submitted"), sub: t("demo.tl.submittedSub"), by: order.owner, icon: "paperAirplane", tone: "neutral" },
    { when: null, title: t("demo.doc.awaiting"), pending: true },
  ]);
  const [comment, setComment] = useState("");
  const now = () => new Date().toISOString();

  async function approve() {
    if (!(await confirmDialog({ title: t("demo.doc.approveQ", { id: order.id }), text: t("demo.doc.approveText"), confirmText: t("demo.tbl.approve"), icon: "question" }))) return;
    setStatus("approved"); setStep("done");
    setEvents((xs) => [...xs.slice(0, -1), { when: now(), title: t("demo.tl.approved"), by: "Arisa", icon: "checkCircle", tone: "ok", sub: comment || undefined }, { when: null, title: t("demo.tl.ship"), pending: true }]);
    toastSuccess(t("demo.doc.approved", { id: order.id }));
    pushNotification({ title: t("demo.doc.approved", { id: order.id }), tone: "ok", linkUrl: "/document" });
  }
  async function reject() {
    const reason = await reasonDialog({ title: t("demo.doc.rejectQ", { id: order.id }), placeholder: t("demo.fb.reason.ph"), requiredText: t("demo.fb.reason.required"), confirmText: t("demo.doc.reject") });
    if (reason === null) return;
    setStatus("rejected"); setStep("draft");
    setEvents((xs) => [...xs.slice(0, -1), { when: now(), title: t("demo.doc.rejected"), sub: reason, by: "Arisa", icon: "x", tone: "stop" }, { when: null, title: t("demo.doc.resubmit"), pending: true }]);
    pushNotification({ title: t("demo.doc.rejected"), body: reason, tone: "stop", linkUrl: "/document" });
  }
  function resubmit() {
    setStatus("pending"); setStep("review");
    setEvents((xs) => [...xs.slice(0, -1), { when: now(), title: t("demo.tl.submitted"), by: order.owner, icon: "paperAirplane", tone: "neutral" }, { when: null, title: t("demo.doc.awaiting"), pending: true }]);
    toastSuccess(t("demo.doc.resubmitted"));
  }

  const lines = [
    { no: 1, item: order.item, qty: order.qty, price: order.amount / order.qty },
    { no: 2, item: t("demo.doc.freight"), qty: 1, price: 1200 },
  ];
  const total = lines.reduce((n, l) => n + l.qty * l.price, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Breadcrumb items={[{ label: t("nav.home"), to: "/" }, { label: t("nav.tables"), to: "/tables" }, { label: order.id }]} heading />
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Badge tone={STATUS_TONE[status]}>{t(`demo.status.${status}`)}</Badge>
        <span style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>{order.customer} · {order.owner}</span>
        <span style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" onClick={() => nav("/tables")}><Icon name="chevronLeft" size={13} /> {t("demo.doc.backToList")}</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: tight ? "minmax(0, 1fr)" : "minmax(0, 1fr) 320px", gap: 16, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 10 }}>
          <StageCard icon="pencil" title={t("demo.stage.draft")} summary={`${lines.length} ${t("demo.doc.lines")} · ${fmtMoney(total)}`} state={step === "draft" ? "now" : "done"}>
            <div style={{ overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr><th style={th}>#</th><th style={th}>{t("demo.col.item")}</th><th style={thNum}>{t("demo.col.qty")}</th><th style={thNum}>{t("demo.doc.price")}</th><th style={thNum}>{t("demo.col.amount")}</th></tr></thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.no}><td style={{ ...td, ...mono }}>{l.no}</td><td style={td}>{l.item}</td><td style={tdNum}>{l.qty.toLocaleString()}</td><td style={tdNum}>{fmtMoney(l.price)}</td><td style={{ ...tdNum, fontWeight: 600 }}>{fmtMoney(l.qty * l.price)}</td></tr>
                  ))}
                </tbody>
                <tfoot><tr><td colSpan={4} style={{ ...td, fontWeight: 600, textAlign: "right" }}>{t("demo.doc.total")}</td><td style={{ ...tdNum, fontWeight: 700 }}>{fmtMoney(total)}</td></tr></tfoot>
              </table>
            </div>
            {step === "draft" && <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>{t("demo.doc.draftHint")}</div>}
          </StageCard>

          <StageCard icon="checkCircle" title={t("demo.stage.approve")} summary={status === "approved" ? t("demo.tl.approved") : status === "rejected" ? t("demo.doc.rejected") : undefined} state={step === "review" ? "now" : step === "done" ? "done" : "next"}>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>{t("demo.doc.reviewHint")}</div>
              <Field label={t("demo.doc.comment")} hint={t("demo.doc.commentHint")}>
                <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
              </Field>
            </div>
          </StageCard>

          <StageCard icon="paperAirplane" title={t("demo.stage.ship")} state={step === "done" ? "now" : "off"}>
            <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>{t("demo.stage.shipBody")}</div>
          </StageCard>

          <ActionBar note={step === "review" ? t("demo.doc.noteReview") : step === "draft" ? t("demo.doc.noteDraft") : t("demo.doc.noteDone")}>
            {step === "review" && <><Button variant="danger" onClick={reject}><Icon name="x" size={15} /> {t("demo.doc.reject")}</Button><Button variant="success" onClick={approve}><Icon name="check" size={15} /> {t("demo.tbl.approve")}</Button></>}
            {step === "draft" && <Button onClick={resubmit}><Icon name="paperAirplane" size={15} /> {t("demo.doc.resubmit")}</Button>}
            {step === "done" && <Button variant="secondary" onClick={() => nav("/tables")}>{t("demo.doc.backToList")}</Button>}
          </ActionBar>
        </div>

        <Timeline title={t("demo.nav.history")} events={events.map((e) => ({ ...e, when: e.when }))} />
      </div>
    </div>
  );
}
