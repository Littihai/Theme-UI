import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/app/providers/I18nProvider";
import { useUi } from "@/app/providers/UiProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { ModuleTabs } from "@/components/ui/ModuleTabs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { DateRange, CharCount } from "@/components/ui/DateRange";
import { Check, Dialog, Field, FormAlert, InlineError, inputStyle, Tile, type ApiFail } from "@/components/ui/DataKit";
import { Skeleton, SkeletonCards, SkeletonDetail, SkeletonRows, SkeletonText } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BulkBar } from "@/components/ui/BulkBar";
import { ActiveFilters } from "@/components/ui/ActiveFilters";
import { Pager } from "@/components/ui/Pager";
import { ActionBar, StageCard } from "@/components/ui/StageCard";
import { Timeline } from "@/components/ui/Timeline";
import { confirmDialog, reasonDialog, toastError, toastInfo, toastSuccess } from "@/lib/notify";
import { toast } from "@/overlays/Toast";
import { pushNotification } from "@/lib/notifications";
import { feedback } from "@/lib/feedback";
import { ICON, TONE } from "@/constants/icons";
import type { IconName, StatusTone } from "@/types";

type TabId = "buttons" | "forms" | "feedback" | "states" | "navigation" | "icons";
const TABS: TabId[] = ["buttons", "forms", "feedback", "states", "navigation", "icons"];
const TONES: StatusTone[] = ["accent", "ok", "warn", "stop", "neutral"];

/**
 * The UI kit, one tab per family, every piece drawn once with its real props. A new project keeps this page while it
 * builds (it is the quickest way to see a change to the tokens or ui.css everywhere) and deletes the showcase module
 * before shipping.
 */
export function ComponentsPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { tab: tabParam } = useParams();
  const tab: TabId = TABS.includes(tabParam as TabId) ? (tabParam as TabId) : "buttons";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader pretitle={t("navgroup.kit")} title={t("nav.components")} sub={t("demo.components.sub")} />
      <ModuleTabs
        tabs={TABS.map((id) => ({ id, label: t(`demo.tab.${id}`) }))}
        active={tab}
        onPick={(id) => nav(id === "buttons" ? "/components" : `/components/${id}`)}
        label={t("nav.components")}
        help={{ label: t("nav.manual"), onClick: () => nav("/manual#kit") }}
      />
      {tab === "buttons" && <ButtonsTab />}
      {tab === "forms" && <FormsTab />}
      {tab === "feedback" && <FeedbackTab />}
      {tab === "states" && <StatesTab />}
      {tab === "navigation" && <NavigationTab />}
      {tab === "icons" && <IconsTab />}
    </div>
  );
}

/** A titled block of the showcase: the family's name, one line on when to use it, the pieces. */
function Block({ title, desc, children, code }: { title: string; desc?: string; children: ReactNode; code?: string }) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600 }}>{title}</div>
        {desc && <div style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{desc}</div>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>{children}</div>
      {code && <code style={{ fontSize: 12, color: "var(--color-neutral-600)", background: "var(--color-neutral-50)", padding: "6px 10px", borderRadius: "var(--radius-md)", overflowWrap: "anywhere" }}>{code}</code>}
    </Card>
  );
}

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))", gap: 14, alignItems: "start" } as const;

