import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/api_client.dart';
import 'core/l10n.dart';
import 'core/models.dart';
import 'core/services.dart';

const _langKey = 'coursaty_lang';
const _themeKey = 'coursaty_theme';
const _onboardingKey = 'coursaty_onboarding_done';
const _savedClassesKey = 'coursaty_saved_classes';
const _lastCityKey = 'coursaty_last_city';

class AppState extends ChangeNotifier {
  AppState()
    : storage = const FlutterSecureStorage(
        aOptions: AndroidOptions(encryptedSharedPreferences: true),
      ) {
    api = ApiClient(storage);
    auth = AuthService(api, storage);
    marketplace = MarketplaceRepository(api);
    tutors = TutorService(marketplace);
    classes = ClassService(marketplace);
    centers = CenterService(marketplace);
    bookings = BookingService(marketplace);
  }

  final FlutterSecureStorage storage;
  late final ApiClient api;
  late final AuthService auth;
  late final MarketplaceRepository marketplace;
  late final TutorService tutors;
  late final ClassService classes;
  late final CenterService centers;
  late final BookingService bookings;

  AppLang lang = AppLang.en;
  ThemeMode themeMode = ThemeMode.system;
  AuthUser? user;
  bool bootstrapping = true;
  bool onboardingDone = false;
  String lastCity = 'Cairo';
  Set<String> savedClassIds = <String>{};

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

    final prefs = await SharedPreferences.getInstance();
    onboardingDone = prefs.getBool(_onboardingKey) ?? false;
    lastCity = prefs.getString(_lastCityKey) ?? 'Cairo';
    savedClassIds =
        prefs.getStringList(_savedClassesKey)?.toSet() ?? <String>{};

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

  Future<void> completeOnboarding() async {
    onboardingDone = true;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_onboardingKey, true);
    notifyListeners();
  }

  Future<void> setLastCity(String city) async {
    lastCity = city;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_lastCityKey, city);
    notifyListeners();
  }

  bool isSaved(String classId) => savedClassIds.contains(classId);

  Future<void> toggleSaved(String classId) async {
    final next = Set<String>.from(savedClassIds);
    if (!next.add(classId)) next.remove(classId);
    savedClassIds = next;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_savedClassesKey, savedClassIds.toList());
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
    user = await auth.signup(
      name: name,
      email: email,
      password: password,
      role: role,
    );
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

  static AppState watch(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppScope>();
    assert(scope != null, 'AppScope not found');
    return scope!.notifier!;
  }
}

extension AppStateX on BuildContext {
  AppState get app => AppScope.of(this);
  AppState get appWatch => AppScope.watch(this);
}
