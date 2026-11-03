import 'package:flutter/material.dart';

import '../app/scope.dart';
import '../components/ui/button.dart';
import '../constants/icons.dart';
import '../services/api_client.dart';
import '../theme/tokens.dart';
import '../util/platform.dart';

/// A bar above the header while the API is unreachable, slow, or behind a proxy that answers for it. Hidden while
/// every call is answered.
class ApiStatusBar extends StatelessWidget {
  const ApiStatusBar({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.stores.api;
    return ValueListenableBuilder<ApiStatus>(
      valueListenable: api.status,
      builder: (context, status, _) {
        if (status == ApiStatus.up) return const SizedBox.shrink();
        final t = context.tokens;
        final (icon, key) = switch (status) {
          ApiStatus.offline => (AppIcon.wifiOff, 'net.offline'),
          ApiStatus.timeout => (AppIcon.hourglass, 'net.slow'),
          ApiStatus.gateway => (AppIcon.cloudOff, 'net.down'),
          ApiStatus.up => (AppIcon.check, ''),
        };
        return Material(
          color: t.warnBg,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(children: [
              AppIconW(icon, size: 16, color: t.warnFg),
              const SizedBox(width: 8),
              Expanded(child: Text(context.t(key), style: TextStyle(color: t.warnFg, fontSize: AppTokens.textSm, fontWeight: FontWeight.w500))),
              AppButton(
                label: context.t('net.retry'),
                size: ButtonSize.sm,
                variant: ButtonVariant.tertiary,
                icon: AppIcon.refresh,
                onPressed: () {
                  api.status.value = ApiStatus.up;
                  reloadPage();
                },
              ),
            ]),
          ),
        );
      },
    );
  }
}
