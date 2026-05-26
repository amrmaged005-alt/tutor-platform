import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/l10n.dart';

class ShellScreen extends StatelessWidget {
  const ShellScreen({super.key, required this.child});
  final Widget child;

  int _index(String location) {
    if (location.startsWith('/browse') ||
        location.startsWith('/classes') ||
        location.startsWith('/tutors') ||
        location.startsWith('/centers')) {
      return 1;
    }
    if (location.startsWith('/dashboard')) return 2;
    if (location.startsWith('/saved')) return 3;
    if (location.startsWith('/profile')) return 4;
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
            1 => '/browse',
            2 => app.isSignedIn ? '/dashboard' : '/login',
            3 => '/saved',
            4 => app.isSignedIn ? '/profile' : '/login',
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
            label: l.t('nav.browse'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.event_note_outlined),
            selectedIcon: const Icon(Icons.event_note_rounded),
            label: l.t('nav.bookings'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.favorite_border_rounded),
            selectedIcon: const Icon(Icons.favorite_rounded),
            label: l.t('nav.saved'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.account_circle_outlined),
            selectedIcon: const Icon(Icons.account_circle_rounded),
            label: l.t('profile.title'),
          ),
        ],
      ),
    );
  }
}
