import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'core/api_client.dart';
import 'core/l10n.dart';
import 'core/models.dart';
import 'core/services.dart';

const _langKey = 'coursaty_lang';
const _themeKey = 'coursaty_theme';

class AppState extends ChangeNotifier {
  AppState()
    : storage = const FlutterSecureStorage(
        aOptions: AndroidOptions(encryptedSharedPreferences: true),
      ) {
    api = ApiClient(storage);
    auth = AuthRepository(api, storage);
    marketplace = MarketplaceRepository(api);
  }

  final FlutterSecureStorage storage;
  late final ApiClient api;
  late final AuthRepository auth;
  late final MarketplaceRepository marketplace;

  AppLang lang = AppLang.en;
  ThemeMode themeMode = ThemeMode.system;
  AuthUser? user;
  bool bootstrapping = true;

  bool get isSignedIn => user != null;
  bool get isDark => themeMode == ThemeMode.dark;

  Future<void> bootstrap() async {
    final rawLang = await storage.read(key: _langKey);
    lang = rawLang == 'ar' ? AppLang.ar : AppLang.en;

    final rawTheme = await storage.read(key: _themeKey);
    themeMode = rawTheme == 'dark'
        ? ThemeMode.dark
        : rawTheme == 'light'
        ? ThemeMode.light
        : ThemeMode.system;

    user = await auth.cachedUser();
    try {
      user = await auth.refreshMe() ?? user;
    } catch (_) {
      await auth.logout();
      user = null;
    }

    bootstrapping = false;
    notifyListeners();
  }

  Future<void> setLang(AppLang next) async {
    lang = next;
    await storage.write(key: _langKey, value: next.code);
    notifyListeners();
  }

  Future<void> setDark(bool enabled) async {
    themeMode = enabled ? ThemeMode.dark : ThemeMode.light;
    await storage.write(key: _themeKey, value: enabled ? 'dark' : 'light');
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    user = await auth.login(email, password);
    notifyListeners();
  }

  Future<void> signup({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    await auth.signup(name: name, email: email, password: password, role: role);
    user = await auth.login(email, password);
    notifyListeners();
  }

  Future<void> logout() async {
    await auth.logout();
    user = null;
    notifyListeners();
  }
}

class AppScope extends InheritedNotifier<AppState> {
  const AppScope({super.key, required AppState state, required super.child})
    : super(notifier: state);

  static AppState of(BuildContext context) {
    final scope =
        context.getElementForInheritedWidgetOfExactType<AppScope>()?.widget
            as AppScope?;
    assert(scope != null, 'AppScope not found');
    return scope!.notifier!;
  }
}

extension AppStateX on BuildContext {
  AppState get app => AppScope.of(this);
}
