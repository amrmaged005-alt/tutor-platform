import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../core/theme.dart';
import '../widgets/marketplace_widgets.dart';

class BrowseScreen extends StatefulWidget {
  const BrowseScreen({super.key});

  @override
  State<BrowseScreen> createState() => _BrowseScreenState();
}

class _BrowseScreenState extends State<BrowseScreen> {
  final _search = TextEditingController();
  int _tab = 0;
  bool _grid = true;
  late Future<({List<AppClass> classes, List<TutorProfile> tutors})> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<({List<AppClass> classes, List<TutorProfile> tutors})> _load() async {
    final app = context.app;
    final classes = await app.marketplace.classes(search: _search.text);
    final tutors = await app.marketplace.tutors(search: _search.text);
    return (classes: classes, tutors: tutors);
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  void _refresh() => setState(() => _future = _load());

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final centers = context.app.centers.search(search: _search.text);
    return Scaffold(
      appBar: AppBar(
        title: Text(l.t('browse.title')),
        actions: [
          IconButton(
            onPressed: () => setState(() => _grid = !_grid),
            icon: Icon(
              _grid ? Icons.view_agenda_outlined : Icons.grid_view_rounded,
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 2, 16, 8),
            child: SearchField(
              controller: _search,
              hint: l.t('browse.search'),
              onSubmitted: (_) => _refresh(),
              onChanged: (_) => setState(() {}),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SegmentedButton<int>(
              segments: [
                ButtonSegment(value: 0, label: Text(l.t('nav.classes'))),
                ButtonSegment(value: 1, label: Text(l.t('nav.tutors'))),
                ButtonSegment(value: 2, label: Text(l.t('browse.centers'))),
              ],
              selected: {_tab},
              onSelectionChanged: (value) => setState(() => _tab = value.first),
            ),
          ),
          Expanded(
            child:
                FutureBuilder<
                  ({List<AppClass> classes, List<TutorProfile> tutors})
                >(
                  future: _future,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState != ConnectionState.done) {
                      return const LoadingList();
                    }
                    if (_tab == 0) {
                      return _ClassResults(
                        items: snapshot.data?.classes ?? [],
                        grid: _grid,
                      );
                    }
                    if (_tab == 1) {
                      return _TutorResults(
                        items: snapshot.data?.tutors ?? [],
                        grid: _grid,
                      );
                    }
                    return _CenterResults(items: centers);
                  },
                ),
          ),
        ],
      ),
    );
  }
}

class _ClassResults extends StatelessWidget {
  const _ClassResults({required this.items, required this.grid});
  final List<AppClass> items;
  final bool grid;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return StateView(
        icon: Icons.search_off_rounded,
        title: context.l10n.t('classes.empty'),
        body: context.l10n.t('classes.filters'),
      );
    }
    if (!grid) {
      return ListView.separated(
        padding: const EdgeInsets.all(16),
        itemBuilder: (_, i) => AppClassCard(item: items[i]),
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemCount: items.length,
      );
    }
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 0.66,
      ),
      itemBuilder: (_, i) => AppClassCard(item: items[i], compact: true),
      itemCount: items.length,
    );
  }
}

class _TutorResults extends StatelessWidget {
  const _TutorResults({required this.items, required this.grid});
  final List<TutorProfile> items;
  final bool grid;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return StateView(
        icon: Icons.person_off_outlined,
        title: context.l10n.t('tutors.empty'),
        body: context.l10n.t('classes.filters'),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemBuilder: (_, i) => TutorCard(tutor: items[i], compact: grid),
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemCount: items.length,
    );
  }
}

class _CenterResults extends StatelessWidget {
  const _CenterResults({required this.items});
  final List<EducationCenter> items;

  @override
  Widget build(BuildContext context) => ListView.separated(
    padding: const EdgeInsets.all(16),
    itemBuilder: (_, i) => _CenterCard(center: items[i]),
    separatorBuilder: (_, _) => const SizedBox(height: 10),
    itemCount: items.length,
  );
}

class _CenterCard extends StatelessWidget {
  const _CenterCard({required this.center});
  final EducationCenter center;

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.push('/centers/${center.id}', extra: center),
      child: Ink(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: c.card,
          border: Border.all(color: c.border),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: c.accent.withValues(alpha: 0.14),
              child: Icon(Icons.apartment_rounded, color: c.accent),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    center.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: c.text,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${center.location} • ${center.tutorCount} tutors',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: c.secondary, fontSize: 12),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    '★ ${center.rating.toStringAsFixed(1)}  ${center.subjects.take(3).join(', ')}',
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
          ],
        ),
      ),
    );
  }
}
