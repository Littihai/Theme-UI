import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app/scope.dart';
import '../components/ui/app_logo.dart';
import '../components/ui/button.dart';
import '../constants/icons.dart';
import '../overlays/theme_reveal.dart';

/// The row at the top of the pages before sign-in (landing, sign-in): the brand, the language, the colour scheme, and
/// the way in.
class PublicBar extends StatelessWidget {
  const PublicBar({super.key, this.showSignIn = true, this.light = false, this.transparent = false});
  final bool showSignIn;

  /// white text (over the dark hero)
  final bool light;
  final bool transparent;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final fg = light ? t.onBrandDeep : null;
    return Container(
      height: 60,
      padding: EdgeInsets.symmetric(horizontal: context.pagePad),
      decoration: transparent ? null : BoxDecoration(color: t.surface, border: Border(bottom: BorderSide(color: t.divider))),
      child: Row(children: [
        BrandLockup(size: 24, light: light, onTap: () => context.go('/')),
        const Spacer(),
        LangToggle(color: fg),
        const SizedBox(width: 4),
        ThemeToggle(color: fg),
        if (showSignIn) ...[
          const SizedBox(width: 10),
          AppButton(label: context.t('login.signIn'), variant: ButtonVariant.primary, size: ButtonSize.sm, trailing: AppIcon.arrowRight, onPressed: () => context.go('/login')),
        ],
      ]),
    );
  }
}

/// TH / EN.
class LangToggle extends StatelessWidget {
  const LangToggle({super.key, this.color});
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final i18n = context.i18n;
    final t = context.tokens;
    return Tooltip(
      message: context.t('set.language'),
      child: InkWell(
        onTap: i18n.toggle,
        borderRadius: t.rMd,
        child: Container(
          height: 36,
          padding: const EdgeInsets.symmetric(horizontal: 10),
          alignment: Alignment.center,
          child: Text(i18n.th ? 'EN' : 'TH', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: color ?? t.n700, letterSpacing: 0.5)),
        ),
      ),
    );
  }
}

/// Sun / moon: the switch spreads out of the button as a circle (overlays/theme_reveal.dart).
class ThemeToggle extends StatelessWidget {
  const ThemeToggle({super.key, this.color});
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final theme = context.stores.theme;
    final dark = theme.isDark;
    return Builder(
      builder: (btnContext) => IconBtn(
        icon: dark ? AppIcon.sun : AppIcon.moon,
        label: btnContext.t(dark ? 'header.themeLight' : 'header.themeDark'),
        color: color,
        onPressed: () => theme.toggle(origin: originOf(btnContext), reduced: btnContext.reducedMotion),
      ),
    );
  }
}
