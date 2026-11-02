import type { StatusTone } from "@/types";

/**
 * Fictional rows for the demo pages. Nothing here describes a real company; a project deletes this file with the
 * showcase module and reads from its own services instead.
 */
export type OrderStatus = "draft" | "pending" | "approved" | "rejected" | "shipped";

export interface Order {
  id: string;
  customer: string;
  item: string;
  qty: number;
  amount: number;
  status: OrderStatus;
  /** ISO instant */
  createdAt: string;
  owner: string;
}

export const STATUS_TONE: Record<OrderStatus, StatusTone> = { draft: "neutral", pending: "warn", approved: "ok", rejected: "stop", shipped: "accent" };

const CUSTOMERS = ["Siam Metal Works", "Bangkok Packaging", "Northern Foods", "Delta Plastics", "Eastern Textiles", "Chao Phraya Logistics", "Lanna Electronics", "Gulf Chemicals"];
const ITEMS = ["Steel sheet 2mm", "Corrugated box L", "Pallet wrap 500m", "PET resin 25kg", "Cotton yarn 40s", "Label roll 100×50", "Copper wire 1.5", "Solvent 20L"];
const OWNERS = ["Arisa", "Somchai", "Nattaya", "Prasert", "Kanya"];
const STATUSES: OrderStatus[] = ["draft", "pending", "pending", "approved", "approved", "approved", "rejected", "shipped", "shipped"];

/** a deterministic pseudo-random sequence, so every reload shows the same rows */
function rng(seed: number) {
  let x = seed;
  return () => { x = (x * 1664525 + 1013904223) % 4294967296; return x / 4294967296; };
}

export const ORDERS: Order[] = (() => {
  const r = rng(42);
  const now = Date.now();
  return Array.from({ length: 57 }, (_, i) => {
    const qty = Math.round(5 + r() * 240);
    const price = 40 + Math.round(r() * 1800);
    return {
      id: `SO-2026-${String(1001 + i).padStart(4, "0")}`,
      customer: CUSTOMERS[Math.floor(r() * CUSTOMERS.length)],
      item: ITEMS[Math.floor(r() * ITEMS.length)],
      qty,
      amount: qty * price,
      status: STATUSES[Math.floor(r() * STATUSES.length)],
      createdAt: new Date(now - Math.floor(r() * 60) * 86_400_000 - Math.floor(r() * 86_400_000)).toISOString(),
      owner: OWNERS[Math.floor(r() * OWNERS.length)],
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
})();

/** the last eight weeks, oldest first: "W35"… */
export const WEEK_LABELS = Array.from({ length: 8 }, (_, i) => `W${36 + i}`);
export const WEEKLY_ORDERS = [38, 42, 35, 51, 47, 58, 61, 66];
export const WEEKLY_SHIPPED = [30, 36, 33, 44, 45, 50, 57, 59];

/** amount per status, for the donut */
export function amountByStatus(rows: Order[]): { status: OrderStatus; value: number; count: number }[] {
  const m = new Map<OrderStatus, { value: number; count: number }>();
  for (const o of rows) {
    const cur = m.get(o.status) ?? { value: 0, count: 0 };
    m.set(o.status, { value: cur.value + o.amount, count: cur.count + 1 });
  }
  return (["approved", "shipped", "pending", "draft", "rejected"] as OrderStatus[]).filter((s) => m.has(s)).map((s) => ({ status: s, ...m.get(s)! }));
}

/** amount per customer, largest first */
export function amountByCustomer(rows: Order[]): { key: string; label: string; value: number; sub?: string }[] {
  const m = new Map<string, { value: number; n: number }>();
  for (const o of rows) { const c = m.get(o.customer) ?? { value: 0, n: 0 }; m.set(o.customer, { value: c.value + o.amount, n: c.n + 1 }); }
  return [...m.entries()].map(([k, v]) => ({ key: k, label: k, value: v.value, sub: `${v.n}` })).sort((a, b) => b.value - a.value).slice(0, 6);
}
