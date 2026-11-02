import { useMemo, useState } from "react";
import { useI18n } from "@/app/providers/I18nProvider";
import { useUi } from "@/app/providers/UiProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { DateRange } from "@/components/ui/DateRange";
import { ActiveFilters } from "@/components/ui/ActiveFilters";
import { BulkBar } from "@/components/ui/BulkBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pager, usePaged } from "@/components/ui/Pager";
import { Dialog, ExportButton, SortTh, mono, td, tdNum, th, tableWrap, useSort, type CsvColumn } from "@/components/ui/DataKit";
import { fmtDate, fmtMoney, When } from "@/components/ui/kit";
import { confirmDialog, toastSuccess } from "@/lib/notify";
import { ORDERS, STATUS_TONE, type Order, type OrderStatus } from "./sampleData";

const STATUSES: OrderStatus[] = ["draft", "pending", "approved", "rejected", "shipped"];

/**
 * The list page pattern, complete: a toolbar (search, a status filter, a date range), the active filters, a bulk bar
 * for ticked rows, sortable headers, CSV export of what the filters left, paging, an empty state, and a detail dialog
 * from a row. On a phone the table becomes a list of cards (nothing scrolls sideways).
 */
export function TablesPage() {
  const { t, lang } = useI18n();
  const { mobile } = useUi();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<Order | null>(null);
  const [rows, setRows] = useState(ORDERS);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((o) =>
      (!s || o.id.toLowerCase().includes(s) || o.customer.toLowerCase().includes(s) || o.item.toLowerCase().includes(s)) &&
      (!status || o.status === status) &&
      (!from || o.createdAt.slice(0, 10) >= from) &&
      (!to || o.createdAt.slice(0, 10) <= to));
  }, [rows, q, status, from, to]);

  const sorted = useSort(filtered, undefined, { key: "createdAt", dir: "desc" });
  const { pageRows, pager } = usePaged(sorted.rows);

  const filters = [
    ...(status ? [{ label: `${t("demo.col.status")}: ${t(`demo.status.${status}`)}`, onRemove: () => setStatus("") }] : []),
    ...(from || to ? [{ label: `${t("filter.date")}: ${from || "…"} – ${to || "…"}`, onRemove: () => { setFrom(""); setTo(""); } }] : []),
    ...(q.trim() ? [{ label: `${t("filter.search")}: ${q.trim()}`, onRemove: () => setQ("") }] : []),
  ];

  const csv: CsvColumn<Order>[] = [
    { h: t("demo.col.id"), v: (o) => o.id }, { h: t("demo.col.customer"), v: (o) => o.customer }, { h: t("demo.col.item"), v: (o) => o.item },
    { h: t("demo.col.qty"), v: (o) => o.qty }, { h: t("demo.col.amount"), v: (o) => o.amount }, { h: t("demo.col.status"), v: (o) => o.status }, { h: t("demo.col.when"), v: (o) => o.createdAt },
  ];

  const toggle = (id: string) => setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allOnPage = pageRows.length > 0 && pageRows.every((o) => picked.has(o.id));
  const toggleAll = () => setPicked((s) => { const n = new Set(s); if (allOnPage) pageRows.forEach((o) => n.delete(o.id)); else pageRows.forEach((o) => n.add(o.id)); return n; });

  async function approvePicked() {
    const ids = [...picked];
    if (!(await confirmDialog({ title: t("demo.tbl.approveQ", { n: ids.length }), text: t("demo.tbl.approveText"), icon: "question" }))) return;
    setRows((xs) => xs.map((o) => (picked.has(o.id) && o.status === "pending" ? { ...o, status: "approved" } : o)));
    setPicked(new Set());
    toastSuccess(t("demo.tbl.approved", { n: ids.length }));
  }
  async function deletePicked() {
    const ids = [...picked];
    if (!(await confirmDialog({ title: t("demo.tbl.deleteQ", { n: ids.length }), text: t("demo.tbl.deleteText"), danger: true, trash: true, confirmText: t("demo.nav.delete") }))) return;
    setRows((xs) => xs.filter((o) => !picked.has(o.id)));
    setPicked(new Set());
    toastSuccess(t("demo.tbl.deleted", { n: ids.length }));
  }

  const statusBadge = (o: Order) => <Badge tone={STATUS_TONE[o.status]}>{t(`demo.status.${o.status}`)}</Badge>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        pretitle={t("navgroup.kit")}
        title={t("nav.tables")}
        sub={t("demo.tbl.sub")}
        actions={<><ExportButton name="orders" columns={csv} rows={sorted.rows} /><Button size="sm" onClick={() => toastSuccess(t("demo.tbl.newHint"))}><Icon name="plus" size={14} /> {t("demo.nav.new")}</Button></>}
      />

      {/* the toolbar: one row that wraps */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div className="input-wrap" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--color-surface)", border: "1px solid var(--color-neutral-300)", borderRadius: "var(--radius-md)", padding: "0 10px", height: 36, width: "min(280px, 100%)" }}>
          <Icon name="search" size={15} color="var(--color-neutral-500)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("demo.tbl.searchPh")} aria-label={t("filter.search")} style={{ border: 0, outline: "none", flex: 1, fontSize: 13, background: "transparent", minWidth: 0 }} />
          {q && <button type="button" className="btn-icon" aria-label={t("select.clear")} onClick={() => setQ("")} style={{ padding: 2 }}><Icon name="x" size={13} /></button>}
        </div>
        <Select size="sm" prefix={t("demo.col.status")} value={status} onChange={setStatus} style={{ width: "auto" }} aria-label={t("demo.col.status")}
          options={[{ value: "", label: t("common.all") }, ...STATUSES.map((s) => ({ value: s, label: t(`demo.status.${s}`), tone: STATUS_TONE[s] }))]} />
        <DateRange inline from={from} to={to} onChange={(f, tt) => { setFrom(f); setTo(tt); }} label={t("filter.date")} />
      </div>
      <ActiveFilters items={filters} count={filtered.length} onClearAll={() => { setQ(""); setStatus(""); setFrom(""); setTo(""); }} />

      <BulkBar count={picked.size} onClear={() => setPicked(new Set())}>
        <Button size="sm" variant="success" onClick={approvePicked}><Icon name="check" size={13} /> {t("demo.tbl.approve")}</Button>
        <Button size="sm" variant="danger" onClick={deletePicked}><Icon name="trash" size={13} /> {t("demo.nav.delete")}</Button>
      </BulkBar>

      {sorted.rows.length === 0 ? (
        <div style={tableWrap}>
          <EmptyState icon="search" text={t("demo.tbl.empty")} hint={t("demo.tbl.emptyHint")} action={<Button size="sm" variant="secondary" onClick={() => { setQ(""); setStatus(""); setFrom(""); setTo(""); }}>{t("filter.clearAll")}</Button>} />
        </div>
      ) : mobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pageRows.map((o) => (
            <button key={o.id} type="button" className="row-click" onClick={() => setOpen(o)}
              style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "4px 12px", alignItems: "center", textAlign: "left", padding: "12px 14px", background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)", color: "inherit", font: "inherit", cursor: "pointer" }}>
              <input type="checkbox" checked={picked.has(o.id)} onChange={() => toggle(o.id)} onClick={(e) => e.stopPropagation()} aria-label={o.id} />
              <span style={{ ...mono, fontWeight: 600 }}>{o.id}</span>
              {statusBadge(o)}
              <span />
              <span style={{ fontSize: 13 }}>{o.customer} · {o.item}</span>
              <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmtMoney(o.amount)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div style={tableWrap}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 36 }}><input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label={t("demo.tbl.pickPage")} /></th>
                <SortTh k="id" s={sorted}>{t("demo.col.id")}</SortTh>
                <SortTh k="customer" s={sorted}>{t("demo.col.customer")}</SortTh>
                <SortTh k="item" s={sorted}>{t("demo.col.item")}</SortTh>
                <SortTh k="qty" s={sorted} num>{t("demo.col.qty")}</SortTh>
                <SortTh k="amount" s={sorted} num>{t("demo.col.amount")}</SortTh>
                <SortTh k="status" s={sorted}>{t("demo.col.status")}</SortTh>
                <SortTh k="createdAt" s={sorted}>{t("demo.col.when")}</SortTh>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((o) => (
                <tr key={o.id} className="row-click" onClick={() => setOpen(o)} style={{ cursor: "pointer", background: picked.has(o.id) ? "var(--color-accent-100)" : undefined }}>
                  <td style={td}><input type="checkbox" checked={picked.has(o.id)} onChange={() => toggle(o.id)} onClick={(e) => e.stopPropagation()} aria-label={o.id} /></td>
                  <td style={{ ...td, ...mono, fontWeight: 600, whiteSpace: "nowrap" }}>{o.id}</td>
                  <td style={td}>{o.customer}</td>
                  <td style={td}>{o.item}</td>
                  <td style={tdNum}>{o.qty.toLocaleString()}</td>
                  <td style={{ ...tdNum, fontWeight: 600 }}>{fmtMoney(o.amount)}</td>
                  <td style={td}>{statusBadge(o)}</td>
                  <td style={{ ...td, whiteSpace: "nowrap" }}><When iso={o.createdAt} lang={lang} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager {...pager} />

      {open && (
        <Dialog labelId="order-dialog" title={open.id} sub={`${open.customer} · ${t(`demo.status.${open.status}`)}`} onClose={() => setOpen(null)} width={520}
          footer={<><Button variant="tertiary" onClick={() => setOpen(null)}>{t("common.close")}</Button>{open.status === "pending" && <Button onClick={() => { setRows((xs) => xs.map((o) => (o.id === open.id ? { ...o, status: "approved" } : o))); setOpen(null); toastSuccess(t("demo.tbl.approved", { n: 1 })); }}>{t("demo.tbl.approve")}</Button>}</>}>
          <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 18px", margin: 0, fontSize: 13.5 }}>
            <dt style={{ color: "var(--color-neutral-600)" }}>{t("demo.col.item")}</dt><dd style={{ margin: 0 }}>{open.item}</dd>
            <dt style={{ color: "var(--color-neutral-600)" }}>{t("demo.col.qty")}</dt><dd style={{ margin: 0 }}>{open.qty.toLocaleString()}</dd>
            <dt style={{ color: "var(--color-neutral-600)" }}>{t("demo.col.amount")}</dt><dd style={{ margin: 0, fontWeight: 600 }}>{fmtMoney(open.amount)}</dd>
            <dt style={{ color: "var(--color-neutral-600)" }}>{t("demo.col.owner")}</dt><dd style={{ margin: 0 }}>{open.owner}</dd>
            <dt style={{ color: "var(--color-neutral-600)" }}>{t("demo.col.when")}</dt><dd style={{ margin: 0 }}>{fmtDate(open.createdAt, lang)}</dd>
          </dl>
        </Dialog>
      )}
    </div>
  );
}
