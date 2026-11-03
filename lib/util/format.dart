import '../i18n/dict.dart';

/// Number and date formatting without a locale package: the house formats are few and fixed.

/// 1234567 → "1,234,567"; a fraction keeps up to [decimals] places.
String fmtInt(num n, {int decimals = 0}) {
  final neg = n < 0;
  final s = n.abs().toStringAsFixed(decimals);
  final dot = s.indexOf('.');
  final whole = dot < 0 ? s : s.substring(0, dot);
  final frac = dot < 0 ? '' : s.substring(dot);
  final b = StringBuffer();
  for (var i = 0; i < whole.length; i++) {
    if (i > 0 && (whole.length - i) % 3 == 0) b.write(',');
    b.write(whole[i]);
  }
  return '${neg ? '-' : ''}$b$frac';
}

/// An amount of money: thousands separated, no decimals.
String fmtMoney(num n) => fmtInt(n.round());

/// A short number for a tile: 1.2k, 3.4M.
String fmtCompact(num n) {
  if (n.abs() >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
  if (n.abs() >= 1000) return '${(n / 1000).toStringAsFixed(1)}k';
  return fmtInt(n);
}

const _thMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const _enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/// "5 Mar 2026" / "5 มี.ค. 2569" (Thai dates carry the Buddhist year, as the forms of a Thai company do).
String fmtDate(DateTime d, Lang lang) {
  final l = d.toLocal();
  return lang == Lang.th ? '${l.day} ${_thMonths[l.month - 1]} ${l.year + 543}' : '${l.day} ${_enMonths[l.month - 1]} ${l.year}';
}

String two(int n) => n.toString().padLeft(2, '0');

/// "5 Mar 2026 14:05"
String fmtDateTime(DateTime d, Lang lang) {
  final l = d.toLocal();
  return '${fmtDate(l, lang)} ${two(l.hour)}:${two(l.minute)}';
}

/// "just now", "12 min ago", "3 hr ago", then the date.
String relativeTime(DateTime d, I18nStore i18n, {DateTime? now}) {
  final diff = (now ?? DateTime.now()).difference(d);
  if (diff.inMinutes < 1) return i18n.t('notif.justNow');
  if (diff.inMinutes < 60) return i18n.t('notif.minAgo', {'n': diff.inMinutes});
  if (diff.inHours < 24) return i18n.t('notif.hrAgo', {'n': diff.inHours});
  return fmtDate(d, i18n.lang);
}

/// 2026-03-05 for CSV cells and inputs.
String isoDate(DateTime d) => '${d.year}-${two(d.month)}-${two(d.day)}';
