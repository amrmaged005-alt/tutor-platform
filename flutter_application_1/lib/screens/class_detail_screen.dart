import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../core/theme.dart';
import 'booking_sheet.dart';
import '../widgets/marketplace_widgets.dart';
import '../widgets/review_widgets.dart';

class ClassDetailScreen extends StatefulWidget {
  const ClassDetailScreen({super.key, required this.classId, this.initial});
  final String classId;
  final AppClass? initial;

  @override
  State<ClassDetailScreen> createState() => _ClassDetailScreenState();
}

class _ClassDetailScreenState extends State<ClassDetailScreen> {
  AppClass? _item;
  bool _loading = false;
  Future<List<AppClass>>? _relatedFuture;

  @override
  void initState() {
    super.initState();
    _item = widget.initial;
    if (_item != null) _relatedFuture = _loadRelated(_item!);
    if (_item == null) _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _item = await context.app.marketplace.classById(widget.classId);
      if (_item != null) _relatedFuture = _loadRelated(_item!);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<List<AppClass>> _loadRelated(AppClass item) async {
    final all = await context.app.marketplace.classes(subject: item.subject);
    return all.where((cls) => cls.id != item.id).take(4).toList();
  }

  Future<void> _book() async {
    final l = context.l10n;
    final app = context.app;
    if (!app.isSignedIn) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l.t('classes.signInToBook'))));
      context.push('/login');
      return;
    }
    final item = _item;
    if (item == null) return;
    await showBookingSheet(context, item);
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;
    final item = _item;
    final appWatch = context.appWatch;
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(onPressed: () => context.pop()),
        title: Text(item?.subject ?? l.t('classes.title')),
        actions: [
          if (item != null) ...[
            IconButton(
              onPressed: () => appWatch.toggleSaved(item.id),
              icon: Icon(
                appWatch.isSaved(item.id)
                    ? Icons.favorite_rounded
                    : Icons.favorite_border_rounded,
              ),
            ),
            IconButton(
              onPressed: () => Share.share(
                'https://coursaty.com/classes/${item.id}',
                subject: item.title,
              ),
              icon: const Icon(Icons.ios_share_rounded),
            ),
          ],
        ],
      ),
      body: _loading || item == null
          ? const LoadingList()
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 110),
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    FilterChipButton(
                      label: item.subject,
                      selected: true,
                      onTap: () {},
                    ),
                    FilterChipButton(
                      label: l.t('format.${item.format}'),
                      selected: false,
                      onTap: () {},
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  item.title,
                  style: TextStyle(
                    color: c.text,
                    fontSize: 24,
                    height: 1.12,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.8,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  item.providerName,
                  style: TextStyle(
                    color: c.secondary,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 16),
                _InfoCard(item: item),
                if ((item.description ?? '').isNotEmpty) ...[
                  SectionHeader(title: l.t('classes.about')),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      item.description!,
                      style: TextStyle(
                        color: c.secondary,
                        fontSize: 14,
                        height: 1.55,
                      ),
                    ),
                  ),
                ],
                if (item.tutors.isNotEmpty) ...[
                  SectionHeader(title: l.t('tutors.title')),
                  ...item.tutors.map(
                    (tutor) => ListTile(
                      leading: CircleAvatar(
                        backgroundColor: c.accent.withValues(alpha: 0.14),
                        child: Text(
                          tutor.name.isEmpty ? 'C' : tutor.name.substring(0, 1),
                        ),
                      ),
                      title: Text(
                        tutor.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      trailing: tutor.isVerified
                          ? Icon(Icons.verified_rounded, color: c.accent)
                          : null,
                      onTap: () => context.push('/tutors/${tutor.id}'),
                    ),
                  ),
                ],
                ReviewsSection(
                  title: l.t('reviews.title'),
                  classId: item.id,
                  load: () => context.app.marketplace.classReviews(item.id),
                ),
                SectionHeader(title: l.t('classes.related')),
                FutureBuilder<List<AppClass>>(
                  future: _relatedFuture,
                  builder: (context, snapshot) {
                    final items = snapshot.data ?? [];
                    if (snapshot.connectionState != ConnectionState.done) {
                      return const SizedBox(height: 110, child: LoadingList());
                    }
                    if (items.isEmpty) return const SizedBox.shrink();
                    return SizedBox(
                      height: 206,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemBuilder: (_, i) => SizedBox(
                          width: 220,
                          child: AppClassCard(item: items[i], compact: true),
                        ),
                        separatorBuilder: (_, _) => const SizedBox(width: 10),
                        itemCount: items.length,
                      ),
                    );
                  },
                ),
              ],
            ),
      bottomNavigationBar: item == null
          ? null
          : SafeArea(
              top: false,
              child: Container(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
                decoration: BoxDecoration(
                  color: c.card,
                  border: Border(top: BorderSide(color: c.border)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        item.priceEgp == 0
                            ? l.t('common.free')
                            : '${item.priceEgp} ${l.t('common.egp')}',
                        style: TextStyle(
                          color: c.accent,
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    ElevatedButton(
                      onPressed: _book,
                      child: Text(l.t('classes.book')),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.item});
  final AppClass item;

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final rows = <(IconData, String, String)>[
      (Icons.menu_book_outlined, l.t('classes.curriculum'), item.curriculum),
      if (item.gradeLevel != null)
        (Icons.grade_outlined, l.t('classes.grade'), item.gradeLevel!),
      (Icons.language_outlined, l.t('classes.language'), item.language),
      if (item.schedule != null)
        (Icons.schedule_outlined, l.t('classes.schedule'), item.schedule!),
      if (item.location != null)
        (Icons.place_outlined, l.t('classes.location'), item.location!),
      (
        Icons.people_outline_rounded,
        l.t('classes.enrolled'),
        '${item.bookingsCount}',
      ),
    ];
    final c = context.c;
    return Container(
      decoration: BoxDecoration(
        color: c.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: c.border),
      ),
      child: Column(
        children: [
          for (var i = 0; i < rows.length; i++) ...[
            if (i > 0) Divider(height: 1, color: c.border),
            ListTile(
              dense: true,
              leading: Icon(rows[i].$1, color: c.muted, size: 19),
              title: Text(
                rows[i].$2,
                style: TextStyle(
                  color: c.muted,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
              trailing: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 170),
                child: Text(
                  rows[i].$3,
                  textAlign: TextAlign.end,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: c.text,
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
