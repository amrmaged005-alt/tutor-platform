import 'package:flutter/material.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../widgets/marketplace_widgets.dart';

class ClassesScreen extends StatefulWidget {
  const ClassesScreen({super.key, this.initialSearch});
  final String? initialSearch;

  @override
  State<ClassesScreen> createState() => _ClassesScreenState();
}

class _ClassesScreenState extends State<ClassesScreen> {
  final _search = TextEditingController();
  String _subject = '';
  String _format = '';
  String _sortBy = 'newest';
  late Future<List<AppClass>> _future;

  @override
  void initState() {
    super.initState();
    if (widget.initialSearch != null) _search.text = widget.initialSearch!;
    _future = _load();
  }

  Future<List<AppClass>> _load() => context.app.marketplace.classes(
    search: _search.text,
    subject: _subject,
    format: _format,
    sortBy: _sortBy,
  );

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
      appBar: AppBar(title: Text(l.t('classes.title'))),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 2, 16, 8),
            child: SearchField(
              controller: _search,
              hint: l.t('classes.search'),
              onSubmitted: (_) => _refresh(),
            ),
          ),
          _FilterRail(
            selectedSubject: _subject,
            selectedFormat: _format,
            sortBy: _sortBy,
            onSubject: (value) => setState(() {
              _subject = value == _subject ? '' : value;
              _future = _load();
            }),
            onFormat: (value) => setState(() {
              _format = value == _format ? '' : value;
              _future = _load();
            }),
            onSort: () => setState(() {
              _sortBy = _sortBy == 'newest' ? 'popular' : 'newest';
              _future = _load();
            }),
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
            ),
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

class _FilterRail extends StatelessWidget {
  const _FilterRail({
    required this.selectedSubject,
    required this.selectedFormat,
    required this.sortBy,
    required this.onSubject,
    required this.onFormat,
    required this.onSort,
  });

  final String selectedSubject;
  final String selectedFormat;
  final String sortBy;
  final ValueChanged<String> onSubject;
  final ValueChanged<String> onFormat;
  final VoidCallback onSort;

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return SizedBox(
      height: 42,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          FilterChipButton(
            label: sortBy == 'popular'
                ? l.t('classes.popular')
                : l.t('classes.newest'),
            selected: sortBy == 'popular',
            onTap: onSort,
            icon: Icons.sort_rounded,
          ),
          const SizedBox(width: 8),
          ...formats.map(
            (format) => Padding(
              padding: const EdgeInsetsDirectional.only(end: 8),
              child: FilterChipButton(
                label: l.t('format.$format'),
                selected: selectedFormat == format,
                onTap: () => onFormat(format),
              ),
            ),
          ),
          ...subjects.map(
            (subject) => Padding(
              padding: const EdgeInsetsDirectional.only(end: 8),
              child: FilterChipButton(
                label: subject,
                selected: selectedSubject == subject,
                onTap: () => onSubject(subject),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
