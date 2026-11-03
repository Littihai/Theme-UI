import 'theme/tokens.dart';

export 'theme/tokens.dart' show StatusTone;

/// Shared types of the platform shell. Module-specific types live beside their module.

/// The signed-in person, as the shell needs them (header chip, account menu, permission checks).
class SessionUser {
  const SessionUser({
    required this.username,
    required this.name,
    required this.first,
    required this.initials,
    required this.role,
    this.dept,
    this.email,
    required this.permissions,
  });

  /// the sign-in name (an employee code, a user name)
  final String username;
  final String name;

  /// first name, for "Welcome, {first}"
  final String first;
  final String initials;
  final String role;
  final String? dept;
  final String? email;

  /// permission codes (APP.MODULE.ACTION) the person holds; null = every permission ("*")
  final List<String>? permissions;

  bool get allPermissions => permissions == null;

  Map<String, Object?> toJson() => {
        'username': username,
        'name': name,
        'first': first,
        'initials': initials,
        'role': role,
        'dept': dept,
        'email': email,
        'permissions': permissions ?? '*',
      };

  factory SessionUser.fromJson(Map<String, Object?> j) {
    final p = j['permissions'];
    return SessionUser(
      username: j['username'] as String,
      name: j['name'] as String,
      first: j['first'] as String,
      initials: j['initials'] as String,
      role: j['role'] as String,
      dept: j['dept'] as String?,
      email: j['email'] as String?,
      permissions: p is List ? p.cast<String>() : null,
    );
  }
}

/// An in-app notification (the bell).
class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    this.body,
    required this.createdAt,
    this.tone = StatusTone.accent,
    this.isRead = false,
    this.linkUrl,
  });

  final int id;
  final String title;
  final String? body;
  final DateTime createdAt;
  final StatusTone tone;
  final bool isRead;

  /// where a tap goes
  final String? linkUrl;

  AppNotification copyWith({bool? isRead}) =>
      AppNotification(id: id, title: title, body: body, createdAt: createdAt, tone: tone, isRead: isRead ?? this.isRead, linkUrl: linkUrl);
}
