import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../theme/appearance.dart';
import '../../theme/theme_store.dart';
import '../../theme/tokens.dart';

/// A row of the Customize panel / Settings > General: a title, one line of help, and the option cards.
class OptionRow<T> extends StatelessWidget {
  const OptionRow({super.key, required this.title, this.desc, required this.options, required this.value, required this.onChanged, this.compact = false});
  final String title;
  final String? desc;
  final List<OptionItem<T>> options;
  final T value;
  final ValueChanged<T> onChanged;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: TextStyle(fontSize: AppTokens.textMd, fontWeight: FontWeight.w600, color: t.text)),
        if (desc != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(desc!, style: TextStyle(fontSize: AppTokens.textSm, color: t.muted))),
        const SizedBox(height: 8),
        Wrap(spacing: 8, runSpacing: 8, children: [
          for (final o in options) _OptionCard(item: o, selected: o.value == value, onTap: () => onChanged(o.value), compact: compact),
        ]),
      ]),
    );
  }
}

class OptionItem<T> {
  const OptionItem(this.value, this.label, {this.preview, this.icon, this.swatch});
  final T value;
  final String label;
  final Widget? preview;
  final AppIcon? icon;
  final Color? swatch;
}

class _OptionCard<T> extends StatelessWidget {
  const _OptionCard({required this.item, required this.selected, required this.onTap, required this.compact});
  final OptionItem<T> item;
  final bool selected;
  final VoidCallback onTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Semantics(
      selected: selected,
      button: true,
      label: item.label,
      child: Material(
        color: selected ? t.a100 : t.surface,
        borderRadius: t.rMd,
        child: InkWell(
          onTap: onTap,
          borderRadius: t.rMd,
          hoverColor: t.hover,
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: compact ? 10 : 12, vertical: compact ? 7 : 9),
            decoration: BoxDecoration(borderRadius: t.rMd, border: Border.all(color: selected ? t.accent : t.n300, width: selected ? 1.5 : 1)),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              if (item.swatch != null) ...[Container(width: 14, height: 14, decoration: BoxDecoration(color: item.swatch, shape: BoxShape.circle)), const SizedBox(width: 8)],
              if (item.icon != null) ...[AppIconW(item.icon!, size: 16, color: selected ? t.a800 : t.n600), const SizedBox(width: 6)],
              if (item.preview != null) ...[item.preview!, const SizedBox(width: 8)],
              Text(item.label, style: TextStyle(fontSize: AppTokens.textSm, fontWeight: FontWeight.w500, color: selected ? t.a800 : t.text)),
            ]),
          ),
        ),
      ),
    );
  }
}

/// A small square with the radius a choice would give.
class RadiusPreview extends StatelessWidget {
  const RadiusPreview(this.radius, {super.key});
  final CornerRadius radius;
  static const Map<CornerRadius, double> px = {CornerRadius.none: 0, CornerRadius.sm: 4, CornerRadius.md: 8, CornerRadius.lg: 12, CornerRadius.xl: 18};

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(width: 22, height: 22, decoration: BoxDecoration(color: t.n200, border: Border.all(color: t.n400), borderRadius: BorderRadius.only(topLeft: Radius.circular(px[radius]!))));
  }
}

