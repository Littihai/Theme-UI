import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../i18n/dict.dart';
import '../../theme/tokens.dart';
import 'field.dart';
import 'page_header.dart';
import 'panel.dart';

/// One kind of block of a manual section. The text is bilingual data ([L]) so a module's guide reads in both languages.
sealed class ManualBlock {
  const ManualBlock();
}

class ManualP extends ManualBlock {
  const ManualP(this.text);
  final L text;
}

class ManualTip extends ManualBlock {
  const ManualTip(this.text, {this.warn = false});
  final L text;
  final bool warn;
}

class ManualCode extends ManualBlock {
  const ManualCode(this.code);
  final String code;
}

class ManualSteps extends ManualBlock {
  const ManualSteps(this.items, {this.numbered = true});
  final List<L> items;
  final bool numbered;
}

class ManualSection {
  const ManualSection({required this.id, required this.title, required this.blocks});
  final String id;
  final L title;
  final List<ManualBlock> blocks;
}

/// The frame every module's guide uses: a table of contents on the left, the sections on the right, a search that
/// narrows both. The same frame carries the starter's own manual (modules/showcase/manual_demo_page.dart).
class ManualPage extends StatefulWidget {
  const ManualPage({super.key, required this.title, this.subtitle, required this.sections});
  final String title;
  final String? subtitle;
  final List<ManualSection> sections;

  @override
  State<ManualPage> createState() => _ManualPageState();
}

class _ManualPageState extends State<ManualPage> {
  final _q = TextEditingController();
  final _keys = <String, GlobalKey>{};
  String _query = '';

  @override
  void dispose() {
    _q.dispose();
    super.dispose();
  }

  bool _matches(ManualSection s, I18nStore i18n) {
    if (_query.isEmpty) return true;
    final q = _query.toLowerCase();
    if (i18n.pick(s.title).toLowerCase().contains(q)) return true;
    for (final b in s.blocks) {
      final text = switch (b) {
        ManualP(:final text) => i18n.pick(text),
        ManualTip(:final text) => i18n.pick(text),
        ManualCode(:final code) => code,
        ManualSteps(:final items) => items.map(i18n.pick).join(' '),
      };
      if (text.toLowerCase().contains(q)) return true;
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final i18n = context.i18n;
    final shown = widget.sections.where((s) => _matches(s, i18n)).toList();
    for (final s in widget.sections) {
      _keys.putIfAbsent(s.id, GlobalKey.new);
    }
    final toc = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(padding: const EdgeInsets.only(bottom: 8), child: Text(context.t('manual.toc').toUpperCase(), style: TextStyle(fontSize: AppTokens.textXs, fontWeight: FontWeight.w600, color: t.muted, letterSpacing: 0.5))),
        for (final s in shown)
          InkWell(
            onTap: () {
              final ctx = _keys[s.id]!.currentContext;
              if (ctx != null) Scrollable.ensureVisible(ctx, duration: context.reducedMotion ? Duration.zero : const Duration(milliseconds: 300), alignment: 0.05);
            },
            borderRadius: t.rSm,
            child: Padding(padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 6), child: Text(i18n.pick(s.title), style: TextStyle(fontSize: AppTokens.textSm, color: t.n700))),
          ),
      ],
    );
    final body = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (shown.isEmpty) Panel(child: Text(context.t('manual.none'), style: TextStyle(color: t.muted)))
        else
          for (final s in shown)
            Padding(
              key: _keys[s.id],
              padding: const EdgeInsets.only(bottom: 20),
              child: Panel(
                title: i18n.pick(s.title),
                child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [for (final b in s.blocks) _Block(b)]),
              ),
            ),
      ],
    );
    return PageBody(children: [
      PageHeader(
        title: widget.title,
        subtitle: widget.subtitle,
        actions: [
          SizedBox(width: 260, child: AppTextField(controller: _q, placeholder: context.t('manual.search'), prefixIcon: AppIcon.search, small: true, onChanged: (v) => setState(() => _query = v.trim()))),
        ],
      ),
      if (context.isTight) ...[Panel(padding: const EdgeInsets.all(12), child: toc), body]
      else
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(width: 220, child: toc),
          const SizedBox(width: 24),
          Expanded(child: body),
        ]),
    ]);
  }
}

class _Block extends StatelessWidget {
  const _Block(this.block);
  final ManualBlock block;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final i18n = context.i18n;
    final body = TextStyle(fontSize: AppTokens.textMd, color: t.text, height: 1.6);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: switch (block) {
        ManualP(:final text) => Text(i18n.pick(text), style: body),
        ManualTip(:final text, :final warn) => Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: warn ? t.warnBg : t.a100, borderRadius: t.rMd, border: Border(left: BorderSide(color: warn ? t.warnSolid : t.accent, width: 3))),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              AppIconW(warn ? AppIcon.alert : AppIcon.info, size: 16, color: warn ? t.warnFg : t.a800),
              const SizedBox(width: 8),
              Expanded(
                child: Text.rich(TextSpan(children: [
                  TextSpan(text: '${context.t(warn ? 'manual.warn' : 'manual.tip')}: ', style: TextStyle(fontWeight: FontWeight.w600, color: warn ? t.warnFg : t.a800)),
                  TextSpan(text: i18n.pick(text)),
                ]), style: body.copyWith(fontSize: AppTokens.textSm)),
              ),
            ]),
          ),
        ManualCode(:final code) => Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: t.n100, borderRadius: t.rMd, border: Border.all(color: t.n200)),
            child: SelectableText(code, style: TextStyle(fontFamily: 'monospace', fontFamilyFallback: const ['Consolas', 'Menlo', 'monospace'], fontSize: AppTokens.textSm, color: t.n800, height: 1.5)),
          ),
        ManualSteps(:final items, :final numbered) => Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            for (var i = 0; i < items.length; i++)
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  SizedBox(width: 24, child: Text(numbered ? '${i + 1}.' : '•', style: body.copyWith(color: t.muted))),
                  Expanded(child: Text(i18n.pick(items[i]), style: body)),
                ]),
              ),
          ]),
      },
    );
  }
}
