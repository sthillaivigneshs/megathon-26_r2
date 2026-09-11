import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:uuid/uuid.dart';
import 'package:collector_app/models/local_collection.dart';
import 'package:collector_app/models/collection_item.dart';
import 'package:collector_app/models/hazard_type.dart';
import 'package:collector_app/services/database_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  sqfliteFfiInit();
  databaseFactory = databaseFactoryFfi;

  late DatabaseService db;

  group('Idempotency & Server Payload Contract Tests', () {
    setUp(() async {
      db = await DatabaseService.initForTest();
    });

    tearDown(() async {
      await db.close();
    });

    test('1. Every collection transaction generates a valid UUID v4', () {
      const uuidGenerator = Uuid();
      final tx1 = uuidGenerator.v4();
      final tx2 = uuidGenerator.v4();

      expect(tx1, isNotEmpty);
      expect(tx2, isNotEmpty);
      expect(tx1, isNot(equals(tx2)));

      // Regex check for standard UUID v4 format: 8-4-4-4-12 hex chars
      final uuidRegex = RegExp(r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', caseSensitive: false);
      expect(uuidRegex.hasMatch(tx1), isTrue);
      expect(uuidRegex.hasMatch(tx2), isTrue);
    });

    test('2. Server payload matches ReLoop CollectionSyncRequest schema', () {
      final txId = const Uuid().v4();
      final collection = LocalCollection(
        clientTransactionId: txId,
        pickupRequestId: 77,
        pickupPrId: 'PR-0077',
        items: [
          CollectionItem(
            category: 'Laptop',
            subcategory: 'ThinkPad',
            quantity: 1,
            declaredWeight: 2.3,
            condition: 'Working',
            photoUrl: 'https://storage.reloop.org/evidence/item1.jpg',
            photoHash: 'hash12345678',
            hazardStatus: HazardType.noHazard,
            latitude: 12.9716,
            longitude: 77.5946,
          ),
          CollectionItem(
            category: 'Mobile',
            quantity: 2,
            declaredWeight: 0.5,
            hazardStatus: HazardType.swollenBattery,
            latitude: 12.9716,
            longitude: 77.5946,
          ),
        ],
        latitude: 12.9716,
        longitude: 77.5946,
        clientTimestamp: '2026-09-11T12:00:00Z',
        createdAt: '2026-09-11T12:00:00Z',
        updatedAt: '2026-09-11T12:00:00Z',
      );

      final payload = collection.toServerPayload();

      // Top-level schema matching backend CollectionSyncRequest
      expect(payload['client_transaction_id'], txId);
      expect(payload['pickup_request_id'], 77);
      expect(payload['items'], isA<List<dynamic>>());

      final items = payload['items'] as List<dynamic>;
      expect(items.length, 2);

      final first = items[0] as Map<String, dynamic>;
      expect(first['category'], 'Laptop');
      expect(first['declared_weight'], 2.3);
      expect(first['hazard_status'], 'no_hazard');
      expect(first['latitude'], 12.9716);
      expect(first['longitude'], 77.5946);

      final second = items[1] as Map<String, dynamic>;
      expect(second['category'], 'Mobile');
      expect(second['quantity'], 2);
      expect(second['hazard_status'], 'swollen_battery');
    });

    test('3. Re-save of same client_transaction_id replaces gracefully without duplication', () async {
      final txId = const Uuid().v4();
      final now = DateTime.now().toIso8601String();

      final col1 = LocalCollection(
        clientTransactionId: txId,
        pickupRequestId: 12,
        items: [],
        latitude: 12.0,
        longitude: 77.0,
        clientTimestamp: now,
        createdAt: now,
        updatedAt: now,
      );

      await db.insertCollection(col1);

      // Re-saving with same UUID
      await db.insertCollection(col1);

      final all = await db.getAllCollections();
      expect(all.length, 1);
      expect(all.first.clientTransactionId, txId);
    });
  });
}