/// The scheme, text size and the Customize choices, in the order both surfaces show them. [layout] adds the layout
/// group (the panel shows it, Settings > General keeps to appearance).
class AppearanceControls extends StatelessWidget {
  const AppearanceControls({super.key, this.layout = false, this.compact = false});
  final bool layout;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final s = context.stores;
    final a = s.appearance.state;
    final t = context.tokens;
    void set(AppearanceState next) => s.appearance.update(next);

    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      OptionRow<ThemePref>(
        title: context.t('cz.scheme'),
        desc: context.t('cz.scheme.desc'),
        compact: compact,
        value: s.theme.pref,
        onChanged: (v) => s.theme.setPref(v),
        options: [
          OptionItem(ThemePref.light, context.t('set.theme.light'), icon: AppIcon.sun),
          OptionItem(ThemePref.dark, context.t('set.theme.dark'), icon: AppIcon.moon),
          OptionItem(ThemePref.system, context.t('set.theme.system'), icon: AppIcon.deviceDesktop),
        ],
      ),
      OptionRow<Accent>(
        title: context.t('set.accent'),
        desc: context.t('set.accentDesc'),
        compact: compact,
        value: a.accent,
        onChanged: (v) => set(a.copyWith(accent: v)),
        options: [for (final ac in Accent.values) OptionItem(ac, context.t('set.accent.${ac.name}'), swatch: AppTokens.swatch(ac))],
      ),
      OptionRow<FontFamily>(
        title: context.t('cz.font'),
        desc: context.t('cz.font.desc'),
        compact: compact,
        value: a.font,
        onChanged: (v) => set(a.copyWith(font: v)),
        options: [for (final f in FontFamily.values) OptionItem(f, context.t('cz.font.${f.name}'))],
      ),
      OptionRow<GreyBase>(
        title: context.t('cz.base'),
        desc: context.t('cz.base.desc'),
        compact: compact,
        value: a.base,
        onChanged: (v) => set(a.copyWith(base: v)),
        options: [
          for (final b in GreyBase.values)
            OptionItem(b, context.t('cz.base.${b.name}'), swatch: AppTokens.build(dark: t.dark, base: b).n400),
        ],
      ),
      OptionRow<CornerRadius>(
        title: context.t('cz.radius'),
        desc: context.t('cz.radius.desc'),
        compact: compact,
        value: a.radius,
        onChanged: (v) => set(a.copyWith(radius: v)),
        options: [for (final r in CornerRadius.values) OptionItem(r, context.t('cz.radius.${r.name}'), preview: RadiusPreview(r))],
      ),
      OptionRow<TextSize>(
        title: context.t('set.fontSize'),
        desc: context.t('set.fontSizeDesc'),
        compact: compact,
        value: s.fontSize.size,
        onChanged: s.fontSize.setSize,
        options: [
          OptionItem(TextSize.s, context.t('set.fontSizeS')),
          OptionItem(TextSize.m, context.t('set.fontSizeM')),
          OptionItem(TextSize.l, context.t('set.fontSizeL')),
        ],
      ),
      OptionRow<Contrast>(
        title: context.t('set.contrast'),
        desc: context.t('set.contrastDesc'),
        compact: compact,
        value: a.contrast,
        onChanged: (v) => set(a.copyWith(contrast: v)),
        options: [for (final c in Contrast.values) OptionItem(c, context.t('set.contrast.${c.name}'))],
      ),
      OptionRow<Motion>(
        title: context.t('set.motion'),
        desc: context.t('set.motionDesc'),
        compact: compact,
        value: a.motion,
        onChanged: (v) => set(a.copyWith(motion: v)),
        options: [for (final m in Motion.values) OptionItem(m, context.t('set.motion.${m.name}'))],
      ),
      if (layout) ...[
        Padding(padding: const EdgeInsets.only(bottom: 12, top: 6), child: Text(context.t('cz.group.layout').toUpperCase(), style: TextStyle(fontSize: AppTokens.textXs, fontWeight: FontWeight.w600, color: t.muted, letterSpacing: 0.5))),
        OptionRow<NavLayout>(
          title: context.t('cz.nav'),
          desc: context.t('cz.nav.desc'),
          compact: compact,
          value: a.nav,
          onChanged: (v) => set(a.copyWith(nav: v)),
          options: [
            OptionItem(NavLayout.top, context.t('cz.nav.top'), icon: AppIcon.deviceDesktop),
            OptionItem(NavLayout.side, context.t('cz.nav.side'), icon: AppIcon.sidebarExpand),
            OptionItem(NavLayout.rail, context.t('cz.nav.rail'), icon: AppIcon.sidebarCollapse),
          ],
        ),
        OptionRow<PageWidth>(
          title: context.t('cz.container'),
          desc: context.t('cz.container.desc'),
          compact: compact,
          value: a.container,
          onChanged: (v) => set(a.copyWith(container: v)),
          options: [for (final c in PageWidth.values) OptionItem(c, context.t('cz.container.${c.name}'))],
        ),
        OptionRow<Sticky>(
          title: context.t('cz.sticky'),
          desc: context.t('cz.sticky.desc'),
          compact: compact,
          value: a.sticky,
          onChanged: (v) => set(a.copyWith(sticky: v)),
          options: [for (final st in Sticky.values) OptionItem(st, context.t('cz.sticky.${st.name}'))],
        ),
        OptionRow<Edges>(
          title: context.t('cz.navStyle'),
          desc: context.t('cz.navStyle.desc'),
          compact: compact,
          value: a.navStyle,
          onChanged: (v) => set(a.copyWith(navStyle: v)),
          options: [for (final e in Edges.values) OptionItem(e, context.t('cz.edges.${e.name}'))],
        ),
        OptionRow<Edges>(
          title: context.t('cz.panelStyle'),
          desc: context.t('cz.panelStyle.desc'),
          compact: compact,
          value: a.panelStyle,
          onChanged: (v) => set(a.copyWith(panelStyle: v)),
          options: [for (final e in Edges.values) OptionItem(e, context.t('cz.edges.${e.name}'))],
        ),
      ],
    ]);
  }
}
