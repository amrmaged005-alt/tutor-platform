import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'api_client.dart';
import 'models.dart';

const userKey = 'coursaty_mobile_user';

class AuthRepository {
  AuthRepository(this._api, this._storage);
  final ApiClient _api;
  final FlutterSecureStorage _storage;

  Future<AuthUser?> cachedUser() async {
    final raw = await _storage.read(key: userKey);
    if (raw == null) return null;
    return AuthUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  Future<bool> hasToken() async => (await _storage.read(key: tokenKey)) != null;

  Future<AuthUser> login(String email, String password) async {
    final data = await _api.postMap(
      '/api/auth/mobile-token',
      data: {'email': email.trim().toLowerCase(), 'password': password},
    );
    final token = data['token'] as String;
    final user = AuthUser.fromJson(data['user'] as Map<String, dynamic>);
    await _storage.write(key: tokenKey, value: token);
    await _storage.write(key: userKey, value: jsonEncode(user.toJson()));
    return user;
  }

  Future<void> signup({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    await _api.postMap(
      '/api/signup',
      data: {
        'fullName': name.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
        'role': role,
      },
    );
  }

  Future<AuthUser?> refreshMe() async {
    if (!await hasToken()) return null;
    final data = await _api.getMap('/api/mobile/me');
    final user = AuthUser.fromJson(data['user'] as Map<String, dynamic>);
    await _storage.write(key: userKey, value: jsonEncode(user.toJson()));
    return user;
  }

  Future<void> logout() async {
    await _storage.delete(key: tokenKey);
    await _storage.delete(key: userKey);
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
    return (data['classes'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .map(AppClass.fromJson)
        .toList();
  }

  Future<AppClass> classById(String id) async {
    final data = await _api.getMap('/api/mobile/classes/$id');
    return AppClass.fromJson(data['class'] as Map<String, dynamic>);
  }

  Future<List<TutorProfile>> tutors({
    String search = '',
    String subject = '',
  }) async {
    final data = await _api.getMap(
      '/api/mobile/tutors',
      query: {
        if (search.trim().isNotEmpty) 'search': search.trim(),
        if (subject.isNotEmpty) 'subject': subject,
      },
    );
    return (data['tutors'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .map(TutorProfile.fromJson)
        .toList();
  }

  Future<TutorProfile> tutor(String id) async {
    final data = await _api.getMap('/api/mobile/tutors/$id');
    return TutorProfile.fromJson(data['tutor'] as Map<String, dynamic>);
  }

  Future<List<BookingItem>> bookings() async {
    final data = await _api.getMap('/api/bookings');
    return (data['bookings'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .map(BookingItem.fromJson)
        .toList();
  }

  Future<BookingResult> bookClass({
    required String classId,
    required int sessionCount,
    required String paymentType,
    String note = '',
  }) async {
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
  }

  Future<List<ReviewItem>> classReviews(String classId) async {
    final data = await _api.getMap('/api/classes/$classId/reviews');
    return (data['reviews'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .map(ReviewItem.fromJson)
        .toList();
  }

  Future<List<ReviewItem>> tutorReviews(String tutorId) async {
    final data = await _api.getMap('/api/tutors/$tutorId/reviews');
    return (data['reviews'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .map(ReviewItem.fromJson)
        .toList();
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
}
