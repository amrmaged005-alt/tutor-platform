import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';

import '../../app_state.dart';
import '../../core/formatters.dart';
import '../../core/l10n.dart';
import '../../core/models.dart';
import '../../core/theme.dart';
import '../../widgets/dashboard/metric_card.dart';
import '../../widgets/dashboard/revenue_chart.dart';
import '../../widgets/marketplace_widgets.dart';

class CenterDashboardScreen extends StatefulWidget {
  const CenterDashboardScreen({super.key});

  @override
  State<CenterDashboardScreen> createState() => _CenterDashboardScreenState();
}

class _CenterDashboardScreenState extends State<CenterDashboardScreen> {
  late Future<_CenterData> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<_CenterData> _load() async {
    final marketplace = context.app.marketplace;
    final classes = await marketplace.managedClasses(role: 'CENTER_ADMIN');
    final bookings = await marketplace.bookings();
    return _CenterData(classes: classes, bookings: bookings);
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return Scaffold(
      appBar: AppBar(title: Text(l.t('dashboard.title'))),
      body: FutureBuilder<_CenterData>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const LoadingList();
          final data = snapshot.data!;
          final revenue = data.bookings.fold<int>(
            0,
            (sum, item) => sum + (item.amountEgp ?? item.classItem.priceEgp),
          );
          final students = data.classes.fold<int>(
            0,
            (sum, item) => sum + item.seatsTaken,
          );
          return ListView(
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
                    value: egp(revenue),
                    icon: Icons.payments_outlined,
                  ),
                  MetricCard(
                    label: l.t('dashboard.active'),
                    value: '${data.classes.length}',
                    icon: Icons.school_outlined,
                  ),
                  MetricCard(
                    label: l.t('tutors.students'),
                    value: '$students',
                    icon: Icons.groups_outlined,
                  ),
                  MetricCard(
                    label: l.t('dashboard.pending'),
                    value: egp((revenue * 0.1).round()),
                    icon: Icons.account_balance_wallet_outlined,
                    tint: AppColors.rating,
                  ),
                ],
              ),
              _section(l.t('dashboard.revenueByTutor')),
              RevenueChart(values: const [900, 740, 1120, 680, 530, 810, 990]),
              _section(l.t('dashboard.calendar')),
              Card(
                child: TableCalendar<void>(
                  focusedDay: DateTime.now(),
                  firstDay: DateTime(2026, 1, 1),
                  lastDay: DateTime(2027, 12, 31),
                  headerStyle: const HeaderStyle(formatButtonVisible: false),
                ),
              ),
              _section(l.t('dashboard.revenueBySubject')),
              ..._subjectRows(data.classes),
              _section(l.t('dashboard.manage')),
              ...data.bookings.take(5).map(_bookingTile),
            ],
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

  List<Widget> _subjectRows(List<AppClass> classes) {
    final totals = <String, int>{};
    for (final item in classes) {
      totals[item.subject] = (totals[item.subject] ?? 0) + item.priceEgp;
    }
    return totals.entries
        .map(
          (entry) => Card(
            child: ListTile(
              dense: true,
              title: Text(entry.key),
              trailing: Text(
                egp(entry.value),
                style: TextStyle(
                  color: context.c.accent,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
        )
        .toList();
  }

  Widget _bookingTile(BookingItem item) => Card(
    child: ListTile(
      dense: true,
      title: Text(
        item.classItem.title,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      subtitle: Text(
        '${item.studentName ?? context.l10n.t('common.student')} ${item.paymentStatus}',
      ),
      trailing: OutlinedButton(
        onPressed: () {},
        child: Text(context.l10n.t('manage.exportCsv')),
      ),
    ),
  );
}

class _CenterData {
  const _CenterData({required this.classes, required this.bookings});
  final List<AppClass> classes;
  final List<BookingItem> bookings;
}
