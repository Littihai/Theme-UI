import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../services/api_client.dart';
import '../../theme/tokens.dart';
import 'button.dart';

/// What kind of failure a response is, so the UI can pick the icon, the heading and the help line.
enum FailureKind { offline, timeout, input, signin, forbidden, outdated, missing, stale, busy, down, server }

FailureKind failureKind({required int status, String? code}) {
  if (code == 'TIMEOUT') return FailureKind.timeout;
  if (status == 0) return FailureKind.offline;
  if (code == 'ENDPOINT_NOT_FOUND' || status == 405 || status == 406 || status == 501) return FailureKind.outdated;
  if (code == 'MODULE_DISABLED') return FailureKind.down;
  return switch (status) {
    401 => FailureKind.signin,
    403 => FailureKind.forbidden,
    404 || 410 => FailureKind.missing,
    409 => FailureKind.stale,
    429 => FailureKind.busy,
    502 || 503 || 504 => FailureKind.down,
    >= 500 => FailureKind.server,
    _ => FailureKind.input,
  };
}

AppIcon _iconOf(FailureKind k) => switch (k) {
      FailureKind.offline => AppIcon.wifiOff,
      FailureKind.timeout => AppIcon.hourglass,
      FailureKind.signin => AppIcon.lock,
      FailureKind.forbidden => AppIcon.shield,
      FailureKind.outdated => AppIcon.server,
      FailureKind.missing => AppIcon.question,
      FailureKind.stale => AppIcon.history,
      FailureKind.busy => AppIcon.clock,
      FailureKind.down => AppIcon.cloudOff,
      FailureKind.server || FailureKind.input => AppIcon.bug,
    };

String? _helpKey(FailureKind k) => switch (k) {
      FailureKind.forbidden => 'error.h.forbidden',
      FailureKind.outdated => 'error.h.outdated',
      FailureKind.server => 'error.h.server',
      _ => null,
    };

/// A failed load, inside a card: reads the kind from status/code and picks the icon, the heading, the sentence and
/// whether "Try again" makes sense.
class InlineError extends StatelessWidget {
  const InlineError({super.key, required this.response, this.onRetry, this.compact = false});
  final ApiResponse<Object?> response;
  final VoidCallback? onRetry;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final k = failureKind(status: response.status, code: response.code);
    final help = _helpKey(k);
    final retry = onRetry != null && (response.transient || k == FailureKind.stale);
    return Container(
      padding: EdgeInsets.all(compact ? 12 : 16),
      decoration: BoxDecoration(color: t.stopBg.withValues(alpha: t.dark ? 0.5 : 0.6), borderRadius: t.rMd, border: Border.all(color: t.stopSolid.withValues(alpha: 0.3))),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppIconW(_iconOf(k), size: 20, color: t.stopFg),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(context.t('error.k.${k.name}'), style: TextStyle(fontWeight: FontWeight.w600, color: t.stopFg, fontSize: AppTokens.textMd)),
                const SizedBox(height: 2),
                Text(response.message, style: TextStyle(color: t.text, fontSize: AppTokens.textSm)),
                if (help != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(context.t(help), style: TextStyle(color: t.muted, fontSize: AppTokens.textXs))),
                if (response.ref != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text('${context.t('error.ref')}: ${response.ref}', style: TextStyle(color: t.muted, fontSize: AppTokens.textXs))),
              ],
            ),
          ),
          if (retry) ...[const SizedBox(width: 8), AppButton(label: context.t('error.retry'), size: ButtonSize.sm, icon: AppIcon.refresh, onPressed: onRetry)],
        ],
      ),
    );
  }
}

/// The page-level error: for 404/403 and a crash. A reference to copy, next steps, and the way out.
class ErrorState extends StatelessWidget {
  const ErrorState({super.key, required this.title, required this.desc, this.icon = AppIcon.alert, this.reference, this.onRetry, this.onHome, this.onBack, this.extra});
  final String title;
  final String desc;
  final AppIcon icon;
  final String? reference;
  final VoidCallback? onRetry;
  final VoidCallback? onHome;
  final VoidCallback? onBack;
  final Widget? extra;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(width: 56, height: 56, decoration: BoxDecoration(color: t.n100, borderRadius: t.rXl), child: Center(child: AppIconW(icon, size: 28, color: t.n600))),
              const SizedBox(height: 16),
              Text(title, textAlign: TextAlign.center, style: context.textTheme.headlineSmall),
              const SizedBox(height: 6),
              Text(desc, textAlign: TextAlign.center, style: TextStyle(color: t.muted, fontSize: AppTokens.textMd)),
              if (reference != null) ...[
                const SizedBox(height: 12),
                InkWell(
                  onTap: () => Clipboard.setData(ClipboardData(text: reference!)),
                  borderRadius: t.rSm,
                  child: Tooltip(
                    message: context.t('error.copyRef'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(color: t.n100, borderRadius: t.rSm, border: Border.all(color: t.n300)),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Text('${context.t('error.ref')}: $reference', style: TextStyle(fontSize: AppTokens.textXs, color: t.n700, fontFeatures: const [FontFeature.tabularFigures()])),
                        const SizedBox(width: 6),
                        AppIconW(AppIcon.copy, size: 14, color: t.n500),
                      ]),
                    ),
                  ),
                ),
              ],
              if (extra != null) Padding(padding: const EdgeInsets.only(top: 12), child: extra!),
              const SizedBox(height: 18),
              Wrap(spacing: 8, runSpacing: 8, alignment: WrapAlignment.center, children: [
                if (onRetry != null) AppButton(label: context.t('error.retry'), variant: ButtonVariant.primary, icon: AppIcon.refresh, onPressed: onRetry),
                if (onBack != null) AppButton(label: context.t('error.back'), icon: AppIcon.arrowLeft, onPressed: onBack),
                if (onHome != null) AppButton(label: context.t('error.home'), icon: AppIcon.home, onPressed: onHome),
              ]),
            ],
          ),
        ),
      ),
    );
  }
}
