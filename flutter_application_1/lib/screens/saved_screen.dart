import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../widgets/marketplace_widgets.dart';

class SavedScreen extends StatefulWidget {
  const SavedScreen({super.key});

  @override
  State<SavedScreen> createState() => _SavedScreenState();
}

class _SavedScreenState extends State<SavedScreen> {
  late Future<List<AppClass>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<AppClass>> _load() async {
    final app = context.app;
    final items = <AppClass>[];
    for (final id in app.savedClassIds) {
      try {
        items.add(await app.marketplace.classById(id));
      } catch (_) {
        // Saved IDs can outlive deleted classes; keep the screen resilient.
      }
    }
    return items;
  }

  void _refresh() => setState(() => _future = _load());

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return Scaffold(
      appBar: AppBar(title: Text(l.t('saved.title'))),
      body: FutureBuilder<List<AppClass>>(
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
              icon: Icons.favorite_border_rounded,
              title: l.t('saved.empty'),
              body: l.t('saved.emptyBody'),
              action: l.t('nav.classes'),
              onAction: () => context.go('/classes'),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => _refresh(),
            child: GridView.builder(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 0.76,
              ),
              itemCount: items.length,
              itemBuilder: (_, i) =>
                  AppClassCard(item: items[i], compact: true),
            ),
          );
        },
      ),
    );
  }
}
