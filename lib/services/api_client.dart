import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../i18n/dict.dart';
import '../i18n/errors.dart';
import '../util/prefs.dart';

/// The standard API envelope every endpoint answers with (docs/decisions/0024). A failure always has a readable
/// [message], its HTTP [status] (0 = the request never got an answer), a stable [code] when the server or this client
/// knows the reason, the support [ref] and [retryAfter] when given.
class ApiResponse<T> {
  const ApiResponse({
    required this.success,
    this.message = '',
    this.data,
    this.errors = const [],
    this.status = 200,
    this.code,
    this.ref,
    this.retryAfter,
  });

  const ApiResponse.ok(T data, {String message = ''}) : this(success: true, data: data, message: message);

  const ApiResponse.fail(String message, {int status = 400, String? code, List<ApiFieldError> errors = const []})
      : this(success: false, message: message, status: status, code: code, errors: errors);

  final bool success;
  final String message;
  final T? data;
  final List<ApiFieldError> errors;
  final int status;
  final String? code;
  final String? ref;
  final int? retryAfter;

  /// The data of a success (throws on a failure: check [success] first, or use `useLoad`).
  T get value => data as T;

  /// True when the server refused for lack of permission (HTTP 403).
  bool get forbidden => status == 403;

  /// True when the failure is worth trying again as it is (a hiccup), as opposed to a refusal or a bad input.
  bool get transient => status == 0 || status == 408 || status == 429 || status >= 500;

  /// The field error for [field], when the server named one.
  String? fieldError(String field) => errors.cast<ApiFieldError?>().firstWhere((e) => e!.field == field, orElse: () => null)?.message;

  ApiResponse<U> cast<U>(U? Function(T? data) map) => ApiResponse<U>(
        success: success, message: message, data: map(data), errors: errors, status: status, code: code, ref: ref, retryAfter: retryAfter);
}

class ApiFieldError {
  const ApiFieldError(this.field, this.message);
  final String field;
  final String message;
}

/// What the status bar listens to: the last answer (or the lack of one) said the API is up, unreachable, slow, or
/// behind a proxy that answers for it.
enum ApiStatus { up, offline, timeout, gateway }

/// Events the shell reacts to: a dead session (go to sign-in), a forced password change, a module switched off.
sealed class ApiEvent {
  const ApiEvent();
}

class SessionExpired extends ApiEvent {
  const SessionExpired();
}

class PasswordChangeRequired extends ApiEvent {
  const PasswordChangeRequired();
}

class ModuleDisabled extends ApiEvent {
  const ModuleDisabled(this.module);
  final String module;
}

/// Thin HTTP wrapper speaking the envelope. Holds the access + refresh tokens and transparently refreshes an expired
/// access token once on a 401 before giving up. Remember Me = WHERE the tokens live (the device's storage or memory
/// only), never the password.
class ApiClient {
  ApiClient({required this.base, http.Client? client, this._prefs, Duration? timeout})
      : _client = client ?? http.Client(),
        timeout = timeout ?? const Duration(seconds: 60) {
    _access = _prefs?.get('at');
    _refresh = _prefs?.get('rt');
    _persistent = _access != null || _refresh != null;
  }

  final String base;
  final http.Client _client;
  final Prefs? _prefs;
  final Duration timeout;

  final ValueNotifier<ApiStatus> status = ValueNotifier(ApiStatus.up);
  final StreamController<ApiEvent> _events = StreamController.broadcast();
  Stream<ApiEvent> get events => _events.stream;

  String? _access;
  String? _refresh;
  bool _persistent = false;
  DateTime? _lastExpired;

