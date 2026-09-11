import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/local_collection.dart';
import '../models/sync_status.dart';
import 'database_service.dart';
import 'api_service.dart';
import 'connectivity_service.dart';

class SyncSummary {
  final int pending;
  final int syncing;
  final int synced;
  final int failed;
  final int total;

  SyncSummary({
    required this.pending,
    required this.syncing,
    required this.synced,
    required this.failed,
    required this.total,
  });
}

class SyncService extends ChangeNotifier {
  static final SyncService instance = SyncService._internal();
  SyncService._internal();

  final DatabaseService _db = DatabaseService.instance;
  final ApiService _api = ApiService();
  final ConnectivityService _connectivity = ConnectivityService.instance;

  String? _authToken;
  bool _isProcessing = false;

  void setAuthToken(String? token) {
    _authToken = token;
  }

  // Get summary counts for Sync Queue screen
  Future<SyncSummary> getSummary() async {
    final all = await _db.getAllCollections();
    int pending = 0;
    int syncing = 0;
    int synced = 0;
    int failed = 0;

    for (var c in all) {
      switch (c.syncStatus) {
        case SyncStatus.pending:
          pending++;
          break;
        case SyncStatus.syncing:
          syncing++;
          break;
        case SyncStatus.synced:
          synced++;
          break;
        case SyncStatus.failed:
          failed++;
          break;
      }
    }

    return SyncSummary(
      pending: pending,
      syncing: syncing,
      synced: synced,
      failed: failed,
      total: all.length,
    );
  }

  // Synchronize all pending/failed collections in the SQLite queue
  Future<void> syncPendingQueue() async {
    if (_isProcessing) return;
    if (!_connectivity.isOnline) {
      debugPrint('[SyncService] Device is offline, sync deferred.');
      return;
    }
    if (_authToken == null || _authToken!.isEmpty) {
      debugPrint('[SyncService] Missing auth token, sync deferred.');
      return;
    }

    _isProcessing = true;
    _connectivity.setSyncing(true);
    notifyListeners();

    try {
      final unsynced = await _db.getUnsyncedCollections();
      debugPrint('[SyncService] Found ${unsynced.length} unsynced collection(s).');

      for (var collection in unsynced) {
        if (!_connectivity.isOnline) break; // Network lost mid-sync

        // Step 1: Transition PENDING/FAILED -> SYNCING in local SQLite
        await _db.updateSyncStatus(
          id: collection.id!,
          status: SyncStatus.syncing,
        );
        notifyListeners();

        try {
          // Step 2: HTTP POST to backend with UUID client_transaction_id
          final result = await _api.syncCollection(collection, _authToken!);

          final serverBatchId = result['cb_id'] as String? ?? 'CB-SYNCED';

          // Step 3: Transition SYNCING -> SYNCED upon confirmed backend ACK
          await _db.updateSyncStatus(
            id: collection.id!,
            status: SyncStatus.synced,
            serverBatchId: serverBatchId,
            lastError: null,
          );
          debugPrint('[SyncService] Collection ${collection.clientTransactionId} acknowledged as $serverBatchId');
        } catch (e) {
          // Step 4: Transition SYNCING -> FAILED on network or API failure (preserves record for retry)
          debugPrint('[SyncService] Failed to sync ${collection.clientTransactionId}: $e');
          await _db.updateSyncStatus(
            id: collection.id!,
            status: SyncStatus.failed,
            lastError: e.toString(),
            incrementRetry: true,
          );
        }
        notifyListeners();
      }
    } finally {
      _isProcessing = false;
      _connectivity.setSyncing(false);
      notifyListeners();
    }
  }

  // Manually retry a specific failed collection
  Future<void> retrySingle(LocalCollection collection) async {
    if (collection.id == null) return;
    await _db.updateSyncStatus(
      id: collection.id!,
      status: SyncStatus.pending,
    );
    notifyListeners();
    await syncPendingQueue();
  }
}
