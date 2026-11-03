import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:theme_ui/app/app.dart';
import 'package:theme_ui/app/scope.dart';
import 'package:theme_ui/services/auth_service.dart';
import 'package:theme_ui/util/prefs.dart';

/// The one smoke test every starter needs: landing → sign-in → home → a gated page.
void main() {
  Future<AppStores> stores({Map<String, Object> saved = const {}}) async {
    SharedPreferences.setMockInitialValues(saved);
    final prefs = await Prefs.load();
    final s = AppStores(prefs: prefs, authService: AuthService(prefs, delay: Duration.zero));
    await s.auth.boot();
    return s;
  }

  testWidgets('a visitor sees the landing page and can sign in as admin', (tester) async {
    tester.view.physicalSize = const Size(1400, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    final s = await stores();
    await tester.pumpWidget(ThemeUiApp(stores: s));
    await tester.pumpAndSettle();
    expect(find.textContaining('Start your next internal app'), findsOneWidget);

    await tester.tap(find.text('Sign in').first);
    await tester.pumpAndSettle();
    expect(find.text('Enter with a sample account'), findsOneWidget);

    await tester.enterText(find.byType(TextField).at(0), 'admin');
    await tester.enterText(find.byType(TextField).at(1), 'wrong');
    await tester.tap(find.widgetWithText(InkWell, 'Sign in').last);
    await tester.pumpAndSettle();
    expect(find.text('The user name or password is not right.'), findsOneWidget);

    await tester.enterText(find.byType(TextField).at(1), 'demo');
    await tester.tap(find.widgetWithText(InkWell, 'Sign in').last);
    await tester.pumpAndSettle();
    expect(s.auth.isAuthenticated, isTrue);
    expect(find.text('My overview'), findsOneWidget);
    expect(find.text('Hello, Arisa'), findsOneWidget);
    s.dispose();
  });

  testWidgets('a remembered session opens on Home and staff cannot open Admin', (tester) async {
    tester.view.physicalSize = const Size(1400, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    final s = await stores(saved: {
      'flutter.app.user': '{"username":"staff","name":"Somchai Demo","first":"Somchai","initials":"SD","role":"Staff","permissions":["DEMO.VIEW"]}',
      'flutter.app.theme': 'dark',
    });
    expect(s.auth.isAuthenticated, isTrue);
    expect(s.theme.isDark, isTrue);
    await tester.pumpWidget(ThemeUiApp(stores: s));
    await tester.pumpAndSettle();
    expect(find.text('Hello, Somchai'), findsOneWidget);
    expect(s.auth.can('ADMIN.PANEL.VIEW'), isFalse);
    // the gated entry is not offered to a person without the permission
    expect(find.text('Admin'), findsNothing);

    // Ctrl-K opens the palette whatever has focus; Esc closes it; Ctrl-, opens Settings
    await tester.sendKeyDownEvent(LogicalKeyboardKey.controlLeft);
    await tester.sendKeyDownEvent(LogicalKeyboardKey.keyK);
    await tester.sendKeyUpEvent(LogicalKeyboardKey.keyK);
    await tester.sendKeyUpEvent(LogicalKeyboardKey.controlLeft);
    await tester.pumpAndSettle();
    expect(find.text('Search apps, work orders, machines, people...'), findsOneWidget);
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    expect(find.text('Search apps, work orders, machines, people...'), findsNothing);
    await tester.sendKeyDownEvent(LogicalKeyboardKey.controlLeft);
    await tester.sendKeyDownEvent(LogicalKeyboardKey.comma);
    await tester.sendKeyUpEvent(LogicalKeyboardKey.comma);
    await tester.sendKeyUpEvent(LogicalKeyboardKey.controlLeft);
    await tester.pumpAndSettle();
    expect(find.text('Keyboard shortcuts'), findsOneWidget);
    s.dispose();
  });
}
