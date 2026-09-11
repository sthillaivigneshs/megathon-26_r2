import 'dart:io';
import 'package:path/path.dart' as p;
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

  group('SQLite Offline Persistence & App Restart Tests', () {
    setUp(() async {
      db = await DatabaseService.initForTest();
    });

    tearDown(() async {
      await db.close();
    });

    test('1. Saves collection locally with PENDING status', () async {
      final txId = const Uuid().v4();
      final now = DateTime.now().toIso8601String();

      final item = CollectionItem(
        category: 'Laptop',
        quantity: 1,
        declaredWeight: 2.5,
        condition: 'Non-working',
        hazardStatus: HazardType.noHazard,
        latitude: 12.9716,
        longitude: 77.5946,
      );

      final collection = LocalCollection(
        clientTransactionId: txId,
        pickupRequestId: 101,
        pickupPrId: 'PR-101',
        items: [item],
        latitude: 12.9716,
        longitude: 77.5946,
        clientTimestamp: now,
        syncStatus: SyncStatus.pending,
        createdAt: now,
        updatedAt: now,
      );

      final saved = await db.insertCollection(collection);
      expect(saved.id, isNotNull);

      // Verify retrieval
      final retrieved = await db.getByTransactionId(txId);
      expect(retrieved, isNotNull);
      expect(retrieved!.clientTransactionId, txId);
      expect(retrieved.syncStatus, SyncStatus.pending);
      expect(retrieved.items.length, 1);
      expect(retrieved.items.first.category, 'Laptop');
      expect(retrieved.items.first.declaredWeight, 2.5);
    });

    test('2. Persistence test: data survives clearAll and re-insert', () async {
      final txId = const Uuid().v4();
      final now = DateTime.now().toIso8601String();

      final collection = LocalCollection(
        clientTransactionId: txId,
        pickupRequestId: 202,
        pickupPrId: 'PR-202',
        items: [
          CollectionItem(
            category: 'Mobile',
            quantity: 2,
            declaredWeight: 0.6,
            hazardStatus: HazardType.swollenBattery,
            latitude: 12.9800,
            longitude: 77.6000,
          )
        ],
        latitude: 12.9800,
        longitude: 77.6000,
        clientTimestamp: now,
        syncStatus: SyncStatus.pending,
        createdAt: now,
        updatedAt: now,
      );

      await db.insertCollection(collection);

      // Verify data persists within the same session
      final allCollections = await db.getAllCollections();
      expect(allCollections.length, 1);
      final persisted = allCollections.first;
      expect(persisted.clientTransactionId, txId);
      expect(persisted.pickupRequestId, 202);
      expect(persisted.syncStatus, SyncStatus.pending);
      expect(persisted.items.first.hazardStatus, HazardType.swollenBattery);
    });

    test('3. Query unsynced returns PENDING and FAILED records only', () async {
      final tx1 = const Uuid().v4();
      final tx2 = const Uuid().v4();
      final tx3 = const Uuid().v4();
      final now = DateTime.now().toIso8601String();

      // 1: Pending
      await db.insertCollection(LocalCollection(
        clientTransactionId: tx1,
        pickupRequestId: 1,
        items: [],
        latitude: 0,
        longitude: 0,
        clientTimestamp: now,
        syncStatus: SyncStatus.pending,
        createdAt: now,
        updatedAt: now,
      ));

      // 2: Synced
      await db.insertCollection(LocalCollection(
        clientTransactionId: tx2,
        pickupRequestId: 2,
        items: [],
        latitude: 0,
        longitude: 0,
        clientTimestamp: now,
        syncStatus: SyncStatus.synced,
        createdAt: now,
        updatedAt: now,
      ));

      // 3: Failed
      await db.insertCollection(LocalCollection(
        clientTransactionId: tx3,
        pickupRequestId: 3,
        items: [],
        latitude: 0,
        longitude: 0,
        clientTimestamp: now,
        syncStatus: SyncStatus.failed,
        createdAt: now,
        updatedAt: now,
      ));

      final unsynced = await db.getUnsyncedCollections();
      expect(unsynced.length, 2);
      expect(unsynced.map((u) => u.clientTransactionId), containsAll([tx1, tx3]));
    });

    test('4. Persistent SQLite across simulated app restart (file-backed db)', () async {
      final tempDir = Directory.systemTemp.createTempSync('reloop_db_test_');
      final dbPath = p.join(tempDir.path, 'restart_test.db');

      try {
        final txId = const Uuid().v4();
        final now = DateTime.now().toIso8601String();

        // 1. App Session 1: open on-disk SQLite, insert PENDING collection
        final db1 = await openDatabase(
          dbPath,
          version: 1,
          onCreate: (db, version) async {
            await db.execute('''
              CREATE TABLE local_collections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_transaction_id TEXT NOT NULL UNIQUE,
                pickup_request_id INTEGER NOT NULL,
                pickup_pr_id TEXT,
                payload_json TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                client_timestamp TEXT NOT NULL,
                sync_status TEXT NOT NULL,
                retry_count INTEGER NOT NULL DEFAULT 0,
                last_error TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                server_batch_id TEXT
              )
            ''');
          },
        );

        final collection = LocalCollection(
          clientTransactionId: txId,
          pickupRequestId: 404,
          pickupPrId: 'PR-404',
          items: [
            CollectionItem(
              category: 'Laptop',
              declaredWeight: 1.8,
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
        );

        await db1.insert('local_collections', collection.toDbMap());

        // 2. Simulate App Termination / Process Kill
        await db1.close();

        // 3. App Session 2 (App Restart): Re-open the same on-disk SQLite database
        final db2 = await openDatabase(dbPath, version: 1);
        final results = await db2.query(
          'local_collections',
          where: 'client_transaction_id = ?',
          whereArgs: [txId],
        );

        expect(results.length, 1);
        final restored = LocalCollection.fromDbMap(results.first);
        expect(restored.clientTransactionId, txId);
        expect(restored.syncStatus, SyncStatus.pending);
        expect(restored.pickupRequestId, 404);
        expect(restored.items.first.category, 'Laptop');
        expect(restored.items.first.declaredWeight, 1.8);

        await db2.close();
      } finally {
        tempDir.deleteSync(recursive: true);
      }
    });
  });
}
