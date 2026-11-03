import 'package:flutter/foundation.dart';

import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../types.dart';

/// Who is signed in, and what they may do. Permissions are checked in one place: [can] on the client (to hide what the
/// person cannot use) and again by the API on every call.
class AuthStore extends ChangeNotifier {
  AuthStore(this._service) : _user = _service.getStoredUser();

  final AuthService _service;
  SessionUser? _user;
  bool _booting = true;

  SessionUser? get user => _user;
  bool get isAuthenticated => _user != null;

  /// True until the restored session has been re-checked (the loading screen stays up meanwhile).
  bool get booting => _booting;

  /// Re-checks the restored session once at start.
  Future<void> boot() async {
    if (_user != null) {
      final verified = await _service.verify();
      if (verified == null) _user = null;
    }
    _booting = false;
    notifyListeners();
  }

  Future<ApiResponse<SessionUser>> login(String username, String password, {bool rememberMe = false}) async {
    final res = await _service.login(username, password, rememberMe: rememberMe);
    if (res.success) {
      _user = res.data;
      notifyListeners();
    }
    return res;
  }

  Future<void> logout() async {
    await _service.logout();
    _user = null;
    notifyListeners();
  }

  /// The server refused the session (401 that could not be refreshed): forget it without a round trip.
  Future<void> sessionExpired() async {
    await _service.forgetSession();
    _user = null;
    notifyListeners();
  }

  /// The sample accounts of the demo sign-in page.
  List<SessionUser> get directory => _service.sampleAccounts();

  /// True when the signed-in person holds [code] (APP.MODULE.ACTION), or every permission.
  bool can(String code) {
    final u = _user;
    if (u == null) return false;
    final p = u.permissions;
    return p == null || p.contains(code);
  }

  bool canAny(Iterable<String> codes) => codes.any(can);
}
