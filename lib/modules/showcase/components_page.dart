import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../app/scope.dart';
import '../../components/ui/app_switch.dart';
import '../../components/ui/badge.dart';
import '../../components/ui/bulk_bar.dart';
import '../../components/ui/button.dart';
import '../../components/ui/empty_state.dart';
import '../../components/ui/error_state.dart';
import '../../components/ui/field.dart';
import '../../components/ui/page_header.dart';
import '../../components/ui/pager.dart';
import '../../components/ui/panel.dart';
import '../../components/ui/select.dart';
import '../../components/ui/skeleton.dart';
import '../../components/ui/stage_card.dart';
import '../../components/ui/stat_tile.dart';
import '../../components/ui/tabs.dart';
import '../../components/ui/timeline.dart';
import '../../constants/icons.dart';
import '../../layouts/app_shell.dart';
import '../../overlays/confirm_dialog.dart';
import '../../services/api_client.dart';
import '../../theme/tokens.dart';

const _tabs = ['buttons', 'forms', 'feedback', 'states', 'navigation', 'icons'];

/// Every piece of the kit, drawn with its real props, one tab per family.
class ComponentsPage extends StatelessWidget {
  const ComponentsPage({super.key, this.tab});
  final String? tab;

  @override
  Widget build(BuildContext context) {
    final active = _tabs.contains(tab) ? tab! : 'buttons';
    return ShellPage(
      child: PageBody(children: [
        PageHeader(
          pre: context.t('navgroup.kit'),
          title: context.t('nav.components'),
          subtitle: context.t('demo.components.sub'),
          bottom: AppTabs(tabs: [for (final id in _tabs) TabItem(id, context.t('demo.tab.$id'))], active: active, onPick: (id) => context.go('/components/$id')),
        ),
        switch (active) {
          'forms' => const _FormsTab(),
          'feedback' => const _FeedbackTab(),
          'states' => const _StatesTab(),
          'navigation' => const _NavigationTab(),
          'icons' => const _IconsTab(),
          _ => const _ButtonsTab(),
        },
      ]),
    );
  }
}

class _Demo extends StatelessWidget {
  const _Demo({required this.title, required this.desc, required this.child});
  final String title;
  final String desc;
  final Widget child;

  @override
  Widget build(BuildContext context) => Panel(title: title, subtitle: desc, child: child);
}

class _ButtonsTab extends StatefulWidget {
  const _ButtonsTab();

  @override
  State<_ButtonsTab> createState() => _ButtonsTabState();
}

