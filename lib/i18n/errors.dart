import 'l.dart';

/// The words for HTTP and network failures. Plain data because the API client localises outside the widget tree.
///
/// Two tables: by HTTP status (what the family of the failure means) and by envelope `code` (the server's more precise
/// reason, e.g. an out-of-date server or a module an administrator switched off). A code wins over a status.
const Map<int, L> statusText = {
  400: L('คำขอไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่กรอก', 'Bad request. Please check the information you entered.'),
  401: L('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง', 'Your session has expired. Please sign in again.'),
  403: L('คุณไม่มีสิทธิ์เข้าถึงส่วนนี้', "You don't have permission to access this."),
  404: L('ไม่พบข้อมูลที่ต้องการ', "We couldn't find what you were looking for."),
  405: L('เซิร์ฟเวอร์ไม่รองรับวิธีเรียกนี้ อาจเป็นรุ่นที่ไม่ตรงกับหน้าจอ', "The server doesn't accept this kind of request. Its version may not match this page."),
  406: L('เซิร์ฟเวอร์ตอบรูปแบบที่หน้าจอต้องการไม่ได้', "The server can't answer in the format this page needs."),
  408: L('การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่', 'The request timed out. Please try again.'),
  409: L('ข้อมูลถูกแก้ไขจากที่อื่น กรุณาโหลดใหม่แล้วลองอีกครั้ง', 'This was changed elsewhere. Reload and try again.'),
  410: L('ข้อมูลนี้ถูกลบไปแล้ว', 'This no longer exists.'),
  413: L('ข้อมูลหรือไฟล์ใหญ่เกินกำหนด', 'The data or file is too large.'),
  415: L('รูปแบบข้อมูลที่ส่งไม่ถูกต้อง', "The data was sent in a format the server doesn't accept."),
  422: L('ข้อมูลไม่ผ่านการตรวจสอบ กรุณาแก้ไขแล้วลองใหม่', "Some fields didn't pass validation. Please fix them and retry."),
  429: L('ทำรายการถี่เกินไป กรุณารอสักครู่แล้วลองใหม่', 'Too many requests. Please wait a moment and try again.'),
  500: L('ระบบเกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง', 'Something went wrong on the server. Please try again later.'),
  501: L('เซิร์ฟเวอร์ยังไม่รองรับการทำงานนี้', "The server doesn't support this yet."),
  502: L('เซิร์ฟเวอร์ไม่ตอบสนอง กรุณาลองใหม่อีกครั้ง', "The server didn't respond. Please try again."),
  503: L('ระบบไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่ภายหลัง', 'The service is temporarily unavailable. Please try again later.'),
  504: L('เซิร์ฟเวอร์ตอบสนองช้าเกินไป กรุณาลองใหม่', 'The server took too long to respond. Please try again.'),
};

/// The server's precise reason, when it gives one; these read better than the status's generic sentence.
const Map<String, L> codeText = {
  'ENDPOINT_NOT_FOUND': L('เซิร์ฟเวอร์ API ยังไม่มีคำสั่งนี้ น่าจะยังไม่ได้อัปเดตเป็นรุ่นเดียวกับหน้าจอ', "The API server doesn't have this endpoint. It probably hasn't been updated to the same version as this page."),
  'MODULE_DISABLED': L('โมดูลนี้ถูกปิดใช้งานโดยผู้ดูแลระบบ', 'An administrator has turned this module off.'),
  'PASSWORD_CHANGE_REQUIRED': L('กรุณาตั้งรหัสผ่านใหม่ก่อนใช้งานระบบ', 'Please set a new password before continuing.'),
  'DB_UNAVAILABLE': L('ฐานข้อมูลไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่ในอีกสักครู่', 'The database is temporarily unavailable. Please try again in a moment.'),
  'SERVER_ERROR': L('ระบบเกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง', 'Something went wrong on the server. Please try again later.'),
  'VALIDATION': L('ข้อมูลไม่ผ่านการตรวจสอบ กรุณาแก้ไขตามที่แจ้ง', "Some fields didn't pass validation. Please fix them."),
  'TOO_MANY_REQUESTS': L('ทำรายการถี่เกินไป กรุณารอสักครู่แล้วลองใหม่', 'Too many requests. Please wait a moment and try again.'),
  'OFFLINE': L('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่', "Can't reach the server. Check your connection and try again."),
  'TIMEOUT': L('เซิร์ฟเวอร์ไม่ตอบกลับภายในเวลาที่กำหนด กรุณาลองใหม่', "The server didn't answer in time. Please try again."),
};

/// Codes the server attaches to a framework-level failure; they mean nothing more than the status, so the status's
/// bilingual sentence is shown instead of the server's Thai-only one.
const Set<String> genericCodes = {
  'BAD_REQUEST', 'UNAUTHENTICATED', 'FORBIDDEN', 'METHOD_NOT_ALLOWED', 'NOT_ACCEPTABLE', 'REQUEST_TIMEOUT', 'CONFLICT',
  'LENGTH_REQUIRED', 'PAYLOAD_TOO_LARGE', 'UNSUPPORTED_MEDIA_TYPE', 'UNPROCESSABLE', 'NOT_IMPLEMENTED', 'BAD_GATEWAY',
  'SERVICE_UNAVAILABLE', 'GATEWAY_TIMEOUT',
};

/// The page could not read the answer at all (HTML where JSON was expected: a proxy or a misrouted request).
const L badResponseText = L('เซิร์ฟเวอร์ตอบกลับในรูปแบบที่หน้าจออ่านไม่ได้ กรุณาแจ้งผู้ดูแลระบบ', "The server answered in a form this page can't read. Please tell your administrator.");

const L unknownText = L('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่', 'An unexpected error occurred. Please try again.');

/// "… you can try again in {n} s" appended to a 429 / 503 that says when.
const L retryInText = L('ลองใหม่ได้ในอีก {n} วินาที', 'You can try again in {n} s');

/// Friendly message for an HTTP status (an unlisted 5xx reads as 500, an unlisted 4xx as 400).
String statusMessage(int status, Lang lang) {
  final p = statusText[status] ?? (status >= 500 ? statusText[500]! : status >= 400 ? statusText[400]! : unknownText);
  return p.of(lang);
}

/// Friendly message for a server-given code, or null when the code has no text of its own.
String? codeMessage(String? code, Lang lang) => code == null ? null : codeText[code]?.of(lang);

/// The message a failed response should show. The server's own sentence wins when it is specific (a rule it checked,
/// a field it rejected); the framework-level codes and an empty message are replaced by our wording so a person reads
/// the same sentence whether the body was JSON, HTML from a proxy, or nothing at all.
String failureMessage(int status, String? code, String? serverMessage, int? retryAfter, Lang lang) {
  final own = codeMessage(code, lang);
  final generic = code == null || genericCodes.contains(code);
  final server = serverMessage?.trim();
  var text = own ?? ((server != null && server.isNotEmpty && !(generic && code != null)) ? server : statusMessage(status, lang));
  if (retryAfter != null && retryAfter > 0 && (status == 429 || status == 503)) {
    text = '$text ${retryInText.of(lang).replaceAll('{n}', '$retryAfter')}';
  }
  return text;
}
