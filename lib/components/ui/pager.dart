import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../constants/brand.dart';
import '../../constants/icons.dart';
import '../../theme/tokens.dart';
import 'button.dart';

/// Page / size for a paged list (house rule: a list that can pass 10 rows is paged). The chosen size is remembered per
/// device under one name, so every list of the app agrees.
class Paged {
  Paged({this.page = 1, this.size = defaultPageSize});
  int page;
  int size;

  static const sizes = [10, 20, 50, 100];

  int pageCount(int total) => total == 0 ? 1 : (total + size - 1) ~/ size;

  /// The rows of the current page; the page is pulled back into range when the total shrank.
  List<T> slice<T>(List<T> all) {
    final pc = pageCount(all.length);
    if (page > pc) page = pc;
    if (page < 1) page = 1;
    final from = (page - 1) * size;
    return all.sublist(from.clamp(0, all.length), (from + size).clamp(0, all.length));
  }

  int from(int total) => total == 0 ? 0 : (page - 1) * size + 1;
  int to(int total) => (page * size).clamp(0, total);
}

/// The row under a list: "Showing 1–10 of 57", the size picker, Prev / page numbers / Next.
class Pager extends StatelessWidget {
  const Pager({super.key, required this.paged, required this.total, required this.onChanged});
  final Paged paged;
  final int total;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final pc = paged.pageCount(total);
    final page = paged.page;
    final mobile = context.isMobile;

    void go(int p) {
      paged.page = p.clamp(1, pc);
      onChanged();
    }

    // which page numbers to show: 1 … p-1 p p+1 … n
    final nums = <int?>[];
    for (var p = 1; p <= pc; p++) {
      if (p == 1 || p == pc || (p - page).abs() <= (mobile ? 0 : 1)) {
        nums.add(p);
      } else if (nums.last != null) {
        nums.add(null);
      }
    }

    final info = Text(context.t('log.showing', {'from': paged.from(total), 'to': paged.to(total), 'total': total}), style: TextStyle(color: t.muted, fontSize: AppTokens.textSm));
    final sizePick = Row(mainAxisSize: MainAxisSize.min, children: [
      Text(context.t('pager.perPage'), style: TextStyle(color: t.muted, fontSize: AppTokens.textSm)),
      const SizedBox(width: 8),
      DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          value: paged.size,
          isDense: true,
          borderRadius: t.rMd,
          style: TextStyle(fontSize: AppTokens.textSm, color: t.text),
          items: [for (final s in Paged.sizes) DropdownMenuItem(value: s, child: Text('$s'))],
          onChanged: (v) {
            if (v == null) return;
            paged.size = v;
            paged.page = 1;
            onChanged();
          },
        ),
      ),
    ]);
    final nav = Semantics(
      label: context.t('pager.label'),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        AppButton(label: context.t('log.prev'), size: ButtonSize.sm, icon: AppIcon.chevronLeft, onPressed: page > 1 ? () => go(page - 1) : null),
        const SizedBox(width: 6),
        for (final n in nums)
          if (n == null)
            Padding(padding: const EdgeInsets.symmetric(horizontal: 4), child: Text('…', style: TextStyle(color: t.muted)))
          else
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: Tooltip(
                message: context.t('pager.page', {'n': n}),
                child: Material(
                  color: n == page ? t.accent : Colors.transparent,
                  borderRadius: t.rMd,
                  child: InkWell(
                    onTap: n == page ? null : () => go(n),
                    borderRadius: t.rMd,
                    child: Container(
                      width: AppTokens.controlHSm,
                      height: AppTokens.controlHSm,
                      alignment: Alignment.center,
                      child: Text('$n', style: TextStyle(color: n == page ? t.onAccent : t.text, fontSize: AppTokens.textSm, fontWeight: FontWeight.w500)),
                    ),
                  ),
                ),
              ),
            ),
        const SizedBox(width: 6),
        AppButton(label: context.t('log.next'), size: ButtonSize.sm, trailing: AppIcon.chevronRight, onPressed: page < pc ? () => go(page + 1) : null),
      ]),
    );
    if (mobile) {
      return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [info, sizePick]),
        const SizedBox(height: 8),
        Center(child: nav),
      ]);
    }
    return Row(children: [info, const SizedBox(width: 16), sizePick, const Spacer(), nav]);
  }
}
