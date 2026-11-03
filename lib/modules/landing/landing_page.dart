import 'dart:ui' show ImageFilter;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/scope.dart';
import '../../components/ui/app_logo.dart';
import '../../components/ui/button.dart';
import '../../components/ui/stat_tile.dart';
import '../../constants/brand.dart';
import '../../constants/icons.dart';
import '../../layouts/public_frame.dart';
import '../../theme/tokens.dart';
import 'mini.dart';
import 'reveal.dart';

/// The page at "/" for a visitor: what is inside, how to start, the way in. Scroll reveals, tilting cards, a glass
/// header, all on the tokens; the whole page sits in one scroll view.
class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  final _scroll = ScrollController();
  final _features = GlobalKey();
  final _how = GlobalKey();
  final _built = GlobalKey();
  bool _scrolled = false;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(() {
      final s = _scroll.offset > 400;
      if (s != _scrolled) setState(() => _scrolled = s);
    });
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  void _jump(GlobalKey k) {
    final ctx = k.currentContext;
    if (ctx != null) Scrollable.ensureVisible(ctx, duration: context.reducedMotion ? Duration.zero : const Duration(milliseconds: 500), curve: Curves.easeInOutCubic, alignment: 0.02);
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final pad = context.pagePad;
    final tight = context.isTight;
    return Scaffold(
      backgroundColor: t.bg,
      body: Stack(children: [
        SingleChildScrollView(
          controller: _scroll,
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            const SizedBox(height: 60),
            _Section(child: _Hero(onHow: () => _jump(_how))),
            _Section(key: _features, tint: true, child: const _Features()),
            _Section(key: _how, child: const _Steps()),
            _Section(key: _built, tint: true, child: const _BuiltWith()),
            const _Section(child: _FinalCta()),
            Container(
              padding: EdgeInsets.symmetric(horizontal: pad, vertical: 20),
              decoration: BoxDecoration(border: Border(top: BorderSide(color: t.divider))),
              child: Center(child: Text('© ${DateTime.now().year} ${Brand.company} · ${context.t('footer.rights')}', style: TextStyle(fontSize: AppTokens.textXs, color: t.muted))),
            ),
          ]),
        ),
        // the glass header
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          child: ClipRect(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
              child: Container(
                height: 60,
                padding: EdgeInsets.symmetric(horizontal: pad),
                decoration: BoxDecoration(color: t.surface.withValues(alpha: 0.72), border: Border(bottom: BorderSide(color: t.divider))),
                child: Row(children: [
                  BrandLockup(size: 24, onTap: () => _scroll.animateTo(0, duration: const Duration(milliseconds: 400), curve: Curves.easeOut)),
                  const Spacer(),
                  if (!tight) ...[
                    _NavLink(context.t('lp.nav.features'), () => _jump(_features)),
                    _NavLink(context.t('lp.nav.how'), () => _jump(_how)),
                    _NavLink(context.t('lp.nav.built'), () => _jump(_built)),
                    const SizedBox(width: 8),
                  ],
                  const LangToggle(),
                  const ThemeToggle(),
                  const SizedBox(width: 10),
                  AppButton(label: context.t('login.signIn'), variant: ButtonVariant.primary, size: ButtonSize.sm, trailing: AppIcon.arrowRight, onPressed: () => context.go('/login')),
                ]),
              ),
            ),
          ),
        ),
        if (_scrolled)
          Positioned(
            right: 20,
            bottom: 20,
            child: IconBtn(icon: AppIcon.arrowUp, label: context.t('lp.top'), bordered: true, size: 40, onPressed: () => _scroll.animateTo(0, duration: const Duration(milliseconds: 500), curve: Curves.easeInOutCubic)),
          ),
      ]),
    );
  }
}

class _NavLink extends StatelessWidget {
  const _NavLink(this.label, this.onTap);
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: context.tokens.rMd,
        child: Padding(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8), child: Text(label, style: TextStyle(fontSize: AppTokens.textMd, fontWeight: FontWeight.w500, color: context.tokens.n700))),
      );
}