class _ButtonsTabState extends State<_ButtonsTab> {
  bool _busy = false;
  bool _on = true;
  String _pill = 'all';

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      _Demo(
        title: context.t('demo.btn.variants'),
        desc: context.t('demo.btn.variantsDesc'),
        child: Wrap(spacing: 8, runSpacing: 8, children: [
          for (final v in ButtonVariant.values) AppButton(label: v.name, variant: v, onPressed: () {}),
        ]),
      ),
      const SizedBox(height: 16),
      _Demo(
        title: context.t('demo.btn.sizes'),
        desc: context.t('demo.btn.sizesDesc'),
        child: Wrap(spacing: 8, runSpacing: 8, crossAxisAlignment: WrapCrossAlignment.center, children: [
          AppButton(label: context.t('demo.btn.small'), size: ButtonSize.sm, onPressed: () {}),
          AppButton(label: context.t('demo.btn.medium'), onPressed: () {}),
          AppButton(label: context.t('demo.btn.large'), size: ButtonSize.lg, onPressed: () {}),
          AppButton(label: context.t('demo.btn.withIcon'), icon: AppIcon.download, onPressed: () {}),
          IconBtn(icon: AppIcon.pencil, label: context.t('demo.btn.iconOnly'), bordered: true, onPressed: () {}),
        ]),
      ),
      const SizedBox(height: 16),
      _Demo(
        title: context.t('demo.btn.states'),
        desc: context.t('demo.btn.statesDesc'),
        child: Wrap(spacing: 8, runSpacing: 8, children: [
          AppButton(
            label: context.t(_busy ? 'demo.btn.saving' : 'demo.btn.save'),
            variant: ButtonVariant.primary,
            busy: _busy,
            onPressed: () {
              setState(() => _busy = true);
              Future<void>.delayed(const Duration(milliseconds: 1500), () {
                if (mounted) setState(() => _busy = false);
              });
            },
          ),
          AppButton(label: context.t('demo.btn.disabled')),
          AppButton(label: context.t('demo.btn.inbox'), icon: AppIcon.inbox, count: 12, onPressed: () {}),
          AppButton(label: context.t('demo.btn.waiting'), variant: ButtonVariant.tertiary, count: 3, onPressed: () {}),
        ]),
      ),
      const SizedBox(height: 16),
      Cols(children: [
        _Demo(
          title: context.t('demo.badge'),
          desc: context.t('demo.badgeDesc'),
          child: Wrap(spacing: 8, runSpacing: 8, children: [
            for (final tone in StatusTone.values) StatusBadge(context.t('demo.tone.${tone.name}'), tone: tone, dot: true),
          ]),
        ),
        _Demo(
          title: context.t('demo.switch'),
          desc: context.t('demo.switchDesc'),
          child: AppSwitch(value: _on, onChanged: (v) => setState(() => _on = v), label: context.t(_on ? 'demo.on' : 'demo.off')),
        ),
      ]),
      const SizedBox(height: 16),
      Cols(children: [
        _Demo(
          title: context.t('demo.tabs'),
          desc: context.t('demo.tabsDesc'),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            AppTabs(tabs: [TabItem('all', context.t('demo.tabs.all'), count: 57), TabItem('mine', context.t('demo.tabs.mine'), icon: AppIcon.person, count: 4, hot: true), TabItem('done', context.t('demo.tabs.done'))], active: _pill, onPick: (v) => setState(() => _pill = v)),
            const SizedBox(height: 12),
            AppTabs(pills: true, tabs: [TabItem('all', context.t('demo.tabs.all')), TabItem('mine', context.t('demo.tabs.mine')), TabItem('done', context.t('demo.tabs.done'))], active: _pill, onPick: (v) => setState(() => _pill = v)),
          ]),
        ),
        _Demo(
          title: context.t('demo.avatar'),
          desc: context.t('demo.avatarDesc'),
          child: const Row(children: [Avatar('AD', size: 48), SizedBox(width: 8), Avatar('SD', size: 36, tone: StatusTone.neutral), SizedBox(width: 8), Avatar('NK', size: 28, tone: StatusTone.ok)]),
        ),
      ]),
    ]);
  }
}

class _FormsTab extends StatefulWidget {
  const _FormsTab();

  @override
  State<_FormsTab> createState() => _FormsTabState();
}

class _FormsTabState extends State<_FormsTab> {
  final _name = TextEditingController();
  String? _nameError;
  String? _item;
  StatusTone? _tone;
  bool _agree = false;
  bool _alert = false;

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  void _save() {
    final bad = _name.text.trim().isEmpty;
    setState(() {
      _nameError = bad ? context.t('demo.form.required') : null;
      _alert = bad;
    });
    if (!bad) context.stores.toasts.success(context.t('demo.form.saved'));
  }

