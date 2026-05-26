import 'package:flutter/material.dart';

import '../../app_state.dart';
import '../../core/l10n.dart';
import '../../core/models.dart';
import '../../widgets/dashboard/class_form.dart';
import '../../widgets/dashboard/managed_class_card.dart';
import '../../widgets/marketplace_widgets.dart';

class TutorClassesScreen extends StatefulWidget {
  const TutorClassesScreen({super.key, this.isCenter = false});
  final bool isCenter;

  @override
  State<TutorClassesScreen> createState() => _TutorClassesScreenState();
}

class _TutorClassesScreenState extends State<TutorClassesScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  List<AppClass> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final role = widget.isCenter ? 'CENTER_ADMIN' : 'TUTOR';
    final items = await context.app.marketplace.managedClasses(role: role);
    if (!mounted) return;
    setState(() {
      _items = items;
      _loading = false;
    });
  }

  Future<void> _openForm([AppClass? item]) async {
    final marketplace = context.app.marketplace;
    final result = await showModalBottomSheet<AppClass>(
      context: context,
      isScrollControlled: true,
      builder: (_) =>
          ManagedClassForm(initial: item, isCenter: widget.isCenter),
    );
    if (result == null) return;
    await marketplace.saveManagedClass(result);
    await _load();
  }

  Future<void> _delete(AppClass item) async {
    final l = context.l10n;
    final marketplace = context.app.marketplace;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l.t('manage.deleteClass')),
        content: Text(l.t('manage.deleteWarning')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(l.t('common.cancel')),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(l.t('manage.deleteClass')),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    await marketplace.deleteManagedClass(item.id);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.isCenter ? l.t('nav.manage') : l.t('dashboard.myClasses'),
        ),
        bottom: TabBar(
          controller: _tabs,
          tabs: [
            Tab(text: l.t('manage.active')),
            Tab(text: l.t('manage.drafts')),
            Tab(text: l.t('manage.completed')),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openForm(),
        icon: const Icon(Icons.add_rounded),
        label: Text(l.t('manage.addClass')),
      ),
      body: _loading
          ? const LoadingList()
          : TabBarView(
              controller: _tabs,
              children: [
                _list(_items.where((item) => item.status == 'ACTIVE')),
                _list(_items.where((item) => item.status == 'DRAFT')),
                _list(_items.where((item) => item.status == 'COMPLETED')),
              ],
            ),
    );
  }

  Widget _list(Iterable<AppClass> items) {
    final list = items.toList();
    if (list.isEmpty) {
      return StateView(
        icon: Icons.school_outlined,
        title: context.l10n.t('classes.empty'),
        body: context.l10n.t('classes.filters'),
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemBuilder: (_, i) => ManagedClassCard(
          item: list[i],
          onEdit: () => _openForm(list[i]),
          onDelete: () => _delete(list[i]),
        ),
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemCount: list.length,
      ),
    );
  }
}
