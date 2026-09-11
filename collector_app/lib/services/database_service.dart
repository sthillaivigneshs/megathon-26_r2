import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:path/path.dart' as p;
import '../models/local_collection.dart';
import '../models/sync_status.dart';

class DatabaseService {
  static DatabaseService instance = DatabaseService._internal();
  DatabaseService._internal();

  Database? _db;

  /// Creates a test-specific instance backed by an in-memory SQLite database.
  /// Each call returns a fresh, isolated instance — no cross-test locking.
  static Future<DatabaseService> initForTest() async {
    final svc = DatabaseService._internal();
    svc._db = await openDatabase(
      inMemoryDatabasePath,
      version: 1,
      onCreate: svc._onCreate,
    );
    instance = svc;
    return svc;
  }

  Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await _initDatabase();
    return _db!;
  }

  Future<Database> _initDatabase({String dbName = 'reloop_collector.db'}) async {
    // Initialize FFI for desktop and unit tests
    if (!kIsWeb && (Platform.isMacOS || Platform.isLinux || Platform.isWindows)) {
      sqfliteFfiInit();
      databaseFactory = databaseFactoryFfi;
    }

    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, dbName);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
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

    await db.execute('''
      CREATE INDEX idx_client_tx ON local_collections(client_transaction_id);
    ''');
    await db.execute('''
      CREATE INDEX idx_sync_status ON local_collections(sync_status);
    ''');
  }

  // Insert new collection locally (default status: PENDING)
  Future<LocalCollection> insertCollection(LocalCollection collection) async {
    final db = await database;
    final id = await db.insert(
      'local_collections',
      collection.toDbMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
    return collection.copyWith(id: id);
  }

  // Get all collections
  Future<List<LocalCollection>> getAllCollections() async {
    final db = await database;
    final maps = await db.query(
      'local_collections',
      orderBy: 'id DESC',
    );
    return maps.map((m) => LocalCollection.fromDbMap(m)).toList();
  }

  // Get collection by client_transaction_id
  Future<LocalCollection?> getByTransactionId(String clientTransactionId) async {
    final db = await database;
    final maps = await db.query(
      'local_collections',
      where: 'client_transaction_id = ?',
      whereArgs: [clientTransactionId],
      limit: 1,
    );
    if (maps.isEmpty) return null;
    return LocalCollection.fromDbMap(maps.first);
  }

  // Get collections pending sync (PENDING or FAILED)
  Future<List<LocalCollection>> getUnsyncedCollections() async {
    final db = await database;
    final maps = await db.query(
      'local_collections',
      where: 'sync_status = ? OR sync_status = ?',
      whereArgs: ['PENDING', 'FAILED'],
      orderBy: 'id ASC',
    );
    return maps.map((m) => LocalCollection.fromDbMap(m)).toList();
  }

  // Update status (e.g. SYNCING, SYNCED, FAILED)
  Future<void> updateSyncStatus({
    required int id,
    required SyncStatus status,
    String? serverBatchId,
    String? lastError,
    bool incrementRetry = false,
  }) async {
    final db = await database;
    final now = DateTime.now().toIso8601String();

    String query = 'UPDATE local_collections SET sync_status = ?, updated_at = ?';
    List<dynamic> args = [status.toDbString(), now];

    if (serverBatchId != null) {
      query += ', server_batch_id = ?';
      args.add(serverBatchId);
    }
    if (lastError != null) {
      query += ', last_error = ?';
      args.add(lastError);
    }
    if (incrementRetry) {
      query += ', retry_count = retry_count + 1';
    }

    query += ' WHERE id = ?';
    args.add(id);

    await db.rawUpdate(query, args);
  }

  // Close database
  Future<void> close() async {
    if (_db != null && _db!.isOpen) {
      await _db!.close();
      _db = null;
    }
  }

  // Clear database (for testing)
  Future<void> clearAll() async {
    final db = await database;
    await db.delete('local_collections');
  }
}