  @override
  Widget build(BuildContext context) {
    return _Demo(
      title: context.t('demo.form.title'),
      desc: context.t('demo.form.desc'),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 560),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          if (_alert) ...[FormAlert(context.t('demo.form.alert')), const SizedBox(height: 14)],
          Field(
            label: context.t('demo.form.name'),
            hint: context.t('demo.form.nameHint'),
            required: true,
            error: _nameError,
            child: AppTextField(controller: _name, placeholder: context.t('demo.form.namePh'), errorText: _nameError, onChanged: (_) => setState(() => _nameError = null)),
          ),
          const SizedBox(height: 14),
          Field(
            label: context.t('demo.col.item'),
            hint: context.t('demo.form.searchHint'),
            child: AppSelect<String>(
              value: _item,
              searchable: true,
              clearable: true,
              options: const [
                SelectOption('steel', 'Steel sheet 2mm', group: 'Metal'),
                SelectOption('copper', 'Copper wire 1.5', group: 'Metal'),
                SelectOption('box', 'Corrugated box L', group: 'Packaging'),
                SelectOption('wrap', 'Pallet wrap 500m', group: 'Packaging'),
              ],
              onChanged: (v) => setState(() => _item = v),
            ),
          ),
          const SizedBox(height: 14),
          Field(
            label: context.t('demo.col.status'),
            child: AppSelect<StatusTone>(
              value: _tone,
              options: [for (final t in StatusTone.values) SelectOption(t, context.t('demo.tone.${t.name}'), tone: t)],
              onChanged: (v) => setState(() => _tone = v),
            ),
          ),
          const SizedBox(height: 14),
          Field(label: context.t('demo.form.note'), child: const AppTextField(maxLines: 3)),
          const SizedBox(height: 14),
          AppCheckbox(value: _agree, onChanged: (v) => setState(() => _agree = v), label: context.t('demo.form.agree')),
          const SizedBox(height: 18),
          Row(children: [
            AppButton(label: context.t('common.save'), variant: ButtonVariant.primary, onPressed: _save),
            const SizedBox(width: 8),
            AppButton(
              label: context.t('demo.form.openDialog'),
              onPressed: () => showDialog<void>(
                context: context,
                barrierColor: context.tokens.scrim,
                builder: (ctx) => Dialog(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 440),
                    child: Padding(
                      padding: const EdgeInsets.all(22),
                      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(ctx.t('demo.dialog.title'), style: ctx.textTheme.titleMedium),
                        const SizedBox(height: 6),
                        Text(ctx.t('demo.dialog.sub'), style: TextStyle(color: ctx.tokens.muted)),
                        const SizedBox(height: 18),
                        Align(alignment: Alignment.centerRight, child: AppButton(label: ctx.t('common.close'), variant: ButtonVariant.primary, onPressed: () => Navigator.of(ctx).pop())),
                      ]),
                    ),
                  ),
                ),
              ),
            ),
          ]),
        ]),
      ),
    );
  }
}

class _FeedbackTab extends StatelessWidget {
  const _FeedbackTab();

