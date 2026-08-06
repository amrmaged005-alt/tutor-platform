import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/mock_data.dart';
import 'api_client.dart';
import 'models.dart';

const userKey = 'coursaty_mobile_user';
const _localUsersKey = 'coursaty_local_users';
const _localBookingsKey = 'coursaty_local_bookings';
const _localEnrollmentsKey = 'coursaty_local_enrollments';
const _managedClassesKey = 'coursaty_managed_classes';

class AuthService {
  AuthService(this._api, this._storage);
  final ApiClient _api;
  final FlutterSecureStorage _storage;

  Future<AuthUser?> cachedUser() async {
    final raw = await _storage.read(key: userKey);
    if (raw == null) return null;
    return AuthUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  Future<bool> hasToken() async => (await _storage.read(key: tokenKey)) != null;

  Future<AuthUser> login(String email, String password) async {
    final normalized = email.trim().toLowerCase();
    try {
      final data = await _api.postMap(
        '/api/auth/mobile-token',
        data: {'email': normalized, 'password': password},
      );
      final token = data['token'] as String;
      final user = AuthUser.fromJson(data['user'] as Map<String, dynamic>);
      await _persist(user, token);
      return user;
    } catch (_) {
      final users = await _localUsers();
      final saved = users[normalized] as Map<String, dynamic>?;
      if (saved == null || saved['password'] != password) {
        throw const ApiException('Invalid email or password.');
      }
      final user = AuthUser.fromJson(saved['user'] as Map<String, dynamic>);
      await _persist(user, 'local:${user.id}');
      return user;
    }
  }

  Future<AuthUser> signup({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    final normalized = email.trim().toLowerCase();
    try {
      await _api.postMap(
        '/api/signup',
        data: {
          'fullName': name.trim(),
          'email': normalized,
          'password': password,
          'role': role,
        },
      );
      return login(normalized, password);
    } catch (_) {
      final user = AuthUser(
        id: 'local-${DateTime.now().millisecondsSinceEpoch}',
        email: normalized,
        name: name.trim(),
        role: role,
      );
      final users = await _localUsers();
      users[normalized] = {'password': password, 'user': user.toJson()};
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_localUsersKey, jsonEncode(users));
      await _persist(user, 'local:${user.id}');
      return user;
    }
  }

  Future<AuthUser?> refreshMe() async {
    final token = await _storage.read(key: tokenKey);
    if (token == null) return null;
    if (token.startsWith('local:')) return cachedUser();
    final data = await _api.getMap('/api/mobile/me');
    final user = AuthUser.fromJson(data['user'] as Map<String, dynamic>);
    await _storage.write(key: userKey, value: jsonEncode(user.toJson()));
    return user;
  }

  Future<void> logout() async {
    await _storage.delete(key: tokenKey);
    await _storage.delete(key: userKey);
  }

  Future<void> _persist(AuthUser user, String token) async {
    await _storage.write(key: tokenKey, value: token);
    await _storage.write(key: userKey, value: jsonEncode(user.toJson()));
  }

  Future<Map<String, dynamic>> _localUsers() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_localUsersKey);
    if (raw == null) return <String, dynamic>{};
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  Future<void> registerPushToken({
    required String token,
    required String platform,
    String? appVersion,
    String? deviceId,
  }) async {
    await _api.postMap(
      '/api/mobile/push-token',
      data: {
        'token': token,
        'platform': platform,
        'appVersion': ?appVersion,
        'deviceId': ?deviceId,
      },
    );
  }
}

class MarketplaceRepository {
  MarketplaceRepository(this._api);
  final ApiClient _api;
  final Map<String, List<AppClass>> _classCache = {};

