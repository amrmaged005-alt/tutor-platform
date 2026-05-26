import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app_state.dart';
import '../core/l10n.dart';
import '../core/theme.dart';
import '../widgets/marketplace_widgets.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Timer(const Duration(milliseconds: 1500), () {
      if (!mounted) return;
      final app = context.app;
      context.go(app.onboardingDone || app.isSignedIn ? '/' : '/onboarding');
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = context.c;
    return Scaffold(
      backgroundColor: c.accent,
      body: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 18),
          decoration: BoxDecoration(
            color: c.onAccent.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(24),
          ),
          child: const BrandMark(),
        ),
      ),
    );
  }
}

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _index = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = context.l10n;
    final c = context.c;
    final slides = [
      (
        icon: Icons.person_search_rounded,
        title: l.t('onboarding.tutors'),
        body: l.t('onboarding.tutorsBody'),
      ),
      (
        icon: Icons.event_available_rounded,
        title: l.t('onboarding.book'),
        body: l.t('onboarding.bookBody'),
      ),
      (
        icon: Icons.auto_stories_rounded,
        title: l.t('onboarding.pace'),
        body: l.t('onboarding.paceBody'),
      ),
    ];
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: AlignmentDirectional.centerEnd,
              child: TextButton(
                onPressed: _finish,
                child: Text(l.t('onboarding.skip')),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (value) => setState(() => _index = value),
                itemCount: slides.length,
                itemBuilder: (_, i) => Padding(
                  padding: const EdgeInsets.all(28),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 132,
                        height: 132,
                        decoration: BoxDecoration(
                          color: c.accent.withValues(alpha: 0.12),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(slides[i].icon, color: c.accent, size: 58),
                      ),
                      const SizedBox(height: 28),
                      Text(
                        slides[i].title,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: c.text,
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        slides[i].body,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: c.secondary,
                          height: 1.5,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                slides.length,
                (i) => AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  width: i == _index ? 22 : 7,
                  height: 7,
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  decoration: BoxDecoration(
                    color: i == _index ? c.accent : c.border,
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(18),
              child: ElevatedButton(
                onPressed: _index == slides.length - 1
                    ? _finish
                    : () => _controller.nextPage(
                        duration: const Duration(milliseconds: 260),
                        curve: Curves.easeOutCubic,
                      ),
                child: Text(
                  _index == slides.length - 1
                      ? l.t('onboarding.start')
                      : l.t('onboarding.next'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _finish() async {
    await context.app.completeOnboarding();
    if (mounted) context.go('/');
  }
}