  @override
  Widget build(BuildContext context) {
    final toasts = context.stores.toasts;
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      _Demo(
        title: context.t('demo.fb.toast'),
        desc: context.t('demo.fb.toastDesc'),
        child: Wrap(spacing: 8, runSpacing: 8, children: [
          AppButton(label: context.t('demo.fb.success'), onPressed: () => toasts.success(context.t('demo.fb.savedTitle'), text: context.t('demo.fb.savedText'))),
          AppButton(label: context.t('demo.fb.info'), onPressed: () => toasts.info(context.t('demo.fb.infoTitle'), onTap: () => context.go('/document'))),
          AppButton(label: context.t('demo.fb.warn'), onPressed: () => toasts.warn(context.t('demo.fb.warnTitle'), text: context.t('demo.fb.warnText'), actionLabel: context.t('demo.fb.undo'), onAction: () => toasts.success(context.t('demo.fb.undone')))),
          AppButton(label: context.t('demo.fb.error'), onPressed: () => toasts.error(context.t('demo.fb.errorTitle'), text: context.t('demo.fb.errorText'))),
        ]),
      ),
      const SizedBox(height: 16),
      _Demo(
        title: context.t('demo.fb.confirm'),
        desc: context.t('demo.fb.confirmDesc'),
        child: Wrap(spacing: 8, runSpacing: 8, children: [
          AppButton(label: context.t('demo.fb.ask'), onPressed: () async {
            final ok = await confirm(context, title: context.t('demo.fb.q.title'), text: context.t('demo.fb.q.text'));
            if (context.mounted) toasts.info('${context.t('demo.fb.answer')}: ${ok ? context.t('common.ok') : context.t('common.cancel')}');
          }),
          AppButton(label: context.t('demo.fb.delete'), variant: ButtonVariant.danger, onPressed: () async {
            final ok = await confirm(context, title: context.t('demo.fb.del.title'), text: context.t('demo.fb.del.text'), okLabel: context.t('demo.fb.del.ok'), danger: true);
            if (context.mounted) toasts.info('${context.t('demo.fb.answer')}: ${ok ? context.t('demo.fb.del.ok') : context.t('common.cancel')}');
          }),
          AppButton(label: context.t('demo.fb.reject'), onPressed: () async {
            final r = await askReason(context, title: context.t('demo.fb.reason.title'), placeholder: context.t('demo.fb.reason.ph'), okLabel: context.t('demo.fb.reason.ok'));
            if (context.mounted) toasts.info('${context.t('demo.fb.answer')}: ${r ?? context.t('common.cancel')}');
          }),
        ]),
      ),
      const SizedBox(height: 16),
      _Demo(
        title: context.t('demo.fb.notif'),
        desc: context.t('demo.fb.notifDesc'),
        child: AppButton(
          label: context.t('demo.fb.send'),
          icon: AppIcon.bell,
          onPressed: () => context.stores.notifications.push(title: context.t('demo.fb.notifTitle'), body: context.t('demo.fb.notifBody'), tone: StatusTone.warn, linkUrl: '/document'),
        ),
      ),
      const SizedBox(height: 16),
      _Demo(
        title: context.t('demo.fb.sound'),
        desc: context.t('demo.fb.soundDesc'),
        child: Wrap(spacing: 8, runSpacing: 8, children: [
          AppButton(label: context.t('demo.fb.accepted'), icon: AppIcon.checkCircle, onPressed: () => HapticFeedback.lightImpact()),
          AppButton(label: context.t('demo.fb.refused'), icon: AppIcon.blocked, onPressed: () => HapticFeedback.heavyImpact()),
          AppButton(label: context.t('demo.fb.tick'), icon: AppIcon.clock, onPressed: () => HapticFeedback.selectionClick()),
        ]),
      ),
    ]);
  }
}

class _StatesTab extends StatefulWidget {
  const _StatesTab();

  @override
  State<_StatesTab> createState() => _StatesTabState();
}

class _StatesTabState extends State<_StatesTab> {
  int _fail = 0;

