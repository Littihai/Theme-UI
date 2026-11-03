import 'dart:js_interop';

import 'package:web/web.dart' as web;

/// Web: an anchor with a Blob URL, clicked for the person; the browser saves the file under [fileName].
Future<bool> saveText(String fileName, String content, String mime) async {
  final blob = web.Blob([content.toJS].toJS, web.BlobPropertyBag(type: mime));
  final url = web.URL.createObjectURL(blob);
  final a = web.HTMLAnchorElement()
    ..href = url
    ..download = fileName
    ..style.display = 'none';
  web.document.body!.append(a);
  a.click();
  a.remove();
  web.URL.revokeObjectURL(url);
  return false;
}
