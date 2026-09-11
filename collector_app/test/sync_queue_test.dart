import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:uuid/uuid.dart';
import 'package:collector_app/models/local_collection.dart';
import 'package:collector_app/models/collection_item.dart';
import 'package:collector_app/models/sync_status.dart';
import 'package:collector_app/models/hazard_type.dart';
import 'package:collector_app/services/database_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  sqfliteFfiInit();
  databaseFactory = databaseFactoryFfi;

  late DatabaseService db;

  group('Sync Queue State Machine Tests', () {
    setUp(() async {
      db = await DatabaseService.initForTest();
    });

    tearDown(() async {
      await db.close();
    });

    test('1. Progression: PENDING -> SYNCING -> SYNCED on backend ACK', () async {
      final txId = const Uuid().v4();
      final now = DateTime.now().toIso8601String();

      // Start: PENDING
      final collection = await db.insertCollection(
        LocalCollection(
          clientTransactionId: txId,
          pickupRequestId: 501,
          items: [
            CollectionItem(
              category: 'Charger / Cable',
              declaredWeight: 0.3,
              hazardStatus: HazardType.noHazard,
              latitude: 12.9716,
              longitude: 77.5946,
            )
          ],
          latitude: 12.9716,
          longitude: 77.5946,
          clientTimestamp: now,
          syncStatus: SyncStatus.pending,
          createdAt: now,
          updatedAt: now,
        ),
      );

      expect(collection.id, isNotNull);
      expect(collection.syncStatus, SyncStatus.pending);

      // Transition to SYNCING
      await db.updateSyncStatus(
        id: collection.id!,
        status: SyncStatus.syncing,
      );

      final inFlight = await db.getByTransactionId(txId);
      expect(inFlight!.syncStatus, SyncStatus.syncing);

      // Backend ACK received: Transition to SYNCED with serverBatchId
      await db.updateSyncStatus(
        id: collection.id!,
        status: SyncStatus.synced,
        serverBatchId: 'CB-00099',
      );

      final synced = await db.getByTransactionId(txId);
      expect(synced!.syncStatus, SyncStatus.synced);
      expect(synced.serverBatchId, 'CB-00099');
    });

    test('2. Error handling: PENDING -> SYNCING -> FAILED on network failure', () async {
      final txId = const Uuid().v4();
      final now = DateTime.now().toIso8601String();

      final collection = await db.insertCollection(
        LocalCollection(
          clientTransactionId: txId,
          pickupRequestId: 502,
          items: [],
          latitude: 12.9716,
          longitude: 77.5946,
          clientTimestamp: now,
          syncStatus: SyncStatus.pending,
          createdAt: now,
          updatedAt: now,
        ),
      );

      // Sync attempt fails with 500 or timeout
      await db.updateSyncStatus(
        id: collection.id!,
        status: SyncStatus.failed,
        lastError: 'HTTP 500: Server timeout',
        incrementRetry: true,
      );

      final failedRecord = await db.getByTransactionId(txId);
      // Record MUST NOT be deleted merely because HTTP failed
      expect(failedRecord, isNotNull);
      expect(failedRecord!.syncStatus, SyncStatus.failed);
      expect(failedRecord.lastError, contains('500'));
      expect(failedRecord.retryCount, 1);

      // Record remains queryable in unsynced queue for retry
      final unsynced = await db.getUnsyncedCollections();
      expect(unsynced.any((c) => c.clientTransactionId == txId), isTrue);
    });

    test('3. Manual retry reset: FAILED -> PENDING -> SYNCED', () async {
      final txId = const Uuid().v4();
      final now = DateTime.now().toIso8601String();

      final collection = await db.insertCollection(
        LocalCollection(
          clientTransactionId: txId,
          pickupRequestId: 503,
          items: [],
          latitude: 12.9716,
          longitude: 77.5946,
          clientTimestamp: now,
          syncStatus: SyncStatus.failed,
          retryCount: 2,
          lastError: 'Connection refused',
          createdAt: now,
          updatedAt: now,
        ),
      );

      // User presses "Retry"
      await db.updateSyncStatus(
        id: collection.id!,
        status: SyncStatus.pending,
      );

      final resetRecord = await db.getByTransactionId(txId);
      expect(resetRecord!.syncStatus, SyncStatus.pending);

      // Then sync succeeds
      await db.updateSyncStatus(
        id: collection.id!,
        status: SyncStatus.synced,
        serverBatchId: 'CB-00101',
      );

      final finalRecord = await db.getByTransactionId(txId);
      expect(finalRecord!.syncStatus, SyncStatus.synced);
      expect(finalRecord.serverBatchId, 'CB-00101');
    });
  });
}
