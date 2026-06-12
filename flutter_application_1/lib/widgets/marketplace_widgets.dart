import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/formatters.dart';
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
  const BrandMark({super.key, this.compact = false, this.onDark = false});
  final bool compact;
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final size = compact ? 30.0 : 36.0;
    final fontSize = compact ? 15.0 : 18.0;
    final textColor = onDark ? Colors.white : c.text;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: size + 4,
          height: size + 4,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: size,
                height: size,
                margin: const EdgeInsets.only(top: 2, left: 2),
                decoration: BoxDecoration(
                  color: onDark
                      ? Colors.white.withValues(alpha: 0.18)
                      : c.accent,
                  borderRadius: BorderRadius.circular(size * 0.28),
                ),
                child: Center(
                  child: Text(
                    'C',
                    style: TextStyle(
                      color: onDark ? Colors.white : c.onAccent,
                      fontWeight: FontWeight.w900,
                      fontSize: fontSize,
                      height: 1,
                    ),
                  ),
                ),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: size * 0.42,
                  height: size * 0.42,
                  decoration: BoxDecoration(
                    color: onDark ? c.bg : c.bg,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.play_arrow_rounded,
                    color: AppColors.rating,
                    size: size * 0.32,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 6),
        Text(
          context.l10n.t('app.name'),
          style: TextStyle(
            color: textColor,
            fontSize: compact ? 16 : 20,
            fontWeight: FontWeight.w900,
            letterSpacing: -0.3,
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

// ─── Class Card ──────────────────────────────────────────────────────────────

class AppClassCard extends StatelessWidget {
  const AppClassCard({super.key, required this.item, this.compact = false});
  final AppClass item;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    final l = context.l10n;
    final app = context.appWatch;
    final price = item.priceEgp == 0 ? l.t('common.free') : egp(item.priceEgp);
    final isSaved = app.isSaved(item.id);

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.push('/classes/${item.id}', extra: item),
      child: Ink(
        decoration: BoxDecoration(
          color: c.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: c.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Image with overlaid badges ──
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(15),
                  ),
                  child: AspectRatio(
                    aspectRatio: 16 / 10,
                    child: _ClassImage(item: item, accent: c.accent),
                  ),
                ),
                // Subject badge (top-left)
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: c.accent,
                      borderRadius: BorderRadius.circular(7),
                    ),
                    child: Text(
                      item.subject,
                      style: TextStyle(
                        color: c.onAccent,
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
                // Heart button (top-right)
                Positioned(
                  top: 6,
                  right: 6,
                  child: GestureDetector(
                    onTap: () => app.toggleSaved(item.id),
                    child: Container(
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        color: c.card.withValues(alpha: 0.92),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      child: Icon(
                        isSaved
                            ? Icons.favorite_rounded
                            : Icons.favorite_border_rounded,
                        color: isSaved ? c.accent : c.muted,
                        size: 15,
                      ),
                    ),
                  ),
                ),
                // Full / low seats badge (bottom-right)
                if (item.isFull)
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: _ImageBadge(
                      text: l.t('classes.full'),
                      color: AppColors.error,
                    ),
                  )
                else if (item.isLowSeats)
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: _ImageBadge(
                      text: l
                          .t('classes.onlyLeft')
                          .replaceFirst('{count}', '${item.remainingSeats}'),
                      color: AppColors.rating,
                    ),
                  ),
              ],
            ),
            // ── Content ──
            Padding(
              padding: EdgeInsets.all(compact ? 10.0 : 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: c.text,
                      fontWeight: FontWeight.w900,
                      fontSize: compact ? 13 : 15,
                      height: 1.25,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    item.providerName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: c.secondary,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      if (item.avgRating != null) ...[
                        Icon(
                          Icons.star_rounded,
                          size: 13,
                          color: AppColors.rating,
                        ),
                        const SizedBox(width: 2),
                        Text(
                          item.avgRating!.toStringAsFixed(1),
                          style: TextStyle(
                            color: AppColors.rating,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        if (item.seatsTaken > 0) ...[
                          Text(
                            '  •  ',
                            style: TextStyle(color: c.muted, fontSize: 11),
                          ),
                          Icon(
                            Icons.people_outline_rounded,
                            size: 12,
                            color: c.muted,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '${item.seatsTaken}',
                            style: TextStyle(
                              color: c.muted,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ],
                      const Spacer(),
                      Text(
                        price,
                        style: TextStyle(
                          color: c.accent,
                          fontWeight: FontWeight.w900,
                          fontSize: compact ? 12 : 14,
                        ),
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

class _ClassImage extends StatelessWidget {
  const _ClassImage({required this.item, required this.accent});
  final AppClass item;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    if (item.thumbnailUrl != null) {
      return CachedNetworkImage(
        imageUrl: item.thumbnailUrl!,
        fit: BoxFit.cover,
        fadeInDuration: const Duration(milliseconds: 150),
        placeholder: (_, _) => _placeholder(),
        errorWidget: (_, _, _) => _placeholder(),
      );
    }
    return _placeholder();
  }

  Widget _placeholder() => Container(
    color: accent.withValues(alpha: 0.1),
    child: Center(
      child: Icon(_subjectIcon(item.subject), color: accent, size: 34),
    ),
  );
}

class _ImageBadge extends StatelessWidget {
  const _ImageBadge({required this.text, required this.color});
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
    decoration: BoxDecoration(
      color: color.withValues(alpha: 0.92),
      borderRadius: BorderRadius.circular(6),
    ),
    child: Text(
      text,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 9,
        fontWeight: FontWeight.w900,
      ),
    ),
  );
}

// ─── Tutor Card ───────────────────────────────────────────────────────────────

class TutorCard extends StatelessWidget {
  const TutorCard({
    super.key,
    required this.tutor,
    this.compact = false,
    this.portrait = false,
  });
  final TutorProfile tutor;
  final bool compact;
  final bool portrait;

  @override
  Widget build(BuildContext context) {
    return portrait
        ? _PortraitTutorCard(tutor: tutor)
        : _HorizontalTutorCard(tutor: tutor, compact: compact);
  }
}

class _PortraitTutorCard extends StatelessWidget {
  const _PortraitTutorCard({required this.tutor});
  final TutorProfile tutor;

  @override
  Widget build(BuildContext context) {
    final c = context.c;

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.push('/tutors/${tutor.id}', extra: tutor),
      child: Ink(
        decoration: BoxDecoration(
          color: c.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: c.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Portrait image with badges ──
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(15),
                  ),
                  child: AspectRatio(
                    aspectRatio: 0.9,
                    child: _TutorImage(tutor: tutor, accent: c.accent),
                  ),
                ),
                // Heart button (top-right)
                Positioned(
                  top: 6,
                  right: 6,
                  child: Container(
                    width: 30,
                    height: 30,
                    decoration: BoxDecoration(
                      color: c.card.withValues(alpha: 0.9),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.08),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.favorite_border_rounded,
                      color: c.muted,
                      size: 15,
                    ),
                  ),
                ),
                // Verified badge (bottom-left of image)
                if (tutor.isVerified)
                  Positioned(
                    bottom: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 7,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: c.accent,
                        borderRadius: BorderRadius.circular(7),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.verified_rounded,
                            size: 10,
                            color: c.onAccent,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            'Verified',
                            style: TextStyle(
                              color: c.onAccent,
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            // ── Info ──
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 10, 10, 12),
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
                            fontSize: 13,
                          ),
                        ),
                      ),
                      if (tutor.isVerified)
                        Icon(
                          Icons.verified_rounded,
                          size: 14,
                          color: c.accent,
                        ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    tutor.subjects.take(2).join(' • '),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: c.secondary,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      if (tutor.avgRating != null) ...[
                        Icon(
                          Icons.star_rounded,
                          size: 12,
                          color: AppColors.rating,
                        ),
                        const SizedBox(width: 2),
                        Text(
                          tutor.avgRating!.toStringAsFixed(1),
                          style: TextStyle(
                            color: AppColors.rating,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(width: 4),
                      ],
                      Expanded(
                        child: Text(
                          '${egp(tutor.hourlyRateEgp)}/hr',
                          maxLines: 1,
                          textAlign: TextAlign.end,
                          style: TextStyle(
                            color: c.accent,
                            fontWeight: FontWeight.w900,
                            fontSize: 12,
                          ),
                        ),
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

class _HorizontalTutorCard extends StatelessWidget {
  const _HorizontalTutorCard({required this.tutor, required this.compact});
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
                      tutor.name.isEmpty ? 'C' : tutor.name[0],
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
                        Icon(
                          Icons.verified_rounded,
                          size: 16,
                          color: c.accent,
                        ),
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

class _TutorImage extends StatelessWidget {
  const _TutorImage({required this.tutor, required this.accent});
  final TutorProfile tutor;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    if (tutor.photoUrl != null) {
      return CachedNetworkImage(
        imageUrl: tutor.photoUrl!,
        fit: BoxFit.cover,
        fadeInDuration: const Duration(milliseconds: 150),
        placeholder: (_, _) => _placeholder(),
        errorWidget: (_, _, _) => _placeholder(),
      );
    }
    return _placeholder();
  }

  Widget _placeholder() => Container(
    color: accent.withValues(alpha: 0.12),
    child: Center(
      child: Icon(Icons.person_rounded, color: accent, size: 48),
    ),
  );
}

// ─── State / Loading Views ────────────────────────────────────────────────────

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

// ─── Shared private widgets ───────────────────────────────────────────────────

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

IconData _subjectIcon(String subject) {
  final s = subject.toLowerCase();
  if (s.contains('math')) return Icons.calculate_outlined;
  if (s.contains('physics')) return Icons.bolt_outlined;
  if (s.contains('chem')) return Icons.biotech_outlined;
  if (s.contains('bio') || s.contains('science')) return Icons.science_outlined;
  if (s.contains('english') || s.contains('arabic')) {
    return Icons.menu_book_outlined;
  }
  return Icons.school_outlined;
}
