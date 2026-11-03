/// The two languages of the UI.
enum Lang {
  th,
  en;

  static Lang? parse(String? s) => s == 'th' ? Lang.th : s == 'en' ? Lang.en : null;
}

/// A bilingual string: every word a person can see is one of these, in `lib/i18n/dict_*.dart` or inline for data
/// (never a bare Thai or English literal in a widget).
class L {
  const L(this.th, this.en);
  final String th;
  final String en;

  String of(Lang lang) => lang == Lang.th ? th : en;

  @override
  String toString() => 'L($th / $en)';
}
