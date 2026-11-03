import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../components/ui/app_logo.dart';
import '../../components/ui/button.dart';
import '../../components/ui/field.dart';
import '../../components/ui/stat_tile.dart';
import '../../constants/brand.dart';
import '../../constants/icons.dart';
import '../../layouts/public_frame.dart';
import '../../theme/tokens.dart';
import '../../types.dart';

/// The sign-in page in two layouts, chosen by [Brand.loginLayout]: a dark brand panel (name, tagline, the numbers)
/// beside the card, or the card alone on a plain page. A successful sign-in lets the router send the person on.
class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    final split = Brand.loginLayout == LoginLayout.split && !context.isTight;
    return Scaffold(
      backgroundColor: context.tokens.bg,
      body: split ? const _SplitLayout() : const _CenteredLayout(),
    );
  }
}

class _SplitLayout extends StatelessWidget {
  const _SplitLayout();

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Row(children: [
      Expanded(
        flex: 5,
        child: Container(
          color: t.brandDeep,
          padding: const EdgeInsets.all(48),
          child: Stack(children: [
            const Align(alignment: Alignment.topLeft, child: BrandLockup(size: 28, light: true)),
            Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 520),
                child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
                  _Rise(
                    delay: 0,
                    child: Text(Brand.name, style: TextStyle(color: t.onBrandDeep, fontSize: 44, fontWeight: FontWeight.w700, height: 1.1, letterSpacing: -0.5)),
                  ),
                  const SizedBox(height: 12),
                  _Rise(delay: 120, child: Text(context.pick(Brand.tagline), style: TextStyle(color: t.onBrandDeep.withValues(alpha: 0.8), fontSize: AppTokens.textXl, height: 1.4))),
                  const SizedBox(height: 36),
                  _Rise(
                    delay: 240,
                    child: Wrap(spacing: 36, runSpacing: 20, children: [
                      for (final s in Brand.stats)
                        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          CountUp(s.value, style: TextStyle(color: t.onBrandDeep, fontSize: AppTokens.text3xl, fontWeight: FontWeight.w700, height: 1.1)),
                          Text(context.t(s.labelKey), style: TextStyle(color: t.onBrandDeep.withValues(alpha: 0.7), fontSize: AppTokens.textSm)),
                        ]),
                    ]),
                  ),
                ]),
              ),
            ),
            Align(
              alignment: Alignment.bottomLeft,
              child: Text('© ${DateTime.now().year} ${Brand.company} · ${context.t('footer.rights')}', style: TextStyle(color: t.onBrandDeep.withValues(alpha: 0.5), fontSize: AppTokens.textXs)),
            ),
          ]),
        ),
      ),
      const Expanded(
        flex: 4,
        child: Column(children: [
          PublicBar(showSignIn: false, transparent: true),
          Expanded(child: Center(child: SingleChildScrollView(padding: EdgeInsets.all(32), child: SignInCard()))),
          SizedBox(height: 24),
        ]),
      ),
    ]);
  }
}

class _CenteredLayout extends StatelessWidget {
  const _CenteredLayout();

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      const PublicBar(showSignIn: false, transparent: true),
      Expanded(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(context.pagePad),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              const AppLogo(size: 40, tile: true),
              const SizedBox(height: 14),
              Text(Brand.name, style: context.textTheme.headlineSmall),
              const SizedBox(height: 4),
              Text(context.pick(Brand.tagline), textAlign: TextAlign.center, style: TextStyle(color: context.tokens.muted, fontSize: AppTokens.textMd)),
              const SizedBox(height: 24),
              const SignInCard(),
            ]),
          ),
        ),
      ),
    ]);
  }
}

/// The form itself, shared by both layouts: user name, password, remember me, the sample accounts.
class SignInCard extends StatefulWidget {
  const SignInCard({super.key});

  @override
  State<SignInCard> createState() => _SignInCardState();
}

class _SignInCardState extends State<SignInCard> {
  final _user = TextEditingController();
  final _pass = TextEditingController();
  bool _show = false;
  bool _remember = false;
  bool _busy = false;
  String? _error;
  String? _userError;
  String? _passError;

  @override
  void dispose() {
    _user.dispose();
    _pass.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final u = _user.text.trim();
    final p = _pass.text;
    setState(() {
      _userError = u.isEmpty ? context.t('login.hint') : null;
      _passError = p.isEmpty ? context.t('login.hint') : null;
      _error = null;
    });
    if (u.isEmpty || p.isEmpty) return;
    await _login(u, p);
  }