  Future<List<AppClass>> classes({
    String search = '',
    String subject = '',
    String curriculum = '',
    String format = '',
    String city = '',
    double maxPrice = 500,
    String sortBy = 'newest',
  }) async {
    final key = _classKey(
      search: search,
      subject: subject,
      curriculum: curriculum,
      format: format,
      city: city,
      maxPrice: maxPrice,
      sortBy: sortBy,
    );
    final cached = _classCache[key];
    if (cached != null) return cached;
    try {
      final data = await _api.getMap(
        '/api/classes/search',
        query: {
          if (search.trim().isNotEmpty) 'search': search.trim(),
          if (subject.isNotEmpty) 'subject': subject,
          if (curriculum.isNotEmpty) 'curriculum': curriculum,
          if (format.isNotEmpty) 'format': format,
          if (city.isNotEmpty) 'location': city,
          if (maxPrice < 500) 'maxPrice': maxPrice.round(),
          'sortBy': sortBy,
        },
      );
      final rawItems = data['items'];
      if (rawItems is! List<dynamic>) {
        throw const FormatException(
          'Expected the classes search response to contain an items list.',
        );
      }
      final items = rawItems.map((item) {
        if (item is! Map<String, dynamic>) {
          throw const FormatException(
            'Expected every classes search item to be an object.',
          );
        }
        return AppClass.fromJson(item);
      }).toList();
      final merged = await _withLocalClasses(items);
      final available = await _applyEnrollments(merged);
      _classCache[key] = available;
      return available;
    } on ApiException {
      await Future<void>.delayed(const Duration(milliseconds: 380));
      final fallback = MockData.filteredClasses(
        search: search,
        subject: subject,
        format: format,
        city: city,
        maxPrice: maxPrice,
        sortBy: sortBy,
      );
      final merged = await _withLocalClasses(fallback);
      final available = await _applyEnrollments(merged);
      _classCache[key] = available;
      return available;
    }
  }

  Future<List<AppClass>> classPage({
    String search = '',
    String subject = '',
    String curriculum = '',
    String format = '',
    String city = '',
    double maxPrice = 500,
    String sortBy = 'newest',
    int offset = 0,
    int limit = 10,
  }) async {
    final all = await classes(
      search: search,
      subject: subject,
      curriculum: curriculum,
      format: format,
      city: city,
      maxPrice: maxPrice,
      sortBy: sortBy,
    );
    if (offset >= all.length) return [];
    final end = offset + limit > all.length ? all.length : offset + limit;
    return all.sublist(offset, end);
  }

  Future<AppClass> classById(String id) async {
    try {
      final data = await _api.getMap('/api/mobile/classes/$id');
      return (await _applyEnrollments([
        AppClass.fromJson(data['class'] as Map<String, dynamic>),
      ])).first;
    } catch (_) {
      final managed = await _managedClasses();
      final matches = managed.where((item) => item.id == id).toList();
      return (await _applyEnrollments([
        matches.isEmpty ? MockData.classById(id) : matches.first,
      ])).first;
    }
  }