function ButtonsTab() {
  const { t } = useI18n();
  const [on, setOn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pill, setPill] = useState("all");
  const variants = ["primary", "secondary", "tertiary", "link", "ghost", "success", "danger", "warning", "neutral"] as const;
  return (
    <div style={grid}>
      <Block title={t("demo.btn.variants")} desc={t("demo.btn.variantsDesc")} code='<Button variant="secondary" size="sm" busy count={3}>…</Button>'>
        {variants.map((v) => <Button key={v} variant={v}>{v}</Button>)}
      </Block>
      <Block title={t("demo.btn.sizes")} desc={t("demo.btn.sizesDesc")}>
        <Button size="sm">{t("demo.btn.small")}</Button>
        <Button>{t("demo.btn.medium")}</Button>
        <Button size="lg">{t("demo.btn.large")}</Button>
        <Button variant="secondary"><Icon name="download" size={15} /> {t("demo.btn.withIcon")}</Button>
        <button type="button" className="btn-icon" aria-label={t("demo.btn.iconOnly")} title={t("demo.btn.iconOnly")}><Icon name="pencil" size={16} /></button>
      </Block>
      <Block title={t("demo.btn.states")} desc={t("demo.btn.statesDesc")}>
        <Button busy={busy} onClick={() => { setBusy(true); window.setTimeout(() => setBusy(false), 1500); }}>{busy ? t("demo.btn.saving") : t("demo.btn.save")}</Button>
        <Button variant="secondary" disabled>{t("demo.btn.disabled")}</Button>
        <Button variant="neutral" count={7}><Icon name="bell" size={15} /> {t("demo.btn.inbox")}</Button>
        <Button variant="secondary" count={120}>{t("demo.btn.waiting")}</Button>
      </Block>
      <Block title={t("demo.badge")} desc={t("demo.badgeDesc")} code='<Badge tone="ok">…</Badge>'>
        {TONES.map((tone) => <Badge key={tone} tone={tone}>{t(`demo.tone.${tone}`)}</Badge>)}
        {TONES.map((tone) => <span key={tone} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5 }}><span style={{ width: 10, height: 10, borderRadius: 999, background: TONE[tone].solid }} />{tone}</span>)}
      </Block>
      <Block title={t("demo.switch")} desc={t("demo.switchDesc")} code='<Switch checked={on} onChange={setOn} />'>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 13.5 }}><Switch checked={on} onChange={setOn} ariaLabel={t("demo.switch")} /> {on ? t("demo.on") : t("demo.off")}</label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "var(--color-neutral-500)" }}><Switch checked disabled onChange={() => {}} ariaLabel={t("demo.btn.disabled")} /> {t("demo.btn.disabled")}</label>
      </Block>
      <Block title={t("demo.tabs")} desc={t("demo.tabsDesc")} code='<Tabs tabs={…} active={id} onPick={setId} pills />'>
        <div style={{ width: "100%" }}>
          <Tabs tabs={[{ id: "all", label: t("demo.tabs.all"), count: 57 }, { id: "mine", label: t("demo.tabs.mine"), icon: "person", count: 4, hot: true }, { id: "done", label: t("demo.tabs.done") }]} active={pill} onPick={setPill} />
        </div>
        <div style={{ width: "100%" }}>
          <Tabs pills tabs={[{ id: "all", label: t("demo.tabs.all") }, { id: "mine", label: t("demo.tabs.mine") }, { id: "done", label: t("demo.tabs.done") }]} active={pill} onPick={setPill} />
        </div>
      </Block>
      <Block title={t("demo.avatar")} desc={t("demo.avatarDesc")} code='<Avatar initials="AD" size={32} src={url} />'>
        <Avatar initials="AD" size={24} />
        <Avatar initials="SD" size={32} />
        <Avatar initials="NK" size={40} />
        <Avatar initials="PW" size={64} />
      </Block>
    </div>
  );
}

