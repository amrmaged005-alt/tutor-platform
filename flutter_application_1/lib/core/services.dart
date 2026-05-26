import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/mock_data.dart';
import 'api_client.dart';
import 'models.dart';

const userKey = 'coursaty_mobile_user';
const _localUsersKey = 'coursaty_local_users';
const _localBookingsKey = 'coursaty_local_bookings';

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

  Future<List<AppClass>> classes({
    String search = '',
    String subject = '',
    String curriculum = '',
    String format = '',
    String city = '',
    double maxPrice = 500,
    String sortBy = 'newest',
  }) async {
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
      final items = (data['classes'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(AppClass.fromJson)
          .toList();
      if (items.isNotEmpty) return items;
    } catch (_) {}
    return MockData.filteredClasses(
      search: search,
      subject: subject,
      format: format,
      city: city,
      maxPrice: maxPrice,
      sortBy: sortBy,
    );
  }

  Future<AppClass> classById(String id) async {
    try {
      final data = await _api.getMap('/api/mobile/classes/$id');
      return AppClass.fromJson(data['class'] as Map<String, dynamic>);
    } catch (_) {
      return MockData.classById(id);
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
    return raw
        .map(
          (item) =>
              BookingItem.fromJson(jsonDecode(item) as Map<String, dynamic>),
        )
        .toList();
  }

  Future<BookingResult> bookClass({
    required String classId,
    required int sessionCount,
    required String paymentType,
    String note = '',
  }) async {
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
      return BookingResult.fromJson(data);
    } catch (_) {
      final cls = MockData.classById(classId);
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
          'class': {
            'id': cls.id,
            'title': cls.title,
            'subject': cls.subject,
            'city': cls.city,
            'priceEgp': cls.priceEgp,
            'bookingsCount': cls.bookingsCount,
            'format': cls.format,
            'curriculum': cls.curriculum,
            'language': cls.language,
            'providerName': cls.providerName,
          },
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
