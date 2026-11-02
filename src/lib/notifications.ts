import { useSyncExternalStore } from "react";
import type { AppNotification, StatusTone } from "@/types";

/**
 * The bell's notifications as one small store the whole shell shares: the header badge, the drop-down panel and any
 * page that wants to push one. In-memory for the starter (a page reload starts over). A real app replaces `push` /
 * `markRead` with calls to its API and feeds the store from a push channel (SignalR, SSE, polling) — the components
 * keep reading it the same way.
 */
let items: AppNotification[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

/** Adds one (newest first) and returns it. */
export function pushNotification(n: { title: string; body?: string; tone?: StatusTone; linkUrl?: string }): AppNotification {
  const item: AppNotification = { id: ++seq, title: n.title, body: n.body, tone: n.tone ?? "accent", linkUrl: n.linkUrl, createdAt: new Date().toISOString(), isRead: false };
  items = [item, ...items].slice(0, 50);
  emit();
  return item;
}

export function markRead(id: number) {
  items = items.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  emit();
}

export function markAllRead() {
  items = items.map((n) => (n.isRead ? n : { ...n, isRead: true }));
  emit();
}

export function clearNotifications() {
  items = [];
  emit();
}

/** The list, newest first; re-renders when it changes. */
export function useNotifications(): AppNotification[] {
  return useSyncExternalStore(subscribe, () => items);
}

export function useUnreadCount(): number {
  return useNotifications().filter((n) => !n.isRead).length;
}

/** A few to start with, so the demo's bell has something to show. */
export function seedDemoNotifications(lang: "th" | "en") {
  if (items.length) return;
  const th = lang === "th";
  pushNotification({ title: th ? "ยินดีต้อนรับสู่ Theme UI" : "Welcome to Theme UI", body: th ? "เริ่มจากหน้า Components เพื่อดูชิ้นส่วนทั้งหมด" : "Start at Components to see every building block", tone: "accent", linkUrl: "/components" });
  pushNotification({ title: th ? "ใบขอซื้อ PR-2026-0042 รออนุมัติ" : "PR-2026-0042 is waiting for your approval", body: th ? "ตัวอย่างการแจ้งเตือนจากโมดูล" : "An example of a module's notification", tone: "warn", linkUrl: "/document" });
}
