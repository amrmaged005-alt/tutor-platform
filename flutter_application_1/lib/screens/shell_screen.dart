import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/l10n.dart';

class ShellScreen extends StatelessWidget {
  const ShellScreen({super.key, required this.child});
  final Widget child;

  int _index(String location) {
    if (location.startsWith('/classes')) return 1;
    if (location.startsWith('/saved')) return 2;
    if (location.startsWith('/dashboard')) return 3;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final app = context.app;
    final location = GoRouterState.of(context).uri.path;
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index(location),
        onDestinationSelected: (index) {
          final path = switch (index) {
            0 => '/',
            1 => '/classes',
            2 => '/saved',
            3 => app.isSignedIn ? '/dashboard' : '/login',
            _ => '/',
          };
          context.go(path);
        },
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            selectedIcon: const Icon(Icons.home_rounded),
            label: l.t('nav.home'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.school_outlined),
            selectedIcon: const Icon(Icons.school_rounded),
            label: l.t('nav.classes'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.favorite_border_rounded),
            selectedIcon: const Icon(Icons.favorite_rounded),
            label: l.t('nav.saved'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.event_note_outlined),
            selectedIcon: const Icon(Icons.event_note_rounded),
            label: l.t('nav.bookings'),
          ),
        ],
      ),
    );
  }
}
