/**
 * The words for HTTP and network failures. Plain data (no React) because the API client localises outside any
 * context: it reads the active language from the same localStorage key the I18n provider writes.
 *
 * Two tables: by HTTP status (what the family of the failure means) and by envelope `code` (the server's more
 * precise reason, e.g. an out-of-date server or a module an administrator switched off). A code wins over a status.
 */
export type Pair = { th: string; en: string };

export const STATUS_TEXT: Record<number, Pair> = {
  400: { th: "คำขอไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่กรอก", en: "Bad request. Please check the information you entered." },
  401: { th: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง", en: "Your session has expired. Please sign in again." },
  403: { th: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้", en: "You don't have permission to access this." },
  404: { th: "ไม่พบข้อมูลที่ต้องการ", en: "We couldn't find what you were looking for." },
  405: { th: "เซิร์ฟเวอร์ไม่รองรับวิธีเรียกนี้ อาจเป็นรุ่นที่ไม่ตรงกับหน้าจอ", en: "The server doesn't accept this kind of request. Its version may not match this page." },
  406: { th: "เซิร์ฟเวอร์ตอบรูปแบบที่หน้าจอต้องการไม่ได้", en: "The server can't answer in the format this page needs." },
  408: { th: "การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่", en: "The request timed out. Please try again." },
  409: { th: "ข้อมูลถูกแก้ไขจากที่อื่น กรุณาโหลดใหม่แล้วลองอีกครั้ง", en: "This was changed elsewhere. Reload and try again." },
  410: { th: "ข้อมูลนี้ถูกลบไปแล้ว", en: "This no longer exists." },
  413: { th: "ข้อมูลหรือไฟล์ใหญ่เกินกำหนด", en: "The data or file is too large." },
  415: { th: "รูปแบบข้อมูลที่ส่งไม่ถูกต้อง", en: "The data was sent in a format the server doesn't accept." },
  422: { th: "ข้อมูลไม่ผ่านการตรวจสอบ กรุณาแก้ไขแล้วลองใหม่", en: "Some fields didn't pass validation. Please fix them and retry." },
  429: { th: "ทำรายการถี่เกินไป กรุณารอสักครู่แล้วลองใหม่", en: "Too many requests. Please wait a moment and try again." },
  500: { th: "ระบบเกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง", en: "Something went wrong on the server. Please try again later." },
  501: { th: "เซิร์ฟเวอร์ยังไม่รองรับการทำงานนี้", en: "The server doesn't support this yet." },
  502: { th: "เซิร์ฟเวอร์ไม่ตอบสนอง กรุณาลองใหม่อีกครั้ง", en: "The server didn't respond. Please try again." },
  503: { th: "ระบบไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่ภายหลัง", en: "The service is temporarily unavailable. Please try again later." },
  504: { th: "เซิร์ฟเวอร์ตอบสนองช้าเกินไป กรุณาลองใหม่", en: "The server took too long to respond. Please try again." },
};

/** The server's precise reason, when it gives one; these read better than the status's generic sentence. */
export const CODE_TEXT: Record<string, Pair> = {
  ENDPOINT_NOT_FOUND: { th: "เซิร์ฟเวอร์ API ยังไม่มีคำสั่งนี้ น่าจะยังไม่ได้อัปเดตเป็นรุ่นเดียวกับหน้าจอ", en: "The API server doesn't have this endpoint. It probably hasn't been updated to the same version as this page." },
  MODULE_DISABLED: { th: "โมดูลนี้ถูกปิดใช้งานโดยผู้ดูแลระบบ", en: "An administrator has turned this module off." },
  PASSWORD_CHANGE_REQUIRED: { th: "กรุณาตั้งรหัสผ่านใหม่ก่อนใช้งานระบบ", en: "Please set a new password before continuing." },
  DB_UNAVAILABLE: { th: "ฐานข้อมูลไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่ในอีกสักครู่", en: "The database is temporarily unavailable. Please try again in a moment." },
  SERVER_ERROR: { th: "ระบบเกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง", en: "Something went wrong on the server. Please try again later." },
  VALIDATION: { th: "ข้อมูลไม่ผ่านการตรวจสอบ กรุณาแก้ไขตามที่แจ้ง", en: "Some fields didn't pass validation. Please fix them." },
  TOO_MANY_REQUESTS: { th: "ทำรายการถี่เกินไป กรุณารอสักครู่แล้วลองใหม่", en: "Too many requests. Please wait a moment and try again." },
  OFFLINE: { th: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่", en: "Can't reach the server. Check your connection and try again." },
  TIMEOUT: { th: "เซิร์ฟเวอร์ไม่ตอบกลับภายในเวลาที่กำหนด กรุณาลองใหม่", en: "The server didn't answer in time. Please try again." },
};

/** Codes the server attaches to a framework-level failure; they mean nothing more than the status, so the status's
 *  bilingual sentence is shown instead of the server's Thai-only one. */
export const GENERIC_CODES = new Set(["BAD_REQUEST", "UNAUTHENTICATED", "FORBIDDEN", "METHOD_NOT_ALLOWED", "NOT_ACCEPTABLE", "REQUEST_TIMEOUT", "CONFLICT", "LENGTH_REQUIRED", "PAYLOAD_TOO_LARGE", "UNSUPPORTED_MEDIA_TYPE", "UNPROCESSABLE", "NOT_IMPLEMENTED", "BAD_GATEWAY", "SERVICE_UNAVAILABLE", "GATEWAY_TIMEOUT"]);

/** The page could not read the answer at all (HTML where JSON was expected: a proxy or a misrouted request). */
export const BAD_RESPONSE_TEXT: Pair = { th: "เซิร์ฟเวอร์ตอบกลับในรูปแบบที่หน้าจออ่านไม่ได้ กรุณาแจ้งผู้ดูแลระบบ", en: "The server answered in a form this page can't read. Please tell your administrator." };

export const UNKNOWN_TEXT: Pair = { th: "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่", en: "An unexpected error occurred. Please try again." };

/** "… you can try again in {n} s" appended to a 429 / 503 that says when. */
export const RETRY_IN_TEXT: Pair = { th: "ลองใหม่ได้ในอีก {n} วินาที", en: "You can try again in {n} s" };
