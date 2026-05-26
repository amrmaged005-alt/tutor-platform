import 'package:flutter/material.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import 'filter_sheet.dart';
import '../widgets/marketplace_widgets.dart';

class ClassesScreen extends StatefulWidget {
  const ClassesScreen({super.key, this.initialSearch});
  final String? initialSearch;

  @override
  State<ClassesScreen> createState() => _ClassesScreenState();
}

class _ClassesScreenState extends State<ClassesScreen> {
  final _search = TextEditingController();
  ClassFilters _filters = ClassFilters.empty;
  late Future<List<AppClass>> _future;

  @override
  void initState() {
    super.initState();
    if (widget.initialSearch != null) _search.text = widget.initialSearch!;
    _future = _load();
  }

  Future<List<AppClass>> _load() async {
    final repo = context.app.marketplace;
    if (_filters.subjects.length <= 1) {
      return repo.classes(
        search: _search.text,
        subject: _filters.primarySubject,
        format: _filters.format,
        city: _filters.city,
        maxPrice: _filters.maxPrice,
        sortBy: _filters.sortBy,
      );
    }
    final chunks = await Future.wait(
      _filters.subjects.map(
        (subject) => repo.classes(
          search: _search.text,
          subject: subject,
          format: _filters.format,
          city: _filters.city,
          maxPrice: _filters.maxPrice,
          sortBy: _filters.sortBy,
        ),
      ),
    );
    final byId = <String, AppClass>{};
    for (final chunk in chunks) {
      for (final item in chunk) {
        byId[item.id] = item;
      }
    }
    return byId.values.toList();
  }

  void _refresh() => setState(() => _future = _load());

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return Scaffold(
      appBar: AppBar(
        title: Text(l.t('classes.title')),
        actions: [
          IconButton(
            onPressed: _openFilters,
            icon: const Icon(Icons.tune_rounded),
            tooltip: l.t('classes.filters'),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 2, 16, 8),
            child: SearchField(
              controller: _search,
              hint: l.t('classes.search'),
              onSubmitted: (_) => _refresh(),
              onChanged: (_) => setState(() {}),
            ),
          ),
          _SuggestionRow(
            query: _search.text,
            onPick: (value) {
              _search.text = value;
              _refresh();
            },
          ),
          Expanded(
            child: FutureBuilder<List<AppClass>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const LoadingList();
                }
                if (snapshot.hasError) {
                  return StateView(
                    icon: Icons.wifi_off_rounded,
                    title: l.t('state.error'),
                    body: l.t('state.offline'),
                    action: l.t('common.retry'),
                    onAction: _refresh,
                  );
                }
                final items = snapshot.data ?? [];
                if (items.isEmpty) {
                  return StateView(
                    icon: Icons.search_off_rounded,
                    title: l.t('classes.empty'),
                    body: l.t('classes.filters'),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () async => _refresh(),
                  child: GridView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                          childAspectRatio: 0.78,
                        ),
                    itemCount: items.length,
                    itemBuilder: (_, i) =>
                        AppClassCard(item: items[i], compact: true),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openFilters() async {
    final app = context.app;
    final next = await showClassFilterSheet(context, _filters);
    if (next == null) return;
    if (next.city.isNotEmpty) {
      await app.setLastCity(next.city);
    }
    if (!mounted) return;
    setState(() {
      _filters = next;
      _future = _load();
    });
  }
}

class TutorsScreen extends StatefulWidget {
  const TutorsScreen({super.key});

  @override
  State<TutorsScreen> createState() => _TutorsScreenState();
}

class _TutorsScreenState extends State<TutorsScreen> {
  final _search = TextEditingController();
  String _subject = '';
  late Future<List<TutorProfile>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<TutorProfile>> _load() =>
      context.app.marketplace.tutors(search: _search.text, subject: _subject);
  void _refresh() => setState(() => _future = _load());

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return Scaffold(
      appBar: AppBar(title: Text(l.t('tutors.title'))),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 2, 16, 8),
            child: SearchField(
              controller: _search,
              hint: l.t('tutors.search'),
              onSubmitted: (_) => _refresh(),
              onChanged: (_) => setState(() {}),
            ),
          ),
          _SuggestionRow(
            query: _search.text,
            onPick: (value) {
              _search.text = value;
              _refresh();
            },
          ),
          SizedBox(
            height: 42,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemBuilder: (_, i) => FilterChipButton(
                label: subjects[i],
                selected: _subject == subjects[i],
                onTap: () => setState(() {
                  _subject = _subject == subjects[i] ? '' : subjects[i];
                  _future = _load();
                }),
              ),
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemCount: subjects.length,
            ),
          ),
          Expanded(
            child: FutureBuilder<List<TutorProfile>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const LoadingList();
                }
                if (snapshot.hasError) {
                  return StateView(
                    icon: Icons.wifi_off_rounded,
                    title: l.t('state.error'),
                    body: l.t('state.offline'),
                    action: l.t('common.retry'),
                    onAction: _refresh,
                  );
                }
                final items = snapshot.data ?? [];
                if (items.isEmpty) {
                  return StateView(
                    icon: Icons.person_off_outlined,
                    title: l.t('tutors.empty'),
                    body: l.t('classes.filters'),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () async => _refresh(),
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
                    itemBuilder: (_, i) => TutorCard(tutor: items[i]),
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemCount: items.length,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _SuggestionRow extends StatelessWidget {
  const _SuggestionRow({required this.query, required this.onPick});
  final String query;
  final ValueChanged<String> onPick;

  @override
  Widget build(BuildContext context) {
    final text = query.trim().toLowerCase();
    if (text.length < 2) return const SizedBox.shrink();
    final matches = subjects
        .where((subject) => subject.toLowerCase().contains(text))
        .take(5)
        .toList();
    if (matches.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemBuilder: (_, i) => FilterChipButton(
          label: matches[i],
          selected: false,
          onTap: () => onPick(matches[i]),
        ),
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemCount: matches.length,
      ),
    );
  }
}
