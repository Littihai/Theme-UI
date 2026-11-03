# Theme UI

แม่แบบหน้าจอ (Flutter 3.47 + Dart 3.13) สำหรับสร้างระบบภายในองค์กร: เปลือกของแอป, design system และชุดชิ้นส่วน UI
ไม่มี backend ในแม่แบบ — การเข้าสู่ระบบเป็นแบบจำลองใน `lib/services/auth_service.dart` และทุกหน้าใช้ข้อมูลตัวอย่าง
**ข้อมูลทั้งหมดเป็นข้อมูลสมมติ** ห้ามใส่ชื่อบริษัท ชื่อคน ที่อยู่ IP รหัสผ่าน หรือข้อมูลจริงใด ๆ ลงใน repo

เอกสาร: `README.md` / `README.th.md` (ภาพรวมและวิธีเริ่มโปรเจกต์), `docs/theme-guide.md` (token, Customize, layout),
`docs/decisions/` (บันทึกการตัดสินใจ — 0001–0039 รับมาจากโปรเจกต์ต้นทาง React, 0040 ขึ้นไปของ Flutter —
เพิ่มไฟล์ใหม่ทุกครั้งที่ตัดสินใจเรื่องสำคัญ ไม่แก้ประวัติเดิม)

## วิธีทำงานกับผู้ใช้

- สื่อสาร อธิบาย ถาม และขออนุญาตเป็นภาษาไทย ใช้ภาษาอังกฤษเฉพาะโค้ด คอมเมนต์ commit และ error message
- อธิบาย logic และผลกระทบก่อนเขียนโค้ดทุกครั้ง ถ้ามีหลายทางเลือก ให้เทียบข้อดีข้อเสียแล้วให้ผู้ใช้เลือก
- เมื่อแก้ของเดิม: ไม่ลบโค้ดที่ใช้งานได้โดยไม่จำเป็น บอกชื่อไฟล์และจุดที่แก้ และตรวจผลกระทบต่อส่วนอื่น
- รายงานผลตามจริง: build ไม่ผ่านต้องบอกพร้อมผลลัพธ์ ขั้นที่ข้ามต้องบอก สิ่งที่ยังไม่ได้ตรวจห้ามพูดว่าเสร็จ
- Commit message ภาษาอังกฤษ ทำทีละเรื่องเล็ก ไม่ push จนกว่าผู้ใช้สั่ง

## ข้อห้าม

- ห้าม commit ความลับ (token, connection string, อีเมลจริง) ค่าที่ต่างกันต่อเครื่องส่งผ่าน `--dart-define` (ดู `.env.example`)
- ห้ามใช้คำว่า "ตีกลับ" ใช้ **"ไม่อนุมัติ"** ห้ามใช้อีโมจิเป็นไอคอน ใช้ Material Symbols ผ่าน `AppIcon` เท่านั้น
  (เพิ่มชื่อใน `lib/constants/icons.dart` ก่อน ห้ามเรียก `Icons.*` ในวิดเจ็ต)
- ห้ามฝังข้อความที่ผู้ใช้เห็นในโค้ด ต้องมี `L(th, en)` ใน `lib/i18n` (`dart run tool/check_i18n.dart` ตรวจให้)
- ห้ามใส่ค่าสี/ระยะตรง ๆ ในวิดเจ็ต อ่านจาก `context.tokens` (`lib/theme/tokens.dart`)

## คำสั่งที่ใช้บ่อย

```powershell
flutter pub get; flutter run -d chrome   # บัญชีตัวอย่าง admin / demo และ staff / demo
flutter analyze --fatal-infos            # lint + type
dart run tool/check_i18n.dart            # key ที่โค้ดเรียกต้องมีในพจนานุกรมทั้งสองภาษา
flutter test                             # unit + widget tests
flutter build web --base-href /Theme-UI/ # build สำหรับ GitHub Pages
```

## ข้อตกลงในการเขียนโค้ด

- โมดูลใหม่: `lib/modules/<name>/` (หน้า = `ShellPage(child: PageBody(children: [PageHeader(...), ...]))`),
  `lib/services/<name>_service.dart` (ที่เดียวที่เรียก API ผ่าน `ApiClient`), route ใน `lib/app/router.dart` ใต้ `ShellRoute`,
  รายการเมนูใน `lib/constants/nav.dart`, คำใน `lib/i18n/dict_<name>.dart` แล้ว spread เข้า `dict` ใน `dict.dart`
- ทุก endpoint ตอบด้วย `ApiResponse<T>` (`lib/services/api_client.dart`) — `InlineError` ใน `components/ui/error_state.dart`
  เลือกไอคอนและข้อความตามชนิดความล้มเหลวให้
- สถานะของแอปอยู่ใน store (`ChangeNotifier`) ภายใต้ `AppScope` อ่านด้วย `context.stores`, `context.t('key')`, `context.tokens`
- สิทธิ์เช็กจุดเดียว: `context.stores.auth.can("APP.MODULE.ACTION")` / `RequireCan` ฝั่งหน้าจอ และ API ต้องเช็กซ้ำทุกครั้ง
- รายการเกิน 10 แถวต้องแบ่งหน้าด้วย `Paged` + `Pager`; ปุ่ม primary หน้าละหนึ่ง; `danger` เฉพาะสิ่งที่ย้อนกลับไม่ได้ (ถามด้วย `confirm`);
  ความผิดพลาดที่ผู้ใช้ต้องแก้แสดงข้างช่อง (`Field.error` / `FormAlert`) ไม่ใช่ toast
- ชื่อผลิตภัณฑ์ โลโก้ และ prefix ของ storage อยู่ใน `lib/constants/brand.dart` (prefix ต้องตรงกับ `web/index.html`)
- หน้า Login มี 2 แบบ เลือกที่ `Brand.loginLayout`; หน้า Landing ก่อนเข้าสู่ระบบอยู่ใน `lib/modules/landing`
- หน้าแบบรายการดู `lib/modules/showcase/tables_page.dart`, หน้าเอกสารดู `document_page.dart`, หน้าภาพรวมดู `charts_page.dart`
  โมดูล showcase ทั้งหมดลบได้เมื่อมีหน้าจริง (พร้อม key `demo.*` / `home.*`)
