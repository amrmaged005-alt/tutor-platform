import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../core/theme.dart';
import 'filter_sheet.dart';
import '../widgets/home_sections.dart';
import '../widgets/marketplace_widgets.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _search = TextEditingController();
  late Future<
    ({List<AppClass> classes, List<AppClass> near, List<TutorProfile> tutors})
  >
  _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<
    ({List<AppClass> classes, List<AppClass> near, List<TutorProfile> tutors})
  >
  _load() async {
    final app = context.app;
    final repo = app.marketplace;
    final classes = await repo.classes(sortBy: 'popular');
    final near = await repo.classes(city: app.lastCity, sortBy: 'popular');
    final tutors = await repo.tutors();
    return (
      classes: classes.take(6).toList(),
      near: near.take(4).toList(),
      tutors: tutors.take(5).toList(),
    );
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;
    return Scaffold(
      appBar: AppBar(
        title: const BrandMark(compact: true),
        actions: [
          IconButton(
            onPressed: () => context.push('/notifications'),
            icon: const Icon(Icons.notifications_none_rounded),
            tooltip: l.t('notifications.title'),
          ),
          IconButton(
            onPressed: () => context.app.setLang(
              context.app.lang == AppLang.en ? AppLang.ar : AppLang.en,
            ),
            icon: const Icon(Icons.language_rounded),
            tooltip: l.t('account.language'),
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => setState(() => _future = _load()),
        child:
            FutureBuilder<
              ({
                List<AppClass> classes,
                List<AppClass> near,
                List<TutorProfile> tutors,
              })
            >(
              future: _future,
              builder: (context, snapshot) {
                final loading =
                    snapshot.connectionState != ConnectionState.done;
                final data = snapshot.data;
                return ListView(
                  padding: EdgeInsets.zero,
                  children: [
                    Container(
                      margin: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: c.card,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: c.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l.t('home.kicker'),
                            style: TextStyle(
                              color: c.accent,
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            l.t('home.title'),
                            style: TextStyle(
                              color: c.text,
                              fontSize: 28,
                              height: 1.05,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -0.9,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            l.t('home.subtitle'),
                            style: TextStyle(
                              color: c.secondary,
                              fontSize: 14,
                              height: 1.45,
                            ),
                          ),
                          const SizedBox(height: 14),
                          SearchField(
                            controller: _search,
                            hint: l.t('home.searchHint'),
                            onSubmitted: (value) => context.push(
                              '/classes?search=${Uri.encodeComponent(value)}',
                            ),
                          ),
                        ],
                      ),
                    ),
                    SectionHeader(title: l.t('home.subjects')),
                    const SubjectIconGrid(),
                    SectionHeader(title: l.t('home.trending')),
                    const TrendingBanners(),
                    if (!loading && data != null && data.near.isNotEmpty) ...[
                      NearYouHeader(
                        city: context.app.lastCity,
                        onChange: _chooseCity,
                      ),
                      SizedBox(
                        height: 206,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemBuilder: (_, i) => SizedBox(
                            width: 220,
                            child: AppClassCard(
                              item: data.near[i],
                              compact: true,
                            ),
                          ),
                          separatorBuilder: (_, _) => const SizedBox(width: 10),
                          itemCount: data.near.length,
                        ),
                      ),
                    ],
                    SectionHeader(
                      title: l.t('home.featuredClasses'),
                      action: l.t('home.viewAll'),
                      onAction: () => context.go('/classes'),
                    ),
                    if (loading)
                      const SizedBox(height: 260, child: LoadingList())
                    else if (snapshot.hasError)
                      StateView(
                        icon: Icons.wifi_off_rounded,
                        title: l.t('state.error'),
                        body: l.t('state.offline'),
                        action: l.t('common.retry'),
                        onAction: () => setState(() => _future = _load()),
                      )
                    else
                      SizedBox(
                        height: 206,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemBuilder: (_, i) => SizedBox(
                            width: 220,
                            child: AppClassCard(
                              item: data!.classes[i],
                              compact: true,
                            ),
                          ),
                          separatorBuilder: (_, _) => const SizedBox(width: 10),
                          itemCount: data?.classes.length ?? 0,
                        ),
                      ),
                    SectionHeader(
                      title: l.t('home.featuredTutors'),
                      action: l.t('home.viewAll'),
                      onAction: () => context.go('/tutors'),
                    ),
                    if (!loading && data != null)
                      ...data.tutors.map(
                        (tutor) => Padding(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                          child: TutorCard(tutor: tutor),
                        ),
                      ),
                    const SizedBox(height: 20),
                  ],
                );
              },
            ),
      ),
    );
  }

  Future<void> _chooseCity() async {
    final app = context.app;
    final current = app.lastCity;
    final next = await showModalBottomSheet<String>(
      context: context,
      showDragHandle: true,
      builder: (context) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          padding: const EdgeInsets.all(16),
          children: egyptCities
              .map(
                (city) => ListTile(
                  title: Text(city),
                  trailing: current == city ? const Icon(Icons.check) : null,
                  onTap: () => Navigator.pop(context, city),
                ),
              )
              .toList(),
        ),
      ),
    );
    if (next != null) {
      await app.setLastCity(next);
      if (mounted) setState(() => _future = _load());
    }
  }
}
