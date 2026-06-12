import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'app_state.dart';
import 'core/models.dart';
import 'screens/auth_screen.dart';
import 'screens/booking_sheet.dart';
import 'screens/browse_screen.dart';
import 'screens/center/center_dashboard_screen.dart';
import 'screens/center/center_manage_screen.dart';
import 'screens/center/center_tutors_screen.dart';
import 'screens/center_profile_screen.dart';
import 'screens/class_detail_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/home_screen.dart';
import 'screens/listing_screens.dart';
import 'screens/notifications_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/saved_screen.dart';
import 'screens/shell_screen.dart';
import 'screens/messages_screen.dart';
import 'screens/splash_screen.dart';
import 'screens/tutor/tutor_classes_screen.dart';
import 'screens/tutor/tutor_dashboard_screen.dart';
import 'screens/tutor_detail_screen.dart';

GoRouter createRouter(AppState state) {
  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: state,
    redirect: (context, routeState) {
      final location = routeState.matchedLocation;
      final needsAuth =
          location == '/dashboard' ||
          location == '/profile' ||
          location.startsWith('/tutor') ||
          location.startsWith('/center/') ||
          location.startsWith('/book/');
      if (needsAuth && !state.isSignedIn) return '/login';
      if ((location == '/login' || location == '/signup') && state.isSignedIn) {
        return '/dashboard';
      }
      return null;
    },
    routes: [
      ShellRoute(
        builder: (context, state, child) => ShellScreen(child: child),
        routes: [
          GoRoute(
            path: '/',
            pageBuilder: _fade((context, state) => const HomeScreen()),
          ),
          GoRoute(
            path: '/browse',
            pageBuilder: _fade((context, state) => const BrowseScreen()),
          ),
          GoRoute(
            path: '/classes',
            pageBuilder: _fade(
              (context, state) => ClassesScreen(
                initialSearch: state.uri.queryParameters['search'],
              ),
            ),
          ),
          GoRoute(
            path: '/tutors',
            pageBuilder: _fade((context, state) => const TutorsScreen()),
          ),
          GoRoute(
            path: '/saved',
            pageBuilder: _fade((context, state) => const SavedScreen()),
          ),
          GoRoute(
            path: '/dashboard',
            pageBuilder: _fade((context, state) => const DashboardScreen()),
          ),
          GoRoute(
            path: '/profile',
            pageBuilder: _fade((context, state) => const ProfileScreen()),
          ),
          GoRoute(
            path: '/tutor/classes',
            pageBuilder: _fade((context, state) => const TutorClassesScreen()),
          ),
          GoRoute(
            path: '/tutor/dashboard',
            pageBuilder: _fade(
              (context, state) => const TutorDashboardScreen(),
            ),
          ),
          GoRoute(
            path: '/center/manage',
            pageBuilder: _fade((context, state) => const CenterManageScreen()),
          ),
          GoRoute(
            path: '/center/dashboard',
            pageBuilder: _fade(
              (context, state) => const CenterDashboardScreen(),
            ),
          ),
          GoRoute(
            path: '/center/tutors',
            pageBuilder: _fade((context, state) => const CenterTutorsScreen()),
          ),
          GoRoute(
            path: '/messages',
            pageBuilder: _fade((context, state) => const MessagesScreen()),
          ),
        ],
      ),
      GoRoute(
        path: '/splash',
        pageBuilder: _fade((context, state) => const SplashScreen()),
      ),
      GoRoute(
        path: '/onboarding',
        pageBuilder: _fade((context, state) => const OnboardingScreen()),
      ),
      GoRoute(
        path: '/notifications',
        pageBuilder: _fade((context, state) => const NotificationsScreen()),
      ),
      GoRoute(
        path: '/booking-confirmed',
        pageBuilder: (context, state) {
          final extra = state.extra;
          if (extra is ({BookingResult booking, AppClass item})) {
            return MaterialPage(
              child: BookingConfirmationScreen(
                result: extra.booking,
                item: extra.item,
              ),
            );
          }
          return MaterialPage(child: const HomeScreen());
        },
      ),
      GoRoute(
        path: '/login',
        pageBuilder: _fade(
          (context, state) => const AuthScreen(mode: AuthMode.login),
        ),
      ),
      GoRoute(
        path: '/signup',
        pageBuilder: _fade(
          (context, state) => const AuthScreen(mode: AuthMode.signup),
        ),
      ),
      GoRoute(
        path: '/centers/:id',
        pageBuilder: (context, state) {
          final item = state.extra is EducationCenter
              ? state.extra as EducationCenter
              : null;
          return MaterialPage(
            child: CenterProfileScreen(
              centerId: state.pathParameters['id']!,
              initial: item,
            ),
          );
        },
      ),
      GoRoute(
        path: '/classes/:id',
        pageBuilder: (context, state) {
          final item = state.extra is AppClass ? state.extra as AppClass : null;
          return MaterialPage(
            child: ClassDetailScreen(
              classId: state.pathParameters['id']!,
              initial: item,
            ),
          );
        },
      ),
      GoRoute(
        path: '/tutors/:id',
        pageBuilder: (context, state) {
          final item = state.extra is TutorProfile
              ? state.extra as TutorProfile
              : null;
          return MaterialPage(
            child: TutorDetailScreen(
              tutorId: state.pathParameters['id']!,
              initial: item,
            ),
          );
        },
      ),
    ],
  );
}

CustomTransitionPage<void> Function(BuildContext, GoRouterState) _fade(
  Widget Function(BuildContext, GoRouterState) builder,
) {
  return (context, state) => CustomTransitionPage<void>(
    child: builder(context, state),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(
        opacity: CurvedAnimation(parent: animation, curve: Curves.easeOutCubic),
        child: child,
      );
    },
  );
}
