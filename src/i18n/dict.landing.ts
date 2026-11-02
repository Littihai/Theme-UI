/**
 * The landing page (modules/landing) and the numbers the sign-in panel shares with it. Both languages for every key.
 */
type Entry = { th: string; en: string };
const e = (th: string, en: string): Entry => ({ th, en });

export const LANDING_DICT: Record<string, Entry> = {
  // ── the numbers (BRAND.stats) ──
  "stat.components": e("ชิ้นส่วน UI", "UI components"),
  "stat.patterns": e("แบบหน้า", "page patterns"),
  "stat.accents": e("สีหลัก", "accent colours"),
  "stat.languages": e("ภาษา", "languages"),

  // ── header links and the back-to-top button ──
  "lp.nav.features": e("มีอะไรบ้าง", "What is inside"),
  "lp.nav.how": e("เริ่มอย่างไร", "How to start"),
  "lp.nav.built": e("สร้างด้วย", "Built with"),
  "lp.top": e("กลับขึ้นด้านบน", "Back to top"),

  // ── hero ──
  "lp.eyebrow": e("แม่แบบ · v{v}", "Starter · v{v}"),
  "lp.hero.t1": e("เริ่มระบบภายในองค์กรถัดไป", "Start your next internal app"),
  "lp.hero.t2": e("จากแม่แบบนี้", "from this starter"),
  "lp.hero.sub": e("เปลือกของแอปที่พร้อมใช้: แถบบน เมนู การตั้งค่า การแจ้งเตือน ชุดสี ชุดฟอนต์ และชิ้นส่วน UI ทุกตัว ในสองภาษา ปรับแต่งได้โดยผู้ใช้ และไม่มีไลบรารี UI ภายนอก", "An application shell ready to build on: top bar, menus, settings, notifications, colour and type tokens, every UI piece, in two languages, customisable by the person using it, with no UI library underneath."),
  "lp.cta.how": e("ดูวิธีเริ่ม", "See how to start"),
  "lp.hint": e("เลื่อนลงเพื่อดูต่อ", "Scroll to see more"),

  // ── what is inside ──
  "lp.f.title": e("มีอะไรอยู่ในแม่แบบ", "What is inside"),
  "lp.f.sub": e("ทุกอย่างที่หน้าจอของระบบภายในต้องมี ยกมาจากแพลตฟอร์มที่ใช้งานจริง และตัดส่วนที่ผูกกับธุรกิจออก", "Everything the screens of an internal system need, lifted from a platform in use and stripped of its business modules."),
  "lp.f1.t": e("ปรับแต่งได้โดยผู้ใช้", "Customisable by the person"),
  "lp.f1.d": e("โหมดสว่าง/มืด สีหลัก 9 สี ฟอนต์ 4 แบบ โทนเทา มุมโค้ง ตำแหน่งเมนู ความกว้างหน้า จำต่อเครื่องและใส่ก่อนวาดเฟรมแรก", "Light/dark, nine accents, four typefaces, grey bases, corner radius, menu layout and page width — remembered per device and applied before the first paint."),
  "lp.f2.t": e("สองภาษาตั้งแต่ต้น", "Two languages from the start"),
  "lp.f2.d": e("ทุกข้อความมี { th, en } ในพจนานุกรม สคริปต์ตรวจใน CI ว่าไม่มี key หาย", "Every string has { th, en } in the dictionary; a CI check makes sure none is missing."),
  "lp.f3.t": e("สิทธิ์เช็กจุดเดียว", "Permissions, checked in one place"),
  "lp.f3.d": e("usePermissions().can(\"APP.MODULE.ACTION\") และ <RequireCan> ซ่อนเมนูและหน้า; API ต้องเช็กซ้ำเสมอ", "usePermissions().can(\"APP.MODULE.ACTION\") and <RequireCan> hide entries and pages; the API checks again, always."),
  "lp.f4.t": e("ชุดชิ้นส่วนครบ", "The whole kit"),
  "lp.f4.d": e("ปุ่ม ป้าย สวิตช์ แท็บ Select ค้นหาได้ ช่วงวันที่ ฟอร์ม ไดอะล็อก toast แบ่งหน้า ตารางเรียงได้ โครงโหลด สถานะว่างและผิดพลาด", "Buttons, badges, switches, tabs, a searchable Select, date ranges, forms, dialogs, toasts, paging, sortable tables, skeletons, empty and error states."),
  "lp.f5.t": e("แบบหน้าสำเร็จรูป", "Page patterns"),
  "lp.f5.d": e("หน้ารายการ หน้าเอกสารแบบมีขั้นตอน หน้าภาพรวมพร้อมกราฟ คู่มือ และหน้าที่ต้องมีสิทธิ์ ให้คัดลอกไปต่อ", "A list page, a staged document, an overview with charts, a manual and a gated page, ready to copy."),
  "lp.f6.t": e("ซอง API เดียว", "One API envelope"),
  "lp.f6.d": e("ทุก endpoint ตอบ ApiResponse<T>; client จัดการ token, offline, timeout และแปลงความล้มเหลวเป็นข้อความที่อ่านได้", "Every endpoint answers ApiResponse<T>; the client handles tokens, offline, timeouts and turns every failure into readable words."),

  // ── how to start ──
  "lp.h.title": e("เริ่มโปรเจกต์ใน 4 ขั้น", "A project in four steps"),
  "lp.h.sub": e("ตั้งแต่กด Use this template จนถึงโมดูลแรกของคุณ", "From Use this template to your first module."),
  "lp.h1.t": e("สร้าง repo จากแม่แบบ", "Create a repo from the template"),
  "lp.h1.d": e("npm ci แล้ว npm run dev เปิด localhost:5173 เข้าด้วย admin / demo", "npm ci, then npm run dev; open localhost:5173 and sign in with admin / demo."),
  "lp.h2.t": e("เปลี่ยนชื่อและโลโก้", "Rename and re-brand"),
  "lp.h2.d": e("ชื่อ บริษัท และ prefix ของ storage ใน src/constants/brand.ts โลโก้ใน AppLogo.tsx และ favicon.svg", "The name, the company and the storage prefix in src/constants/brand.ts; the mark in AppLogo.tsx and favicon.svg."),
  "lp.h3.t": e("ต่อกับระบบเข้าสู่ระบบจริง", "Wire up the real sign-in"),
  "lp.h3.d": e("แทน authService.ts ด้วยการเรียก API คง login / verify / logout / forgetSession ไว้ AuthProvider ไม่ต้องแก้", "Replace authService.ts with API calls, keeping login / verify / logout / forgetSession; the AuthProvider stays as it is."),
  "lp.h4.t": e("เพิ่มโมดูลแรก", "Add the first module"),
  "lp.h4.d": e("src/modules/<name>, service ของมัน, route, รายการเมนูใน nav.ts และพจนานุกรม แล้วลบโมดูล showcase", "src/modules/<name>, its service, a route, an entry in nav.ts and a dictionary; then delete the showcase module."),
  "lp.h.rules": e("กฎของบ้าน", "House rules"),
  "lp.rule.r1": e("ทุกข้อความมี { th, en } — ไม่ฝังข้อความในโค้ด", "Every string has { th, en } — no text in components"),
  "lp.rule.r2": e("สีและระยะมาจาก token เท่านั้น", "Colours and spacing come only from the tokens"),
  "lp.rule.r3": e("ไอคอนเป็น Octicons ผ่าน <Icon> ไม่ใช้อีโมจิ", "Icons are Octicons through <Icon>; no emoji"),
  "lp.rule.r4": e("รายการเกิน 10 แถวต้องแบ่งหน้า", "A list past 10 rows is paged"),
  "lp.rule.r5": e("ปุ่ม primary หน้าละหนึ่ง; danger เฉพาะสิ่งที่ย้อนกลับไม่ได้", "One primary button per page; danger only for what cannot be undone"),
  "lp.h.note": e("คู่มือฉบับเต็มอยู่ในแอปที่หน้า Manual หลังเข้าสู่ระบบ", "The full guide is the Manual page inside the app."),

  // ── built with + the way in ──
  "lp.b.title": e("สร้างด้วย", "Built with"),
  "lp.b.note": e("ไม่มีไลบรารี UI ภายนอก: ชิ้นส่วนทุกตัวเป็น React + CSS custom properties ของโปรเจกต์เอง", "No UI library underneath: every piece is the project's own React and CSS custom properties."),
  "lp.c.title": e("ลองเลย", "Try it"),
  "lp.c.sub": e("เข้าสู่ระบบด้วยบัญชีตัวอย่าง แล้วเปิดแผง Customize (ไอคอนพู่กัน) เพื่อดูหน้าตาเปลี่ยนตามที่เลือก", "Sign in with a sample account, then open Customize (the brush) and watch the look change as you pick."),
  "lp.c.try": e("บัญชีตัวอย่าง:", "Sample accounts:"),
};