function FormsTab() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [customer, setCustomer] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const nameError = submitted && !name.trim() ? t("demo.form.required") : undefined;
  const customers = ["Siam Metal Works", "Bangkok Packaging", "Northern Foods", "Delta Plastics", "Eastern Textiles", "Chao Phraya Logistics", "Lanna Electronics", "Gulf Chemicals"];

  return (
    <div style={grid}>
      <Card style={{ display: "flex", flexDirection: "column", gap: 12, gridColumn: "1 / -1" }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600 }}>{t("demo.form.title")}</div>
          <div style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{t("demo.form.desc")}</div>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); if (name.trim()) toastSuccess(t("demo.form.saved")); }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "12px 16px" }}
        >
          <Field label={t("demo.form.name")} error={nameError} hint={t("demo.form.nameHint")}>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("demo.form.namePh")} />
          </Field>
          <Field label={t("demo.col.status")}>
            <Select value={status} onChange={setStatus} placeholder={t("select.placeholder")}
              options={["draft", "pending", "approved", "rejected", "shipped"].map((s) => ({ value: s, label: t(`demo.status.${s}`), tone: s === "approved" ? "ok" : s === "rejected" ? "stop" : s === "pending" ? "warn" : s === "shipped" ? "accent" : "neutral" }))} />
          </Field>
          <Field label={t("demo.col.customer")} hint={t("demo.form.searchHint")}>
            <Select searchable value={customer} onChange={setCustomer} placeholder={t("select.placeholder")} options={customers.map((c) => ({ value: c, label: c, group: c[0] < "M" ? "A–L" : "M–Z" }))} />
          </Field>
          <Field label={t("filter.date")} span={2}>
            <DateRange from={from} to={to} onChange={(f, tt) => { setFrom(f); setTo(tt); }} label={t("filter.date")} />
          </Field>
          <Field label={t("demo.form.note")} span={2}>
            <textarea rows={3} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} aria-describedby="note-count" />
            <CharCount id="note-count" value={note} max={200} />
          </Field>
          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Check checked={agree} onChange={setAgree} label={t("demo.form.agree")} />
          </div>
          {submitted && !name.trim() && <FormAlert text={t("demo.form.alert")} />}
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Button type="button" variant="tertiary" onClick={() => { setName(""); setStatus(""); setCustomer(""); setFrom(""); setTo(""); setNote(""); setAgree(false); setSubmitted(false); }}>{t("common.cancel")}</Button>
            <Button type="button" variant="secondary" onClick={() => setDialog(true)}>{t("demo.form.openDialog")}</Button>
            <Button type="submit">{t("common.save")}</Button>
          </div>
        </form>
      </Card>
      {dialog && (
        <Dialog
          labelId="demo-dialog"
          title={t("demo.dialog.title")}
          sub={t("demo.dialog.sub")}
          onClose={() => setDialog(false)}
          width={560}
          footer={<><Button variant="tertiary" onClick={() => setDialog(false)}>{t("common.cancel")}</Button><Button onClick={() => { setDialog(false); toastSuccess(t("demo.form.saved")); }}>{t("common.save")}</Button></>}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <Field label={t("demo.form.name")}><input style={inputStyle} autoFocus placeholder={t("demo.form.namePh")} /></Field>
            <Field label={t("demo.form.note")}><textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} /></Field>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function FeedbackTab() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [answer, setAnswer] = useState<string | null>(null);
  return (
    <div style={grid}>
      <Block title={t("demo.fb.toast")} desc={t("demo.fb.toastDesc")} code='toastSuccess(title, text) · toastError(…) · toast({ tone, title, action })'>
        <Button variant="success" onClick={() => toastSuccess(t("demo.fb.savedTitle"), t("demo.fb.savedText"))}>{t("demo.fb.success")}</Button>
        <Button variant="secondary" onClick={() => toastInfo(t("demo.fb.infoTitle"), () => nav("/document"))}>{t("demo.fb.info")}</Button>
        <Button variant="warning" onClick={() => toast({ tone: "warn", title: t("demo.fb.warnTitle"), text: t("demo.fb.warnText"), action: { label: t("demo.fb.undo"), onClick: () => toastSuccess(t("demo.fb.undone")) } })}>{t("demo.fb.warn")}</Button>
        <Button variant="danger" onClick={() => toastError(t("demo.fb.errorTitle"), t("demo.fb.errorText"))}>{t("demo.fb.error")}</Button>
      </Block>
      <Block title={t("demo.fb.confirm")} desc={t("demo.fb.confirmDesc")} code='await confirmDialog({ title, text, danger, trash }) · await reasonDialog({ title, requiredText })'>
        <Button variant="secondary" onClick={async () => setAnswer(String(await confirmDialog({ title: t("demo.fb.q.title"), text: t("demo.fb.q.text"), icon: "question" })))}>{t("demo.fb.ask")}</Button>
        <Button variant="danger" onClick={async () => setAnswer(String(await confirmDialog({ title: t("demo.fb.del.title"), text: t("demo.fb.del.text"), danger: true, trash: true, confirmText: t("demo.fb.del.ok") })))}>{t("demo.fb.delete")}</Button>
        <Button variant="warning" onClick={async () => { const r = await reasonDialog({ title: t("demo.fb.reason.title"), placeholder: t("demo.fb.reason.ph"), requiredText: t("demo.fb.reason.required"), confirmText: t("demo.fb.reason.ok") }); setAnswer(r === null ? "null" : `"${r}"`); }}>{t("demo.fb.reject")}</Button>
        {answer !== null && <span style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{t("demo.fb.answer")}: <b>{answer}</b></span>}
      </Block>
      <Block title={t("demo.fb.notif")} desc={t("demo.fb.notifDesc")} code='pushNotification({ title, body, tone, linkUrl })'>
        <Button variant="secondary" onClick={() => { pushNotification({ title: t("demo.fb.notifTitle"), body: t("demo.fb.notifBody"), tone: "warn", linkUrl: "/document" }); toastInfo(t("demo.fb.notifTitle"), () => nav("/document")); }}><Icon name="bell" size={15} /> {t("demo.fb.send")}</Button>
      </Block>
      <Block title={t("demo.fb.sound")} desc={t("demo.fb.soundDesc")} code='feedback("ok") · feedback("stop") · feedback("tick")'>
        <Button variant="success" onClick={() => feedback("ok")}>{t("demo.fb.accepted")}</Button>
        <Button variant="danger" onClick={() => feedback("stop")}>{t("demo.fb.refused")}</Button>
        <Button variant="secondary" onClick={() => feedback("tick")}>{t("demo.fb.tick")}</Button>
      </Block>
    </div>
  );
}

