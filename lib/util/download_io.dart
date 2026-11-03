import 'package:flutter/services.dart';

/// Desktop / mobile: there is no browser download; the text goes to the clipboard.
Future<bool> saveText(String fileName, String content, String mime) async {
  await Clipboard.setData(ClipboardData(text: content));
  return true;
}
