import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../core/theme.dart';
import '../widgets/marketplace_widgets.dart';
import '../widgets/review_widgets.dart';

class TutorDetailScreen extends StatefulWidget {
  const TutorDetailScreen({super.key, required this.tutorId, this.initial});
  final String tutorId;
  final TutorProfile? initial;

  @override
  State<TutorDetailScreen> createState() => _TutorDetailScreenState();
}

class _TutorDetailScreenState extends State<TutorDetailScreen> {
  TutorProfile? _tutor;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _tutor = widget.initial;
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _tutor = await context.app.marketplace.tutor(widget.tutorId);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;
    final tutor = _tutor;
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(onPressed: () => context.pop()),
        title: Text(l.t('tutors.title')),
      ),
      body: _loading && tutor == null
          ? const LoadingList()
          : tutor == null
          ? StateView(
              icon: Icons.person_off_outlined,
              title: l.t('state.error'),
              body: l.t('state.offline'),
              action: l.t('common.retry'),
              onAction: _load,
            )
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
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
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 34,
                              backgroundColor: c.accent.withValues(alpha: 0.13),
                              backgroundImage: tutor.photoUrl == null
                                  ? null
                                  : NetworkImage(tutor.photoUrl!),
                              child: tutor.photoUrl == null
                                  ? Text(
                                      tutor.name.isEmpty
                                          ? 'C'
                                          : tutor.name.substring(0, 1),
                                      style: TextStyle(
                                        color: c.accent,
                                        fontSize: 24,
                                        fontWeight: FontWeight.w900,
                                      ),
                                    )
                                  : null,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          tutor.name,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            color: c.text,
                                            fontSize: 21,
                                            fontWeight: FontWeight.w900,
                                            height: 1.1,
                                          ),
                                        ),
                                      ),
                                      if (tutor.isVerified)
                                        Icon(
                                          Icons.verified_rounded,
                                          color: c.accent,
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    tutor.centerName ?? tutor.city,
                                    style: TextStyle(
                                      color: c.secondary,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: tutor.subjects
                              .take(5)
                              .map(
                                (s) => FilterChipButton(
                                  label: s,
                                  selected: false,
                                  onTap: () => context.go('/classes'),
                                ),
                              )
                              .toList(),
                        ),
                        if ((tutor.bio ?? '').isNotEmpty) ...[
                          const SizedBox(height: 14),
                          Text(
                            tutor.bio!,
                            style: TextStyle(color: c.secondary, height: 1.5),
                          ),
                        ],
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            _Stat(
                              value: tutor.classCount.toString(),
                              label: l.t('tutors.classes'),
                            ),
                            _Stat(
                              value: tutor.studentCount.toString(),
                              label: l.t('tutors.students'),
                            ),
                            _Stat(
                              value: tutor.avgRating?.toStringAsFixed(1) ?? '-',
                              label: l.t('tutors.rating'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  SectionHeader(title: l.t('booking.sessions')),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: c.card,
                      border: Border.all(color: c.border),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${tutor.hourlyRateEgp} ${l.t('common.egp')} / hour',
                          style: TextStyle(
                            color: c.accent,
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: tutor.availableSlots
                              .map(
                                (slot) => FilterChipButton(
                                  label: slot,
                                  selected: false,
                                  onTap: () {},
                                ),
                              )
                              .toList(),
                        ),
                      ],
                    ),
                  ),
                  SectionHeader(title: l.t('nav.classes')),
                  if (tutor.classes.isEmpty)
                    StateView(
                      icon: Icons.school_outlined,
                      title: l.t('classes.empty'),
                      body: l.t('tutors.empty'),
                    )
                  else
                    SizedBox(
                      height: 212,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemBuilder: (_, i) => SizedBox(
                          width: 220,
                          child: AppClassCard(
                            item: tutor.classes[i],
                            compact: true,
                          ),
                        ),
                        separatorBuilder: (_, _) => const SizedBox(width: 10),
                        itemCount: tutor.classes.length,
                      ),
                    ),
                  ReviewsSection(
                    title: l.t('reviews.title'),
                    load: () => context.app.marketplace.tutorReviews(tutor.id),
                  ),
                ],
              ),
            ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.value, required this.label});
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: TextStyle(
              color: c.accent,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              color: c.muted,
              fontSize: 11,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
