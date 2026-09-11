import 'dart:convert';
import 'collection_item.dart';
import 'sync_status.dart';

class LocalCollection {
  final int? id;
  final String clientTransactionId;
  final int pickupRequestId;
  final String? pickupPrId;
  final List<CollectionItem> items;
  final double latitude;
  final double longitude;
  final String clientTimestamp;
  final SyncStatus syncStatus;
  final int retryCount;
  final String? lastError;
  final String createdAt;
  final String updatedAt;
  final String? serverBatchId; // e.g. CB-00071 once synced

  LocalCollection({
    this.id,
    required this.clientTransactionId,
    required this.pickupRequestId,
    this.pickupPrId,
    required this.items,
    required this.latitude,
    required this.longitude,
    required this.clientTimestamp,
    this.syncStatus = SyncStatus.pending,
    this.retryCount = 0,
    this.lastError,
    required this.createdAt,
    required this.updatedAt,
    this.serverBatchId,
  });

  LocalCollection copyWith({
    int? id,
    String? clientTransactionId,
    int? pickupRequestId,
    String? pickupPrId,
    List<CollectionItem>? items,
    double? latitude,
    double? longitude,
    String? clientTimestamp,
    SyncStatus? syncStatus,
    int? retryCount,
    String? lastError,
    String? createdAt,
    String? updatedAt,
    String? serverBatchId,
  }) {
    return LocalCollection(
      id: id ?? this.id,
      clientTransactionId: clientTransactionId ?? this.clientTransactionId,
      pickupRequestId: pickupRequestId ?? this.pickupRequestId,
      pickupPrId: pickupPrId ?? this.pickupPrId,
      items: items ?? this.items,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      clientTimestamp: clientTimestamp ?? this.clientTimestamp,
      syncStatus: syncStatus ?? this.syncStatus,
      retryCount: retryCount ?? this.retryCount,
      lastError: lastError ?? this.lastError,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      serverBatchId: serverBatchId ?? this.serverBatchId,
    );
  }

  Map<String, dynamic> toDbMap() {
    return {
      if (id != null) 'id': id,
      'client_transaction_id': clientTransactionId,
      'pickup_request_id': pickupRequestId,
      'pickup_pr_id': pickupPrId,
      'payload_json': jsonEncode(items.map((i) => i.toJson()).toList()),
      'latitude': latitude,
      'longitude': longitude,
      'client_timestamp': clientTimestamp,
      'sync_status': syncStatus.toDbString(),
      'retry_count': retryCount,
      'last_error': lastError,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'server_batch_id': serverBatchId,
    };
  }

  factory LocalCollection.fromDbMap(Map<String, dynamic> map) {
    List<CollectionItem> parsedItems = [];
    if (map['payload_json'] != null) {
      try {
        final list = jsonDecode(map['payload_json'] as String) as List<dynamic>;
        parsedItems = list.map((e) => CollectionItem.fromJson(e as Map<String, dynamic>)).toList();
      } catch (_) {}
    }

    return LocalCollection(
      id: map['id'] as int?,
      clientTransactionId: map['client_transaction_id'] as String,
      pickupRequestId: (map['pickup_request_id'] as num).toInt(),
      pickupPrId: map['pickup_pr_id'] as String?,
      items: parsedItems,
      latitude: (map['latitude'] as num).toDouble(),
      longitude: (map['longitude'] as num).toDouble(),
      clientTimestamp: map['client_timestamp'] as String? ?? DateTime.now().toIso8601String(),
      syncStatus: SyncStatus.fromDbString(map['sync_status'] as String? ?? 'PENDING'),
      retryCount: (map['retry_count'] as num?)?.toInt() ?? 0,
      lastError: map['last_error'] as String?,
      createdAt: map['created_at'] as String? ?? DateTime.now().toIso8601String(),
      updatedAt: map['updated_at'] as String? ?? DateTime.now().toIso8601String(),
      serverBatchId: map['server_batch_id'] as String?,
    );
  }

  Map<String, dynamic> toServerPayload() {
    return {
      'client_transaction_id': clientTransactionId,
      'pickup_request_id': pickupRequestId,
      'items': items.map((e) => e.toJson()).toList(),
    };
  }
}
