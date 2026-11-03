import '../i18n/l.dart';

/// The one place a new project renames itself. Everything that shows the product's name (header, sidebar, footer,
/// sign-in page, browser tab, About) reads from here; the logo lives in components/ui/app_logo.dart.
abstract final class Brand {
  /// the product name, as written (title case)
  static const name = 'Theme UI';

  /// the wordmark beside the logo mark
  static const word = 'theme ui';

  /// the organisation on the footer's small print and the About section
  static const company = 'Your Company Co., Ltd.';

  /// one line under the brand in the footer and on the sign-in page: what the system is
  static const tagline = L('แม่แบบหน้าจอสำหรับระบบภายในองค์กร', 'A UI starter for internal business applications');

  /// the sign-in page: [LoginLayout.split] is a dark brand panel (name, tagline, the numbers below) beside the card;
  /// [LoginLayout.centered] is the card alone on a plain page
  static const loginLayout = LoginLayout.split;

  /// the numbers on the split sign-in panel and the landing page (safe aggregates, never personal data)
  static const stats = [
    BrandStat(30, 'stat.components'),
    BrandStat(7, 'stat.patterns'),
    BrandStat(9, 'stat.accents'),
    BrandStat(2, 'stat.languages'),
  ];

  /// what the landing page's "built with" row lists
  static const builtWith = ['Flutter 3.47', 'Dart 3.13', 'Material 3', 'go_router', 'ThemeExtension tokens', 'Material Symbols'];

  /// the support address on the sign-in page and in Settings > About (fictional)
  static const supportEmail = 'it-support@example.com';
}

enum LoginLayout { split, centered }

class BrandStat {
  const BrandStat(this.value, this.labelKey);
  final int value;
  final String labelKey;
}

/// Storage keys: `app.<name>` (shared_preferences adds its own `flutter.` prefix on every platform). The loading
/// screen in web/index.html reads the colour scheme under the same key before Flutter starts, so change both together.
const storagePrefix = 'app';
String storageKey(String name) => '$storagePrefix.$name';

/// the language every device starts in until the person picks one
const defaultLang = Lang.en;

/// the starting rows-per-page of every paged list (house rule: a list that can pass 10 rows is paged)
const defaultPageSize = 10;

/// the version shown in About and on the landing page (also pubspec.yaml)
const appVersion = '2.0.0';