class _Section extends StatelessWidget {
  const _Section({super.key, required this.child, this.tint = false});
  final Widget child;
  final bool tint;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      color: tint ? t.surface : null,
      padding: EdgeInsets.symmetric(horizontal: context.pagePad, vertical: context.isMobile ? 48 : 80),
      child: Center(child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 1180), child: child)),
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero({required this.onHow});
  final VoidCallback onHow;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final tight = context.isTight;
    final text = Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Reveal(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(color: t.a100, borderRadius: BorderRadius.circular(999)),
          child: Text(context.t('lp.eyebrow', {'v': appVersion}), style: TextStyle(color: t.a800, fontSize: AppTokens.textXs, fontWeight: FontWeight.w600)),
        ),
      ),
      const SizedBox(height: 18),
      Reveal(
        delay: 80,
        child: Text.rich(
          TextSpan(children: [TextSpan(text: '${context.t('lp.hero.t1')}\n'), TextSpan(text: context.t('lp.hero.t2'), style: TextStyle(color: t.accent))]),
          style: TextStyle(fontSize: tight ? 36 : 52, fontWeight: FontWeight.w700, height: 1.08, letterSpacing: -0.8, color: t.text),
        ),
      ),
      const SizedBox(height: 18),
      Reveal(delay: 160, child: Text(context.t('lp.hero.sub'), style: TextStyle(fontSize: AppTokens.textLg, color: t.muted, height: 1.6))),
      const SizedBox(height: 26),
      Reveal(
        delay: 240,
        child: Wrap(spacing: 10, runSpacing: 10, children: [
          AppButton(label: context.t('login.signIn'), variant: ButtonVariant.primary, size: ButtonSize.lg, trailing: AppIcon.arrowRight, onPressed: () => context.go('/login')),
          AppButton(label: context.t('lp.cta.how'), size: ButtonSize.lg, onPressed: onHow),
        ]),
      ),
      const SizedBox(height: 34),
      Reveal(
        delay: 320,
        child: Wrap(spacing: 32, runSpacing: 14, children: [
          for (final s in Brand.stats)
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              CountUp(s.value, style: TextStyle(fontSize: AppTokens.text2xl, fontWeight: FontWeight.w700, color: t.text, height: 1.1)),
              Text(context.t(s.labelKey), style: TextStyle(fontSize: AppTokens.textSm, color: t.muted)),
            ]),
        ]),
      ),
      const SizedBox(height: 24),
      Row(children: [AppIconW(AppIcon.chevronDown, size: 16, color: t.n400), const SizedBox(width: 6), Text(context.t('lp.hint'), style: TextStyle(fontSize: AppTokens.textXs, color: t.n500))]),
    ]);
    const mock = Reveal(delay: 200, child: Tilt(max: 4, child: HeroMock()));
    if (tight) return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [text, const SizedBox(height: 40), mock]);
    return Row(crossAxisAlignment: CrossAxisAlignment.center, children: [Expanded(flex: 6, child: text), const SizedBox(width: 48), const Expanded(flex: 5, child: mock)]);
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title, this.sub);
  final String title;
  final String sub;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Reveal(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: TextStyle(fontSize: context.isTight ? 28 : 34, fontWeight: FontWeight.w700, letterSpacing: -0.5, color: t.text, height: 1.15)),
        const SizedBox(height: 8),
        Text(sub, style: TextStyle(fontSize: AppTokens.textLg, color: t.muted, height: 1.5)),
        const SizedBox(height: 32),
      ]),
    );
  }
}

class _Features extends StatelessWidget {
  const _Features();

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final items = <(String, AppIcon, Widget, bool)>[
      ('f1', AppIcon.paintbrush, const MiniTheme(), true),
      ('f2', AppIcon.globe, const MiniLang(), false),
      ('f3', AppIcon.shieldLock, const MiniRoles(), false),
      ('f4', AppIcon.beaker, const MiniKit(), false),
      ('f5', AppIcon.log, const MiniTable(), false),
      ('f6', AppIcon.server, const MiniApi(), true),
    ];
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      _SectionTitle(context.t('lp.f.title'), context.t('lp.f.sub')),
      LayoutBuilder(builder: (context, c) {
        final cols = c.maxWidth < 640 ? 1 : c.maxWidth < 1000 ? 2 : 3;
        const gap = 16.0;
        final unit = (c.maxWidth - gap * (cols - 1)) / cols;
        return Wrap(spacing: gap, runSpacing: gap, children: [
          for (var i = 0; i < items.length; i++)
            SizedBox(
              width: items[i].$4 && cols > 1 ? unit * 2 + gap : unit,
              child: Reveal(
                delay: 60 * (i % cols),
                child: Tilt(
                  child: Container(
                    height: 230,
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(color: t.bg, borderRadius: t.rXl, border: Border.all(color: t.divider)),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        Container(width: 34, height: 34, decoration: BoxDecoration(color: t.a100, borderRadius: t.rMd), child: Center(child: AppIconW(items[i].$2, size: 18, color: t.a800))),
                        const SizedBox(width: 10),
                        Expanded(child: Text(context.t('lp.${items[i].$1}.t'), style: TextStyle(fontSize: AppTokens.textLg, fontWeight: FontWeight.w600, color: t.text))),
                      ]),
                      const SizedBox(height: 10),
                      Text(context.t('lp.${items[i].$1}.d'), maxLines: 3, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: AppTokens.textSm, color: t.muted, height: 1.5)),
                      const Spacer(),
                      Align(alignment: Alignment.bottomLeft, child: items[i].$3),
                    ]),
                  ),
                ),
              ),
            ),
        ]);
      }),
    ]);
  }
}

