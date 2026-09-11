class UserSession {
  final String token;
  final String email;
  final String role;
  final int? userId;

  UserSession({
    required this.token,
    required this.email,
    required this.role,
    this.userId,
  });

  bool get isCollector => role.toUpperCase() == 'COLLECTOR';
}