  @override
  Widget build(BuildContext context) {
    final fails = [
      ApiResponse<Object?>.fail(context.t('demo.state.failOffline'), status: 0, code: 'OFFLINE'),
      ApiResponse<Object?>.fail(context.t('demo.state.failForbidden'), status: 403),
      ApiResponse<Object?>.fail(context.t('demo.state.failServer'), status: 500),
    ];
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      _Demo(
        title: context.t('demo.state.skeleton'),
        desc: context.t('demo.state.skeletonDesc'),
        child: const Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [SkeletonLines(), SizedBox(height: 16), SkeletonTable(rows: 3)]),
      ),
      const SizedBox(height: 16),
      _Demo(
        title: context.t('demo.state.tiles'),
        desc: context.t('demo.state.tilesDesc'),
        child: TileGrid(children: [
          StatTile(label: context.t('demo.t.waiting'), value: 12, icon: AppIcon.hourglass, tone: StatusTone.warn, note: context.t('demo.t.waitingSub'), onTap: () {}),
          StatTile(label: context.t('demo.t.done'), value: 48, icon: AppIcon.checkCircle, tone: StatusTone.ok),
          StatTile(label: context.t('demo.t.late'), value: 3, icon: AppIcon.alert, tone: StatusTone.stop),
          StatTile(label: context.t('demo.t.total'), value: 1284500, icon: AppIcon.meter, tone: StatusTone.accent),
        ]),
      ),
      const SizedBox(height: 16),
      Cols(children: [
        _Demo(
          title: context.t('demo.state.empty'),
          desc: context.t('demo.state.emptyDesc'),
          child: EmptyState(title: context.t('demo.state.emptyText'), hint: context.t('demo.state.emptyHint'), action: AppButton(label: context.t('demo.state.emptyAction'), variant: ButtonVariant.primary, icon: AppIcon.plus, onPressed: () {}), compact: true),
        ),
        _Demo(
          title: context.t('demo.state.inlineError'),
          desc: context.t('demo.state.inlineErrorDesc'),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            InlineError(response: fails[_fail], onRetry: () {
              setState(() => _fail = (_fail + 1) % fails.length);
              context.stores.toasts.info(context.t('demo.state.retried'));
            }),
          ]),
        ),
      ]),
      const SizedBox(height: 16),
      Cols(children: [
        _Demo(
          title: context.t('demo.state.errorPage'),
          desc: context.t('demo.state.errorPageDesc'),
          child: ErrorState(title: context.t('demo.state.errorTitle'), desc: context.t('demo.state.errorDesc'), reference: 'ERR-7F3A2C', onRetry: () {}, onHome: () => context.go('/')),
        ),
        _Demo(
          title: context.t('demo.state.soon'),
          desc: context.t('demo.state.soonDesc'),
          child: ComingSoon(name: context.t('demo.state.soonName')),
        ),
      ]),
    ]);
  }
}

class _NavigationTab extends StatefulWidget {
  const _NavigationTab();

  @override
  State<_NavigationTab> createState() => _NavigationTabState();
}

