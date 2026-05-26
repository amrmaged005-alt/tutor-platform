import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../core/theme.dart';
import '../widgets/marketplace_widgets.dart';
import '../widgets/stats_row.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<List<BookingItem>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<BookingItem>> _load() => context.app.marketplace.bookings();
  void _refresh() => setState(() => _future = _load());

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final c = context.c;
    final user = app.user;
    return Scaffold(
      appBar: AppBar(title: Text(l.t('dashboard.title'))),
      body: user == null
          ? StateView(
              icon: Icons.lock_outline_rounded,
              title: l.t('auth.loginTitle'),
              body: l.t('classes.signInToBook'),
              action: l.t('auth.signIn'),
              onAction: () => context.go('/login'),
            )
          : FutureBuilder<List<BookingItem>>(
              future: _future,
              builder: (context, snapshot) {
                final roleTitle = user.role == 'STUDENT'
                    ? l.t('dashboard.mine')
                    : l.t('dashboard.manage');
                final bookings = snapshot.data ?? [];
                return RefreshIndicator(
                  onRefresh: () async => _refresh(),
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: c.card,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: c.border),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 24,
                              backgroundColor: c.accent.withValues(alpha: 0.14),
                              child: Text(
                                (user.name.isEmpty ? user.email : user.name)
                                    .substring(0, 1)
                                    .toUpperCase(),
                                style: TextStyle(
                                  color: c.accent,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    user.name.isEmpty ? user.email : user.name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: c.text,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                  Text(
                                    user.role.replaceAll('_', ' '),
                                    style: TextStyle(
                                      color: c.secondary,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              onPressed: () => _showSettings(context),
                              icon: const Icon(Icons.settings_outlined),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      DashboardStatsRow(bookings: bookings),
                      SectionHeader(title: roleTitle),
                      if (snapshot.connectionState != ConnectionState.done)
                        const SizedBox(height: 320, child: LoadingList())
                      else if (snapshot.hasError)
                        StateView(
                          icon: Icons.wifi_off_rounded,
                          title: l.t('state.error'),
                          body: l.t('state.offline'),
                          action: l.t('common.retry'),
                          onAction: _refresh,
                        )
                      else if (bookings.isEmpty)
                        StateView(
                          icon: Icons.event_busy_outlined,
                          title: l.t('dashboard.empty'),
                          body: user.role == 'STUDENT'
                              ? l.t('home.subtitle')
                              : l.t('account.roleFeature'),
                          action: l.t('nav.classes'),
                          onAction: () => context.go('/classes'),
                        )
                      else
                        _BookingTabs(
                          bookings: bookings,
                          showStudent: user.role != 'STUDENT',
                          showClasses: user.role != 'STUDENT',
                        ),
                    ],
                  ),
                );
              },
            ),
    );
  }

  void _showSettings(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SwitchListTile(
                value: app.isDark,
                onChanged: app.setDark,
                title: Text(l.t('account.theme')),
                secondary: const Icon(Icons.dark_mode_outlined),
              ),
              ListTile(
                leading: const Icon(Icons.language_rounded),
                title: Text(l.t('account.language')),
                trailing: Text(
                  app.lang == AppLang.en
                      ? l.t('account.english')
                      : l.t('account.arabic'),
                ),
                onTap: () => app.setLang(
                  app.lang == AppLang.en ? AppLang.ar : AppLang.en,
                ),
              ),
              if (app.user != null && app.user!.role != 'STUDENT')
                ListTile(
                  leading: const Icon(Icons.construction_rounded),
                  title: Text(l.t('common.comingSoon')),
                  subtitle: Text(l.t('account.roleFeature')),
                ),
              OutlinedButton(
                onPressed: () async {
                  await app.logout();
                  if (context.mounted) context.go('/');
                },
                child: Text(l.t('auth.logout')),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BookingTabs extends StatelessWidget {
  const _BookingTabs({
    required this.bookings,
    required this.showStudent,
    required this.showClasses,
  });

  final List<BookingItem> bookings;
  final bool showStudent;
  final bool showClasses;

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final active = bookings
        .where((b) => b.status == 'PENDING' || b.paymentStatus == 'UNPAID')
        .toList();
    final completed = bookings
        .where((b) => b.status == 'CONFIRMED' && b.paymentStatus == 'PAID')
        .toList();
    final cancelled = bookings.where((b) => b.status == 'CANCELLED').toList();
    final uniqueClasses = <String, AppClass>{};
    for (final booking in bookings) {
      uniqueClasses[booking.classItem.id] = booking.classItem;
    }
    final tabs = [
      Tab(text: l.t('dashboard.active')),
      Tab(text: l.t('dashboard.completed')),
      Tab(text: l.t('dashboard.cancelled')),
      if (showClasses) Tab(text: l.t('dashboard.myClasses')),
    ];
    final views = [
      _BookingList(items: active, showStudent: showStudent),
      _BookingList(items: completed, showStudent: showStudent),
      _BookingList(items: cancelled, showStudent: showStudent),
      if (showClasses) _ClassList(items: uniqueClasses.values.toList()),
    ];
    return DefaultTabController(
      length: tabs.length,
      child: Column(
        children: [
          TabBar(isScrollable: true, tabs: tabs),
          SizedBox(height: 420, child: TabBarView(children: views)),
        ],
      ),
    );
  }
}

class _BookingList extends StatelessWidget {
  const _BookingList({required this.items, required this.showStudent});
  final List<BookingItem> items;
  final bool showStudent;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return StateView(
        icon: Icons.event_busy_outlined,
        title: context.l10n.t('dashboard.empty'),
        body: context.l10n.t('home.subtitle'),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.only(top: 12),
      itemBuilder: (_, i) =>
          _BookingCard(booking: items[i], showStudent: showStudent),
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemCount: items.length,
    );
  }
}

class _ClassList extends StatelessWidget {
  const _ClassList({required this.items});
  final List<AppClass> items;

  @override
  Widget build(BuildContext context) => ListView.separated(
    padding: const EdgeInsets.only(top: 12),
    itemBuilder: (_, i) => AppClassCard(item: items[i]),
    separatorBuilder: (_, _) => const SizedBox(height: 10),
    itemCount: items.length,
  );
}

class _BookingCard extends StatelessWidget {
  const _BookingCard({required this.booking, required this.showStudent});
  final BookingItem booking;
  final bool showStudent;

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () => context.push(
        '/classes/${booking.classItem.id}',
        extra: booking.classItem,
      ),
      child: Ink(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: c.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: c.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    booking.classItem.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: c.text,
                      fontWeight: FontWeight.w900,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                _StatusPill(label: l.t('status.${booking.status}')),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              booking.classItem.providerName,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: c.secondary,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                Text(
                  l.t('payment.${booking.paymentStatus}'),
                  style: TextStyle(
                    color: c.muted,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Text(
                  '${booking.amountEgp ?? booking.classItem.priceEgp} ${l.t('common.egp')}',
                  style: TextStyle(
                    color: c.accent,
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                if (showStudent && booking.studentName != null)
                  Text(
                    booking.studentName!,
                    style: TextStyle(
                      color: c.muted,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.label});
  final String label;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      color: context.c.accent.withValues(alpha: 0.12),
      borderRadius: BorderRadius.circular(999),
    ),
    child: Text(
      label,
      style: TextStyle(
        color: context.c.accent,
        fontSize: 11,
        fontWeight: FontWeight.w900,
      ),
    ),
  );
}
