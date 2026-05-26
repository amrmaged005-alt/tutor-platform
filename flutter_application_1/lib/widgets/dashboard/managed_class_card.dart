import 'package:flutter/material.dart';

import '../../core/formatters.dart';
import '../../core/l10n.dart';
import '../../core/models.dart';
import '../../core/theme.dart';

class ManagedClassCard extends StatelessWidget {
  const ManagedClassCard({
    super.key,
    required this.item,
    required this.onEdit,
    required this.onDelete,
  });

  final AppClass item;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final l = context.l10n;
    final full = item.isFull;
    final seatColor = full
        ? Theme.of(context).colorScheme.error
        : item.isLowSeats
        ? AppColors.rating
        : c.accent;
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onLongPress: onEdit,
      child: Ink(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: c.card,
          border: Border.all(color: c.border),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    item.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: c.text,
                      fontSize: 14,
                      height: 1.2,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                PopupMenuButton<String>(
                  onSelected: (value) {
                    if (value == 'edit') onEdit();
                    if (value == 'delete') onDelete();
                  },
                  itemBuilder: (_) => [
                    PopupMenuItem(
                      value: 'edit',
                      child: Text(l.t('manage.editClass')),
                    ),
                    PopupMenuItem(
                      value: 'delete',
                      child: Text(l.t('manage.deleteClass')),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                _Pill(text: item.subject, color: c.accent),
                _Pill(text: item.status, color: c.secondary),
                _Pill(text: egp(item.priceEgp), color: c.accent),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      minHeight: 6,
                      value: item.seatsTaken / item.seatLimit,
                      color: seatColor,
                      backgroundColor: c.border,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '${item.seatsTaken}/${item.seatLimit}',
                  style: TextStyle(
                    color: seatColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              item.schedule ?? item.location ?? item.format,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: c.secondary,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.text, required this.color});
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.11),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}