  Future<void> _login(String u, String p) async {
    setState(() => _busy = true);
    final res = await context.stores.auth.login(u, p, rememberMe: _remember);
    if (!mounted) return;
    setState(() {
      _busy = false;
      _error = res.success ? null : context.t('login.invalid');
    });
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final accounts = context.stores.auth.directory;
    return Container(
      width: 420,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(color: t.surface, borderRadius: t.rXl, border: Border.all(color: t.divider), boxShadow: t.shadowLg),
      child: AutofillGroup(
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
          Text(context.t('login.signIn'), style: context.textTheme.headlineSmall),
          const SizedBox(height: 4),
          Text(context.t('login.hint'), style: TextStyle(color: t.muted, fontSize: AppTokens.textMd)),
          const SizedBox(height: 20),
          if (_error != null) ...[FormAlert(_error!), const SizedBox(height: 14)],
          Field(
            label: context.t('login.username'),
            error: _userError,
            child: AppTextField(
              controller: _user,
              placeholder: context.t('login.usernamePh'),
              prefixIcon: AppIcon.person,
              autofocus: true,
              errorText: _userError,
              autofillHints: const [AutofillHints.username],
              textInputAction: TextInputAction.next,
              onChanged: (_) => _userError == null ? null : setState(() => _userError = null),
            ),
          ),
          const SizedBox(height: 14),
          Field(
            label: context.t('login.password'),
            error: _passError,
            child: AppTextField(
              controller: _pass,
              placeholder: context.t('login.passwordPh'),
              prefixIcon: AppIcon.key,
              obscure: !_show,
              errorText: _passError,
              autofillHints: const [AutofillHints.password],
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => _submit(),
              onChanged: (_) => _passError == null ? null : setState(() => _passError = null),
              suffix: Padding(
                padding: const EdgeInsets.only(right: 4),
                child: IconBtn(icon: _show ? AppIcon.eyeClosed : AppIcon.eye, label: context.t(_show ? 'login.hidePassword' : 'login.showPassword'), size: 32, onPressed: () => setState(() => _show = !_show)),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: AppCheckbox(value: _remember, onChanged: (v) => setState(() => _remember = v), label: context.t('login.remember'))),
            AppButton(label: context.t('login.forgot'), variant: ButtonVariant.tertiary, size: ButtonSize.sm, onPressed: () => context.stores.toasts.info(context.t('login.forgot'), text: context.t('login.forgotHint'))),
          ]),
          const SizedBox(height: 16),
          AppButton(label: context.t(_busy ? 'login.signingIn' : 'login.signIn'), variant: ButtonVariant.primary, size: ButtonSize.lg, expand: true, busy: _busy, onPressed: _submit),
          if (accounts.isNotEmpty) ...[
            const SizedBox(height: 22),
            Divider(color: t.divider),
            const SizedBox(height: 14),
            Text(context.t('login.demoTitle'), style: TextStyle(fontWeight: FontWeight.w600, fontSize: AppTokens.textSm, color: t.text)),
            const SizedBox(height: 2),
            Text(context.t('login.demoHint'), style: TextStyle(color: t.muted, fontSize: AppTokens.textXs)),
            const SizedBox(height: 10),
            Wrap(spacing: 8, runSpacing: 8, children: [for (final a in accounts) _DemoButton(user: a, busy: _busy, onTap: () => _login(a.username, 'demo'))]),
          ],
          const SizedBox(height: 18),
          Text.rich(
            TextSpan(children: [
              TextSpan(text: '${context.t('login.supportLine')} '),
              TextSpan(text: Brand.supportEmail, style: TextStyle(color: t.a800, fontWeight: FontWeight.w500)),
            ]),
            style: TextStyle(color: t.muted, fontSize: AppTokens.textXs),
          ),
        ]),
      ),
    );
  }
}

class _DemoButton extends StatelessWidget {
  const _DemoButton({required this.user, required this.busy, required this.onTap});
  final SessionUser user;
  final bool busy;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => AppButton(
        label: '${user.username} · ${user.role}',
        size: ButtonSize.sm,
        icon: user.allPermissions ? AppIcon.shieldLock : AppIcon.person,
        onPressed: busy ? null : onTap,
      );
}

/// Rises into place with a short fade, [delay] ms after the first frame; a plain child with reduced motion.
class _Rise extends StatefulWidget {
  const _Rise({required this.delay, required this.child});
  final int delay;
  final Widget child;

  @override
  State<_Rise> createState() => _RiseState();
}

class _RiseState extends State<_Rise> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    if (context.reducedMotion) {
      _c.value = 1;
    } else {
      Future<void>.delayed(Duration(milliseconds: widget.delay), () {
        if (mounted) _c.forward();
      });
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final curve = CurvedAnimation(parent: _c, curve: Curves.easeOutCubic);
    return FadeTransition(
      opacity: curve,
      child: SlideTransition(position: Tween(begin: const Offset(0, 0.25), end: Offset.zero).animate(curve), child: widget.child),
    );
  }
}
