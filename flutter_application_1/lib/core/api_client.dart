import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'constants.dart';

const tokenKey = 'coursaty_mobile_token';

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});
  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient(this._storage)
    : dio = Dio(
        BaseOptions(
          baseUrl: apiBaseUrl,
          connectTimeout: const Duration(seconds: 12),
          receiveTimeout: const Duration(seconds: 30),
          headers: {'Content-Type': 'application/json'},
        ),
      ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: tokenKey);
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) {
          handler.reject(error);
        },
      ),
    );
  }

  final FlutterSecureStorage _storage;
  final Dio dio;

  Future<Map<String, dynamic>> getMap(
    String path, {
    Map<String, dynamic>? query,
  }) async {
    try {
      final res = await dio.get<Map<String, dynamic>>(
        path,
        queryParameters: query,
      );
      return res.data ?? <String, dynamic>{};
    } on DioException catch (error) {
      throw _normalize(error);
    }
  }

  Future<Map<String, dynamic>> postMap(
    String path, {
    Map<String, dynamic>? data,
  }) async {
    try {
      final res = await dio.post<Map<String, dynamic>>(path, data: data);
      return res.data ?? <String, dynamic>{};
    } on DioException catch (error) {
      throw _normalize(error);
    }
  }

  ApiException _normalize(DioException error) {
    final raw = error.response?.data;
    if (raw is Map && raw['error'] is String) {
      return ApiException(
        raw['error'] as String,
        statusCode: error.response?.statusCode,
      );
    }
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError) {
      return const ApiException('Connection failed. Please try again.');
    }
    return ApiException(
      'Request failed. Please try again.',
      statusCode: error.response?.statusCode,
    );
  }
}
