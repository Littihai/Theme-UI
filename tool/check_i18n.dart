// Verifies the dictionary against the code: every key the code asks for exists in both languages, and lists the keys
// nothing asks for. Run with `dart run tool/check_i18n.dart` (CI runs it; exits 1 on a missing key).
//
// What counts as "asked for": t('…'), context.t('…'), tr('…'), i18n.t('…'), labelKey/descKey/groupKey values,
// and any dotted single-quoted literal that looks like a key (so a key picked from a list or data is seen too).
// A template such as 'demo.status.${x}' counts as the prefix 'demo.status.' and marks every key under it as used.
import 'dart:io';

final keyLike = RegExp(r"'([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9]+)+)'");
final template = RegExp(r"'([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9]+)*\.)\$\{?[^']*'");
final dictEntry = RegExp(r"^\s*'([^']+)':\s*L\('", multiLine: true);
final dictPair = RegExp(r"'([^']+)':\s*L\('((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\)");

void main(List<String> args) {
  final root = Directory('lib');
  final dictFiles = Directory('lib/i18n').listSync().whereType<File>().where((f) => f.path.replaceAll('\\', '/').contains('/dict_')).toList();
  final keys = <String>{};
  final empty = <String>[];
  for (final f in dictFiles) {
    final src = f.readAsStringSync();
    for (final m in dictPair.allMatches(src)) {
      keys.add(m[1]!);
      if (m[2]!.trim().isEmpty || m[3]!.trim().isEmpty) empty.add(m[1]!);
    }
  }

  final exact = <String>{};
  final prefixes = <String>{};
  for (final f in root.listSync(recursive: true).whereType<File>()) {
    final p = f.path.replaceAll('\\', '/');
    if (!p.endsWith('.dart') || p.contains('/i18n/dict_')) continue;
    final src = f.readAsStringSync();
    for (final m in template.allMatches(src)) {
      prefixes.add(m[1]!);
    }
    for (final m in keyLike.allMatches(src)) {
      if (!m[1]!.endsWith('.dart')) exact.add(m[1]!);
    }
  }

  // keys the code refers to by their exact name (only those that look like dictionary keys matter)
  final missing = exact.where((k) => !keys.contains(k) && _looksLikeKey(k)).toList()..sort();
  final used = keys.where((k) => exact.contains(k) || prefixes.any(k.startsWith)).toSet();
  final unused = keys.where((k) => !used.contains(k)).toList()..sort();

  stdout.writeln('dictionary: ${keys.length} keys in ${dictFiles.length} files');
  if (empty.isNotEmpty) stdout.writeln('EMPTY (${empty.length}): ${empty.join(', ')}');
  if (missing.isNotEmpty) stdout.writeln('MISSING (${missing.length}): ${missing.join(', ')}');
  if (unused.isNotEmpty) stdout.writeln('unused (${unused.length}): ${unused.join(', ')}');
  if (missing.isEmpty && empty.isEmpty) stdout.writeln('OK: every key the code asks for exists in both languages');
  exit(missing.isEmpty && empty.isEmpty ? 0 : 1);
}

/// A literal counts as a key reference when its first segment is one of the dictionary's namespaces.
bool _looksLikeKey(String k) {
  const namespaces = {'common', 'table', 'select', 'toast', 'range', 'pager', 'bulk', 'crumb', 'filter', 'soon', 'footer', 'header', 'nav', 'navgroup', 'palette', 'module', 'log', 'error', 'net', 'notif', 'menu', 'login', 'stage', 'set', 'support', 'acct', 'cz', 'ft', 'manual', 'home', 'demo', 'stat', 'lp'};
  return namespaces.contains(k.split('.').first);
}