  /// The sign-in family answers 401 for a wrong password or a dead refresh token; that is not "your session expired".
  static const authPaths = {'/auth/login', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'};

  String? get accessToken => _access;
  String? get refreshToken => _refresh;
  bool get hasSession => _access != null || _refresh != null;

  /// Stores the tokens. [persist] (Remember Me) chooses the device's storage over memory; when omitted the current
  /// session's mode is kept (e.g. on a silent refresh).
  Future<void> setTokens(String? access, String? refresh, {bool? persist}) async {
    if (persist != null) _persistent = persist;
    _access = access;
    _refresh = refresh;
    final p = _prefs;
    if (p != null) {
      await p.set('at', _persistent ? access : null);
      await p.set('rt', _persistent ? refresh : null);
    }
  }

  Future<ApiResponse<T>> get<T>(String path, {T Function(Object? json)? parse}) => _request('GET', path, null, parse);
  Future<ApiResponse<T>> post<T>(String path, {Object? body, T Function(Object? json)? parse}) => _request('POST', path, body, parse);
  Future<ApiResponse<T>> put<T>(String path, {Object? body, T Function(Object? json)? parse}) => _request('PUT', path, body, parse);
  Future<ApiResponse<T>> delete<T>(String path, {T Function(Object? json)? parse}) => _request('DELETE', path, null, parse);

  Lang get _lang => I18nStore.current?.lang ?? Lang.en;

  Future<http.Response> _send(String method, String path, Object? body) {
    final uri = Uri.parse('$base$path');
    final headers = {
      'Content-Type': 'application/json',
      if (_access != null) 'Authorization': 'Bearer $_access',
    };
    final encoded = body == null ? null : jsonEncode(body);
    final req = switch (method) {
      'GET' => _client.get(uri, headers: headers),
      'POST' => _client.post(uri, headers: headers, body: encoded),
      'PUT' => _client.put(uri, headers: headers, body: encoded),
      'DELETE' => _client.delete(uri, headers: headers),
      _ => throw ArgumentError.value(method, 'method'),
    };
    return req.timeout(timeout);
  }

  Future<ApiResponse<T>> _request<T>(String method, String path, Object? body, T Function(Object?)? parse) async {
    http.Response res;
    try {
      res = await _send(method, path, body);
      // access token expired → refresh once and retry (but never on the refresh/login calls themselves)
      if (res.statusCode == 401 && _refresh != null && !authPaths.contains(path)) {
        if (await tryRefresh()) res = await _send(method, path, body);
      }
    } on TimeoutException {
      status.value = ApiStatus.timeout;
      return ApiResponse<T>(success: false, message: codeText['TIMEOUT']!.of(_lang), status: 0, code: 'TIMEOUT');
    } catch (_) {
      // the request never got an answer: offline, DNS, CORS
      status.value = ApiStatus.offline;
      return ApiResponse<T>(success: false, message: codeText['OFFLINE']!.of(_lang), status: 0, code: 'OFFLINE');
    }
    return finish<T>(res, path, parse);
  }

  /// Attempts a single refresh; updates the tokens on success.
  Future<bool> tryRefresh() async {
    final rt = _refresh;
    if (rt == null) return false;
    try {
      final res = await _client
          .post(Uri.parse('$base/auth/refresh'), headers: {'Content-Type': 'application/json'}, body: jsonEncode({'refreshToken': rt}))
          .timeout(timeout);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        final json = jsonDecode(res.body);
        if (json is Map && json['success'] == true && json['data'] is Map) {
          final d = json['data'] as Map;
          await setTokens(d['accessToken'] as String?, d['refreshToken'] as String?);
          return true;
        }
      }
    } catch (_) {
      // fall through: the session is gone
    }
    await setTokens(null, null);
    return false;
  }