function StatesTab() {
  const { t } = useI18n();
  const fails: { kind: string; fail: ApiFail }[] = [
    { kind: "offline", fail: { message: t("demo.state.failOffline"), status: 0, code: "OFFLINE" } },
    { kind: "forbidden", fail: { message: t("demo.state.failForbidden"), status: 403, code: "FORBIDDEN", ref: "SRV-7F3A" } },
    { kind: "server", fail: { message: t("demo.state.failServer"), status: 500, code: "SERVER_ERROR", ref: "SRV-2B9C" } },
  ];
  return (
    <div style={grid}>
      <Block title={t("demo.state.skeleton")} desc={t("demo.state.skeletonDesc")} code="<SkeletonText /> <SkeletonRows /> <SkeletonCards /> <SkeletonDetail /> <SkeletonPage />">
        <div style={{ width: "100%", display: "grid", gap: 16 }}>
          <SkeletonText lines={3} />
          <SkeletonCards n={3} />
          <div style={{ border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}><SkeletonRows rows={3} cells={4} /></div>
          <SkeletonDetail fields={4} />
          <div style={{ display: "flex", gap: 8 }}><Skeleton w={120} h={32} r={999} /><Skeleton w={80} h={32} r={999} /></div>
        </div>
      </Block>
      <Block title={t("demo.state.tiles")} desc={t("demo.state.tilesDesc")} code='<Tile icon label value sub tone onClick />'>
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          <Tile icon="checklist" label={t("demo.t.waiting")} value="12" sub={t("demo.t.waitingSub")} tone="warn" onClick={() => toastInfo(t("demo.t.waiting"))} />
          <Tile icon="checkCircle" label={t("demo.t.done")} value="128" tone="ok" />
          <Tile icon="alert" label={t("demo.t.late")} value="3" tone="stop" />
          <Tile icon="graph" label={t("demo.t.total")} value="1,250,000" sub="THB" />
        </div>
      </Block>
      <Block title={t("demo.state.empty")} desc={t("demo.state.emptyDesc")} code='<EmptyState icon text hint action />'>
        <div style={{ width: "100%", border: "1px dashed var(--color-neutral-300)", borderRadius: "var(--radius-lg)" }}>
          <EmptyState icon="inbox" text={t("demo.state.emptyText")} hint={t("demo.state.emptyHint")} action={<Button size="sm"><Icon name="plus" size={14} /> {t("demo.state.emptyAction")}</Button>} />
        </div>
      </Block>
      <Block title={t("demo.state.inlineError")} desc={t("demo.state.inlineErrorDesc")} code='<InlineError text fail={fail} onRetry={reload} />'>
        <div style={{ width: "100%", display: "grid", gap: 10 }}>
          {fails.map((f) => (
            <div key={f.kind} style={{ border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)" }}>
              <InlineError text={f.fail.message} fail={f.fail} onRetry={() => toastInfo(t("demo.state.retried"))} />
            </div>
          ))}
        </div>
      </Block>
      <Block title={t("demo.state.errorPage")} desc={t("demo.state.errorPageDesc")} code='<ErrorState code={404} title description actions reference />'>
        <div style={{ width: "100%" }}>
          <ErrorState icon="bug" code={500} title={t("demo.state.errorTitle")} description={t("demo.state.errorDesc")} reference="UI-DEMO-1A2B" actions={[{ label: t("error.retry"), icon: "sync", onClick: () => toastInfo(t("demo.state.retried")), primary: true }]} />
        </div>
      </Block>
      <Block title={t("demo.state.soon")} desc={t("demo.state.soonDesc")} code='<ComingSoon name icon />'>
        <div style={{ width: "100%" }}><ComingSoon name={t("demo.state.soonName")} icon="telescope" /></div>
      </Block>
    </div>
  );
}

function NavigationTab() {
  const { t } = useI18n();
  const { mobile } = useUi();
  const [picked, setPicked] = useState(3);
  const [filters, setFilters] = useState(["pending", "Siam Metal Works"]);
  const [page, setPage] = useState(3);
  const [pageSize, setPageSize] = useState(10);
  const [stage, setStage] = useState<1 | 2 | 3>(2);
  const now = Date.now();
  return (
    <div style={grid}>
      <Block title={t("demo.nav.crumb")} desc={t("demo.nav.crumbDesc")} code='<Breadcrumb items={[{ label, to }, …]} />'>
        <div style={{ width: "100%", display: "grid", gap: 8 }}>
          <Breadcrumb items={[{ label: t("nav.home"), to: "/" }, { label: t("nav.tables"), to: "/tables" }, { label: "SO-2026-1042" }]} />
          <Breadcrumb items={[{ label: t("nav.home"), to: "/" }, { label: t("navgroup.pages") }, { label: t("nav.document"), to: "/document" }, { label: "2026" }, { label: "SO-2026-1042" }]} />
        </div>
      </Block>
      <Block title={t("demo.nav.pageHeader")} desc={t("demo.nav.pageHeaderDesc")} code='<PageHeader pretitle title sub actions />'>
        <div style={{ width: "100%", border: "1px dashed var(--color-neutral-300)", borderRadius: "var(--radius-lg)", padding: 14 }}>
          <PageHeader pretitle={t("navgroup.pages")} title={t("demo.nav.sampleTitle")} sub={t("demo.nav.sampleSub")} actions={<><Button variant="secondary" size="sm">{t("demo.nav.export")}</Button><Button size="sm"><Icon name="plus" size={14} /> {t("demo.nav.new")}</Button></>} />
        </div>
      </Block>
      <Block title={t("demo.nav.bulk")} desc={t("demo.nav.bulkDesc")} code='<BulkBar count onClear>…</BulkBar> · <ActiveFilters items count onClearAll />'>
        <div style={{ width: "100%", display: "grid", gap: 10 }}>
          <BulkBar count={picked} onClear={() => setPicked(0)}>
            <Button size="sm" variant="secondary"><Icon name="download" size={13} /> {t("demo.nav.export")}</Button>
            <Button size="sm" variant="danger"><Icon name="trash" size={13} /> {t("demo.nav.delete")}</Button>
          </BulkBar>
          {picked === 0 && <Button size="sm" variant="ghost" onClick={() => setPicked(3)}>{t("demo.nav.pickAgain")}</Button>}
          <ActiveFilters count={14} items={filters.map((f) => ({ label: f, onRemove: () => setFilters((xs) => xs.filter((x) => x !== f)) }))} onClearAll={() => setFilters([])} />
          {filters.length === 0 && <Button size="sm" variant="ghost" onClick={() => setFilters(["pending", "Siam Metal Works"])}>{t("demo.nav.filterAgain")}</Button>}
        </div>
      </Block>
      <Block title={t("demo.nav.pager")} desc={t("demo.nav.pagerDesc")} code='const { pageRows, pager } = usePaged(rows); <Pager {...pager} />'>
        <div style={{ width: "100%" }}>
          <Pager page={page} totalPages={Math.ceil(237 / pageSize)} total={237} from={(page - 1) * pageSize + 1} to={Math.min(page * pageSize, 237)} onPage={setPage} pageSize={pageSize} onPageSize={(n) => { setPageSize(n); setPage(1); }} />
        </div>
      </Block>
      <Block title={t("demo.nav.stages")} desc={t("demo.nav.stagesDesc")} code='<StageCard icon title summary state="done|now|next|off">…</StageCard> · <ActionBar note>…</ActionBar>'>
        <div style={{ width: "100%", display: "grid", gap: 10 }}>
          <StageCard icon="pencil" title={t("demo.stage.draft")} summary={t("demo.stage.draftSummary")} state={stage > 1 ? "done" : "now"}>
            <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>{t("demo.stage.draftBody")}</div>
          </StageCard>
          <StageCard icon="checkCircle" title={t("demo.stage.approve")} summary={t("demo.stage.approveSummary")} state={stage > 2 ? "done" : stage === 2 ? "now" : "next"}>
            <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>{t("demo.stage.approveBody")}</div>
          </StageCard>
          <StageCard icon="paperAirplane" title={t("demo.stage.ship")} state={stage === 3 ? "now" : "off"}>
            <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>{t("demo.stage.shipBody")}</div>
          </StageCard>
          <ActionBar note={t("demo.stage.note", { n: stage })}>
            <Button variant="tertiary" size="sm" disabled={stage === 1} onClick={() => setStage((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}>{t("demo.stage.back")}</Button>
            <Button size="sm" disabled={stage === 3} onClick={() => setStage((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s))}>{t("demo.stage.next")}</Button>
          </ActionBar>
        </div>
      </Block>
      <Block title={t("demo.nav.timeline")} desc={t("demo.nav.timelineDesc")} code='<Timeline title events={[{ when, title, sub, by, icon, tone, pending }]} />'>
        <div style={{ width: "100%" }}>
          <Timeline title={t("demo.nav.history")} events={[
            { when: new Date(now - 3 * 86_400_000).toISOString(), title: t("demo.tl.created"), by: "Arisa", icon: "plus", tone: "accent" },
            { when: new Date(now - 2 * 86_400_000).toISOString(), title: t("demo.tl.submitted"), sub: t("demo.tl.submittedSub"), by: "Arisa", icon: "paperAirplane", tone: "neutral" },
            { when: new Date(now - 86_400_000).toISOString(), title: t("demo.tl.approved"), by: "Somchai", icon: "checkCircle", tone: "ok" },
            { when: null, title: t("demo.tl.ship"), pending: true },
          ]} />
        </div>
      </Block>
      {mobile && <Card><div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>{t("demo.nav.mobileNote")}</div></Card>}
    </div>
  );
}

function IconsTab() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const names = (Object.keys(ICON) as IconName[]).filter((n) => !q.trim() || n.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600 }}>{t("demo.icons.title")}</div>
          <div style={{ fontSize: 12.5, color: "var(--color-neutral-600)" }}>{t("demo.icons.desc", { n: Object.keys(ICON).length })}</div>
        </div>
        <input style={{ ...inputStyle, width: 220 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")} aria-label={t("common.search")} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))", gap: 8 }}>
        {names.map((n) => (
          <button key={n} type="button" title={`<Icon name="${n}" />`} onClick={() => { void navigator.clipboard?.writeText(`<Icon name="${n}" />`); toastSuccess(t("demo.icons.copied"), `<Icon name="${n}" />`); }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 6px", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-md)", background: "var(--color-surface)", color: "var(--color-text)", font: "inherit", cursor: "pointer" }}>
            <Icon name={n} size={20} />
            <span style={{ fontSize: 11, color: "var(--color-neutral-600)", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", whiteSpace: "nowrap" }}>{n}</span>
          </button>
        ))}
      </div>
      {names.length === 0 && <EmptyState icon="search" text={t("select.noMatch", { q })} />}
    </Card>
  );
}
