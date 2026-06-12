import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/l10n.dart';
import '../core/theme.dart';

class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;

    return Scaffold(
      appBar: AppBar(
        title: Text(l.t('messages.title')),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.search_rounded),
            tooltip: 'Search',
          ),
        ],
      ),
      body: _EmptyMessages(c: c, l: l),
    );
  }
}

class _EmptyMessages extends StatelessWidget {
  const _EmptyMessages({required this.c, required this.l});
  final AppThemeTokens c;
  final AppLocalizations l;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: c.accent.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.chat_bubble_outline_rounded,
                color: c.accent,
                size: 36,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              l.t('messages.empty'),
              style: TextStyle(
                color: c.text,
                fontSize: 18,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.3,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              l.t('messages.emptyBody'),
              textAlign: TextAlign.center,
              style: TextStyle(
                color: c.secondary,
                fontSize: 14,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.go('/tutors'),
              icon: const Icon(Icons.person_search_rounded, size: 18),
              label: Text(l.t('messages.browseTutors')),
            ),
          ],
        ),
      ),
    );
  }
}