class _Steps extends StatelessWidget {
  const _Steps();

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    const icons = [AppIcon.copy, AppIcon.pencil, AppIcon.key, AppIcon.plus];
    final steps = Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      for (var i = 0; i < 4; i++)
        Reveal(
          delay: 80 * i,
          child: Padding(
            padding: const EdgeInsets.only(bottom: 14),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(width: 40, height: 40, decoration: BoxDecoration(color: t.accent, borderRadius: t.rLg), child: Center(child: AppIconW(icons[i], size: 20, color: t.onAccent))),
              const SizedBox(width: 14),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('${i + 1}. ${context.t('lp.h${i + 1}.t')}', style: TextStyle(fontSize: AppTokens.textLg, fontWeight: FontWeight.w600, color: t.text)),
                  const SizedBox(height: 3),
                  Text(context.t('lp.h${i + 1}.d'), style: TextStyle(fontSize: AppTokens.textMd, color: t.muted, height: 1.5)),
                ]),
              ),
            ]),
          ),
        ),
      const SizedBox(height: 6),
      Reveal(child: Text(context.t('lp.h.note'), style: TextStyle(fontSize: AppTokens.textSm, color: t.n500))),
    ]);
    final rules = Reveal(
      delay: 120,
      child: Container(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(color: t.brandDeep, borderRadius: t.rXl),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(context.t('lp.h.rules'), style: TextStyle(color: t.onBrandDeep, fontSize: AppTokens.textLg, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          for (var i = 1; i <= 5; i++)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Padding(padding: const EdgeInsets.only(top: 3), child: AppIconW(AppIcon.checkCircle, size: 15, color: t.accent2)),
                const SizedBox(width: 8),
                Expanded(child: Text(context.t('lp.rule.r$i'), style: TextStyle(color: t.onBrandDeep.withValues(alpha: 0.85), fontSize: AppTokens.textSm, height: 1.5))),
              ]),
            ),
        ]),
      ),
    );
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      _SectionTitle(context.t('lp.h.title'), context.t('lp.h.sub')),
      if (context.isTight) ...[steps, const SizedBox(height: 24), rules]
      else
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Expanded(flex: 7, child: steps), const SizedBox(width: 40), Expanded(flex: 5, child: rules)]),
    ]);
  }
}

class _BuiltWith extends StatelessWidget {
  const _BuiltWith();

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Reveal(child: Text(context.t('lp.b.title'), style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, letterSpacing: -0.5, color: t.text))),
      const SizedBox(height: 18),
      Reveal(
        delay: 80,
        child: Wrap(spacing: 10, runSpacing: 10, children: [
          for (final b in Brand.builtWith)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
              decoration: BoxDecoration(color: t.bg, borderRadius: BorderRadius.circular(999), border: Border.all(color: t.n300)),
              child: Text(b, style: TextStyle(fontSize: AppTokens.textMd, fontWeight: FontWeight.w500, color: t.n800)),
            ),
        ]),
      ),
      const SizedBox(height: 14),
      Reveal(delay: 120, child: Text(context.t('lp.b.note'), style: TextStyle(fontSize: AppTokens.textMd, color: t.muted, height: 1.5))),
    ]);
  }
}

class _FinalCta extends StatelessWidget {
  const _FinalCta();

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Reveal(
      child: Container(
        padding: EdgeInsets.all(context.isMobile ? 24 : 40),
        decoration: BoxDecoration(gradient: LinearGradient(colors: [t.a100, t.surface]), borderRadius: t.rXl, border: Border.all(color: t.a200)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(context.t('lp.c.title'), style: TextStyle(fontSize: 30, fontWeight: FontWeight.w700, letterSpacing: -0.5, color: t.text)),
          const SizedBox(height: 8),
          Text(context.t('lp.c.sub'), style: TextStyle(fontSize: AppTokens.textLg, color: t.muted, height: 1.5)),
          const SizedBox(height: 18),
          Wrap(spacing: 10, runSpacing: 10, crossAxisAlignment: WrapCrossAlignment.center, children: [
            AppButton(label: context.t('login.signIn'), variant: ButtonVariant.primary, size: ButtonSize.lg, trailing: AppIcon.arrowRight, onPressed: () => context.go('/login')),
            Text('${context.t('lp.c.try')} admin / demo · staff / demo', style: TextStyle(fontSize: AppTokens.textSm, color: t.n700)),
          ]),
        ]),
      ),
    );
  }
}