  /// Turns any response into the envelope the pages expect. Framework-level bodies (HTML from a proxy, nothing at all)
  /// are mapped by status, so a person reads the same sentence whatever the server sent.
  Future<ApiResponse<T>> finish<T>(http.Response res, String path, T Function(Object?)? parse) async {
    final st = res.statusCode;
    status.value = (st == 502 || st == 503 || st == 504) ? ApiStatus.gateway : ApiStatus.up;
    final retryAfter = parseRetryAfter(res.headers['retry-after']);
    Map<String, Object?>? json;
    try {
      final parsed = jsonDecode(res.body);
      if (parsed is Map) json = parsed.cast<String, Object?>();
    } catch (_) {
      json = null;
    }
    if (st >= 200 && st < 300) {
      if (json != null && json['success'] is bool) {
        final ok = json['success'] as bool;
        final raw = json['data'];
        return ApiResponse<T>(
          success: ok,
          message: (json['message'] as String?) ?? '',
          data: ok ? (parse != null ? parse(raw) : raw as T?) : null,
          errors: _fieldErrors(json['errors']),
          status: st,
          code: json['code'] as String?,
          ref: json['ref'] as String?,
        );
      }
      // a 200 that is not the envelope: the SPA shell served for an API path, or a proxy page
      return ApiResponse<T>(success: false, message: badResponseText.of(_lang), status: st, code: 'BAD_RESPONSE');
    }
    final rawErrors = json?['errors'];
    final legacyCode = rawErrors is List && rawErrors.isNotEmpty && rawErrors.first is String ? rawErrors.first as String : null;
    var code = (json?['code'] as String?) ?? legacyCode;
    final msg = json?['message'] as String?;
    if (code == null && st == 404 && (msg ?? '').toLowerCase().contains('endpoint')) code = 'ENDPOINT_NOT_FOUND';
    final out = ApiResponse<T>(
      success: false,
      message: failureMessage(st, code, msg, retryAfter, _lang),
      errors: _fieldErrors(rawErrors),
      status: st,
      code: code,
      ref: json?['ref'] as String?,
      retryAfter: retryAfter,
    );
    if (st == 401 && !authPaths.contains(path)) {
      // the token is dead and could not be refreshed: forget it and let the app go to the sign-in page (once)
      await setTokens(null, null);
      final now = DateTime.now();
      if (_lastExpired == null || now.difference(_lastExpired!).inSeconds > 3) {
        _lastExpired = now;
        _events.add(const SessionExpired());
      }
    } else if (st == 403 && code == 'PASSWORD_CHANGE_REQUIRED') {
      _events.add(const PasswordChangeRequired());
    } else if (st == 403 && code == 'MODULE_DISABLED') {
      final parts = path.split('/');
      _events.add(ModuleDisabled(parts.length > 1 ? parts[1] : ''));
    }
    return out;
  }

  static List<ApiFieldError> _fieldErrors(Object? raw) {
    if (raw is! List) return const [];
    return [
      for (final e in raw)
        if (e is Map && e['field'] is String) ApiFieldError(e['field'] as String, (e['message'] as String?) ?? ''),
    ];
  }

  /// A Retry-After header: seconds, or an HTTP date.
  static int? parseRetryAfter(String? header) {
    if (header == null || header.isEmpty) return null;
    final n = int.tryParse(header);
    if (n != null) return n < 0 ? null : n;
    try {
      final at = HttpDate.parse(header);
      return at.difference(DateTime.now()).inSeconds.clamp(0, 1 << 30);
    } catch (_) {
      return null;
    }
  }

  void dispose() {
    _events.close();
    status.dispose();
    _client.close();
  }
}

/// RFC 7231 dates ("Wed, 21 Oct 2015 07:28:00 GMT") without dart:io.
abstract final class HttpDate {
  static const _months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  static DateTime parse(String s) {
    final m = RegExp(r'^\w{3},\s+(\d{1,2})\s+(\w{3})\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s+GMT$').firstMatch(s.trim());
    if (m == null) throw FormatException('not an HTTP date', s);
    final month = _months.indexOf(m[2]!.toLowerCase()) + 1;
    if (month == 0) throw FormatException('not an HTTP date', s);
    return DateTime.utc(int.parse(m[3]!), month, int.parse(m[1]!), int.parse(m[4]!), int.parse(m[5]!), int.parse(m[6]!));
  }
}
