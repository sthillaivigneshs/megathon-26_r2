import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/pickup_request.dart';
import '../models/local_collection.dart';
import '../models/user_session.dart';

class ApiService {
  String baseUrl;
  http.Client client;

  ApiService({
    this.baseUrl = 'http://localhost:8000/api/v1',
    http.Client? client,
  }) : client = client ?? http.Client();

  // Login collector with existing OAuth2 endpoint
  Future<UserSession> login(String email, String password) async {
    final uri = Uri.parse('$baseUrl/auth/login');
    final response = await client.post(
      uri,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        'username': email,
        'password': password,
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final token = data['access_token'] as String;

      // Extract role from token payload safely
      String role = 'COLLECTOR';
      try {
        final parts = token.split('.');
        if (parts.length == 3) {
          final normalized = base64Url.normalize(parts[1]);
          final payload = jsonDecode(utf8.decode(base64Url.decode(normalized)));
          role = payload['role'] ?? 'COLLECTOR';
        }
      } catch (_) {}

      return UserSession(token: token, email: email, role: role);
    } else {
      String errorMsg = 'Authentication failed (${response.statusCode})';
      try {
        final err = jsonDecode(response.body);
        if (err['detail'] != null) errorMsg = err['detail'];
      } catch (_) {}
      throw Exception(errorMsg);
    }
  }

  // Fetch assigned pickups for authenticated collector
  Future<List<PickupRequest>> getAssignedPickups(String token) async {
    final uri = Uri.parse('$baseUrl/pickups/collector/assigned');
    final response = await client.get(
      uri,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final list = jsonDecode(response.body) as List<dynamic>;
      return list.map((e) => PickupRequest.fromJson(e as Map<String, dynamic>)).toList();
    } else {
      throw Exception('Failed to fetch assigned pickups: ${response.statusCode}');
    }
  }

  // Synchronize a collection batch
  // Uses /collections/sync endpoint with CollectionSyncRequest contract
  Future<Map<String, dynamic>> syncCollection(LocalCollection collection, String token) async {
    final uri = Uri.parse('$baseUrl/collections/sync');
    final body = jsonEncode(collection.toServerPayload());

    final response = await client.post(
      uri,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: body,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } else {
      String errorMsg = 'Sync error (${response.statusCode})';
      try {
        final err = jsonDecode(response.body);
        if (err['detail'] != null) errorMsg = err['detail'].toString();
      } catch (_) {}
      throw Exception(errorMsg);
    }
  }
}
