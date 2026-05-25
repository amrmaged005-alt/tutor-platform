import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/l10n.dart';
import '../core/models.dart';
import '../core/theme.dart';

const subjects = [
  'Math',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Arabic',
  'History',
  'Geography',
  'CS',
];
const curricula = [
  'NATIONAL',
  'IGCSE',
  'AMERICAN',
  'IB',
  'FRENCH',
  'STEM',
  'OTHER',
];
const formats = ['IN_PERSON', 'ONLINE', 'HYBRID'];

class BrandMark extends StatelessWidget {
  const BrandMark({super.key, this.compact = false});
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: compact ? 28 : 34,
          height: compact ? 28 : 34,
          decoration: BoxDecoration(
            color: c.accent,
            borderRadius: BorderRadius.circular(9),
          ),
          child: Center(
            child: Text(
              'C',
              style: TextStyle(
                color: c.onAccent,
                fontWeight: FontWeight.w900,
                fontSize: compact ? 14 : 18,
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          context.l10n.t('app.name'),
          style: TextStyle(
            color: c.text,
            fontSize: compact ? 16 : 19,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.title,
    this.action,
    this.onAction,
  });
  final String title;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 10),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                color: c.text,
                fontSize: 18,
                fontWeight: FontWeight.w900,
                letterSpacing: -0.4,
              ),
            ),
          ),
          if (action != null)
            TextButton(onPressed: onAction, child: Text(action!)),
        ],
      ),
    );
  }
}

class SearchField extends StatelessWidget {
  const SearchField({
    super.key,
    required this.controller,
    required this.hint,
    required this.onSubmitted,
    this.onChanged,
  });
  final TextEditingController controller;
  final String hint;
  final ValueChanged<String> onSubmitted;
  final ValueChanged<String>? onChanged;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return TextField(
      controller: controller,
      textInputAction: TextInputAction.search,
      onSubmitted: onSubmitted,
      onChanged: onChanged,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: Icon(Icons.search_rounded, color: c.muted, size: 20),
        suffixIcon: controller.text.isEmpty
            ? null
            : IconButton(
                onPressed: () {
                  controller.clear();
                  onSubmitted('');
                },
                icon: Icon(Icons.close_rounded, color: c.muted, size: 18),
              ),
      ),
    );
  }
}

class FilterChipButton extends StatelessWidget {
  const FilterChipButton({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
    this.icon,
  });
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: onTap,
      child: Container(
        constraints: const BoxConstraints(minHeight: 40),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? c.accent.withValues(alpha: 0.12) : c.card,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: selected ? c.accent : c.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 15, color: selected ? c.accent : c.muted),
              const SizedBox(width: 5),
            ],
            Text(
              label,
              style: TextStyle(
                color: selected ? c.accent : c.secondary,
                fontSize: 12,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AppClassCard extends StatelessWidget {
  const AppClassCard({super.key, required this.item, this.compact = false});
  final AppClass item;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final l = context.l10n;
    final price = item.priceEgp == 0
        ? l.t('common.free')
        : '${item.priceEgp} ${l.t('common.egp')}';
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () => context.push('/classes/${item.id}', extra: item),
      child: Ink(
        decoration: BoxDecoration(
          color: c.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: c.border),
        ),
        padding: EdgeInsets.all(compact ? 10 : 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _Badge(item.subject, color: c.accent),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    price,
                    textAlign: TextAlign.end,
                    style: TextStyle(
                      color: c.accent,
                      fontWeight: FontWeight.w900,
                      fontSize: compact ? 12 : 14,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              item.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: c.text,
                fontWeight: FontWeight.w900,
                fontSize: compact ? 13 : 15,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              item.providerName,
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
              spacing: 6,
              runSpacing: 6,
              children: [
                _Meta(
                  icon: Icons.place_outlined,
                  text: item.format == 'ONLINE'
                      ? l.t('format.ONLINE')
                      : item.city,
                ),
                if (item.avgRating != null)
                  _Meta(
                    icon: Icons.star_rounded,
                    text: item.avgRating!.toStringAsFixed(1),
                    color: AppColors.rating,
                  ),
                if (item.spotsLeft != null)
                  _Meta(
                    icon: Icons.people_outline_rounded,
                    text: '${item.spotsLeft} ${l.t('classes.spots')}',
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class TutorCard extends StatelessWidget {
  const TutorCard({super.key, required this.tutor, this.compact = false});
  final TutorProfile tutor;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final l = context.l10n;
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () => context.push('/tutors/${tutor.id}', extra: tutor),
      child: Ink(
        decoration: BoxDecoration(
          color: c.card,
          border: Border.all(color: c.border),
          borderRadius: BorderRadius.circular(14),
        ),
        padding: EdgeInsets.all(compact ? 10 : 12),
        child: Row(
          children: [
            CircleAvatar(
              radius: compact ? 22 : 26,
              backgroundColor: c.accent.withValues(alpha: 0.14),
              backgroundImage: tutor.photoUrl == null
                  ? null
                  : NetworkImage(tutor.photoUrl!),
              child: tutor.photoUrl == null
                  ? Text(
                      tutor.name.isEmpty ? 'C' : tutor.name.substring(0, 1),
                      style: TextStyle(
                        color: c.accent,
                        fontWeight: FontWeight.w900,
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          tutor.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: c.text,
                            fontWeight: FontWeight.w900,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      if (tutor.isVerified)
                        Icon(Icons.verified_rounded, size: 16, color: c.accent),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    tutor.subjects.take(2).join(' • '),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: c.secondary,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Row(
                    children: [
                      if (tutor.avgRating != null)
                        _Meta(
                          icon: Icons.star_rounded,
                          text: tutor.avgRating!.toStringAsFixed(1),
                          color: AppColors.rating,
                        ),
                      const SizedBox(width: 6),
                      _Meta(
                        icon: Icons.school_outlined,
                        text: '${tutor.classCount} ${l.t('tutors.classes')}',
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class StateView extends StatelessWidget {
  const StateView({
    super.key,
    required this.icon,
    required this.title,
    required this.body,
    this.action,
    this.onAction,
  });
  final IconData icon;
  final String title;
  final String body;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 44, color: c.muted),
            const SizedBox(height: 12),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: c.text,
                fontSize: 16,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              body,
              textAlign: TextAlign.center,
              style: TextStyle(color: c.secondary, fontSize: 13, height: 1.5),
            ),
            if (action != null) ...[
              const SizedBox(height: 16),
              ElevatedButton(onPressed: onAction, child: Text(action!)),
            ],
          ],
        ),
      ),
    );
  }
}

class LoadingList extends StatelessWidget {
  const LoadingList({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemBuilder: (_, _) => Container(
        height: 104,
        decoration: BoxDecoration(
          color: c.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: c.border),
        ),
      ),
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemCount: 6,
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge(this.text, {required this.color});
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(7),
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

class _Meta extends StatelessWidget {
  const _Meta({required this.icon, required this.text, this.color});
  final IconData icon;
  final String text;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: color ?? c.muted),
        const SizedBox(width: 3),
        Text(
          text,
          style: TextStyle(
            color: color ?? c.muted,
            fontSize: 11,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}
