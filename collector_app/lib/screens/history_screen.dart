import 'package:flutter/material.dart';
import '../models/local_collection.dart';
import '../services/database_service.dart';
import '../widgets/sync_status_badge.dart';
import '../widgets/connection_badge.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<LocalCollection> _collections = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCollections();
  }

  Future<void> _loadCollections() async {
    setState(() => _isLoading = true);
    final list = await DatabaseService.instance.getAllCollections();
    if (mounted) {
      setState(() {
        _collections = list;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Local Collection History'),
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
          : _collections.isEmpty
              ? const Center(
                  child: Text('No local collections recorded yet.', style: TextStyle(color: Colors.grey)),
                )
              : RefreshIndicator(
                  onRefresh: _loadCollections,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _collections.length,
                    itemBuilder: (context, index) {
                      final item = _collections[index];
                      final firstItem = item.items.isNotEmpty ? item.items.first : null;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    item.serverBatchId ?? 'Local #${item.id}',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  SyncStatusBadge(status: item.syncStatus),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Pickup: ${item.pickupPrId ?? "PR-${item.pickupRequestId}"} • ${firstItem?.category ?? "E-Waste"} (${firstItem?.declaredWeight ?? 0.0} kg)',
                                style: const TextStyle(color: Colors.black87, fontSize: 13),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'UUID: ${item.clientTransactionId}',
                                style: const TextStyle(fontFamily: 'monospace', fontSize: 10, color: Colors.grey),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'GPS: ${item.latitude.toStringAsFixed(4)}, ${item.longitude.toStringAsFixed(4)} • ${item.clientTimestamp.substring(0, 19).replaceAll('T', ' ')}',
                                style: const TextStyle(fontSize: 11, color: Colors.grey),
                              ),
                              if (item.lastError != null) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFEE2E2),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    'Error: ${item.lastError}',
                                    style: const TextStyle(color: Color(0xFF991B1B), fontSize: 11),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
