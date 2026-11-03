import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/scope.dart';
import '../../components/ui/badge.dart';
import '../../components/ui/button.dart';
import '../../components/ui/field.dart';
import '../../components/ui/page_header.dart';
import '../../components/ui/panel.dart';
import '../../components/ui/stage_card.dart';
import '../../components/ui/timeline.dart';
import '../../constants/icons.dart';
import '../../layouts/app_shell.dart';
import '../../overlays/confirm_dialog.dart';
import '../../theme/tokens.dart';
import '../../util/format.dart';

enum _Doc { draft, review, approved }

/// A staged document with its history and an approval: the current stage is open, the approver decides from the
/// bar at the bottom (approve, or "ไม่อนุมัติ" with a reason), a refused document goes back to draft to be submitted again.
class DocumentPage extends StatefulWidget {
  const DocumentPage({super.key});

  @override
  State<DocumentPage> createState() => _DocumentPageState();
}

class _DocumentPageState extends State<DocumentPage> {
  static const _id = 'SO-2026-1042';
  _Doc _state = _Doc.review;
  int? _open;
  String? _reason;
  final _comment = TextEditingController();
  final _history = <TimelineItem>[];

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  Future<void> _approve() async {
    final ok = await confirm(context, title: context.t('demo.doc.approveQ', {'id': _id}), text: context.t('demo.doc.approveText'), okLabel: context.t('demo.tbl.approve'));
    if (!ok || !mounted) return;
    setState(() {
      _state = _Doc.approved;
      _open = null;
      _history.add(TimelineItem(title: context.t('demo.tl.approved'), sub: _comment.text.trim().isEmpty ? null : _comment.text.trim(), when: context.t('notif.justNow'), tone: StatusTone.ok));
    });
    context.stores.toasts.success(context.t('demo.doc.approved', {'id': _id}));
    context.stores.notifications.push(title: context.t('demo.doc.approved', {'id': _id}), tone: StatusTone.ok, linkUrl: '/document');
  }

  Future<void> _reject() async {
    final reason = await askReason(context, title: context.t('demo.doc.rejectQ', {'id': _id}), placeholder: context.t('demo.fb.reason.ph'), okLabel: context.t('demo.doc.reject'));
    if (reason == null || !mounted) return;
    setState(() {
      _state = _Doc.draft;
      _reason = reason;
      _open = 0;
      _history.add(TimelineItem(title: context.t('demo.doc.rejected'), sub: reason, when: context.t('notif.justNow'), tone: StatusTone.stop));
    });
    context.stores.toasts.warn(context.t('demo.doc.rejected'), text: reason);
  }

