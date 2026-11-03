import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../theme/tokens.dart';

enum StageStatus { done, current, upcoming }

/// One stage of a document: a done stage folds to a line, the current one is open, a later one is dimmed.
class StageCard extends StatelessWidget {
  const StageCard({super.key, required this.n, required this.title, this.summary, required this.status, required this.open, this.onToggle, required this.child});
  final int n;
  final String title;
  final String? summary;
  final StageStatus status;
  final bool open;
  final VoidCallback? onToggle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final (bg, fg) = switch (status) {
      StageStatus.done => (t.okBg, t.okFg),
      StageStatus.current => (t.accent, t.onAccent),
      StageStatus.upcoming => (t.n100, t.n500),
    };
    final dim = status == StageStatus.upcoming;
    return Opacity(
      opacity: dim ? 0.7 : 1,
      child: Container(
        decoration: BoxDecoration(
          color: t.surface,
          borderRadius: t.rLg,
          border: Border.all(color: status == StageStatus.current ? t.a300 : t.divider),
          boxShadow: status == StageStatus.current ? t.shadowMd : t.shadowSm,
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            InkWell(
              onTap: onToggle,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(14, 12, 10, 12),
                child: Row(children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
                    alignment: Alignment.center,
                    child: status == StageStatus.done ? AppIconW(AppIcon.check, size: 16, color: fg) : Text('$n', style: TextStyle(color: fg, fontWeight: FontWeight.w700, fontSize: AppTokens.textSm)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(title, style: TextStyle(fontWeight: FontWeight.w600, fontSize: AppTokens.textMd, color: t.text)),
                      if (summary != null && !open) Text(summary!, style: TextStyle(color: t.muted, fontSize: AppTokens.textSm)),
                    ]),
                  ),
                  if (onToggle != null)
                    Tooltip(message: context.t(open ? 'stage.fold' : 'stage.open'), child: AppIconW(open ? AppIcon.chevronUp : AppIcon.chevronDown, size: 18, color: t.n500)),
                ]),
              ),
            ),
            if (open) ...[
              Divider(color: t.divider),
              Padding(padding: const EdgeInsets.all(16), child: child),
            ],
          ],
        ),
      ),
    );
  }
}

/// The bar at the bottom of a document page: a note on the left, the decisions on the right (one primary at most).
class ActionBar extends StatelessWidget {
  const ActionBar({super.key, this.note, required this.children});
  final String? note;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final mobile = context.isMobile;
    final acts = Wrap(spacing: 8, runSpacing: 8, alignment: WrapAlignment.end, children: children);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(color: t.surface, borderRadius: t.rLg, border: Border.all(color: t.divider), boxShadow: t.shadowMd),
      child: mobile
          ? Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [if (note != null) Padding(padding: const EdgeInsets.only(bottom: 10), child: Text(note!, style: TextStyle(color: t.muted, fontSize: AppTokens.textSm))), acts])
          : Row(children: [
              Expanded(child: note == null ? const SizedBox.shrink() : Text(note!, style: TextStyle(color: t.muted, fontSize: AppTokens.textSm))),
              const SizedBox(width: 16),
              acts,
            ]),
    );
  }
}
