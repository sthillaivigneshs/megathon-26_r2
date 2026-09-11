import 'package:flutter/material.dart';
import '../models/local_collection.dart';
import '../models/sync_status.dart';
import '../services/database_service.dart';
import '../services/sync_service.dart';
import '../services/connectivity_service.dart';
import '../widgets/sync_status_badge.dart';
import '../widgets/connection_badge.dart';

class SyncQueueScreen extends StatefulWidget {
  final String? token;

  const SyncQueueScreen({super.key, this.token});

  @override
  State<SyncQueueScreen> createState() => _SyncQueueScreenState();
}

class _SyncQueueScreenState extends State<SyncQueueScreen> {
  List<LocalCollection> _collections = [];
  SyncSummary _summary = SyncSummary(pending: 0, syncing: 0, synced: 0, failed: 0, total: 0);
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    if (widget.token != null) {
      SyncService.instance.setAuthToken(widget.token);
    }
    SyncService.instance.addListener(_refresh);
    _refresh();
  }

  @override
  void dispose() {
    SyncService.instance.removeListener(_refresh);
    super.dispose();
  }

  Future<void> _refresh() async {
    final list = await DatabaseService.instance.getAllCollections();
    final sum = await SyncService.instance.getSummary();
    if (mounted) {
      setState(() {
        _collections = list;
        _summary = sum;
        _isLoading = false;
      });
    }
  }

  Future<void> _triggerSyncNow() async {
    if (!ConnectivityService.instance.isOnline) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚠️ Cannot sync: Device is offline. Restore connectivity or turn off Airplane mode.'),
          backgroundColor: Colors.amber,
        ),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('🔄 Initiating queue synchronization...')),
    );
    await SyncService.instance.syncPendingQueue();
    _refresh();
  }

  Widget _buildSummaryCard(String title, int count, Color color, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(height: 4),
            Text(
              '$count',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color),
            ),
            Text(
              title,
              style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Offline Sync Queue'),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12.0),
            child: ConnectionBadge(showToggle: true),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // KPI Counters Row
                  Row(
                    children: [
                      _buildSummaryCard('Pending', _summary.pending, Colors.amber.shade800, Icons.hourglass_top),
                      const SizedBox(width: 8),
                      _buildSummaryCard('Syncing', _summary.syncing, Colors.blue.shade700, Icons.sync),
                      const SizedBox(width: 8),
                      _buildSummaryCard('Synced', _summary.synced, Colors.green.shade700, Icons.check_circle),
                      const SizedBox(width: 8),
                      _buildSummaryCard('Failed', _summary.failed, Colors.red.shade700, Icons.error),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Action Buttons
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    icon: const Icon(Icons.cloud_upload),
                    label: const Text(
                      'Sync Now (Trigger Server ACK)',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    onPressed: _summary.pending == 0 && _summary.failed == 0 ? null : _triggerSyncNow,
                  ),
                  const SizedBox(height: 20),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Queue Transactions',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1E293B)),
                      ),
                      Text(
                        '${_collections.length} Total',
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  if (_collections.isEmpty)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: Center(
                          child: Text(
                            'The offline queue is empty.\nRecord a collection to see queue progression.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.grey),
                          ),
                        ),
                      ),
                    )
                  else
                    ..._collections.map((item) {
                      final isPendingOrFailed = item.syncStatus == SyncStatus.pending || item.syncStatus == SyncStatus.failed;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        elevation: 1.5,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      'Pickup: ${item.pickupPrId ?? "PR-${item.pickupRequestId}"}',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                    ),
                                  ),
                                  SyncStatusBadge(status: item.syncStatus),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Tx UUID: ${item.clientTransactionId}',
                                style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: Colors.blueGrey),
                              ),
                              if (item.serverBatchId != null) ...[
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.verified, size: 14, color: Color(0xFF059669)),
                                    const SizedBox(width: 4),
                                    Text(
                                      'Server Batch: ${item.serverBatchId}',
                                      style: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 12),
                                    ),
                                  ],
                                ),
                              ],
                              if (item.lastError != null) ...[
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFEE2E2),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.warning, size: 14, color: Color(0xFF991B1B)),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          'Error: ${item.lastError}',
                                          style: const TextStyle(color: Color(0xFF991B1B), fontSize: 11),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Retries: ${item.retryCount} • Recorded: ${item.createdAt.substring(11, 19)}',
                                    style: const TextStyle(fontSize: 11, color: Colors.grey),
                                  ),
                                  if (isPendingOrFailed)
                                    TextButton.icon(
                                      style: TextButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        foregroundColor: const Color(0xFF2563EB),
                                      ),
                                      icon: const Icon(Icons.replay, size: 14),
                                      label: const Text('Retry Now', style: TextStyle(fontSize: 12)),
                                      onPressed: () => SyncService.instance.retrySingle(item),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                ],
              ),
            ),
    );
  }
}
