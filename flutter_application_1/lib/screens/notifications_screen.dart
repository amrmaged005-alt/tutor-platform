import 'package:flutter/material.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/notification_service.dart';
import '../core/theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    _registerNotificationToken();
  }

  Future<void> _registerNotificationToken() async {
    final app = context.app;
    if (!app.isSignedIn) return;
    final token = await NotificationService.instance.pushToken();
    if (token == null || token.isEmpty) return;
    await app.auth.registerPushToken(
      token: token,
      platform: NotificationService.instance.platform,
    );
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final items = [
      (
        Icons.check_circle_outline,
        l.t('notifications.booking'),
        l.t('notifications.bookingBody'),
      ),
      (
        Icons.schedule_outlined,
        l.t('notifications.soon'),
        l.t('notifications.soonBody'),
      ),
      (
        Icons.star_border_rounded,
        l.t('notifications.review'),
        l.t('notifications.reviewBody'),
      ),
    ];
    return Scaffold(
      appBar: AppBar(title: Text(l.t('notifications.title'))),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemBuilder: (_, index) => _NotificationTile(
          icon: items[index].$1,
          title: items[index].$2,
          body: items[index].$3,
        ),
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemCount: items.length,
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({
    required this.icon,
    required this.title,
    required this.body,
  });

  final IconData icon;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: c.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: c.border),
      ),
      child: Row(
        children: [
          Icon(icon, color: c.accent),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(color: c.text, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 3),
                Text(body, style: TextStyle(color: c.secondary, fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
