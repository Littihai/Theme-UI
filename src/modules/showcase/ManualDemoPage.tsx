import { useI18n } from "@/app/providers/I18nProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { ManualPage, type ManualSection } from "@/components/ui/ManualPage";

/**
 * The manual pattern (components/ui/ManualPage): a table of contents, a search, the steps of each task, and a clean
 * print. The words of this one are the guide to the starter itself, so the page is also the documentation.
 */
const SECTIONS: ManualSection[] = [
  {
    id: "start",
    title: { th: "เริ่มโปรเจกต์ใหม่จากแม่แบบนี้", en: "Start a new project from this starter" },
    blocks: [
      { p: { th: "แม่แบบนี้คือเปลือกของแอป (shell) พร้อม design system: แถบบน เมนู การตั้งค่า การแจ้งเตือน ชุดสี ชุดฟอนต์ และชิ้นส่วน UI ทั้งหมด โค้ดของโมดูลจริงยังไม่มี ให้เพิ่มเอง", en: "This starter is the application shell with its design system: the top bar, the menus, settings, notifications, the colour and type tokens, and every UI piece. There is no business module yet — you add those." } },
      { steps: [
        { th: "สร้าง repository ใหม่จาก Theme-UI (Use this template หรือ clone แล้วเปลี่ยน remote)", en: "Create a repository from Theme-UI (Use this template, or clone and point the remote elsewhere)" },
        { th: "npm ci แล้ว npm run dev เปิด http://localhost:5173 เข้าด้วยบัญชีตัวอย่าง admin / demo", en: "npm ci, then npm run dev; open http://localhost:5173 and sign in with the sample account admin / demo" },
        { th: "เปลี่ยนชื่อผลิตภัณฑ์ใน src/constants/brand.ts และโลโก้ใน src/components/ui/AppLogo.tsx กับ public/favicon.svg", en: "Rename the product in src/constants/brand.ts and replace the mark in src/components/ui/AppLogo.tsx and public/favicon.svg" },
        { th: "ลบโมดูล showcase (src/modules/showcase) และหน้าแรกตัวอย่างเมื่อมีหน้าจริงแล้ว", en: "Delete the showcase module (src/modules/showcase) and the sample home page once real pages exist" },
      ] },
      { tip: { th: "ค่าทุกอย่างที่ผู้ใช้เลือก (ธีม ภาษา ขนาดตัวอักษร การจัดวาง) ถูกจำไว้ใน localStorage ภายใต้ prefix ใน brand.ts ซึ่งต้องตรงกับ public/theme-init.js", en: "Every choice a person makes (theme, language, text size, layout) is remembered in localStorage under the prefix in brand.ts, which must match public/theme-init.js." } },
    ],
  },
  {
    id: "kit",
    title: { th: "ชิ้นส่วน UI และกฎของบ้าน", en: "The UI kit and the house rules" },
    blocks: [
      { p: { th: "ทุกชิ้นส่วนอยู่ใน src/components/ui และดูได้ครบในหน้า Components ลักษณะ (สี ระยะ เงา มุม) อ่านจาก token ใน src/styles/tokens.css เท่านั้น ห้ามใส่ค่าสีตรง ๆ ในคอมโพเนนต์", en: "Every piece lives in src/components/ui and is on the Components page. Its look (colour, spacing, elevation, corners) comes only from the tokens in src/styles/tokens.css — never a hex value in a component." } },
      { steps: [
        { th: "ข้อความที่ผู้ใช้เห็นทุกคำต้องมี { th, en } ใน src/i18n แล้วเรียกผ่าน t(\"key\") — ไม่ฝังข้อความในโค้ด", en: "Every visible string has { th, en } in src/i18n and is read with t(\"key\") — no text in components" },
        { th: "ไอคอนใช้ Octicons ผ่าน <Icon name=\"…\" /> เพิ่มชื่อใน src/constants/icons.ts ก่อนใช้ ห้ามใช้อีโมจิ", en: "Icons are Octicons through <Icon name=\"…\" />; add the name to src/constants/icons.ts first. No emoji." },
        { th: "รายการที่อาจเกิน 10 แถวต้องแบ่งหน้าด้วย usePaged + <Pager>", en: "A list that can pass 10 rows is paged with usePaged + <Pager>" },
        { th: "ปุ่มหลัก (primary) มีได้หน้าละหนึ่งปุ่ม ปุ่ม danger ใช้เฉพาะสิ่งที่ย้อนกลับไม่ได้", en: "One primary button per page; danger only for what cannot be undone" },
        { th: "ความผิดพลาดที่ผู้ใช้ต้องแก้ แสดงข้างช่องกรอก (Field error / FormAlert) ไม่ใช่ toast", en: "A mistake the person must fix is shown beside the field (Field error / FormAlert), not as a toast" },
      ] },
      { warn: { th: "คำว่า \"ตีกลับ\" ห้ามใช้ ให้ใช้ \"ไม่อนุมัติ\" (ดู docs/decisions/0003 ของโปรเจกต์ต้นทาง)", en: "The Thai word \"ตีกลับ\" is never used; say \"ไม่อนุมัติ\" (not approved) instead." } },
    ],
  },
  {
    id: "module",
    title: { th: "เพิ่มโมดูลใหม่", en: "Add a module" },
    blocks: [
      { steps: [
        { th: "สร้าง src/modules/<name>/ ใส่หน้าของโมดูล (เริ่มจาก PageHeader แล้วต่อด้วยเนื้อหา)", en: "Create src/modules/<name>/ with the module's pages (each opens with PageHeader)" },
        { th: "สร้าง src/services/<name>Service.ts ที่เรียก API ผ่าน services/apiClient.ts (ที่เดียวที่คุยกับ backend)", en: "Create src/services/<name>Service.ts that calls the API through services/apiClient.ts (the only place that talks to the backend)" },
        { th: "เพิ่ม route ใน src/app/routes.tsx ใต้ <AppShell> และครอบด้วย <RequireCan code=\"APP.MODULE.VIEW\"> เมื่อต้องมีสิทธิ์", en: "Add the route in src/app/routes.tsx under <AppShell>, wrapped in <RequireCan code=\"APP.MODULE.VIEW\"> when it is gated" },
        { th: "เพิ่มรายการเมนูใน src/constants/nav.ts (เมนูใหญ่ แถบข้าง และเมนูมือถือ อ่านจากที่เดียวกัน)", en: "Add the menu entry in src/constants/nav.ts (the mega menu, the sidebar and the phone drawer all read it)" },
        { th: "สร้าง src/i18n/dict.<name>.ts แล้ว spread เข้า DICT ใน dict.ts", en: "Create src/i18n/dict.<name>.ts and spread it into DICT in dict.ts" },
      ] },
      { tip: { th: "หน้าแบบรายการ ดูตัวอย่างเต็มที่หน้า Tables; หน้าแบบเอกสาร ดูที่หน้า Document; หน้าภาพรวม ดูที่หน้า Charts", en: "For a list page copy the Tables page; for a document the Document page; for an overview the Charts page." } },
    ],
  },
  {
    id: "auth",
    title: { th: "การเข้าสู่ระบบและสิทธิ์", en: "Sign-in and permissions" },
    blocks: [
      { p: { th: "src/services/authService.ts ของแม่แบบเป็นแบบจำลองในหน่วยความจำ (บัญชี admin/demo และ staff/demo) แทนที่ด้วยการเรียก API จริงโดยคงฟังก์ชันเดิมสี่ตัวไว้: login, verify, logout, forgetSession", en: "The starter's src/services/authService.ts is an in-memory stand-in (accounts admin/demo and staff/demo). Replace it with real API calls while keeping the same four functions: login, verify, logout, forgetSession." } },
      { p: { th: "สิทธิ์เช็กจุดเดียวด้วย usePermissions().can(\"APP.MODULE.ACTION\") ฝั่งหน้าจอ และ API ต้องเช็กซ้ำทุกครั้ง การซ่อนปุ่มเป็นมารยาท ไม่ใช่ความปลอดภัย", en: "Permissions are checked in one place on the client, usePermissions().can(\"APP.MODULE.ACTION\"), and again by the API on every call. Hiding a button is a courtesy, not security." } },
      { p: { th: "ทุก endpoint ตอบด้วยซอง ApiResponse<T> (success, message, data, errors) ดู docs/decisions/0024; apiClient แปลงความล้มเหลวทุกแบบ (offline, timeout, 401, 403, 5xx) ให้เป็นข้อความที่อ่านได้ และ InlineError แสดงผลตามชนิด", en: "Every endpoint answers with the ApiResponse<T> envelope (success, message, data, errors), see docs/decisions/0024; apiClient turns every kind of failure (offline, timeout, 401, 403, 5xx) into a readable message and InlineError draws it by kind." } },
    ],
  },
  {
    id: "customize",
    title: { th: "ปรับแต่งหน้าตา (Customize)", en: "Customize (look and layout)" },
    blocks: [
      { p: { th: "ปุ่มพู่กันในแถบบนเปิดแผง Customize: โหมดสี สีหลัก ฟอนต์ โทนสีเทา มุมโค้ง ตำแหน่งเมนู ความกว้างหน้า แถบติดหน้าจอ และรูปแบบขอบ ทุกค่าเป็น attribute บน <html> ที่ CSS อ่าน (ดู src/lib/appearance.ts และ docs/decisions/0015)", en: "The brush in the top bar opens Customize: colour scheme, accent, font, grey base, corner radius, menu layout, page width, sticky bars and edge style. Each is an attribute on <html> that the CSS reads (see src/lib/appearance.ts and docs/decisions/0015)." } },
      { tip: { th: "ต้องการให้โปรเจกต์ใหม่เริ่มด้วยค่าอื่น (เช่น เมนูด้านข้าง) ให้แก้ค่า default ใน CHOICES ของ src/lib/appearance.ts และตารางใน public/theme-init.js ให้ตรงกัน", en: "To start a new project with other defaults (a sidebar, say), change the defaults in CHOICES of src/lib/appearance.ts and the table in public/theme-init.js together." } },
    ],
  },
];

export function ManualDemoPage() {
  const { t } = useI18n();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <PageHeader pretitle={t("navgroup.pages")} title={t("nav.manual")} sub={t("demo.manual.sub")} />
      <ManualPage sections={SECTIONS} prefix="guide" title={t("nav.manual")} />
    </div>
  );
}
