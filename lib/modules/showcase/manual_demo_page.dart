import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../components/ui/manual_page.dart';
import '../../i18n/dict.dart';

/// The starter's own guide, in the same ManualPage frame every module's guide uses. The text is data ([L]), so a
/// module writes its guide the same way: a list of sections in its own file.
class ManualDemoPage extends StatelessWidget {
  const ManualDemoPage({super.key});

  static const sections = [
    ManualSection(id: 'start', title: L('เริ่มโปรเจกต์ใหม่', 'Start a project'), blocks: [
      ManualP(L('แม่แบบนี้เป็น GitHub Template: กด Use this template แล้ว clone มา จากนั้นติดตั้ง Flutter 3.47 ขึ้นไปและรันคำสั่งด้านล่าง เข้าสู่ระบบด้วยบัญชีตัวอย่าง admin / demo (ทุกสิทธิ์) หรือ staff / demo (DEMO.VIEW)',
          'This starter is a GitHub Template: press Use this template, clone it, install Flutter 3.47 or newer and run the commands below. Sign in with a sample account: admin / demo (every permission) or staff / demo (DEMO.VIEW).')),
      ManualCode('flutter pub get\nflutter run -d chrome\n\nflutter analyze\ndart run tool/check_i18n.dart\nflutter test\nflutter build web --base-href /<repo>/'),
      ManualTip(L('ค่าที่ต่างกันต่อเครื่อง (URL ของ API) ส่งผ่าน --dart-define=API_BASE=… ไม่ใส่ลงใน repo', 'Per-machine values (the API URL) go in --dart-define=API_BASE=…, never into the repository.')),
    ]),
    ManualSection(id: 'brand', title: L('เปลี่ยนชื่อและโลโก้', 'Rename and re-brand'), blocks: [
      ManualSteps([
        L('lib/constants/brand.dart: ชื่อผลิตภัณฑ์ บริษัท tagline แบบหน้า Login และ prefix ของ storage', 'lib/constants/brand.dart: the product name, the company, the tagline, the sign-in layout and the storage prefix.'),
        L('lib/components/ui/app_logo.dart: วาดโลโก้ใหม่ใน LogoPainter (canvas 100×100) และเปลี่ยน web/favicon.svg', 'lib/components/ui/app_logo.dart: redraw the mark in LogoPainter (a 100×100 canvas) and replace web/favicon.svg.'),
        L('web/index.html: ชื่อแท็บ สีพื้นของหน้าโหลด และ web/manifest.json', 'web/index.html: the tab title, the loading screen colours, and web/manifest.json.'),
      ]),
    ]),
    ManualSection(id: 'auth', title: L('ต่อระบบเข้าสู่ระบบจริง', 'Wire up the real sign-in'), blocks: [
      ManualP(L('แทนที่ lib/services/auth_service.dart ด้วยการเรียก API ผ่าน ApiClient โดยคงเมธอด login / verify / logout / forgetSession ไว้ AuthStore ไม่ต้องแก้ สิทธิ์มาจาก SessionUser.permissions และเช็กด้วย context.stores.auth.can("APP.MODULE.ACTION") หรือครอบ route ด้วย RequireCan',
          'Replace lib/services/auth_service.dart with calls to your API through ApiClient, keeping login / verify / logout / forgetSession; AuthStore does not change. Permissions come from SessionUser.permissions and are checked with context.stores.auth.can("APP.MODULE.ACTION") or by wrapping a route in RequireCan.')),
      ManualCode("// login\nfinal res = await api.post('/auth/login', body: {'username': u, 'password': p});\nawait api.setTokens(res.data['accessToken'], res.data['refreshToken'], persist: rememberMe);"),
      ManualTip(L('API ต้องเช็กสิทธิ์ซ้ำทุกครั้ง ฝั่งหน้าจอซ่อนได้แค่สิ่งที่ผู้ใช้ไม่ควรเห็น', 'The API must check every permission again; the client only hides what the person should not see.'), warn: true),
    ]),
    ManualSection(id: 'module', title: L('เพิ่มโมดูลแรก', 'Add the first module'), blocks: [
      ManualSteps([
        L('lib/modules/<name>/: หน้าต่าง ๆ เริ่มด้วย PageHeader และครอบด้วย ShellPage + PageBody', 'lib/modules/<name>/: the pages, each opening with PageHeader inside ShellPage + PageBody.'),
        L('lib/services/<name>_service.dart: ที่เดียวที่เรียก API ทุก endpoint ตอบด้วย ApiResponse<T>', 'lib/services/<name>_service.dart: the only place that calls the API; every endpoint answers ApiResponse<T>.'),
        L('route ใน lib/app/router.dart ใต้ ShellRoute และรายการเมนูใน lib/constants/nav.dart (ใส่ permission ถ้ามี)', 'A route in lib/app/router.dart under the ShellRoute, and an entry in lib/constants/nav.dart (with its permission when gated).'),
        L('คำใน lib/i18n/dict_<name>.dart แล้ว spread เข้า dict ใน dict.dart', 'The words in lib/i18n/dict_<name>.dart, spread into dict in dict.dart.'),
        L('ลบ lib/modules/showcase และ key demo.* / home.* เมื่อมีหน้าจริง', 'Delete lib/modules/showcase and the demo.* / home.* keys once real pages exist.'),
      ]),
    ]),
    ManualSection(id: 'i18n', title: L('สองภาษา', 'Two languages'), blocks: [
      ManualP(L('ทุกข้อความที่ผู้ใช้เห็นต้องมี { th, en } ในพจนานุกรม และอ่านผ่าน context.t("key") ข้อมูลที่เป็นสองภาษา (ชื่อขั้นตอน คำอธิบาย) ใช้คลาส L แล้ว context.pick(l) สคริปต์ tool/check_i18n.dart ตรวจว่า key ที่โค้ดเรียกมีจริง และรายงาน key ที่ไม่ได้ใช้ (รันใน CI)',
          'Every visible string has { th, en } in the dictionary and is read with context.t("key"). Bilingual data (a stage name, a description) is an L read with context.pick(l). tool/check_i18n.dart verifies every key the code asks for exists and lists unused ones (it runs in CI).')),
    ]),
    ManualSection(id: 'tokens', title: L('สี ระยะ และ Customize', 'Tokens and Customize'), blocks: [
      ManualP(L('สี มุม เงา และขนาดตัวอักษรอ่านจาก context.tokens (AppTokens, ThemeExtension) เท่านั้น ห้ามใส่ค่าสีในวิดเจ็ต ตัวเลือก Customize (สีหลัก ฟอนต์ โทนเทา มุม คอนทราสต์ การเคลื่อนไหว เมนู ความกว้าง) อยู่ใน lib/theme/appearance.dart และถูกพับเข้า token ใน AppTokens.build',
          'Colours, corners, elevation and type sizes come from context.tokens (AppTokens, a ThemeExtension) and nowhere else; a widget never holds a hex value. The Customize choices (accent, typeface, grey base, radius, contrast, motion, menu, page width) live in lib/theme/appearance.dart and are folded into the tokens by AppTokens.build.')),
      ManualTip(L('เพิ่มสีหลักใหม่ = เพิ่มค่าใน Accent และ accentSeeds หนึ่งบรรทัด แล้วใส่ชื่อใน dict_core (set.accent.<id>)', 'A new accent is one value in Accent and one line in accentSeeds, plus its name in dict_core (set.accent.<id>).')),
    ]),
    ManualSection(id: 'rules', title: L('กฎของบ้าน', 'House rules'), blocks: [
      ManualSteps(numbered: false, [
        L('รายการที่อาจเกิน 10 แถวต้องแบ่งหน้าด้วย Paged + Pager', 'A list that can pass 10 rows is paged with Paged + Pager.'),
        L('ปุ่ม primary หน้าละหนึ่ง danger เฉพาะสิ่งที่ย้อนกลับไม่ได้ (ถามยืนยันด้วย confirm)', 'One primary button per page; danger only for what cannot be undone (ask with confirm).'),
        L('ความผิดพลาดที่ผู้ใช้ต้องแก้แสดงข้างช่อง (Field.error / FormAlert) ไม่ใช่ toast', 'A mistake the person must fix is shown beside the field (Field.error / FormAlert), not as a toast.'),
        L('ไอคอนผ่าน AppIcon เท่านั้น ห้ามอีโมจิ', 'Icons through AppIcon only; no emoji.'),
        L('ใช้คำว่า "ไม่อนุมัติ" ไม่ใช้คำอื่นที่หยาบกว่า', 'Say "not approved", never a harsher word.'),
      ]),
    ]),
    ManualSection(id: 'deploy', title: L('Build และ deploy', 'Build and deploy'), blocks: [
      ManualP(L('.github/workflows/ci.yml รัน analyze, check_i18n, test และ build ทุก push; pages.yml build เว็บด้วย --base-href /<repo>/ แล้ว deploy ไป GitHub Pages พร้อม 404.html เพื่อให้ลิงก์ลึก (เช่น /tables) เปิดได้',
          '.github/workflows/ci.yml runs analyze, check_i18n, test and build on every push; pages.yml builds the web app with --base-href /<repo>/ and deploys it to GitHub Pages with a 404.html so deep links (such as /tables) open.')),
    ]),
  ];

  @override
  Widget build(BuildContext context) =>
      ManualPage(title: context.t('nav.manual'), subtitle: context.t('demo.manual.sub'), sections: sections);
}
