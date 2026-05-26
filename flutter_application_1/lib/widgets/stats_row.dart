import 'package:flutter/material.dart';

import '../core/l10n.dart';
import '../core/models.dart';
import '../core/theme.dart';

class DashboardStatsRow extends StatelessWidget {
  const DashboardStatsRow({super.key, required this.bookings});
  final List<BookingItem> bookings;

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final active = bookings
        .where((b) => b.status == 'PENDING' || b.status == 'CONFIRMED')
        .length;
    final spent = bookings.fold<int>(
      0,
      (sum, b) => sum + (b.amountEgp ?? b.classItem.priceEgp),
    );
    return Row(
      children: [
        _StatCard(label: l.t('dashboard.total'), value: '${bookings.length}'),
        const SizedBox(width: 8),
        _StatCard(label: l.t('dashboard.active'), value: '$active'),
        const SizedBox(width: 8),
        _StatCard(label: l.t('dashboard.spent'), value: '$spent'),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        decoration: BoxDecoration(
          color: c.card,
          border: Border.all(color: c.border),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: c.accent,
                fontSize: 18,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: c.muted,
                fontSize: 11,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
