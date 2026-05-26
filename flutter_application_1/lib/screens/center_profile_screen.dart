import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../core/theme.dart';
import '../data/mock_data.dart';
import '../widgets/marketplace_widgets.dart';

class CenterProfileScreen extends StatelessWidget {
  const CenterProfileScreen({super.key, required this.centerId, this.initial});
  final String centerId;
  final EducationCenter? initial;

  @override
  Widget build(BuildContext context) {
    final center = initial ?? context.app.marketplace.center(centerId);
    final tutors = MockData.tutors
        .where((t) => t.centerName == center.name)
        .toList();
    final classes = MockData.classes
        .where((c) => c.city == center.city)
        .take(6)
        .toList();
    final c = context.c;
    return Scaffold(
      appBar: AppBar(title: Text(center.name)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          Container(
            height: 126,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: c.accent.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 36,
                  backgroundColor: c.card,
                  child: Icon(
                    Icons.apartment_rounded,
                    color: c.accent,
                    size: 34,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    center.description,
                    maxLines: 4,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: c.text,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          _InfoRow(icon: Icons.place_outlined, text: center.location),
          _InfoRow(icon: Icons.star_rounded, text: '${center.rating} rating'),
          _InfoRow(
            icon: Icons.group_outlined,
            text: '${center.tutorCount} tutors',
          ),
          SectionHeader(title: context.l10n.t('nav.tutors')),
          ...tutors
              .take(4)
              .map(
                (tutor) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: TutorCard(tutor: tutor),
                ),
              ),
          SectionHeader(title: context.l10n.t('nav.classes')),
          ...classes.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: AppClassCard(item: item),
            ),
          ),
          SectionHeader(title: context.l10n.t('classes.location')),
          Container(
            height: 120,
            decoration: BoxDecoration(
              color: c.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: c.border),
            ),
            child: Center(
              child: Text(
                center.location,
                style: TextStyle(
                  color: c.secondary,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          ElevatedButton.icon(
            onPressed: () => context.push('/browse'),
            icon: const Icon(Icons.near_me_outlined),
            label: const Text('Contact / visit'),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.text});
  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(
      children: [
        Icon(icon, size: 18, color: context.c.accent),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              color: context.c.secondary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    ),
  );
}
