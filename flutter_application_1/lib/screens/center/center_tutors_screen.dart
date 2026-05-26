import 'package:flutter/material.dart';

import '../../app_state.dart';
import '../../core/l10n.dart';
import '../../core/models.dart';
import '../../widgets/marketplace_widgets.dart';

class CenterTutorsScreen extends StatefulWidget {
  const CenterTutorsScreen({super.key});

  @override
  State<CenterTutorsScreen> createState() => _CenterTutorsScreenState();
}

class _CenterTutorsScreenState extends State<CenterTutorsScreen> {
  late Future<List<TutorProfile>> _future;

  @override
  void initState() {
    super.initState();
    _future = context.app.marketplace.tutors();
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return Scaffold(
      appBar: AppBar(
        title: Text(l.t('tutors.title')),
        actions: [
          IconButton(
            onPressed: _inviteTutor,
            icon: const Icon(Icons.person_add_alt_1_rounded),
            tooltip: l.t('manage.assignTutor'),
          ),
        ],
      ),
      body: FutureBuilder<List<TutorProfile>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const LoadingList();
          final items = snapshot.data!.take(12).toList();
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemBuilder: (_, i) => Dismissible(
              key: ValueKey(items[i].id),
              background: Container(color: Theme.of(context).colorScheme.error),
              child: TutorCard(tutor: items[i]),
            ),
            separatorBuilder: (_, _) => const SizedBox(height: 10),
            itemCount: items.length,
          );
        },
      ),
    );
  }

  void _inviteTutor() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(context.l10n.t('common.comingSoon'))),
    );
  }
}
