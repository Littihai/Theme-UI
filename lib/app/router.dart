import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../layouts/app_shell.dart';
import '../modules/auth/login_page.dart';
import '../modules/common/forbidden_page.dart';
import '../modules/common/not_found_page.dart';
import '../modules/home/home_page.dart';
import '../modules/landing/landing_page.dart';
import '../modules/settings/settings_modal.dart';
import '../modules/settings/settings_nav.dart';
import '../modules/showcase/admin_demo_page.dart';
import '../modules/showcase/charts_page.dart';
import '../modules/showcase/components_page.dart';
import '../modules/showcase/document_page.dart';
import '../modules/showcase/manual_demo_page.dart';
import '../modules/showcase/tables_page.dart';
import '../theme/tokens.dart';
import 'scope.dart';

/// The paths a signed-out visitor is sent to sign in for; anything else unknown goes to the landing page.
const _knownPrefixes = ['/components', '/tables', '/charts', '/document', '/manual', '/admin', '/settings'];

/// Only a path of this app may be a return target (never another origin).
String safeReturnPath(String? from) {
  if (from == null || !from.startsWith('/') || from.startsWith('//') || from.startsWith('/login')) return '/';
  return from;
}

/// Requires a permission code on top of the session; a person without it gets the 403 page, not a blank screen.
class RequireCan extends StatelessWidget {
  const RequireCan({super.key, required this.code, required this.child});
  final String code;
  final Widget child;

  @override
  Widget build(BuildContext context) => context.stores.auth.can(code) ? child : const ForbiddenPage();
}

/// The routes. Pages of the signed-in app sit under the shell; a new module adds its route there (and its entry in
/// constants/nav.dart). The Settings window is a route of its own (`/settings/<section>`) drawn over whatever page is
/// behind it, on the root navigator so it covers the header too.
GoRouter buildRouter(AppStores s) {
  final rootKey = GlobalKey<NavigatorState>(debugLabel: 'root');

  Page<void> plain(Widget child, GoRouterState state) => NoTransitionPage(key: state.pageKey, child: child);

  return GoRouter(
    navigatorKey: rootKey,
    initialLocation: '/',
    refreshListenable: s.auth,
    redirect: (context, state) {
      final authed = s.auth.isAuthenticated;
      final path = state.uri.path;
      if (!authed) {
        if (path == '/' || path == '/login') return null;
        if (_knownPrefixes.any(path.startsWith)) return '/login?from=${Uri.encodeComponent(state.uri.toString())}';
        return '/';
      }
      if (path == '/login') return safeReturnPath(state.uri.queryParameters['from']);
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const LoginPage(),
          transitionsBuilder: (_, a, _, child) => FadeTransition(opacity: a, child: child),
        ),
      ),
      ShellRoute(
        builder: (context, state, child) => s.auth.isAuthenticated ? AppShell(child: child) : const LandingPage(),
        routes: [
          GoRoute(
            path: '/',
            pageBuilder: (context, state) => plain(const HomePage(), state),
            routes: [
              GoRoute(
                path: 'settings/:section',
                parentNavigatorKey: rootKey,
                pageBuilder: (context, state) {
                  final section = settingsSection(state.pathParameters['section']);
                  final scrim = Theme.of(context).extension<AppTokens>()!.scrim;
                  return CustomTransitionPage(
                    key: const ValueKey('settings'),
                    opaque: false,
                    barrierDismissible: true,
                    barrierColor: scrim,
                    fullscreenDialog: true,
                    transitionDuration: const Duration(milliseconds: 180),
                    reverseTransitionDuration: const Duration(milliseconds: 120),
                    child: SettingsModal(section: section),
                    transitionsBuilder: (_, a, _, child) => FadeTransition(
                      opacity: a,
                      child: ScaleTransition(scale: Tween(begin: 0.98, end: 1.0).animate(CurvedAnimation(parent: a, curve: Curves.easeOut)), child: child),
                    ),
                  );
                },
              ),
            ],
          ),
          GoRoute(path: '/components', pageBuilder: (context, state) => plain(const ComponentsPage(), state)),
          GoRoute(path: '/components/:tab', pageBuilder: (context, state) => plain(ComponentsPage(tab: state.pathParameters['tab']), state)),
          GoRoute(path: '/tables', pageBuilder: (context, state) => plain(const TablesPage(), state)),
          GoRoute(path: '/charts', pageBuilder: (context, state) => plain(const ChartsPage(), state)),
          GoRoute(path: '/document', pageBuilder: (context, state) => plain(const DocumentPage(), state)),
          GoRoute(path: '/manual', pageBuilder: (context, state) => plain(const ManualDemoPage(), state)),
          GoRoute(path: '/admin', pageBuilder: (context, state) => plain(const RequireCan(code: 'ADMIN.PANEL.VIEW', child: AdminDemoPage()), state)),
          // unknown path while signed in → friendly 404 inside the app shell
          GoRoute(path: '/:rest(.*)', pageBuilder: (context, state) => plain(const NotFoundPage(), state)),
        ],
      ),
    ],
  );
}
