import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/scope.dart';
import '../../components/ui/error_state.dart';
import '../../constants/icons.dart';
import '../../layouts/app_shell.dart';

/// A page the person's account may not open (RequireCan): says so, with the way out, instead of a blank screen.
class ForbiddenPage extends StatelessWidget {
  const ForbiddenPage({super.key});

  @override
  Widget build(BuildContext context) => ShellPage(
        child: SizedBox(
          height: 480,
          child: ErrorState(
            icon: AppIcon.shieldLock,
            title: context.t('error.403.title'),
            desc: context.t('error.403.desc'),
            onHome: () => context.go('/'),
          ),
        ),
      );
}
