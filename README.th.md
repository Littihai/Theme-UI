# Theme UI

แม่แบบ Flutter สำหรับระบบภายในองค์กร: เปลือกของแอป (shell), design system และชุดชิ้นส่วน UI ของแพลตฟอร์ม
[Lotline](https://github.com/Littihai/TMCL-PR) ที่สร้างใหม่ด้วย Flutter เพื่อให้โปรเจกต์ถัดไปเริ่มจากตรงนี้ได้เลย
(เวอร์ชัน React อยู่ในประวัติของ repo นี้จนถึง v1.0.0 ดู [docs/decisions/0040](docs/decisions/0040-flutter-stack.md))
หน้าจอไทย/อังกฤษ ไม่มี backend: การเข้าสู่ระบบเป็นแบบจำลองในหน่วยความจำ และทุกหน้าแสดงข้อมูลตัวอย่าง

ดูตัวอย่างสด: **https://littihai.github.io/Theme-UI/** (deploy จาก `main` โดย `.github/workflows/pages.yml`) · English version: [README.md](README.md)

[![หน้า Landing ของตัวอย่างสด](docs/screenshot-landing.jpg)](https://littihai.github.io/Theme-UI/)

## มีอะไรให้บ้าง

| ส่วน | สิ่งที่ได้ |
|---|---|
| **Shell** | แถบบนแถวเดียวพร้อมเมนูใหญ่ หรือแถบข้าง / แถบไอคอน (ผู้ใช้เลือกเอง); เมนูมือถือ; เมนูบัญชี; กระดิ่งแจ้งเตือน; Ctrl-K palette; หน้าต่าง Settings ที่เป็น route (`/settings/<section>`); ส่วนท้าย; แถบสถานะ API |
| **หน้าตา** | สว่าง / มืด / ตามระบบ (ตอนสลับ สีใหม่ขยายเป็นวงกลมจากปุ่ม); สีหลัก 9 สี; ฟอนต์ 4 แบบ (อ่านไทยได้ทุกแบบ); โทนเทา 5 แบบ; มุมโค้ง; ความกว้างหน้า; แถบติดหน้าจอ; ขอบแนบหรือลอย; ขนาดตัวอักษร S/M/L; คอนทราสต์สูง; ลดการเคลื่อนไหว ทั้งหมดจำต่อเครื่องและอ่านก่อนวาดเฟรมแรก |
| **ชุด UI** | Button, StatusBadge, Avatar, AppSwitch, AppTabs, AppSelect (ค้นหาได้ จัดกลุ่ม มีโทน), DateRangeField, Field / AppTextField / FormAlert, Pager, AppTable (เรียง เลือกหลายแถว เป็นการ์ดบนมือถือ), ส่งออก CSV, BulkBar, ActiveFilters, Breadcrumb, PageHeader, StageCard / ActionBar, Timeline, Skeleton, StatTile / CountUp, EmptyState, ErrorState, InlineError (ตามชนิดความล้มเหลว), ComingSoon, toast, ไดอะล็อกยืนยัน/ขอเหตุผล, กราฟเส้น/โดนัท/แท่งที่วาดด้วย `CustomPainter` |
| **ท่อส่ง** | ซอง `ApiResponse<T>` + client บน `http` ที่ต่ออายุ token เอง ตรวจ offline/timeout และแปลงความล้มเหลวเป็นข้อความอ่านได้ (มี unit test); store ของ auth และสิทธิ์ (`context.stores.auth.can("APP.MODULE.ACTION")`, `RequireCan`); พจนานุกรมสองภาษาพร้อมสคริปต์ตรวจใน CI; ไอคอน Material Symbols ผ่าน `AppIcon` เท่านั้น |
| **ก่อนเข้าสู่ระบบ** | Landing page (hero, bento ว่ามีอะไรบ้าง, 4 ขั้นเริ่มต้น, ทางเข้า) พร้อมเอฟเฟกต์เลื่อนเผย การ์ดเอียงตามเมาส์ และ header แบบกระจก; หน้า Login 2 แบบ (`Brand.loginLayout`) |
| **หน้าตัวอย่าง** | Home (ภาพรวม), Components (ทุกชิ้นส่วน), Tables (หน้ารายการครบชุด), Charts, Document (ขั้นตอน + อนุมัติ), Manual (คู่มือในแอป), Admin (หน้าที่ต้องมีสิทธิ์) |

## รัน

ต้องมี Flutter 3.47 ขึ้นไป (Dart 3.13) และ Chrome สำหรับ target web

```powershell
flutter pub get
flutter run -d chrome
```

เข้าสู่ระบบด้วยบัญชีตัวอย่าง: `admin` / `demo` (ทุกสิทธิ์) หรือ `staff` / `demo` (มีแค่ DEMO.VIEW) ทั้งสองเป็นบัญชีสมมติ
อยู่ใน `lib/services/auth_service.dart`

```powershell
flutter analyze --fatal-infos     # lint + type
dart run tool/check_i18n.dart     # ทุก key ที่โค้ดเรียกต้องมีใน lib/i18n ทั้งสองภาษา (และรายงาน key ที่ไม่ได้ใช้)
flutter test                      # unit test (API client, token, Customize, kit) + widget test การเข้าสู่ระบบ
flutter build web --release       # ลง build/web (ใส่ --base-href /<repo>/ สำหรับ GitHub Pages)
```

## เริ่มโปรเจกต์ใหม่จากแม่แบบนี้

1. สร้าง repository จากอันนี้ (Use this template หรือ clone แล้วเปลี่ยน remote)
2. เปลี่ยนชื่อผลิตภัณฑ์ใน `lib/constants/brand.dart` เปลี่ยนโลโก้ใน `lib/components/ui/app_logo.dart`, `web/favicon.svg`
   และ `web/icons` และตั้งชื่อแท็บกับสีหน้าโหลดใน `web/index.html`
3. แทนที่ `lib/services/auth_service.dart` ด้วยการเรียก API จริงผ่าน `ApiClient` (คงเมธอด `login`, `verify`, `logout`,
   `forgetSession` ไว้) `AuthStore` ไม่ต้องแก้ client จัดการ token การต่ออายุ และซองความล้มเหลวให้แล้ว
   URL ของ API ส่งผ่าน `--dart-define=API_BASE=…` (ดู `.env.example`)
4. เพิ่มโมดูล: `lib/modules/<name>/` (หน้า), `lib/services/<name>_service.dart` (ที่เดียวที่เรียก API),
   route ใน `lib/app/router.dart`, รายการเมนูใน `lib/constants/nav.dart` และ `lib/i18n/dict_<name>.dart`
5. ลบโมดูล showcase (`lib/modules/showcase` และ key `demo.*`, `home.*`) เมื่อมีหน้าจริงแล้ว

คู่มือในแอป (`/manual`) อธิบายขั้นตอนเดียวกัน; [docs/theme-guide.md](docs/theme-guide.md) อธิบาย token, ตัวเลือก Customize
และ layout; [docs/decisions](docs/decisions) เก็บการตัดสินใจด้านการออกแบบที่แม่แบบนี้รับมาและที่ตัดสินใจเอง

## กฎของบ้าน

- ข้อความที่ผู้ใช้เห็นทุกคำมี `L(th, en)` ใน `lib/i18n` และเรียกผ่าน `context.t('key')` ห้ามฝังข้อความในวิดเจ็ต
- สี ระยะ เงา และมุม มาจาก `context.tokens` (`lib/theme/tokens.dart`) เท่านั้น
- ไอคอนใช้ Material Symbols ผ่าน `AppIcon` เพิ่มชื่อใน `lib/constants/icons.dart` ก่อน ห้ามใช้อีโมจิ
- รายการที่อาจเกิน 10 แถวต้องแบ่งหน้า (`Paged` + `Pager`) ปุ่ม primary หน้าละหนึ่ง `danger` เฉพาะสิ่งที่ย้อนกลับไม่ได้
  ความผิดพลาดที่ผู้ใช้ต้องแก้แสดงข้างช่อง ไม่ใช่ toast
- สิทธิ์เช็กจุดเดียวฝั่งหน้าจอ และ API เช็กซ้ำทุกครั้ง

## โครงสร้าง

```
lib/app          app.dart (root, token, router), router.dart, scope.dart (store ทั้งหมด, context.t / tokens / breakpoints)
lib/components   ui/ (ชุดชิ้นส่วน), charts/ (กราฟ CustomPainter)
lib/constants    brand.dart (ชื่อ, prefix ของ storage), nav.dart (เมนู), icons.dart (AppIcon)
lib/i18n         dict.dart (I18nStore, t), dict_core / dict_appearance / dict_demo / dict_landing, errors.dart (ข้อความ HTTP)
lib/layouts      app_shell, header, mega_menu, side_nav, nav_drawer (มือถือ), public_frame, app_footer, api_status_bar
lib/modules      auth/, common/ (404, 403), home/, landing/ (ก่อนเข้าสู่ระบบ), settings/, showcase/ (ลบได้)
lib/overlays     toast, confirm_dialog, command_palette, account_menu, notifications_panel, customize_panel, theme_reveal, anchored
lib/services     api_client.dart, auth_service.dart
lib/state        auth_store.dart, notifications_store.dart
lib/theme        tokens.dart, appearance.dart, theme_store.dart, app_theme.dart, fonts.dart
lib/util         prefs, format, csv (+ ดาวน์โหลดบนเว็บ), platform
tool             check_i18n.dart
test             api_client, appearance / tokens, i18n, kit, การไหลของแอป
web              index.html (หน้าโหลด, ธีมที่จำไว้ก่อน Flutter), favicon, manifest, icons
```

## สัญญาอนุญาต

ยังไม่ได้เลือก จนกว่าจะเพิ่มไฟล์สัญญาอนุญาต สงวนสิทธิ์ทั้งหมดโดยผู้เขียน ฟอนต์ที่รวมมาอยู่ภายใต้ SIL Open Font License
