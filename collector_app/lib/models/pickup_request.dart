class PickupRequest {
  final int id;
  final String prId;
  final int citizenId;
  final int? collectorId;
  final String status;
  final double latitude;
  final double longitude;
  final String? description;
  final String? createdAt;

  PickupRequest({
    required this.id,
    required this.prId,
    required this.citizenId,
    this.collectorId,
    required this.status,
    required this.latitude,
    required this.longitude,
    this.description,
    this.createdAt,
  });

  factory PickupRequest.fromJson(Map<String, dynamic> json) {
    return PickupRequest(
      id: (json['id'] as num).toInt(),
      prId: json['pr_id'] as String? ?? 'PR-${json['id']}',
      citizenId: (json['citizen_id'] as num).toInt(),
      collectorId: (json['collector_id'] as num?)?.toInt(),
      status: json['status'] as String? ?? 'REQUESTED',
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      description: json['description'] as String?,
      createdAt: json['created_at'] as String?,
    );
  }
}
