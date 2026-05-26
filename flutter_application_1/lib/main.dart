import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'app_state.dart';
import 'core/l10n.dart';
import 'core/notification_service.dart';
import 'core/supabase_config.dart';
import 'core/theme.dart';
import 'router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initSupabase();
  await NotificationService.instance.initialize();
  final state = AppState();
  await state.bootstrap();
  runApp(CoursatyApp(state: state));
}

class CoursatyApp extends StatelessWidget {
  const CoursatyApp({super.key, required this.state});
  final AppState state;

  @override
  Widget build(BuildContext context) {
    return AppScope(
      state: state,
      child: ChangeNotifierProvider<AppState>.value(
        value: state,
        child: AnimatedBuilder(
          animation: state,
          builder: (context, _) {
            return LocalizationsScope(
              lang: state.lang,
              child: Directionality(
                textDirection: state.lang.direction,
                child: MaterialApp.router(
                  title: 'Coursaty',
                  locale: state.lang.locale,
                  theme: AppTheme.light(),
                  darkTheme: AppTheme.dark(),
                  themeMode: state.themeMode,
                  routerConfig: createRouter(state),
                  debugShowCheckedModeBanner: false,
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
