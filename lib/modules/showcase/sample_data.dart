import '../../theme/tokens.dart';

/// Fictional rows for the demo pages. Nothing here describes a real company; a project deletes this file with the
/// showcase module and reads from its own services instead.
enum OrderStatus { draft, pending, approved, rejected, shipped }

const Map<OrderStatus, StatusTone> statusTone = {
  OrderStatus.draft: StatusTone.neutral,
  OrderStatus.pending: StatusTone.warn,
  OrderStatus.approved: StatusTone.ok,
  OrderStatus.rejected: StatusTone.stop,
  OrderStatus.shipped: StatusTone.accent,
};

class Order {
  const Order({required this.id, required this.customer, required this.item, required this.qty, required this.amount, required this.status, required this.createdAt, required this.owner});
  final String id;
  final String customer;
  final String item;
  final int qty;
  final int amount;
  final OrderStatus status;
  final DateTime createdAt;
  final String owner;

  Order copyWith({OrderStatus? status}) => Order(id: id, customer: customer, item: item, qty: qty, amount: amount, status: status ?? this.status, createdAt: createdAt, owner: owner);
}

const customers = ['Siam Metal Works', 'Bangkok Packaging', 'Northern Foods', 'Delta Plastics', 'Eastern Textiles', 'Chao Phraya Logistics', 'Lanna Electronics', 'Gulf Chemicals'];
const items = ['Steel sheet 2mm', 'Corrugated box L', 'Pallet wrap 500m', 'PET resin 25kg', 'Cotton yarn 40s', 'Label roll 100×50', 'Copper wire 1.5', 'Solvent 20L'];
const owners = ['Arisa', 'Somchai', 'Nattaya', 'Prasert', 'Kanya'];
const _statuses = [OrderStatus.draft, OrderStatus.pending, OrderStatus.pending, OrderStatus.approved, OrderStatus.approved, OrderStatus.approved, OrderStatus.rejected, OrderStatus.shipped, OrderStatus.shipped];

/// A deterministic pseudo-random sequence, so every start shows the same rows.
class _Rng {
  _Rng(this._x);
  int _x;
  double next() {
    _x = (_x * 1664525 + 1013904223) % 4294967296;
    return _x / 4294967296;
  }
}

/// 57 orders of the last two months, newest first.
final List<Order> orders = () {
  final r = _Rng(42);
  final now = DateTime.now();
  final out = List.generate(57, (i) {
    final qty = (5 + r.next() * 240).round();
    final price = 40 + (r.next() * 1800).round();
    return Order(
      id: 'SO-2026-${(1001 + i).toString().padLeft(4, '0')}',
      customer: customers[(r.next() * customers.length).floor()],
      item: items[(r.next() * items.length).floor()],
      qty: qty,
      amount: qty * price,
      status: _statuses[(r.next() * _statuses.length).floor()],
      createdAt: now.subtract(Duration(days: (r.next() * 60).floor(), seconds: (r.next() * 86400).floor())),
      owner: owners[(r.next() * owners.length).floor()],
    );
  });
  out.sort((a, b) => b.createdAt.compareTo(a.createdAt));
  return out;
}();

/// The last eight weeks, oldest first.
const weekLabels = ['W36', 'W37', 'W38', 'W39', 'W40', 'W41', 'W42', 'W43'];
const weeklyOrders = [38, 42, 35, 51, 47, 58, 61, 66];
const weeklyShipped = [30, 36, 33, 44, 45, 50, 57, 59];

/// Amount per status, for the donut.
List<({OrderStatus status, int value, int count})> amountByStatus(List<Order> rows) {
  final m = <OrderStatus, (int, int)>{};
  for (final o in rows) {
    final cur = m[o.status] ?? (0, 0);
    m[o.status] = (cur.$1 + o.amount, cur.$2 + 1);
  }
  return [
    for (final s in [OrderStatus.approved, OrderStatus.shipped, OrderStatus.pending, OrderStatus.draft, OrderStatus.rejected])
      if (m.containsKey(s)) (status: s, value: m[s]!.$1, count: m[s]!.$2),
  ];
}

/// Amount per customer, largest first (top six).
List<({String label, int value, int n})> amountByCustomer(List<Order> rows) {
  final m = <String, (int, int)>{};
  for (final o in rows) {
    final c = m[o.customer] ?? (0, 0);
    m[o.customer] = (c.$1 + o.amount, c.$2 + 1);
  }
  final list = [for (final e in m.entries) (label: e.key, value: e.value.$1, n: e.value.$2)];
  list.sort((a, b) => b.value.compareTo(a.value));
  return list.take(6).toList();
}
