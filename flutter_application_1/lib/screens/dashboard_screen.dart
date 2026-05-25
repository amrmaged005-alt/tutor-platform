import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../core/theme.dart';
import '../widgets/marketplace_widgets.dart';

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
                              onPressed: () => context.go('/account'),
                              icon: const Icon(Icons.settings_outlined),
                            ),
                          ],
                        ),
                      ),
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
                      else if ((snapshot.data ?? []).isEmpty)
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
                        ...(snapshot.data ?? []).map(
                          (booking) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _BookingCard(
                              booking: booking,
                              showStudent: user.role != 'STUDENT',
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              },
            ),
    );
  }
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

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.app;
    final l = context.l10n;
    final c = context.c;
    final user = app.user;
    return Scaffold(
      appBar: AppBar(title: Text(l.t('account.title'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: c.card,
              border: Border.all(color: c.border),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const BrandMark(),
                const SizedBox(height: 12),
                Text(
                  user?.name ?? l.t('auth.welcome'),
                  style: TextStyle(
                    color: c.text,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                if (user != null)
                  Text(
                    user.email,
                    style: TextStyle(
                      color: c.secondary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),
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
            onTap: () =>
                app.setLang(app.lang == AppLang.en ? AppLang.ar : AppLang.en),
          ),
          if (user != null && user.role != 'STUDENT')
            ListTile(
              leading: const Icon(Icons.construction_rounded),
              title: Text(l.t('common.comingSoon')),
              subtitle: Text(l.t('account.roleFeature')),
            ),
          const SizedBox(height: 12),
          if (user == null)
            ElevatedButton(
              onPressed: () => context.go('/login'),
              child: Text(l.t('auth.signIn')),
            )
          else
            OutlinedButton(
              onPressed: () async {
                await app.logout();
                if (context.mounted) context.go('/');
              },
              child: Text(l.t('auth.logout')),
            ),
        ],
      ),
    );
  }
}
