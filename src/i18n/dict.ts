/**
 * The platform's bilingual dictionary (Thai / English). Keys are dotted namespaces. Add both `th` and `en` for every
 * string; a missing key falls back to the key itself (visible in dev). A module keeps its own words in
 * ./dict.<module>.ts and spreads them in at the bottom, like the demo's.
 */
import { APPEARANCE_DICT } from "./dict.appearance";
import { DEMO_DICT } from "./dict.demo";
import { LANDING_DICT } from "./dict.landing";
import { DEFAULT_LANG, storageKey } from "@/constants/brand";

export type Lang = "th" | "en";

/** the localStorage key of the language choice (I18nProvider writes it; public/theme-init.js reads it before React) */
export const LANG_KEY = storageKey("lang");

/** Current language for non-React code (libs, helpers). React code uses useI18n(). */
export function getLang(): Lang {
  try {
    const s = localStorage.getItem(LANG_KEY);
    if (s === "th" || s === "en") return s;
  } catch {
    /* ignore */
  }
  return DEFAULT_LANG;
}

/** Translate outside the React tree (falls back to the key). */
export function tr(key: string, vars?: Record<string, string | number>): string {
  const entry = DICT[key];
  let s = entry ? entry[getLang()] : key;
  if (vars) for (const k in vars) s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k]));
  return s;
}

type Entry = { th: string; en: string };

