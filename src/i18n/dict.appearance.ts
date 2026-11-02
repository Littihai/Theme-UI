/**
 * Customize (look and layout) strings, merged into DICT in ./dict.ts. Both languages for every key.
 */
type Entry = { th: string; en: string };
const e = (th: string, en: string): Entry => ({ th, en });

export const APPEARANCE_DICT: Record<string, Entry> = {
  "cz.title": e("ปรับแต่ง", "Customize"),
  "cz.subtitle": e("ปรับหน้าตาและการจัดวางให้เข้ากับการใช้งาน จำไว้ในเครื่องนี้", "Shape how the app looks and is laid out. Remembered on this device."),
  "cz.group.appearance": e("ลักษณะที่ปรากฏ", "Appearance"),
  "cz.group.layout": e("การจัดวาง", "Layout"),
  "cz.reset": e("คืนค่าเริ่มต้น", "Reset to default"),
  "cz.resetHint": e("คืนทุกอย่างในหน้านี้เป็นค่าเริ่มต้น (โหมดสีและขนาดตัวอักษรไม่เปลี่ยน)", "Put everything here back to its default (colour scheme and text size stay)"),
  "cz.openSettings": e("ตั้งค่าทั้งหมด", "All settings"),
  "cz.menuItem": e("ปรับแต่งหน้าตา", "Customize the look"),

  "cz.scheme": e("โหมดสี", "Color scheme"),
  "cz.scheme.desc": e("สีของหน้าและเมนู เลือกครั้งเดียวเปลี่ยนทั้งระบบ", "The page and its navigation, in one pick."),

  "set.accent.indigo": e("คราม", "Indigo"),
  "set.accent.azure": e("ฟ้า", "Azure"),
  "set.accent.slate": e("เทาน้ำเงิน", "Slate"),

  "cz.font": e("ฟอนต์", "Font family"),
  "cz.font.desc": e("ตัวอักษรที่ใช้ทั้งระบบ ทุกแบบแสดงภาษาไทยได้", "The typeface used across the app. Every one reads Thai."),
  "cz.font.inter": e("Inter", "Inter"),
  "cz.font.plex": e("IBM Plex", "IBM Plex"),
  "cz.font.sarabun": e("Sarabun", "Sarabun"),
  "cz.font.system": e("ของเครื่อง", "System"),

  "cz.base": e("โทนสีเทา", "Theme base"),
  "cz.base.desc": e("ชุดสีเทาเบื้องหลังทุกพื้นผิว", "The gray palette behind every surface."),
  "cz.base.slate": e("เทาน้ำเงิน", "Slate"),
  "cz.base.gray": e("เทาเย็น", "Gray"),
  "cz.base.zinc": e("เทาซิงก์", "Zinc"),
  "cz.base.neutral": e("เทากลาง", "Neutral"),
  "cz.base.stone": e("เทาอุ่น", "Stone"),

  "cz.radius": e("มุมโค้ง", "Corner radius"),
  "cz.radius.desc": e("ความมนของมุมปุ่ม การ์ด และช่องกรอก", "How round corners are drawn."),
  "cz.radius.none": e("เหลี่ยม", "Sharp"),
  "cz.radius.sm": e("ปกติ", "Default"),
  "cz.radius.md": e("นุ่ม", "Soft"),
  "cz.radius.lg": e("มน", "Round"),
  "cz.radius.xl": e("มนมาก", "Rounder"),

  "cz.nav": e("เมนูหลัก", "Navigation"),
  "cz.nav.desc": e("ตำแหน่งของเมนูหลัก บนมือถือจะเป็นเมนูที่ลงมาจากปุ่มเสมอ", "Where the main menu lives. A phone always gets the drop-down menu."),
  "cz.nav.top": e("แถบด้านบน", "Top bar"),
  "cz.nav.side": e("แถบด้านข้าง", "Sidebar"),
  "cz.nav.rail": e("แถบข้างแบบไอคอน", "Icon sidebar"),
  "cz.nav.collapse": e("ย่อเมนู", "Collapse menu"),
  "cz.nav.expand": e("ขยายเมนู", "Expand menu"),

  "cz.container": e("ความกว้างหน้า", "Container width"),
  "cz.container.desc": e("เนื้อหาของหน้ากว้างได้มากแค่ไหน", "How wide the page content runs."),
  "cz.container.narrow": e("แคบ", "Narrow"),
  "cz.container.standard": e("ปกติ", "Standard"),
  "cz.container.wide": e("กว้าง", "Wide"),
  "cz.container.fluid": e("เต็มจอ", "Fluid"),

  "cz.sticky": e("การติดแถบเมนู", "Navbar behavior"),
  "cz.sticky.desc": e("ให้แถบเมนูค้างอยู่บนจอขณะเลื่อนหน้า", "Keep the navbar visible while scrolling."),
  "cz.sticky.header": e("เฉพาะแถบบน", "Top bar only"),
  "cz.sticky.all": e("ทั้งหมด", "Everything"),
  "cz.sticky.none": e("เลื่อนหายไป", "Scrolls away"),

  "cz.navStyle": e("รูปแบบเมนู", "Navigation style"),
  "cz.navStyle.desc": e("ให้เมนูแนบขอบจอ หรือลอยอยู่เหนือหน้า", "Attach the navigation to the edges, or let it float."),
  "cz.panelStyle": e("รูปแบบแผงข้าง", "Offcanvas style"),
  "cz.panelStyle.desc": e("ให้แผงข้างและเมนูบนมือถือแนบขอบจอ หรือลอย", "Attach side panels to the edges, or let them float."),
  "cz.edges.attached": e("แนบขอบ", "Attached"),
  "cz.edges.floating": e("ลอย", "Floating"),
};
