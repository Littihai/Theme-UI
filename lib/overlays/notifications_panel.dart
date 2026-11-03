import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app/scope.dart';
import '../components/ui/badge.dart';
import '../components/ui/button.dart';
import '../components/ui/empty_state.dart';
import '../constants/icons.dart';
import '../theme/tokens.dart';
import '../util/format.dart';
import 'anchored.dart';

/// The bell and the panel under it: newest first, unread marked, a tap opens the link and marks it read.
class NotificationsBell extends StatelessWidget {
  const NotificationsBell({super.key});

  @override
  Widget build(BuildContext context) {
    final store = context.stores.notifications;
    final t = context.tokens;
    return AnchoredPanel(
      width: 360,
      trigger: (context, toggle, open) => IconBtn(icon: AppIcon.bell, label: context.t('notif.title'), badge: store.unread, active: open, onPressed: toggle),
      panel: (context, close) => ListenableBuilder(
        listenable: store,
        builder: (context, _) {
          final items = store.items;
          return Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 10, 8, 6),
              child: Row(children: [
                Expanded(child: Text(context.t('notif.title'), style: context.textTheme.titleSmall)),
                if (store.unread > 0) AppButton(label: context.t('notif.markAll'), variant: ButtonVariant.tertiary, size: ButtonSize.sm, onPressed: store.markAllRead),
              ]),
            ),
            Divider(color: t.divider),
            Flexible(
              child: items.isEmpty
                  ? EmptyState(icon: AppIcon.bell, title: context.t('notif.empty'), compact: true)
                  : ListView(
                      shrinkWrap: true,
                      children: [
                        for (final n in items)
                          InkWell(
                            onTap: () {
                              store.markRead(n.id);
                              close();
                              if (n.linkUrl != null) context.go(n.linkUrl!);
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(color: n.isRead ? null : t.a100.withValues(alpha: 0.5), border: Border(bottom: BorderSide(color: t.divider))),
                              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Padding(padding: const EdgeInsets.only(top: 5), child: ToneDot(n.tone)),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                    Text(n.title, style: TextStyle(fontSize: AppTokens.textMd, fontWeight: n.isRead ? FontWeight.w400 : FontWeight.w600, color: t.text)),
                                    if (n.body != null) Text(n.body!, style: TextStyle(fontSize: AppTokens.textSm, color: t.muted)),
                                    Padding(padding: const EdgeInsets.only(top: 2), child: Text(relativeTime(n.createdAt, context.i18n), style: TextStyle(fontSize: AppTokens.textXs, color: t.n500))),
                                  ]),
                                ),
                              ]),
                            ),
                          ),
                      ],
                    ),
            ),
          ]);
        },
      ),
    );
  }
}
