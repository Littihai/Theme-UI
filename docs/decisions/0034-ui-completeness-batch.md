# 0034 — The UI completeness batch: sorting and export, work-today tiles, global search, printed documents, phone and scanner mode, charts, manuals, empty states, the item drawer, document history, the permission matrix, module settings

Status: accepted and built.

## Context

After the warehouse batch (ADR 0028–0033) the owner asked what the web application still lacked as a product and
then asked for all of it. The gaps were in six groups: finding and leaving with data (sort, CSV, search); knowing
what waits (home tiles, event notifications); paper (orders, pick lists, count sheets, slips, lot labels); the shop
floor (phones, scanners, installable); understanding (charts, manuals, empty states, one item from every side, a
document's history); and administration (who may do what, module settings, personal conveniences).

## Decision

- **Lists.** Every main list sorts by its column headers (`useSort`/`SortTh`) and exports what is shown as CSV
  (`exportCsv`, UTF-8 with a byte-order mark). No new dependency.
- **Work today.** The home page shows, by permission, the counts that wait in each module (receipts, picks, counts,
  pending request lines, overdue orders, late suggestions, held lots, forecasts due). Event notifications are sent
  by permission with a once-a-day dedupe: count ready, order sent, order closed by itself, lots held, lots expiring,
  the purchasing digest (`LotExpiryWorker`, `PurchasingDigestWorker`).
- **Search.** `GET api/v1/search?q=` finds items, locations, suppliers, customers, lots, pick lists, counts and
  orders, each behind the right that reads it; the Ctrl-K palette shows them under "documents" and list pages open
  filtered from a hit (`?q=`).
- **Paper.** One print stylesheet (`lib/printDoc.ts`) for the purchase order, the pick list (bin and item/lot QR
  per line), the blind count sheet, the receipt slip with the lot QR, and lot labels (lot big, item small). The scan
  station reads lot labels (`LOT:item:lot`).
- **Shop floor.** Card layout under 720 px on receiving, picking, lots and counts; a scanner mode (big type and
  buttons, a tone and a buzz on pass/fail, the screen kept awake) remembered per browser; a web-app manifest and a
  worker that caches only the icons, so the app installs on a phone but never serves stale data.
- **Charts.** Hand-drawn SVG (`OverviewCharts`) on the WMS, MRP, S&OP and purchasing overviews; no chart library.
- **Manuals.** Each module has a Manual tab written from the user's side (`manual.<app>.ts`, `{ th, en }`), and the
  help button on every tab opens the matching section.
- **Empty states** say why the list is empty and offer the next step (`EmptyState`).
- **The item drawer** (`overlays/ItemDrawer.tsx`). Every item code is a link that opens one item seen from every
  side without leaving the page: stock by bin and lot, lots, on order (`GET po/lines?itemId=`), demand, movements.
  Each tab is shown only to someone who may open the module it reads from, and loads only when looked at.
- **Document history.** A purchase order's detail carries its receipts; the page shows a timeline (made, sent,
  every receipt, closed in full or short, cancelled, or the step still waiting). A pick list shows its own from the
  header and the lines (made and reserved, picked so far by scan or by hand, confirmed or cancelled). No new audit
  table: the history is read from the facts the documents already keep.
- **The permission matrix** (Settings → Roles → Matrix) is read-only: active roles across, permissions down, a mark
  where the role holds it, filtered by application and text, exported as CSV. Grants stay on the Roles tab. It needs
  both `IAM.ROLE.VIEW` and `IAM.PERMISSION.VIEW`.
- **Module settings** (`sql/165_wms_po_settings.sql`, `master.AppSetting` with `IsSystem = 0`): the warehouse gets
  its own Settings tab (edited by `WMS.LOT.MANAGE`; `ModuleSettingsController` maps `wms` to that right) with
  `wms.lotExpiringDays` (the expiring-soon window of the daily digest, 1–90) and `wms.lotDigestEnabled`. Purchase
  orders live inside the purchasing application, so their two settings sit on the existing purchasing Settings tab
  under `Module = 'pr'`: `pr.poDigestEnabled` and `pr.poDefaultExpectedDays` (the expected date offered when an order
  is made, 0–365; the orders overview carries it so the page needs no admin right to read it). A setting exists only
  together with the code that reads it.
- **Personal conveniences** stay in the browser (`localStorage`), never in data: the location last used at the
  scan station and in the receiving dialog is offered first the next time (a putaway rule still overrides it).

## Consequences

- Nothing new to install; the bundle grows by the SVG charts, the manuals and the drawer only.
- The item drawer is the one place that joins five modules on screen, so a change to any of their list endpoints
  shows up there first; its tabs fail independently (`InlineError` per tab).
- The history timelines are derived, so a receipt deleted from the ledger (which the API does not allow) would
  vanish from the order's history too; that is the intended meaning.
- Phase 2 of the warehouse and this batch are not pushed yet; the GitHub workflow has still never run.
