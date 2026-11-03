import 'package:flutter_test/flutter_test.dart';
import 'package:theme_ui/components/ui/data_table.dart';
import 'package:theme_ui/i18n/l.dart';
import 'package:theme_ui/components/ui/date_range.dart';
import 'package:theme_ui/components/ui/pager.dart';
import 'package:theme_ui/util/csv.dart';
import 'package:theme_ui/util/format.dart';

void main() {
  test('Paged slices and pulls the page back into range', () {
    final p = Paged(page: 3, size: 10);
    final rows = List.generate(25, (i) => i);
    expect(p.slice(rows), [20, 21, 22, 23, 24]);
    expect(p.pageCount(25), 3);
    expect(p.from(25), 21);
    expect(p.to(25), 25);
    expect(p.slice(List.generate(12, (i) => i)), [10, 11]);
    expect(p.page, 2);
    expect(Paged().slice(<int>[]), isEmpty);
  });

  test('SortState cycles asc → desc → none and sorts with nulls first', () {
    const s0 = SortState();
    final s1 = s0.next('amount');
    expect((s1.key, s1.desc), ('amount', false));
    final s2 = s1.next('amount');
    expect(s2.desc, isTrue);
    expect(s2.next('amount').key, isNull);
    final rows = [(3, 'c'), (1, 'a'), (2, null)];
    expect(s2.apply(rows, (r, k) => r.$1), [(3, 'c'), (2, null), (1, 'a')]);
    expect(const SortState(key: 'name').apply(rows, (r, k) => r.$2).first.$2, isNull);
  });

  test('number and date formats', () {
    expect(fmtInt(1234567), '1,234,567');
    expect(fmtInt(-999), '-999');
    expect(fmtInt(12.5, decimals: 1), '12.5');
    expect(fmtCompact(1500), '1.5k');
    expect(fmtDate(DateTime(2026, 3, 5), Lang.en), '5 Mar 2026');
    expect(fmtDate(DateTime(2026, 3, 5), Lang.th), '5 มี.ค. 2569');
    expect(isoDate(DateTime(2026, 3, 5)), '2026-03-05');
  });

  test('CSV quotes what needs it and starts with a BOM for Excel', () {
    final csv = toCsv([
      ['id', 'name'],
      ['1', 'a, b'],
      ['2', 'say "hi"'],
    ]);
    expect(csv.startsWith('﻿'), isTrue);
    expect(csv, contains('"a, b"'));
    expect(csv, contains('"say ""hi"""'));
  });

  test('date range presets', () {
    final now = DateTime(2026, 11, 3);
    expect(DateRange.lastDays(7, now).from, DateTime(2026, 10, 28));
    expect(DateRange.thisMonth(now).to, DateTime(2026, 11, 30));
    expect(DateRange.thisQuarter(now).from, DateTime(2026, 10, 1));
    expect(DateRange.thisQuarter(now).contains(DateTime(2026, 12, 31, 23)), isTrue);
    expect(DateRange.thisQuarter(now).contains(DateTime(2027, 1, 1)), isFalse);
  });
}
