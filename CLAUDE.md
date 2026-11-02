# Theme UI

แม่แบบหน้าจอ (React 19 + TypeScript + Vite) สำหรับสร้างระบบภายในองค์กร: เปลือกของแอป, design system และชุดชิ้นส่วน UI
ไม่มี backend ในแม่แบบ — การเข้าสู่ระบบเป็นแบบจำลองใน `src/services/authService.ts` และทุกหน้าใช้ข้อมูลตัวอย่าง
**ข้อมูลทั้งหมดเป็นข้อมูลสมมติ** ห้ามใส่ชื่อบริษัท ชื่อคน ที่อยู่ IP รหัสผ่าน หรือข้อมูลจริงใด ๆ ลงใน repo

เอกสาร: `README.md` / `README.th.md` (ภาพรวมและวิธีเริ่มโปรเจกต์), `docs/theme-guide.md` (token, Customize, layout),
`docs/decisions/` (บันทึกการตัดสินใจที่รับมาจากโปรเจกต์ต้นทาง — เพิ่มไฟล์ใหม่ทุกครั้งที่ตัดสินใจเรื่องสำคัญ ไม่แก้ประวัติเดิม)

## วิธีทำงานกับผู้ใช้

- สื่อสาร อธิบาย ถาม และขออนุญาตเป็นภาษาไทย ใช้ภาษาอังกฤษเฉพาะโค้ด คอมเมนต์ commit และ error message
- อธิบาย logic และผลกระทบก่อนเขียนโค้ดทุกครั้ง ถ้ามีหลายทางเลือก ให้เทียบข้อดีข้อเสียแล้วให้ผู้ใช้เลือก
- เมื่อแก้ของเดิม: ไม่ลบโค้ดที่ใช้งานได้โดยไม่จำเป็น บอกชื่อไฟล์และจุดที่แก้ และตรวจผลกระทบต่อส่วนอื่น
- รายงานผลตามจริง: build ไม่ผ่านต้องบอกพร้อมผลลัพธ์ ขั้นที่ข้ามต้องบอก สิ่งที่ยังไม่ได้ตรวจห้ามพูดว่าเสร็จ
- Commit message ภาษาอังกฤษ ทำทีละเรื่องเล็ก ไม่ push จนกว่าผู้ใช้สั่ง

## ข้อห้าม

- ห้าม commit ความลับ (token, connection string, อีเมลจริง) ค่าที่ต่างกันต่อเครื่องอยู่ใน `.env.local` (ดู `.env.example`)
- ห้ามใช้คำว่า "ตีกลับ" ใช้ **"ไม่อนุมัติ"** ห้ามใช้อีโมจิเป็นไอคอน ใช้ Octicons ผ่าน `<Icon>` (เพิ่มชื่อใน `src/constants/icons.ts` ก่อน)
- ห้ามฝังข้อความที่ผู้ใช้เห็นในโค้ด ต้องมี `{ th, en }` ใน `src/i18n` (`npm run check:i18n` ตรวจให้)
- ห้ามใส่ค่าสี/ระยะตรง ๆ ในคอมโพเนนต์ อ่านจาก token ใน `src/styles/tokens.css`

## คำสั่งที่ใช้บ่อย

```powershell
npm ci; npm run dev          # http://localhost:5173 — บัญชีตัวอย่าง admin / demo และ staff / demo
npx tsc --noEmit             # ตรวจ type
npm run check:i18n           # key ที่โค้ดเรียกต้องมีในพจนานุกรม
npm run build                # ตรวจ type + build
```

## ข้อตกลงในการเขียนโค้ด

- โมดูลใหม่: `src/modules/<name>/` (หน้า เริ่มด้วย `PageHeader`), `src/services/<name>Service.ts` (ที่เดียวที่เรียก API ผ่าน
  `services/apiClient.ts`), route ใน `src/app/routes.tsx` ใต้ `<AppShell>`, รายการเมนูใน `src/constants/nav.ts`,
  คำใน `src/i18n/dict.<name>.ts` แล้ว spread เข้า `DICT`
- ทุก endpoint ตอบด้วย `ApiResponse<T>` (`src/types`) — `useLoad` + `InlineError` ใน `components/ui/DataKit.tsx` จัดการ
  loading / ความล้มเหลวตามชนิดให้
- สิทธิ์เช็กจุดเดียว: `usePermissions().can("APP.MODULE.ACTION")` / `<RequireCan>` ฝั่งหน้าจอ และ API ต้องเช็กซ้ำทุกครั้ง
- รายการเกิน 10 แถวต้องแบ่งหน้าด้วย `usePaged` + `Pager`; ปุ่ม primary หน้าละหนึ่ง; `danger` เฉพาะสิ่งที่ย้อนกลับไม่ได้;
  ความผิดพลาดที่ผู้ใช้ต้องแก้แสดงข้างช่อง (`Field error` / `FormAlert`) ไม่ใช่ toast
- ชื่อผลิตภัณฑ์ โลโก้ และ prefix ของ localStorage อยู่ใน `src/constants/brand.ts` (prefix ต้องตรงกับ `public/theme-init.js`)
- หน้า Login มี 2 แบบ เลือกที่ `BRAND.loginLayout`; หน้า Landing ก่อนเข้าสู่ระบบอยู่ใน `src/modules/landing` (CSS ของตัวเอง `landing.css`)
- หน้าแบบรายการดู `src/modules/showcase/TablesPage.tsx`, หน้าเอกสารดู `DocumentPage.tsx`, หน้าภาพรวมดู `ChartsPage.tsx`
  โมดูล showcase ทั้งหมดลบได้เมื่อมีหน้าจริง
