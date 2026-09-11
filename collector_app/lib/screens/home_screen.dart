import 'package:flutter/material.dart';
import '../models/user_session.dart';
import '../models/pickup_request.dart';
import '../services/api_service.dart';
import '../services/sync_service.dart';
import '../services/connectivity_service.dart';
import '../widgets/connection_badge.dart';
import 'collection_form_screen.dart';
import 'sync_queue_screen.dart';
import 'history_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  final UserSession session;

  const HomeScreen({super.key, required this.session});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _api = ApiService();
  List<PickupRequest> _pickups = [];
  bool _isLoading = false;
  String? _error;
  int _pendingCount = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
    SyncService.instance.addListener(_updateSummary);
    ConnectivityService.instance.addListener(_onConnectivityChanged);
  }

  @override
  void dispose() {
    SyncService.instance.removeListener(_updateSummary);
    ConnectivityService.instance.removeListener(_onConnectivityChanged);
    super.dispose();
  }

  void _onConnectivityChanged() {
    if (ConnectivityService.instance.isOnline) {
      _loadData();
    }
  }

  Future<void> _updateSummary() async {
    final summary = await SyncService.instance.getSummary();
    if (mounted) {
      setState(() {
        _pendingCount = summary.pending + summary.failed;
      });
    }
  }

  Future<void> _loadData() async {
    await _updateSummary();
    if (!ConnectivityService.instance.isOnline) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final list = await _api.getAssignedPickups(widget.session.token);
      if (mounted) {
        setState(() {
          _pickups = list;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Offline: Showing cached pickups.';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Collector Terminal', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text(widget.session.email, style: const TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        actions: [
          const ConnectionBadge(showToggle: true),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Quick action banners
            Card(
              color: const Color(0xFF0F172A),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Offline Sync Queue',
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _pendingCount > 0 ? Colors.amber.shade400 : const Color(0xFF34D399),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '$_pendingCount Pending',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black87),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Collections recorded offline are safely held in SQLite and synced once connectivity is restored.',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF059669),
                              foregroundColor: Colors.white,
                            ),
                            icon: const Icon(Icons.sync, size: 18),
                            label: const Text('View Sync Queue'),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => SyncQueueScreen(token: widget.session.token),
                                ),
                              ).then((_) => _updateSummary());
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Colors.white30),
                          ),
                          icon: const Icon(Icons.history, size: 18),
                          label: const Text('History'),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const HistoryScreen()),
                            );
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.amber.shade300),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, size: 16, color: Color(0xFF92400E)),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_error!, style: const TextStyle(fontSize: 12, color: Color(0xFF92400E)))),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 16),

            // Assigned Pickups Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Assigned Pickups',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Direct Collection'),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => CollectionFormScreen(session: widget.session),
                      ),
                    ).then((_) => _updateSummary());
                  },
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (_isLoading)
              const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
            else if (_pickups.isEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      const Icon(Icons.inbox, size: 48, color: Colors.grey),
                      const SizedBox(height: 8),
                      const Text(
                        'No assigned pickups online',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'You can still record e-waste collection offline by tapping "Direct Collection".',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CollectionFormScreen(
                                session: widget.session,
                                defaultPickupId: 1,
                                defaultPrId: 'PR-1024',
                              ),
                            ),
                          ).then((_) => _updateSummary());
                        },
                        child: const Text('Record Collection for PR-1024'),
                      ),
                    ],
                  ),
                ),
              )
            else
              ..._pickups.map((p) => Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: const Color(0xFFD1FAE5),
                        child: const Icon(Icons.phone_iphone, color: Color(0xFF065F46)),
                      ),
                      title: Text(
                        p.prId,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(
                        '${p.description ?? "E-Waste Items"}\nGPS: ${p.latitude.toStringAsFixed(4)}, ${p.longitude.toStringAsFixed(4)}',
                        style: const TextStyle(fontSize: 12),
                      ),
                      isThreeLine: true,
                      trailing: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF059669),
                          foregroundColor: Colors.white,
                        ),
                        child: const Text('Collect'),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CollectionFormScreen(
                                session: widget.session,
                                defaultPickupId: p.id,
                                defaultPrId: p.prId,
                                defaultLat: p.latitude,
                                defaultLon: p.longitude,
                              ),
                            ),
                          ).then((_) => _updateSummary());
                        },
                      ),
                    ),
                  )),
          ],
        ),
      ),
    );
  }
}