  void _resubmit() {
    setState(() {
      _state = _Doc.review;
      _reason = null;
      _open = null;
      _history.add(TimelineItem(title: context.t('demo.tl.submitted'), sub: context.t('demo.tl.submittedSub'), when: context.t('notif.justNow'), tone: StatusTone.accent));
    });
    context.stores.toasts.success(context.t('demo.doc.resubmitted'));
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final lang = context.i18n.lang;
    final now = DateTime.now();
    final statusKey = switch (_state) { _Doc.draft => 'demo.status.rejected', _Doc.review => 'demo.status.pending', _Doc.approved => 'demo.status.approved' };
    final statusTone = switch (_state) { _Doc.draft => StatusTone.stop, _Doc.review => StatusTone.warn, _Doc.approved => StatusTone.ok };
    final current = switch (_state) { _Doc.draft => 0, _Doc.review => 1, _Doc.approved => 2 };
    StageStatus st(int i) => i < current ? StageStatus.done : i == current ? StageStatus.current : StageStatus.upcoming;
    bool isOpen(int i) => _open == null ? i == current : _open == i;

    final lines = [('Steel sheet 2mm', 120, 185), ('Copper wire 1.5', 40, 652)];
    final sub = lines.fold<int>(0, (a, l) => a + l.$2 * l.$3);
    const freight = 1200;

    final linesTable = Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      for (final l in lines)
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(children: [
            Expanded(child: Text(l.$1, style: TextStyle(fontSize: AppTokens.textMd, color: t.text))),
            SizedBox(width: 70, child: Text('${l.$2}', textAlign: TextAlign.right, style: TextStyle(fontSize: AppTokens.textSm, color: t.muted))),
            SizedBox(width: 90, child: Text(fmtMoney(l.$3), textAlign: TextAlign.right, style: TextStyle(fontSize: AppTokens.textSm, color: t.muted))),
            SizedBox(width: 100, child: Text(fmtMoney(l.$2 * l.$3), textAlign: TextAlign.right, style: TextStyle(fontSize: AppTokens.textMd, fontWeight: FontWeight.w600, color: t.text))),
          ]),
        ),
      Divider(color: t.divider),
      Row(children: [
        Expanded(child: Text(context.t('demo.doc.freight'), style: TextStyle(fontSize: AppTokens.textSm, color: t.muted))),
        Text(fmtMoney(freight), style: TextStyle(fontSize: AppTokens.textSm, color: t.muted)),
      ]),
      const SizedBox(height: 4),
      Row(children: [
        Expanded(child: Text(context.t('demo.doc.total'), style: TextStyle(fontSize: AppTokens.textMd, fontWeight: FontWeight.w600, color: t.text))),
        Text(fmtMoney(sub + freight), style: TextStyle(fontSize: AppTokens.textLg, fontWeight: FontWeight.w700, color: t.text)),
      ]),
    ]);

    final stages = Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      StageCard(
        n: 1,
        title: context.t('demo.stage.draft'),
        summary: '${lines.length} ${context.t('demo.doc.lines')} · ${fmtMoney(sub + freight)}',
        status: st(0),
        open: isOpen(0),
        onToggle: () => setState(() => _open = isOpen(0) ? -1 : 0),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          if (_state == _Doc.draft) ...[FormAlert('${context.t('demo.doc.draftHint')} ${_reason == null ? '' : '· $_reason'}', tone: StatusTone.warn), const SizedBox(height: 12)],
          Text(context.t('demo.stage.draftBody'), style: TextStyle(fontSize: AppTokens.textSm, color: t.muted)),
          const SizedBox(height: 10),
          linesTable,
        ]),
      ),
      const SizedBox(height: 10),
      StageCard(
        n: 2,
        title: context.t('demo.stage.approve'),
        summary: _state == _Doc.approved ? context.t('demo.tl.approved') : context.t('demo.stage.approveSummary'),
        status: st(1),
        open: isOpen(1),
        onToggle: () => setState(() => _open = isOpen(1) ? -1 : 1),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          if (_state == _Doc.review) ...[FormAlert(context.t('demo.doc.reviewHint'), tone: StatusTone.accent), const SizedBox(height: 12)],
          Text(context.t('demo.stage.approveBody'), style: TextStyle(fontSize: AppTokens.textSm, color: t.muted)),
          const SizedBox(height: 12),
          Field(label: context.t('demo.doc.comment'), hint: context.t('demo.doc.commentHint'), child: AppTextField(controller: _comment, maxLines: 3, enabled: _state == _Doc.review)),
        ]),
      ),
      const SizedBox(height: 10),
      StageCard(
        n: 3,
        title: context.t('demo.stage.ship'),
        status: st(2),
        open: isOpen(2),
        onToggle: () => setState(() => _open = isOpen(2) ? -1 : 2),
        child: Text(context.t('demo.stage.shipBody'), style: TextStyle(fontSize: AppTokens.textSm, color: t.muted)),
      ),
    ]);

    final history = Panel(
      title: context.t('demo.nav.history'),
      child: Timeline(items: [
        TimelineItem(title: context.t('demo.tl.created'), sub: 'Somchai', when: fmtDate(now.subtract(const Duration(days: 3)), lang), tone: StatusTone.neutral),
        TimelineItem(title: context.t('demo.tl.submitted'), sub: context.t('demo.tl.submittedSub'), when: fmtDate(now.subtract(const Duration(days: 2)), lang), tone: StatusTone.accent),
        ..._history,
        if (_state != _Doc.approved) TimelineItem(title: context.t('demo.tl.approved'), hollow: true),
        TimelineItem(title: context.t('demo.tl.ship'), hollow: true),
      ]),
    );

    final noteKey = switch (_state) { _Doc.review => 'demo.doc.noteReview', _Doc.draft => 'demo.doc.noteDraft', _Doc.approved => 'demo.doc.noteDone' };
    final actions = switch (_state) {
      _Doc.review => [
          AppButton(label: context.t('demo.doc.reject'), icon: AppIcon.blocked, onPressed: _reject),
          AppButton(label: context.t('demo.tbl.approve'), variant: ButtonVariant.primary, icon: AppIcon.check, onPressed: _approve),
        ],
      _Doc.draft => [AppButton(label: context.t('demo.doc.resubmit'), variant: ButtonVariant.primary, icon: AppIcon.paperAirplane, onPressed: _resubmit)],
      _Doc.approved => [AppButton(label: context.t('demo.doc.backToList'), icon: AppIcon.arrowLeft, onPressed: () => context.go('/tables'))],
    };

    return ShellPage(
      child: PageBody(children: [
        PageHeader(
          crumbs: [CrumbItem(context.t('nav.home'), path: '/'), CrumbItem(context.t('nav.tables'), path: '/tables'), const CrumbItem(_id)],
          title: _id,
          subtitle: context.t('demo.stage.note', {'n': current + 1}),
          actions: [StatusBadge(context.t(statusKey), tone: statusTone, dot: true)],
        ),
        Cols(flex: const [3, 2], children: [stages, history]),
        ActionBar(note: context.t(noteKey), children: actions),
      ]),
    );
  }
}
