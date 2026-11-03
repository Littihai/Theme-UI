import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../app/scope.dart';
import '../modules/settings/settings_nav.dart';
import '../overlays/command_palette.dart';
import '../overlays/customize_panel.dart';
import '../theme/appearance.dart';
import 'api_status_bar.dart';
import 'app_footer.dart';
import 'header.dart';
import 'nav_drawer.dart';
import 'nav_items.dart';
import 'side_nav.dart';

/// What a page may ask the shell to do.
class ShellScope extends InheritedWidget {
  const ShellScope({super.key, required this.openDrawer, required this.openCustomize, required this.openPalette, required super.child});
  final VoidCallback openDrawer;
  final VoidCallback openCustomize;
  final VoidCallback openPalette;

  static ShellScope of(BuildContext context) => context.dependOnInheritedWidgetOfExactType<ShellScope>()!;

  @override
  bool updateShouldNotify(ShellScope oldWidget) => false;
}

/// The frame of every signed-in page: the status bar, the header (or the sidebar + header), the page, the footer.
/// The Customize panel is the end drawer; the phone menu the start drawer. Ctrl-K opens the palette, Ctrl-, Settings.
class AppShell extends StatefulWidget {
  const AppShell({super.key, required this.child});
  final Widget child;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  final _scaffold = GlobalKey<ScaffoldState>();
  bool _seeded = false;
  bool _headerHidden = false;

  @override
  void initState() {
    super.initState();
    // app-wide keys, whatever has focus: Ctrl-K the palette, Ctrl-, Settings (a text field never uses these)
    HardwareKeyboard.instance.addHandler(_onKey);
  }

  bool _onKey(KeyEvent e) {
    if (e is! KeyDownEvent) return false;
    final mod = HardwareKeyboard.instance.isControlPressed || HardwareKeyboard.instance.isMetaPressed;
    if (!mod) return false;
    if (e.logicalKey == LogicalKeyboardKey.keyK) {
      _openPalette();
      return true;
    }
    if (e.logicalKey == LogicalKeyboardKey.comma) {
      openSettings(context, SettingsSection.general);
      return true;
    }
    return false;
  }

  @override
  void dispose() {
    HardwareKeyboard.instance.removeHandler(_onKey);
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_seeded) {
      _seeded = true;
      final stores = context.stores;
      final lang = context.i18n.lang;
      // after this frame: pushing into the store during a build would mark listeners dirty mid-build
      WidgetsBinding.instance.addPostFrameCallback((_) => stores.notifications.seedDemo(lang));
    }
  }

  void _openPalette() => showCommandPalette(context);

  bool _onScroll(ScrollNotification n) {
    if (context.stores.appearance.state.sticky != Sticky.none || n.metrics.axis != Axis.vertical) return false;
    if (n is UserScrollNotification) {
      final hide = n.direction == ScrollDirection.reverse && n.metrics.pixels > 80;
      final show = n.direction == ScrollDirection.forward || n.metrics.pixels <= 80;
      if (hide && !_headerHidden) setState(() => _headerHidden = true);
      if (show && _headerHidden) setState(() => _headerHidden = false);
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final a = context.stores.appearance.state;
    final mobile = context.isMobile;
    final nav = NavModel(auth: context.stores.auth, currentPath: GoRouterState.of(context).uri.path);
    final sidebar = !mobile && a.nav != NavLayout.top;
    final floating = a.navStyle == Edges.floating;
    final reduced = context.reducedMotion;

    final header = AnimatedSize(
      duration: Duration(milliseconds: reduced ? 0 : 200),
      curve: Curves.easeOut,
      alignment: Alignment.topCenter,
      child: _headerHidden ? const SizedBox(width: double.infinity, height: 0) : AppHeader(nav: nav),
    );

    final content = NotificationListener<ScrollNotification>(
      onNotification: _onScroll,
      child: Column(children: [
        const ApiStatusBar(),
        header,
        Expanded(child: widget.child),
      ]),
    );

    final body = sidebar
        ? Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            SideNav(nav: nav, rail: a.nav == NavLayout.rail, floating: floating),
            Expanded(child: content),
          ])
        : content;

    return ShellScope(
      openDrawer: () => _scaffold.currentState?.openDrawer(),
      openCustomize: () => _scaffold.currentState?.openEndDrawer(),
      openPalette: _openPalette,
      child: Scaffold(
        key: _scaffold,
        backgroundColor: t.bg,
        drawer: mobile ? NavDrawer(nav: nav, floating: a.panelStyle == Edges.floating) : null,
        endDrawer: CustomizeDrawer(floating: a.panelStyle == Edges.floating),
        drawerEdgeDragWidth: mobile ? 24 : 0,
        body: body,
      ),
    );
  }
}

/// A page's scrolling body with the footer under it: pages use this instead of their own scroll view, so the footer
/// sits at the end of every page and the header's auto-hide sees the scroll.
class ShellPage extends StatelessWidget {
  const ShellPage({super.key, required this.child, this.footer = true});
  final Widget child;
  final bool footer;

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      primary: true,
      slivers: [
        SliverToBoxAdapter(child: child),
        if (footer) const SliverFillRemaining(hasScrollBody: false, child: Align(alignment: Alignment.bottomCenter, child: AppFooter())),
      ],
    );
  }
}