class _NavigationTabState extends State<_NavigationTab> {
  int _picked = 3;
  bool _filtered = true;
  final _paged = Paged();
  int _stage = 1;

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Cols(children: [
        _Demo(
          title: context.t('demo.nav.crumb'),
          desc: context.t('demo.nav.crumbDesc'),
          child: Breadcrumb(items: [CrumbItem(context.t('nav.home'), path: '/'), CrumbItem(context.t('nav.tables'), path: '/tables'), const CrumbItem('2026', path: '/tables'), const CrumbItem('Q4', path: '/tables'), const CrumbItem('SO-2026-1042')]),
        ),
        _Demo(
          title: context.t('demo.nav.pageHeader'),
          desc: context.t('demo.nav.pageHeaderDesc'),
          child: PageHeader(pre: context.t('navgroup.kit'), title: context.t('demo.nav.sampleTitle'), subtitle: context.t('demo.nav.sampleSub'), actions: [
            AppButton(label: context.t('demo.nav.export'), size: ButtonSize.sm, icon: AppIcon.download, onPressed: () {}),
            AppButton(label: context.t('demo.nav.new'), size: ButtonSize.sm, variant: ButtonVariant.primary, icon: AppIcon.plus, onPressed: () {}),
          ]),
        ),
      ]),
      const SizedBox(height: 16),
      _Demo(
        title: context.t('demo.nav.bulk'),
        desc: context.t('demo.nav.bulkDesc'),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          if (_picked > 0)
            BulkBar(count: _picked, onClear: () => setState(() => _picked = 0), actions: [
              AppButton(label: context.t('demo.tbl.approve'), size: ButtonSize.sm, icon: AppIcon.check, onPressed: () => setState(() => _picked = 0)),
              AppButton(label: context.t('demo.nav.delete'), size: ButtonSize.sm, variant: ButtonVariant.danger, icon: AppIcon.trash, onPressed: () => setState(() => _picked = 0)),
            ])
          else
            AppButton(label: context.t('demo.nav.pickAgain'), size: ButtonSize.sm, onPressed: () => setState(() => _picked = 3)),
          const SizedBox(height: 12),
          if (_filtered)
            ActiveFilters(
              filters: [ActiveFilter(context.t('demo.col.status'), context.t('demo.status.pending'), () => setState(() => _filtered = false)), ActiveFilter(context.t('demo.col.owner'), 'Arisa', () => setState(() => _filtered = false))],
              found: 12,
              onClearAll: () => setState(() => _filtered = false),
            )
          else
            AppButton(label: context.t('demo.nav.filterAgain'), size: ButtonSize.sm, onPressed: () => setState(() => _filtered = true)),
        ]),
      ),
      const SizedBox(height: 16),
      _Demo(
        title: context.t('demo.nav.pager'),
        desc: context.t('demo.nav.pagerDesc'),
        child: Pager(paged: _paged, total: 57, onChanged: () => setState(() {})),
      ),
      const SizedBox(height: 16),
      Cols(children: [
        _Demo(
          title: context.t('demo.nav.stages'),
          desc: context.t('demo.nav.stagesDesc'),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            for (var i = 0; i < 3; i++) ...[
              StageCard(
                n: i + 1,
                title: context.t(['demo.stage.draft', 'demo.stage.approve', 'demo.stage.ship'][i]),
                summary: context.t(['demo.stage.draftSummary', 'demo.stage.approveSummary', 'demo.stage.shipBody'][i]),
                status: i < _stage ? StageStatus.done : i == _stage ? StageStatus.current : StageStatus.upcoming,
                open: i == _stage,
                onToggle: () => setState(() => _stage = i),
                child: Text(context.t(['demo.stage.draftBody', 'demo.stage.approveBody', 'demo.stage.shipBody'][i]), style: TextStyle(color: context.tokens.muted, fontSize: AppTokens.textSm)),
              ),
              if (i < 2) const SizedBox(height: 8),
            ],
            const SizedBox(height: 10),
            ActionBar(note: context.t('demo.stage.note', {'n': _stage + 1}), children: [
              AppButton(label: context.t('demo.stage.back'), size: ButtonSize.sm, onPressed: _stage > 0 ? () => setState(() => _stage--) : null),
              AppButton(label: context.t('demo.stage.next'), size: ButtonSize.sm, variant: ButtonVariant.primary, onPressed: _stage < 2 ? () => setState(() => _stage++) : null),
            ]),
          ]),
        ),
        _Demo(
          title: context.t('demo.nav.timeline'),
          desc: context.t('demo.nav.timelineDesc'),
          child: Timeline(items: [
            TimelineItem(title: context.t('demo.tl.created'), sub: 'Somchai', when: '09:12', tone: StatusTone.neutral),
            TimelineItem(title: context.t('demo.tl.submitted'), sub: context.t('demo.tl.submittedSub'), when: '09:40', tone: StatusTone.accent),
            TimelineItem(title: context.t('demo.tl.approved'), sub: 'Arisa', when: '11:05', tone: StatusTone.ok),
            TimelineItem(title: context.t('demo.tl.ship'), hollow: true),
          ]),
        ),
      ]),
    ]);
  }
}

class _IconsTab extends StatelessWidget {
  const _IconsTab();

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return _Demo(
      title: context.t('demo.icons.title'),
      desc: context.t('demo.icons.desc', {'n': AppIcon.values.length}),
      child: Wrap(spacing: 6, runSpacing: 6, children: [
        for (final i in AppIcon.values)
          Tooltip(
            message: 'AppIcon.${i.name}',
            child: InkWell(
              onTap: () {
                Clipboard.setData(ClipboardData(text: 'AppIcon.${i.name}'));
                context.stores.toasts.success(context.t('demo.icons.copied'), text: 'AppIcon.${i.name}');
              },
              borderRadius: t.rMd,
              child: Container(
                width: 96,
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(borderRadius: t.rMd, border: Border.all(color: t.divider)),
                child: Column(children: [
                  AppIconW(i, size: 20, color: t.n700),
                  const SizedBox(height: 6),
                  Text(i.name, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 11, color: t.muted)),
                ]),
              ),
            ),
          ),
      ]),
    );
  }
}
