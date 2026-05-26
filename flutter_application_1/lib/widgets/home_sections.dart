import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/l10n.dart';
import '../core/theme.dart';
import 'marketplace_widgets.dart';

const subjectIcons = <({String label, IconData icon})>[
  (label: 'Math', icon: Icons.calculate_outlined),
  (label: 'Science', icon: Icons.science_outlined),
  (label: 'Arabic', icon: Icons.menu_book_outlined),
  (label: 'English', icon: Icons.translate_outlined),
  (label: 'Physics', icon: Icons.bolt_outlined),
  (label: 'Chemistry', icon: Icons.biotech_outlined),
  (label: 'History', icon: Icons.history_edu_outlined),
  (label: 'Art', icon: Icons.palette_outlined),
];

class SubjectIconGrid extends StatelessWidget {
  const SubjectIconGrid({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: subjectIcons.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 4,
          mainAxisSpacing: 12,
          crossAxisSpacing: 10,
          childAspectRatio: 0.82,
        ),
        itemBuilder: (_, index) {
          final item = subjectIcons[index];
          return InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: () => context.push(
              '/classes?search=${Uri.encodeComponent(item.label)}',
            ),
            child: Column(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: c.accent.withValues(alpha: 0.12),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(item.icon, color: c.accent, size: 24),
                ),
                const SizedBox(height: 7),
                Text(
                  item.label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: c.secondary,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
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

class TrendingBanners extends StatelessWidget {
  const TrendingBanners({super.key});

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final items = [
      (title: l.t('home.trendMath'), search: 'Math', icon: Icons.calculate),
      (
        title: l.t('home.trendOnline'),
        search: 'Online',
        icon: Icons.video_call,
      ),
      (
        title: l.t('home.trendExam'),
        search: 'IGCSE',
        icon: Icons.workspace_premium,
      ),
    ];
    return SizedBox(
      height: 108,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemBuilder: (_, index) => _PromoBanner(item: items[index]),
        separatorBuilder: (_, _) => const SizedBox(width: 10),
        itemCount: items.length,
      ),
    );
  }
}

class NearYouHeader extends StatelessWidget {
  const NearYouHeader({super.key, required this.city, required this.onChange});
  final String city;
  final VoidCallback onChange;

  @override
  Widget build(BuildContext context) => SectionHeader(
    title: '${context.l10n.t('home.nearYou')} $city',
    action: context.l10n.t('filter.city'),
    onAction: onChange,
  );
}

class _PromoBanner extends StatelessWidget {
  const _PromoBanner({required this.item});
  final ({String title, String search, IconData icon}) item;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: () =>
          context.push('/classes?search=${Uri.encodeComponent(item.search)}'),
      child: Container(
        width: 230,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: c.card,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: c.border),
        ),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: c.accent.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(item.icon, color: c.accent),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                item.title,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: c.text,
                  fontWeight: FontWeight.w900,
                  fontSize: 15,
                  height: 1.18,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
