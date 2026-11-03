import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/scope.dart';
import '../../components/ui/error_state.dart';
import '../../constants/icons.dart';
import '../../layouts/app_shell.dart';

/// Unknown path while signed in: a friendly 404 inside the app shell.
class NotFoundPage extends StatelessWidget {
  const NotFoundPage({super.key});

  @override
  Widget build(BuildContext context) => ShellPage(
        child: SizedBox(
          height: 480,
          child: ErrorState(
            icon: AppIcon.telescope,
            title: context.t('error.404.title'),
            desc: context.t('error.404.desc'),
            onHome: () => context.go('/'),
            onBack: context.canPop() ? () => context.pop() : null,
          ),
        ),
      );
}
