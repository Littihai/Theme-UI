import 'dart:convert';

import '../types.dart';
import '../util/prefs.dart';
import 'api_client.dart';

/// Sign-in for the shell. This starter ships with an IN-MEMORY implementation (the demo accounts below) so the app runs
/// without a backend. To connect a real API keep the same four methods and have them call it through
/// services/api_client.dart, e.g.
///
///   login:  POST /auth/login  → { user, accessToken, refreshToken }  then api.setTokens(...)
///   verify: GET  /auth/me     → the user, or null when the token is dead
///   logout: POST /auth/logout then api.setTokens(null, null)
///
/// The AuthStore does not care which one it is talking to.

/// Sample accounts of the demo (fictional). Remove them when a real sign-in is wired up.
const demoAccounts = [
  (user: SessionUser(username: 'admin', name: 'Arisa Demo', first: 'Arisa', initials: 'AD', role: 'Administrator', dept: 'IT', email: 'admin@example.com', permissions: null), password: 'demo'),
  (user: SessionUser(username: 'staff', name: 'Somchai Demo', first: 'Somchai', initials: 'SD', role: 'Staff', dept: 'Operations', email: 'staff@example.com', permissions: ['DEMO.VIEW']), password: 'demo'),
];

class AuthService {
  AuthService(this._prefs, {this.delay = const Duration(milliseconds: 350)});

  final Prefs _prefs;

  /// a short pause, so the busy state of the sign-in button can be seen in the demo
  final Duration delay;

  /// Remember Me = WHERE the session lives, never the password. Persistent → the device's storage (survives closing
  /// the app); non-persistent → memory (gone when the tab or window closes).
  SessionUser? _memory;

  /// The session restored from storage, synchronously, so a start does not bounce to /login.
  SessionUser? getStoredUser() {
    final raw = _prefs.get('user');
    if (raw != null) {
      try {
        return SessionUser.fromJson((jsonDecode(raw) as Map).cast<String, Object?>());
      } catch (_) {
        return null;
      }
    }
    return _memory;
  }

  Future<void> _write(SessionUser? user, bool persistent) async {
    _memory = persistent ? null : user;
    await _prefs.set('user', persistent && user != null ? jsonEncode(user.toJson()) : null);
  }

  Future<ApiResponse<SessionUser>> login(String username, String password, {bool rememberMe = false}) async {
    await Future<void>.delayed(delay);
    final name = username.trim().toLowerCase();
    for (final a in demoAccounts) {
      if (a.user.username == name && a.password == password) {
        await _write(a.user, rememberMe);
        return ApiResponse.ok(a.user);
      }
    }
    return const ApiResponse.fail('INVALID_CREDENTIALS', status: 401, code: 'INVALID_CREDENTIALS');
  }

  /// Re-checks a restored session on boot; null when it is no longer valid.
  Future<SessionUser?> verify() async => getStoredUser();

  Future<void> logout() => _write(null, false);

  /// Forgets the session without telling the server (the server already refused it).
  Future<void> forgetSession() => _write(null, false);

  /// The sample accounts the sign-in page offers (the "Enter as" buttons); empty once a real API is wired up.
  List<SessionUser> sampleAccounts() => demoAccounts.map((a) => a.user).toList();
}