export const DICT: Record<string, Entry> = {
  // ── common ──
  "common.all": { th: "ทั้งหมด", en: "All" },
  "table.export": { th: "CSV", en: "CSV" },
  "table.exportHint": { th: "ดาวน์โหลด {n} แถวตามตัวกรองเป็นไฟล์ CSV (เปิดใน Excel ได้)", en: "Download the {n} filtered rows as CSV (opens in Excel)" },
  "table.sortHint": { th: "คลิกเพื่อเรียง คลิกซ้ำเพื่อกลับด้าน คลิกอีกครั้งเพื่อยกเลิก", en: "Click to sort, again to reverse, once more to clear" },
  "common.save": { th: "บันทึก", en: "Save" },
  "common.cancel": { th: "ยกเลิก", en: "Cancel" },
  "common.ok": { th: "ตกลง", en: "OK" },
  "common.close": { th: "ปิด", en: "Close" },
  "common.search": { th: "ค้นหา", en: "Search" },
  "common.loading": { th: "กำลังโหลด…", en: "Loading…" },
  "select.placeholder": { th: "เลือก", en: "Select" },
  "select.search": { th: "พิมพ์เพื่อค้นหา", en: "Type to search" },
  "toast.close": { th: "ปิดการแจ้งเตือน", en: "Dismiss" },
  "range.from": { th: "ตั้งแต่วันที่", en: "From" },
  "range.to": { th: "ถึงวันที่", en: "To" },
  "range.7d": { th: "7 วัน", en: "7 days" },
  "range.month": { th: "เดือนนี้", en: "This month" },
  "range.quarter": { th: "ไตรมาสนี้", en: "This quarter" },
  "pager.label": { th: "แบ่งหน้า", en: "Pages" },
  "pager.perPage": { th: "แถวต่อหน้า", en: "Rows per page" },
  "pager.page": { th: "หน้า {n}", en: "Page {n}" },
  "bulk.label": { th: "รายการที่เลือก", en: "Selected rows" },
  "bulk.selected": { th: "เลือกแล้ว {n} รายการ", en: "{n} selected" },
  "bulk.clear": { th: "ล้างการเลือก", en: "Clear selection" },
  "crumb.label": { th: "ตำแหน่งของหน้านี้", en: "Breadcrumb" },
  "crumb.more": { th: "แสดงระดับที่ซ่อนอยู่", en: "Show the hidden levels" },
  "filter.date": { th: "วันที่", en: "Date" },
  "filter.search": { th: "ค้นหา", en: "Search" },
  "filter.found": { th: "พบ {n} รายการ", en: "{n} found" },
  "filter.remove": { th: "ลบตัวกรอง {name}", en: "Remove the filter {name}" },
  "filter.clearAll": { th: "ล้างทั้งหมด", en: "Clear all" },
  "select.none": { th: "ไม่มีตัวเลือก", en: "Nothing to choose" },
  "select.clear": { th: "ล้างข้อความ", en: "Clear text" },
  "select.noMatch": { th: "ไม่พบ \"{q}\"", en: "No match for \"{q}\"" },
  "select.noMatchHint": { th: "ลองคำอื่น หรือล้างคำค้นเพื่อดูทั้งหมด", en: "Try another word, or clear the search to see all" },
  "common.back": { th: "ย้อนกลับ", en: "Back" },
  "soon.badge": { th: "เร็วๆ นี้ · Coming soon", en: "Coming soon" },
  "soon.title": { th: "โมดูล{name}กำลังพัฒนา", en: "The {name} module is under development" },
  "soon.body": {
    th: "หน้านี้ยังไม่เปิดใช้งาน ทีมกำลังเชื่อมต่อข้อมูลและฟังก์ชันเข้ากับแพลตฟอร์ม โปรดกลับมาตรวจสอบอีกครั้งเร็วๆ นี้",
    en: "This page isn't available yet. The team is wiring its data and features into the platform — please check back soon.",
  },

  // ── footer ──
  "footer.rights": { th: "สงวนลิขสิทธิ์", en: "All rights reserved" },

  // ── header ──
  "header.search": { th: "ค้นหา", en: "Search" },
  "header.themeDark": { th: "โหมดมืด", en: "Dark mode" },
  "header.themeLight": { th: "โหมดสว่าง", en: "Light mode" },
  "header.searchAll": { th: "ค้นหาทุกอย่าง...", en: "Search everything..." },

  // ── nav ──
  "nav.home": { th: "หน้าแรก", en: "Home" },
  "nav.menu": { th: "เมนู", en: "Menu" },
  "nav.mega": { th: "เมนูใช้งาน", en: "Apps" },
  "nav.closeMenu": { th: "ปิดเมนู", en: "Close menu" },

  // ── command palette ──
  "palette.searchPh": { th: "ค้นหาแอป คำสั่งผลิต เครื่องจักร พนักงาน...", en: "Search apps, work orders, machines, people..." },
  "palette.empty": { th: "ไม่พบผลลัพธ์ที่ตรงกับสิทธิ์การเข้าถึงของคุณ", en: "No results match your access permissions" },

  // ── usage overview (home) ──
  "module.disabled.title": { th: "โมดูลนี้ถูกปิดใช้งาน", en: "This module is turned off" },
  "module.disabled.desc": { th: "ผู้ดูแลระบบได้ปิดการใช้งานโมดูลนี้ไว้ชั่วคราว หากต้องการใช้งานกรุณาติดต่อผู้ดูแลระบบ", en: "An administrator has temporarily disabled this module. Please contact your administrator if you need access." },
  "home.welcomeBody": { th: "มีใบขอซื้อรออนุมัติ {pr} ใบ และการแจ้งเตือนที่ยังไม่ได้อ่าน {n} รายการ", en: "You have {pr} requests waiting for your approval and {n} unread notifications." },
  "home.title": { th: "ภาพรวมของฉัน", en: "My overview" },
  "home.sub": { th: "งานที่รอคุณ และสถานะของโมดูลที่คุณใช้ (ข้อมูลจริงจากระบบ)", en: "What is waiting on you and how your modules are doing (live data)" },

  // ── admin (IAM) ──
  "log.showing": { th: "แสดง {from}–{to} จาก {total} รายการ", en: "Showing {from}–{to} of {total}" },
  "log.prev": { th: "ก่อนหน้า", en: "Prev" },
  "log.next": { th: "ถัดไป", en: "Next" },
  "error.retry": { th: "ลองใหม่", en: "Try again" },
  "error.home": { th: "กลับหน้าแรก", en: "Back to home" },
  "error.403.desc": { th: "บัญชีของคุณไม่มีสิทธิ์ในหน้านี้ ถ้าควรจะมี ติดต่อผู้ดูแลระบบให้เพิ่มบทบาท", en: "Your account has no right to this page; if it should, ask an administrator to add the role" },
  "net.offline": { th: "ไม่มีการเชื่อมต่ออินเทอร์เน็ต ข้อมูลที่เห็นอาจไม่ใช่ล่าสุด", en: "No internet connection; what you see may be out of date" },
  "net.down": { th: "เซิร์ฟเวอร์ไม่ตอบ ลองใหม่อีกครั้งหรือรอสักครู่", en: "The server is not answering; try again or wait a moment" },
  "net.slow": { th: "เซิร์ฟเวอร์ตอบช้ากว่าปกติ คำขอล่าสุดหมดเวลา", en: "The server is slower than usual; the last request timed out" },
  "net.retry": { th: "โหลดใหม่", en: "Reload" },
  "error.reload": { th: "โหลดหน้าใหม่", en: "Reload page" },
  "error.crash.title": { th: "เกิดข้อผิดพลาดที่ไม่คาดคิด", en: "Something went wrong" },
  "error.crash.desc": { th: "ระบบทำงานผิดพลาดชั่วคราว ลองโหลดหน้าใหม่อีกครั้ง หากยังพบปัญหากรุณาแจ้งผู้ดูแลระบบ", en: "The page hit an unexpected error. Try reloading; if it keeps happening, contact your administrator." },
  "error.404.title": { th: "ไม่พบหน้าที่ต้องการ", en: "Page not found" },
  "error.404.desc": { th: "หน้าที่คุณเปิดอาจถูกย้ายหรือไม่มีอยู่แล้ว", en: "The page you opened may have moved or no longer exists." },
  "error.signIn": { th: "เข้าสู่ระบบ", en: "Sign in" },
  "error.ref": { th: "รหัสอ้างอิง", en: "Reference" },
  "error.back": { th: "ย้อนกลับ", en: "Go back" },
  "error.copyRef": { th: "คัดลอกรหัสอ้างอิง", en: "Copy the reference" },
  "error.copied": { th: "คัดลอกแล้ว", en: "Copied" },
  "error.k.offline": { th: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้", en: "Can't reach the server" },
  "error.k.timeout": { th: "เซิร์ฟเวอร์ไม่ตอบกลับ", en: "The server didn't answer" },
  "error.k.input": { th: "คำขอไม่ถูกต้อง", en: "Bad request" },
  "error.k.signin": { th: "ต้องเข้าสู่ระบบก่อน", en: "Sign-in required" },
  "error.k.forbidden": { th: "ไม่มีสิทธิ์เข้าถึง", en: "No permission" },
  "error.k.outdated": { th: "เซิร์ฟเวอร์ API ไม่ตรงรุ่นกับหน้าจอ", en: "The API server is out of step with this page" },
  "error.k.missing": { th: "ไม่พบข้อมูล", en: "Not found" },
  "error.k.stale": { th: "ข้อมูลบนหน้าจอเก่ากว่าเซิร์ฟเวอร์", en: "This page is out of date" },
  "error.k.busy": { th: "เซิร์ฟเวอร์ไม่ว่าง", en: "The server is busy" },
  "error.k.down": { th: "ระบบไม่พร้อมใช้งานชั่วคราว", en: "Temporarily unavailable" },
  "error.k.server": { th: "ระบบขัดข้อง", en: "Server error" },
  "error.h.forbidden": { th: "หากต้องใช้งานส่วนนี้ ติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์", en: "Ask your administrator for access if you need this." },
  "error.h.outdated": { th: "แจ้งผู้ดูแลระบบให้อัปเดต API เป็นรุ่นเดียวกับหน้าจอ แล้วโหลดหน้านี้ใหม่", en: "Ask your administrator to update the API to the version this page expects, then reload." },
  "error.h.server": { th: "ถ้ายังพบซ้ำ แจ้งผู้ดูแลระบบพร้อมรหัสอ้างอิงด้านล่าง", en: "If it keeps happening, tell your administrator and quote the reference below." },

  // ── notifications ──
  "notif.title": { th: "การแจ้งเตือน", en: "Notifications" },
  "notif.markAll": { th: "อ่านทั้งหมด", en: "Mark all read" },
  "notif.empty": { th: "ไม่มีการแจ้งเตือน", en: "No notifications" },
  "notif.justNow": { th: "เมื่อสักครู่", en: "just now" },
  "notif.minAgo": { th: "{n} นาทีที่แล้ว", en: "{n} min ago" },
  "notif.hrAgo": { th: "{n} ชม.ที่แล้ว", en: "{n} hr ago" },

  // ── profile menu ──
  "menu.settings": { th: "การตั้งค่า", en: "Settings" },
  "menu.signOut": { th: "ออกจากระบบ", en: "Sign out" },

  // ── auth / login ──
  "login.signIn": { th: "เข้าสู่ระบบ", en: "Sign in" },
  "login.demoTitle": { th: "เข้าชมด้วยบัญชีตัวอย่าง", en: "Enter with a sample account" },
  "login.demoHint": { th: "ข้อมูลสมมติทั้งหมด กดเพื่อเข้าด้วยบัญชีนั้นโดยไม่ต้องพิมพ์รหัสผ่าน", en: "All data is fictional. Press one to enter as that account, no password typed" },
  "stage.open": { th: "เปิดดู", en: "Open" },
  "stage.fold": { th: "ยุบ", en: "Fold" },
  "login.password": { th: "รหัสผ่าน", en: "Password" },
  "login.passwordPh": { th: "รหัสผ่าน", en: "Password" },
  "login.remember": { th: "จดจำการเข้าสู่ระบบ", en: "Remember me" },
  "login.forgot": { th: "ลืมรหัสผ่าน?", en: "Forgot password?" },
  "login.showPassword": { th: "แสดงรหัสผ่าน", en: "Show password" },
  "login.hidePassword": { th: "ซ่อนรหัสผ่าน", en: "Hide password" },
  "login.signingIn": { th: "กำลังเข้าสู่ระบบ…", en: "Signing in…" },
  "login.failed": { th: "เข้าสู่ระบบไม่สำเร็จ", en: "Sign-in failed" },

  // ── settings window + account menu ──
  "set.title": { th: "ตั้งค่า", en: "Settings" },
  "set.group.personal": { th: "ส่วนตัว", en: "Personal" },
  "set.group.admin": { th: "ผู้ดูแลระบบ", en: "Administration" },
  "set.group.other": { th: "อื่น ๆ", en: "Other" },
  "set.nav.general": { th: "ทั่วไป", en: "General" },
  "set.nav.account": { th: "บัญชี", en: "Account" },
  "set.nav.about": { th: "เกี่ยวกับระบบ", en: "About" },
  "set.desc.general": { th: "ธีม ภาษา และคีย์ลัดบนอุปกรณ์นี้", en: "Theme, language and shortcuts on this device" },
  "set.desc.account": { th: "ข้อมูลบัญชี รหัสผ่าน และการออกจากระบบ", en: "Account details, password and sign-out" },
  "set.desc.about": { th: "เวอร์ชันและข้อมูลระบบสำหรับติดต่อฝ่าย IT", en: "Version and system details for IT support" },
  "set.appearance": { th: "ธีม", en: "Appearance" },
  "set.theme.light": { th: "สว่าง", en: "Light" },
  "set.theme.dark": { th: "มืด", en: "Dark" },
  "set.theme.system": { th: "ตามระบบ", en: "System" },
  "set.accent": { th: "สีหลัก", en: "Accent colour" },
  "set.accentDesc": { th: "สีของปุ่ม ลิงก์ และจุดเน้นทั่วทั้งระบบ จำไว้ในเครื่องนี้", en: "The colour of buttons, links and highlights across the app — remembered on this device" },
  "set.accent.steel": { th: "น้ำเงิน", en: "Blue" },
  "set.accent.teal": { th: "เขียวน้ำทะเล", en: "Teal" },
  "set.accent.green": { th: "เขียว", en: "Green" },
  "set.accent.violet": { th: "ม่วง", en: "Violet" },
  "set.accent.rose": { th: "กุหลาบ", en: "Rose" },
  "set.accent.amber": { th: "ส้มอำพัน", en: "Amber" },
  "set.contrast": { th: "ความคมชัด", en: "Contrast" },
  "set.contrastDesc": { th: "ตัวอักษรเข้มขึ้น เส้นขอบชัดขึ้น เหมาะกับจอที่มีแสงสะท้อนหรือสายตาไม่ดี", en: "Darker text and clearer borders — for screens in glare, or for tired eyes" },
  "set.contrast.standard": { th: "ปกติ", en: "Standard" },
  "set.contrast.high": { th: "สูง", en: "High" },
  "set.motion": { th: "การเคลื่อนไหว", en: "Motion" },
  "set.motionDesc": { th: "ภาพเคลื่อนไหวเล็ก ๆ เช่น ตัวเลขนับขึ้น และการ์ดที่ค่อย ๆ ปรากฏ", en: "Small animations such as counting numbers and cards that fade in" },
  "set.motion.auto": { th: "ตามเครื่อง", en: "Follow device" },
  "set.motion.reduce": { th: "ลดลง", en: "Reduced" },
  "set.motion.full": { th: "เต็มที่", en: "Full" },
  "set.appearanceReset": { th: "คืนค่าเริ่มต้น", en: "Reset to default" },
  "set.appearanceResetHint": { th: "คืนการปรับแต่งทั้งหมดเป็นค่าเริ่มต้น (สีหลัก ฟอนต์ โทนเทา มุมโค้ง เมนู ความกว้าง ความคมชัด การเคลื่อนไหว ฯลฯ) โหมดสี ขนาดตัวอักษร และภาษาไม่เปลี่ยน", en: "Put every customisation back to its default (accent, font, grey base, corners, menu, width, contrast, motion and so on). Colour scheme, text size and language stay." },
  "set.fontSize": { th: "ขนาดตัวอักษร", en: "Text size" },
  "set.fontSizeDesc": { th: "ปรับให้อ่านสบายตา ขยายทั้งหน้าจอ จำไว้ในเครื่องนี้", en: "Make the screen easier to read — scales the whole interface, remembered on this device" },
  "set.fontSizeLabel": { th: "ขนาด", en: "Size" },
  "set.fontSizeS": { th: "เล็ก", en: "Small" },
  "set.fontSizeM": { th: "กลาง", en: "Medium" },
  "set.fontSizeL": { th: "ใหญ่", en: "Large" },
  "set.fontSizeSample": { th: "ตัวอย่างข้อความ — ตรวจสอบทรัพย์สิน 1234567890", en: "Sample text — Asset check 1234567890" },
  "set.language": { th: "ภาษา", en: "Language" },
  "set.languageLabel": { th: "ภาษาที่แสดง", en: "Display language" },
  "set.languageDesc": { th: "ใช้กับเมนูและข้อความทั้งหมดบนอุปกรณ์นี้", en: "Used for menus and text on this device" },
  "set.shortcuts": { th: "คีย์ลัด", en: "Keyboard shortcuts" },
  "set.shortcutsDesc": { th: "ใช้ได้ทุกหน้า (บน Mac ใช้ ⌘ แทน Ctrl)", en: "Work on every page (use ⌘ instead of Ctrl on Mac)" },
  "set.sc.search": { th: "ค้นหาแอปและเมนู", en: "Search apps and menus" },
  "set.sc.settings": { th: "เปิดหน้าตั้งค่า", en: "Open settings" },
  "set.sc.close": { th: "ปิดหน้าต่าง / เมนู", en: "Close window / menu" },
  "set.accountInfo": { th: "ข้อมูลบัญชี", en: "Account details" },
  "set.accountInfoDesc": { th: "ดึงจากข้อมูลพนักงาน — หากไม่ถูกต้องโปรดติดต่อฝ่ายบุคคล", en: "From the employee record — contact HR if anything is wrong" },
  "set.position": { th: "ตำแหน่ง", en: "Position" },
  "set.security": { th: "ความปลอดภัย", en: "Security" },
  "set.passwordDesc": { th: "รหัสใหม่ต้องเป็นไปตามนโยบายรหัสผ่านของบริษัท", en: "The new password must meet the company password policy" },
  "set.signOutDesc": { th: "ออกจากระบบบนอุปกรณ์นี้", en: "Sign out on this device" },
  "set.about.app": { th: "แอปพลิเคชัน", en: "Application" },
  "set.about.product": { th: "ระบบ", en: "Product" },
  "set.about.company": { th: "บริษัท", en: "Company" },
  "set.about.version": { th: "เวอร์ชัน", en: "Version" },
  "set.about.built": { th: "สร้างเมื่อ", en: "Built" },
  "set.about.device": { th: "อุปกรณ์นี้", en: "This device" },
  "set.about.theme": { th: "ธีมที่แสดงอยู่", en: "Theme in use" },
  "set.about.lang": { th: "ภาษา", en: "Language" },
  "set.about.browser": { th: "เบราว์เซอร์", en: "Browser" },
  "set.about.support": { th: "ติดต่อผู้ดูแลระบบ", en: "Contact support" },
  "set.about.supportDesc": { th: "พบปัญหาการใช้งาน ส่งอีเมลถึงผู้ดูแลระบบได้ที่นี่ ระบบจะใส่เวอร์ชันและหน้าที่เปิดอยู่ให้", en: "Having a problem? Email the administrator — the version and current page are filled in for you" },
  "support.subject": { th: "ขอความช่วยเหลือ", en: "Support request" },
  "support.menu": { th: "ติดต่อผู้ดูแลระบบ", en: "Contact support" },
  "acct.menu": { th: "เมนูบัญชี", en: "Account menu" },
  "acct.myAccount": { th: "บัญชีของฉัน", en: "My account" },

  ...APPEARANCE_DICT,
  ...DEMO_DICT,
  ...LANDING_DICT,
};