  Future<List<TutorProfile>> tutors({
    String search = '',
    String subject = '',
  }) async {
    try {
      final data = await _api.getMap(
        '/api/mobile/tutors',
        query: {
          if (search.trim().isNotEmpty) 'search': search.trim(),
          if (subject.isNotEmpty) 'subject': subject,
        },
      );
      final items = (data['tutors'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(TutorProfile.fromJson)
          .toList();
      if (items.isNotEmpty) return items;
    } catch (_) {}
    return MockData.filteredTutors(search: search, subject: subject);
  }

  Future<TutorProfile> tutor(String id) async {
    try {
      final data = await _api.getMap('/api/mobile/tutors/$id');
      return TutorProfile.fromJson(data['tutor'] as Map<String, dynamic>);
    } catch (_) {
      return MockData.tutorById(id);
    }
  }

  Future<List<BookingItem>> bookings() async {
    try {
      final data = await _api.getMap('/api/bookings');
      final items = (data['bookings'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(BookingItem.fromJson)
          .toList();
      if (items.isNotEmpty) return items;
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_localBookingsKey) ?? [];
    final local = raw
        .map(
          (item) =>
              BookingItem.fromJson(jsonDecode(item) as Map<String, dynamic>),
        )
        .toList();
    if (local.isNotEmpty) return local;
    final sample = MockData.classes.take(6).toList();
    return List<BookingItem>.generate(sample.length, (index) {
      final cls = sample[index];
      final done = index > 2;
      return BookingItem(
        id: 'mock-booking-${index + 1}',
        status: done ? 'COMPLETED' : 'CONFIRMED',
        paymentStatus: index % 3 == 0 ? 'PENDING' : 'PAID',
        createdAt: DateTime.now().subtract(Duration(days: index * 3)),
        classItem: cls,
        amountEgp: cls.priceEgp,
        studentName: ['Ahmed Ali', 'Mona Adel', 'Laila Samir'][index % 3],
        studentPhone: '010${(10000000 + index * 44123)}',
        attendance: {
          '2026-06-01': index % 2 == 0,
          '2026-06-08': index % 3 != 0,
        },
      );
    });
  }

  Future<BookingResult> bookClass({
    required String classId,
    required int sessionCount,
    required String paymentType,
    String note = '',
  }) async {
    final currentClass = await classById(classId);
    if (currentClass.isFull) {
      throw const ApiException('This class is full.');
    }
    try {
      final data = await _api.postMap(
        '/api/bookings',
        data: {
          'classId': classId,
          'sessionCount': sessionCount,
          'paymentType': paymentType,
          if (note.trim().isNotEmpty) 'note': note.trim(),
        },
      );
      await _incrementEnrollment(classId);
      return BookingResult.fromJson(data);
    } catch (_) {
      final cls = currentClass;
      await _incrementEnrollment(classId);
      final booking = BookingItem(
        id: 'local-booking-${DateTime.now().millisecondsSinceEpoch}',
        status: 'CONFIRMED',
        paymentStatus: paymentType == 'ONLINE' ? 'UNPAID' : 'PAID',
        createdAt: DateTime.now(),
        classItem: cls,
        amountEgp: cls.priceEgp * sessionCount,
      );
      final prefs = await SharedPreferences.getInstance();
      final current = prefs.getStringList(_localBookingsKey) ?? [];
      current.insert(
        0,
        jsonEncode({
          'id': booking.id,
          'status': booking.status,
          'paymentStatus': booking.paymentStatus,
          'createdAt': booking.createdAt.toIso8601String(),
          'amountEgp': booking.amountEgp,
          'class': cls.toJson(),
          'attendance': booking.attendance,
        }),
      );
      await prefs.setStringList(_localBookingsKey, current);
      return BookingResult(
        bookingId: booking.id,
        message: 'Booking confirmed in preview mode.',
      );
    }
  }

  Future<List<ReviewItem>> classReviews(String classId) async {
    try {
      final data = await _api.getMap('/api/classes/$classId/reviews');
      final items = (data['reviews'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(ReviewItem.fromJson)
          .toList();
      if (items.isNotEmpty) return items;
    } catch (_) {}
    return MockData.reviews;
  }

  Future<List<ReviewItem>> tutorReviews(String tutorId) async {
    try {
      final data = await _api.getMap('/api/tutors/$tutorId/reviews');
      final items = (data['reviews'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(ReviewItem.fromJson)
          .toList();
      if (items.isNotEmpty) return items;
    } catch (_) {}
    return MockData.reviews;
  }

  Future<void> leaveClassReview({
    required String classId,
    required int rating,
    required String comment,
  }) async {
    await _api.postMap(
      '/api/classes/$classId/reviews',
      data: {'rating': rating, 'comment': comment.trim()},
    );
  }

  List<EducationCenter> centers({String search = ''}) {
    final q = search.trim().toLowerCase();
    if (q.isEmpty) return MockData.centers;
    return MockData.centers
        .where(
          (center) =>
              center.name.toLowerCase().contains(q) ||
              center.city.toLowerCase().contains(q) ||
              center.subjects.join(' ').toLowerCase().contains(q),
        )
        .toList();
  }

  EducationCenter center(String id) => MockData.centers.firstWhere(
    (item) => item.id == id,
    orElse: () => MockData.centers.first,
  );

  Future<List<AppClass>> managedClasses({required String role}) async {
    final local = await _managedClasses();
    if (local.isNotEmpty) return local;
    final isCenter = role == 'CENTER_ADMIN' || role == 'CENTER';
    return MockData.classes
        .where(
          (item) => isCenter
              ? item.city == 'Cairo'
              : item.tutors.any((tutor) => tutor.id == 'tutor-amina') ||
                    item.providerName.contains('Amina'),
        )
        .take(8)
        .toList();
  }

  Future<void> saveManagedClass(AppClass item) async {
    final items = await _managedClasses();
    final index = items.indexWhere((entry) => entry.id == item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.insert(0, item);
    }
    await _saveManagedClasses(items);
    _classCache.clear();
  }

  Future<void> deleteManagedClass(String id) async {
    final items = await _managedClasses();
    items.removeWhere((item) => item.id == id);
    await _saveManagedClasses(items);
    _classCache.clear();
  }

  String _classKey({
    required String search,
    required String subject,
    required String curriculum,
    required String format,
    required String city,
    required double maxPrice,
    required String sortBy,
  }) => [
    search.trim().toLowerCase(),
    subject,
    curriculum,
    format,
    city,
    maxPrice.round(),
    sortBy,
  ].join('|');

  Future<List<AppClass>> _withLocalClasses(List<AppClass> base) async {
    final managed = await _managedClasses();
    if (managed.isEmpty) return base;
    final byId = {for (final item in base) item.id: item};
    for (final item in managed) {
      if (item.status != 'DRAFT') byId[item.id] = item;
    }
    return byId.values.toList();
  }

  Future<List<AppClass>> _managedClasses() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_managedClassesKey) ?? [];
    return raw
        .map(
          (item) => AppClass.fromJson(jsonDecode(item) as Map<String, dynamic>),
        )
        .toList();
  }

  Future<void> _saveManagedClasses(List<AppClass> items) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(
      _managedClassesKey,
      items.map((item) => jsonEncode(item.toJson())).toList(),
    );
  }

  Future<List<AppClass>> _applyEnrollments(List<AppClass> items) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_localEnrollmentsKey);
    final deltas = raw == null
        ? <String, dynamic>{}
        : jsonDecode(raw) as Map<String, dynamic>;
    return items.map((item) {
      final delta = (deltas[item.id] as num?)?.toInt() ?? 0;
      if (delta == 0) return item;
      final taken = item.seatsTaken + delta;
      return item.copyWith(
        bookingsCount: taken,
        enrolledSeats: taken,
        spotsLeft: item.seatLimit - taken,
      );
    }).toList();
  }

  Future<void> _incrementEnrollment(String classId) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_localEnrollmentsKey);
    final deltas = raw == null
        ? <String, dynamic>{}
        : jsonDecode(raw) as Map<String, dynamic>;
    deltas[classId] = ((deltas[classId] as num?)?.toInt() ?? 0) + 1;
    await prefs.setString(_localEnrollmentsKey, jsonEncode(deltas));
    _classCache.clear();
  }
}

class TutorService {
  TutorService(this.marketplace);
  final MarketplaceRepository marketplace;
  Future<List<TutorProfile>> search({
    String search = '',
    String subject = '',
  }) => marketplace.tutors(search: search, subject: subject);
}

class ClassService {
  ClassService(this.marketplace);
  final MarketplaceRepository marketplace;
  Future<List<AppClass>> search({String search = '', String subject = ''}) =>
      marketplace.classes(search: search, subject: subject);
}

class CenterService {
  CenterService(this.marketplace);
  final MarketplaceRepository marketplace;
  List<EducationCenter> search({String search = ''}) =>
      marketplace.centers(search: search);
}

class BookingService {
  BookingService(this.marketplace);
  final MarketplaceRepository marketplace;
  Future<List<BookingItem>> list() => marketplace.bookings();
}
