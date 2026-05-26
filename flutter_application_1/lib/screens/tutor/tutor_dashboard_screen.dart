import 'package:flutter/material.dart';

import '../../app_state.dart';
import '../../core/formatters.dart';
import '../../core/l10n.dart';
import '../../core/models.dart';
import '../../core/theme.dart';
import '../../widgets/dashboard/metric_card.dart';
import '../../widgets/dashboard/revenue_chart.dart';
import '../../widgets/marketplace_widgets.dart';

class TutorDashboardScreen extends StatefulWidget {
  const TutorDashboardScreen({super.key});

  @override
  State<TutorDashboardScreen> createState() => _TutorDashboardScreenState();
}

class _TutorDashboardScreenState extends State<TutorDashboardScreen> {
  late Future<_TutorData> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<_TutorData> _load() async {
    final marketplace = context.app.marketplace;
    final bookings = await marketplace.bookings();
    final classes = await marketplace.managedClasses(role: 'TUTOR');
    return _TutorData(bookings: bookings, classes: classes);
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return Scaffold(
      appBar: AppBar(title: Text(l.t('dashboard.title'))),
      body: FutureBuilder<_TutorData>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const LoadingList();
          final data = snapshot.data!;
          final earned = data.bookings.fold<int>(
            0,
            (sum, item) => sum + (item.amountEgp ?? item.classItem.priceEgp),
          );
          final pending = data.bookings
              .where((item) => item.paymentStatus == 'PENDING')
              .fold<int>(0, (sum, item) => sum + (item.amountEgp ?? 0));
          return RefreshIndicator(
            onRefresh: () async => setState(() => _future = _load()),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              children: [
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.45,
                  children: [
                    MetricCard(
                      label: l.t('dashboard.earnings'),
                      value: egp(earned),
                      icon: Icons.payments_outlined,
                    ),
                    MetricCard(
                      label: l.t('dashboard.thisMonth'),
                      value: egp((earned * 0.42).round()),
                      icon: Icons.calendar_month_outlined,
                    ),
                    MetricCard(
                      label: l.t('dashboard.pending'),
                      value: egp(pending),
                      icon: Icons.hourglass_bottom_rounded,
                      tint: AppColors.rating,
                    ),
                    MetricCard(
                      label: l.t('dashboard.collected'),
                      value: egp(earned - pending),
                      icon: Icons.verified_rounded,
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                RevenueChart(values: const [420, 650, 390, 820, 760, 980, 540]),
                _section(l.t('dashboard.upcoming')),
                ...data.bookings.take(4).map(_bookingTile),
                _section(l.t('dashboard.attendance')),
                ...data.classes.take(3).map(_attendanceTile),
                _section(l.t('dashboard.roster')),
                ...data.bookings.take(5).map(_studentTile),
                _section(l.t('dashboard.content')),
                _contentBox(),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _section(String title) => Padding(
    padding: const EdgeInsets.fromLTRB(0, 20, 0, 8),
    child: Text(
      title,
      style: TextStyle(
        color: context.c.text,
        fontSize: 17,
        fontWeight: FontWeight.w900,
      ),
    ),
  );

  Widget _bookingTile(BookingItem item) {
    final c = context.c;
    final color = item.paymentStatus == 'PAID'
        ? c.accent
        : item.paymentStatus == 'CANCELLED'
        ? Theme.of(context).colorScheme.error
        : AppColors.rating;
    return Card(
      child: ListTile(
        dense: true,
        title: Text(
          item.classItem.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(item.studentName ?? context.l10n.t('common.student')),
        trailing: Text(
          item.paymentStatus,
          style: TextStyle(color: color, fontWeight: FontWeight.w900),
        ),
      ),
    );
  }

  Widget _attendanceTile(AppClass item) => Card(
    child: CheckboxListTile(
      value: item.seatsTaken % 2 == 0,
      onChanged: (_) {},
      title: Text(item.title, maxLines: 1, overflow: TextOverflow.ellipsis),
      subtitle: Text(
        '${item.seatsTaken}/${item.seatLimit} ${context.l10n.t('classes.spots')}',
      ),
    ),
  );

  Widget _studentTile(BookingItem item) => Card(
    child: SwitchListTile(
      value: item.paymentStatus == 'PAID',
      onChanged: (_) {},
      title: Text(item.studentName ?? context.l10n.t('common.student')),
      subtitle: Text(item.studentPhone ?? '01000000000'),
    ),
  );

  Widget _contentBox() => Card(
    child: Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          TextField(
            decoration: InputDecoration(
              labelText: context.l10n.t('manage.notes'),
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            decoration: InputDecoration(
              labelText: context.l10n.t('manage.recording'),
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            decoration: InputDecoration(
              labelText: context.l10n.t('manage.homework'),
            ),
          ),
        ],
      ),
    ),
  );
}

class _TutorData {
  const _TutorData({required this.bookings, required this.classes});
  final List<BookingItem> bookings;
  final List<AppClass> classes;
}
