import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:theme_ui/services/api_client.dart';
import 'package:theme_ui/util/prefs.dart';

http.Response json(int status, Map<String, Object?> body, {Map<String, String>? headers}) =>
    http.Response(jsonEncode(body), status, headers: {'content-type': 'application/json', ...?headers});

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('a success envelope comes back parsed', () async {
    final api = ApiClient(base: '/api', client: MockClient((r) async => json(200, {'success': true, 'message': '', 'data': {'id': 7}, 'errors': []})));
    final res = await api.get<Map<String, Object?>>('/orders/7', parse: (j) => (j as Map).cast<String, Object?>());
    expect(res.success, isTrue);
    expect(res.value['id'], 7);
    expect(api.status.value, ApiStatus.up);
  });

  test('a 200 that is not the envelope is a BAD_RESPONSE failure', () async {
    final api = ApiClient(base: '/api', client: MockClient((r) async => http.Response('<html>proxy</html>', 200)));
    final res = await api.get<Object?>('/orders');
    expect(res.success, isFalse);
    expect(res.code, 'BAD_RESPONSE');
  });

  test('field errors, status and Retry-After are kept', () async {
    final api = ApiClient(
      base: '/api',
      client: MockClient((r) async => json(429, {'success': false, 'message': 'slow down', 'code': 'TOO_MANY_REQUESTS', 'errors': [{'field': 'qty', 'message': 'too many'}]}, headers: {'retry-after': '12'})),
    );
    final res = await api.post<Object?>('/orders', body: {'qty': 9});
    expect(res.status, 429);
    expect(res.retryAfter, 12);
    expect(res.fieldError('qty'), 'too many');
    expect(res.transient, isTrue);
    expect(res.message, endsWith('You can try again in 12 s'));
  });

  test('an expired access token is refreshed once and the call retried', () async {
    var calls = <String>[];
    final api = ApiClient(
      base: '/api',
      prefs: await Prefs.load(),
      client: MockClient((r) async {
        calls.add('${r.method} ${r.url.path} ${r.headers['Authorization']}');
        if (r.url.path == '/api/auth/refresh') return json(200, {'success': true, 'data': {'accessToken': 'new', 'refreshToken': 'rt2'}});
        if (r.headers['Authorization'] == 'Bearer new') return json(200, {'success': true, 'data': 1});
        return json(401, {'success': false, 'message': 'expired'});
      }),
    );
    await api.setTokens('old', 'rt1', persist: true);
    final res = await api.get<Object?>('/me');
    expect(res.success, isTrue);
    expect(api.accessToken, 'new');
    expect(calls, ['GET /api/me Bearer old', 'POST /api/auth/refresh null', 'GET /api/me Bearer new']);
  });

  test('a dead session fires SessionExpired once and forgets the tokens', () async {
    final api = ApiClient(base: '/api', client: MockClient((r) async => json(401, {'success': false, 'message': 'nope'})));
    await api.setTokens('old', null);
    final events = <ApiEvent>[];
    api.events.listen(events.add);
    await api.get<Object?>('/me');
    await api.get<Object?>('/me');
    await Future<void>.delayed(Duration.zero);
    expect(events.whereType<SessionExpired>().length, 1);
    expect(api.hasSession, isFalse);
  });

  test('no answer at all is OFFLINE and the status bar hears it', () async {
    final api = ApiClient(base: '/api', client: MockClient((r) async => throw http.ClientException('refused')));
    final res = await api.get<Object?>('/ping');
    expect(res.status, 0);
    expect(res.code, 'OFFLINE');
    expect(api.status.value, ApiStatus.offline);
  });

  test('HTTP dates in Retry-After are read', () {
    expect(ApiClient.parseRetryAfter('120'), 120);
    expect(ApiClient.parseRetryAfter('garbage'), isNull);
    expect(HttpDate.parse('Wed, 21 Oct 2015 07:28:00 GMT'), DateTime.utc(2015, 10, 21, 7, 28));
  });
}
