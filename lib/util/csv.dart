import 'download_io.dart' if (dart.library.js_interop) 'download_web.dart' as impl;

/// Rows → CSV text (RFC 4180 quoting; a BOM so Excel opens Thai correctly).
String toCsv(List<List<Object?>> rows) {
  String cell(Object? v) {
    final s = v == null ? '' : '$v';
    return s.contains(RegExp(r'[",\n\r]')) ? '"${s.replaceAll('"', '""')}"' : s;
  }

  return '﻿${rows.map((r) => r.map(cell).join(',')).join('\r\n')}';
}

/// Hands the person a text file: a download on the web, the clipboard elsewhere (returns true when it was copied).
Future<bool> saveText(String fileName, String content, {String mime = 'text/csv;charset=utf-8'}) =>
    impl.saveText(fileName, content, mime);
