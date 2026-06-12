import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/l10n.dart';

class ShellScreen extends StatelessWidget {
  const ShellScreen({super.key, required this.child});
  final Widget child;

  int _index(String location, List<_NavItem> items) {
    var selected = 0;
    for (var i = 0; i < items.length; i++) {
      if (location == items[i].path ||
          location.startsWith('${items[i].path}/')) {
        selected = i;
      }
    }
    return selected;
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final app = context.app;
    final location = GoRouterState.of(context).uri.path;
    final items = _itemsFor(app.user?.role ?? 'STUDENT', l);
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index(location, items),
        onDestinationSelected: (index) {
          final target = items[index];
          final path =
              target.needsAuth && !app.isSignedIn ? '/login' : target.path;
          context.go(path);
        },
        destinations: [
          for (final item in items)
            NavigationDestination(
              icon: Icon(item.icon),
              selectedIcon: Icon(item.selectedIcon),
              label: item.label,
            ),
        ],
      ),
    );
  }

  List<_NavItem> _itemsFor(String role, AppLocalizations l) {
    if (role == 'TUTOR') {
      return [
        _NavItem('/', l.t('nav.home'), Icons.home_outlined, Icons.home_rounded),
        _NavItem(
          '/tutor/classes',
          l.t('dashboard.myClasses'),
          Icons.school_outlined,
          Icons.school_rounded,
          needsAuth: true,
        ),
        _NavItem(
          '/tutor/dashboard',
          l.t('dashboard.title'),
          Icons.insights_outlined,
          Icons.insights_rounded,
          needsAuth: true,
        ),
        _NavItem(
          '/messages',
          l.t('nav.messages'),
          Icons.chat_bubble_outline_rounded,
          Icons.chat_bubble_rounded,
          needsAuth: true,
        ),
        _NavItem(
          '/profile',
          l.t('profile.title'),
          Icons.account_circle_outlined,
          Icons.account_circle_rounded,
          needsAuth: true,
        ),
      ];
    }
    if (role == 'CENTER_ADMIN' || role == 'CENTER') {
      return [
        _NavItem('/', l.t('nav.home'), Icons.home_outlined, Icons.home_rounded),
        _NavItem(
          '/center/manage',
          l.t('nav.manage'),
          Icons.edit_note_outlined,
          Icons.edit_note_rounded,
          needsAuth: true,
        ),
        _NavItem(
          '/center/dashboard',
          l.t('dashboard.title'),
          Icons.insights_outlined,
          Icons.insights_rounded,
          needsAuth: true,
        ),
        _NavItem(
          '/center/tutors',
          l.t('nav.tutors'),
          Icons.groups_outlined,
          Icons.groups_rounded,
          needsAuth: true,
        ),
        _NavItem(
          '/profile',
          l.t('profile.title'),
          Icons.account_circle_outlined,
          Icons.account_circle_rounded,
          needsAuth: true,
        ),
      ];
    }
    // STUDENT (default)
    return [
      _NavItem('/', l.t('nav.home'), Icons.home_outlined, Icons.home_rounded),
      _NavItem(
        '/classes',
        l.t('nav.classes'),
        Icons.school_outlined,
        Icons.school_rounded,
      ),
      _NavItem(
        '/tutors',
        l.t('nav.tutors'),
        Icons.person_search_outlined,
        Icons.person_search_rounded,
      ),
      _NavItem(
        '/messages',
        l.t('nav.messages'),
        Icons.chat_bubble_outline_rounded,
        Icons.chat_bubble_rounded,
      ),
      _NavItem(
        '/profile',
        l.t('profile.title'),
        Icons.account_circle_outlined,
        Icons.account_circle_rounded,
        needsAuth: true,
      ),
    ];
  }
}

class _NavItem {
  const _NavItem(
    this.path,
    this.label,
    this.icon,
    this.selectedIcon, {
    this.needsAuth = false,
  });

  final String path;
  final String label;
  final IconData icon;
  final IconData selectedIcon;
  final bool needsAuth;
}
