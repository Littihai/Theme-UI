import 'package:flutter/foundation.dart';

import '../i18n/dict.dart';
import '../types.dart';

/// The bell's notifications as one small store the whole shell shares: the header badge, the drop-down panel and any
/// page that wants to push one. In-memory for the starter (a restart starts over). A real app replaces [push] /
/// [markRead] with calls to its API and feeds the store from a push channel (SignalR, SSE, polling); the widgets keep
/// reading it the same way.
class NotificationStore extends ChangeNotifier {
  List<AppNotification> _items = const [];
  int _seq = 0;

  /// The list, newest first.
  List<AppNotification> get items => _items;
  int get unread => _items.where((n) => !n.isRead).length;

  /// Adds one (newest first) and returns it.
  AppNotification push({required String title, String? body, StatusTone tone = StatusTone.accent, String? linkUrl}) {
    final item = AppNotification(id: ++_seq, title: title, body: body, tone: tone, linkUrl: linkUrl, createdAt: DateTime.now());
    _items = [item, ..._items].take(50).toList();
    notifyListeners();
    return item;
  }

  void markRead(int id) {
    _items = [for (final n in _items) n.id == id ? n.copyWith(isRead: true) : n];
    notifyListeners();
  }

  void markAllRead() {
    _items = [for (final n in _items) n.isRead ? n : n.copyWith(isRead: true)];
    notifyListeners();
  }

  void clear() {
    _items = const [];
    notifyListeners();
  }

  /// A few to start with, so the demo's bell has something to show.
  void seedDemo(Lang lang) {
    if (_items.isNotEmpty) return;
    final th = lang == Lang.th;
    push(
      title: th ? 'ยินดีต้อนรับสู่ Theme UI' : 'Welcome to Theme UI',
      body: th ? 'เริ่มจากหน้า Components เพื่อดูชิ้นส่วนทั้งหมด' : 'Start at Components to see every building block',
      linkUrl: '/components',
    );
    push(
      title: th ? 'ใบขอซื้อ PR-2026-0042 รออนุมัติ' : 'PR-2026-0042 is waiting for your approval',
      body: th ? 'ตัวอย่างการแจ้งเตือนจากโมดูล' : "An example of a module's notification",
      tone: StatusTone.warn,
      linkUrl: '/document',
    );
  }
}
