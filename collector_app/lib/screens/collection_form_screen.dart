import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/user_session.dart';
import '../models/hazard_type.dart';
import '../models/collection_item.dart';
import '../models/local_collection.dart';
import '../models/sync_status.dart';
import '../models/voice_command.dart';
import '../services/database_service.dart';
import '../services/location_service.dart';
import '../services/sync_service.dart';
import '../services/connectivity_service.dart';
import '../services/voice_service.dart';
import '../widgets/connection_badge.dart';

class CollectionFormScreen extends StatefulWidget {
  final UserSession session;
  final int? defaultPickupId;
  final String? defaultPrId;
  final double? defaultLat;
  final double? defaultLon;

  const CollectionFormScreen({
    super.key,
    required this.session,
    this.defaultPickupId,
    this.defaultPrId,
    this.defaultLat,
    this.defaultLon,
  });

  @override
  State<CollectionFormScreen> createState() => _CollectionFormScreenState();
}

class _CollectionFormScreenState extends State<CollectionFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _pickupIdController;
  final _weightController = TextEditingController(text: '2.5');
  final _quantityController = TextEditingController(text: '1');
  final _conditionController = TextEditingController(text: 'Used');

  String _selectedCategory = 'Laptop';
  HazardType _selectedHazard = HazardType.noHazard;
  double? _latitude;
  double? _longitude;
  bool _isLocating = false;
  bool _isSaving = false;
  String? _voiceFeedback;
  bool _isVoiceProcessing = false;

  final List<String> _categories = [
    'Laptop',
    'Mobile',
    'Printer',
    'Television / Screen',
    'Charger / Cable',
    'Battery',
    'PCB / Motherboard',
    'Other E-Waste'
  ];

  @override
  void initState() {
    super.initState();
    _pickupIdController = TextEditingController(
      text: widget.defaultPickupId != null ? widget.defaultPickupId.toString() : '1',
    );
    _latitude = widget.defaultLat ?? LocationService.defaultLat;
    _longitude = widget.defaultLon ?? LocationService.defaultLon;
    _refreshGps();
  }

  Future<void> _handleVoiceCommand(String rawText) async {
    if (rawText.trim().isEmpty) return;
    setState(() => _isVoiceProcessing = true);

    try {
      final VoiceCommandResponse resp = await VoiceService.instance.processCommand(
        rawText,
        token: widget.session.token,
      );

      if (!mounted) return;

      setState(() {
        _voiceFeedback = resp.spokenFeedback;
        if (resp.intent == 'create_collection' || resp.intent == 'add_item') {
          if (resp.items.isNotEmpty) {
            final VoiceCommandItem it = resp.items.first;
            if (_categories.contains(it.category)) {
              _selectedCategory = it.category;
            }
            _quantityController.text = it.quantity.toString();
          }
          if (resp.totalWeightKg != null && resp.totalWeightKg! > 0) {
            _weightController.text = resp.totalWeightKg!.toString();
          }
          if (resp.hazardStatus != HazardType.noHazard) {
            _selectedHazard = resp.hazardStatus;
          }
        } else if (resp.intent == 'update_weight') {
          if (resp.totalWeightKg != null && resp.totalWeightKg! > 0) {
            _weightController.text = resp.totalWeightKg!.toString();
          }
        } else if (resp.intent == 'report_hazard') {
          _selectedHazard = resp.hazardStatus;
        } else if (resp.intent == 'trigger_sync') {
          SyncService.instance.syncPendingQueue();
        }
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF0F172A),
          content: Row(
            children: [
              const Icon(Icons.record_voice_over, color: Color(0xFF34D399), size: 20),
              const SizedBox(width: 8),
              Expanded(child: Text(resp.spokenFeedback)),
            ],
          ),
          duration: const Duration(seconds: 3),
        ),
      );

      // Explicit Safety Confirmation Step
      if (resp.intent == 'save_collection' || resp.requiresConfirmation) {
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Row(
              children: [
                Icon(Icons.mic, color: Color(0xFF059669)),
                SizedBox(width: 8),
                Text('Confirm Voice Save'),
              ],
            ),
            content: Text(
              'Voice Assistant requested to save this collection:\n\n'
              '• Item: ${_quantityController.text}x $_selectedCategory\n'
              '• Weight: ${_weightController.text} kg\n'
              '• Hazard: ${_selectedHazard.label}\n\n'
              'Save now to offline-first SQLite queue?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669)),
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Confirm & Save', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        );

        if (confirmed == true && mounted) {
          _saveCollection();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: Colors.red, content: Text('Voice error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isVoiceProcessing = false);
    }
  }

  void _openVoiceModal() {
    final inputCtrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.mic, color: Color(0xFF059669)),
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ReLoop Voice Assistant',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      Text(
                        'English • हिन्दी • Hinglish (Offline-Safe)',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: inputCtrl,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Speak or type command (e.g. "Collect 3 laptops 5 kg")',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.send, color: Color(0xFF059669)),
                    onPressed: () {
                      final text = inputCtrl.text.trim();
                      Navigator.pop(ctx);
                      if (text.isNotEmpty) _handleVoiceCommand(text);
                    },
                  ),
                ),
                onSubmitted: (val) {
                  Navigator.pop(ctx);
                  if (val.trim().isNotEmpty) _handleVoiceCommand(val.trim());
                },
              ),
              const SizedBox(height: 14),
              const Text('Quick voice presets:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ActionChip(
                    avatar: const Icon(Icons.laptop, size: 16, color: Color(0xFF059669)),
                    label: const Text('2 Laptops 3 kg'),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _handleVoiceCommand('Collect 2 laptops weighing 3 kg');
                    },
                  ),
                  ActionChip(
                    avatar: const Icon(Icons.phone_android, size: 16, color: Color(0xFF059669)),
                    label: const Text('5 Mobiles 1 kg'),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _handleVoiceCommand('Collect 5 phones weighing 1 kg');
                    },
                  ),
                  ActionChip(
                    avatar: const Icon(Icons.warning_amber, size: 16, color: Colors.red),
                    label: const Text('Swollen Battery'),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _handleVoiceCommand('Battery is swollen hazard');
                    },
                  ),
                  ActionChip(
                    avatar: const Icon(Icons.translate, size: 16, color: Colors.blue),
                    label: const Text('2 लैपटॉप 3 किलो (हिन्दी)'),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _handleVoiceCommand('2 laptop 3 kilo jama kiya');
                    },
                  ),
                  ActionChip(
                    avatar: const Icon(Icons.save, size: 16, color: Color(0xFF059669)),
                    label: const Text('Save Collection'),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _handleVoiceCommand('Save this collection');
                    },
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }


  Future<void> _refreshGps() async {
    setState(() => _isLocating = true);
    final coords = await LocationService.instance.getCurrentLocation();
    if (mounted) {
      setState(() {
        _latitude = coords.latitude;
        _longitude = coords.longitude;
        _isLocating = false;
      });
    }
  }

  Future<void> _saveCollection() async {
    if (!_formKey.currentState!.validate()) return;
    if (_latitude == null || _longitude == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please capture GPS coordinates.')),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final pickupId = int.parse(_pickupIdController.text.trim());
      final weight = double.parse(_weightController.text.trim());
      final quantity = int.tryParse(_quantityController.text.trim()) ?? 1;
      final clientTxId = const Uuid().v4();
      final nowStr = DateTime.now().toIso8601String();

      final item = CollectionItem(
        category: _selectedCategory,
        quantity: quantity,
        declaredWeight: weight,
        condition: _conditionController.text.trim(),
        hazardStatus: _selectedHazard,
        latitude: _latitude!,
        longitude: _longitude!,
        photoUrl: 'https://storage.reloop.org/evidence/${clientTxId.substring(0, 8)}.jpg',
        photoHash: 'hash_${clientTxId.substring(0, 8)}',
      );

      final collection = LocalCollection(
        clientTransactionId: clientTxId,
        pickupRequestId: pickupId,
        pickupPrId: widget.defaultPrId ?? 'PR-$pickupId',
        items: [item],
        latitude: _latitude!,
        longitude: _longitude!,
        clientTimestamp: nowStr,
        syncStatus: SyncStatus.pending,
        createdAt: nowStr,
        updatedAt: nowStr,
      );

      // 1. Always save locally to SQLite first
      await DatabaseService.instance.insertCollection(collection);

      // 2. If online, trigger background sync
      if (ConnectivityService.instance.isOnline) {
        SyncService.instance.syncPendingQueue();
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFF059669),
          content: Text(
            ConnectivityService.instance.isOnline
                ? '✅ Collection saved! Sync initiated...'
                : '💾 Saved to offline SQLite queue (PENDING)!',
          ),
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: Colors.red, content: Text('Error saving: $e')),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Record Collection'),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12.0),
            child: ConnectionBadge(showToggle: true),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: _isVoiceProcessing ? Colors.orange : const Color(0xFF059669),
        onPressed: _isVoiceProcessing ? null : _openVoiceModal,
        child: _isVoiceProcessing
            ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : const Icon(Icons.mic, color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Voice feedback banner
              if (_voiceFeedback != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF059669).withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.record_voice_over, color: Color(0xFF059669), size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _voiceFeedback!,
                          style: const TextStyle(fontSize: 13, color: Color(0xFF065F46)),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => setState(() => _voiceFeedback = null),
                        child: const Icon(Icons.close, size: 16, color: Colors.grey),
                      ),
                    ],
                  ),
                ),

              // Pickup Info Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Pickup Reference', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _pickupIdController,
                        decoration: const InputDecoration(
                          labelText: 'Pickup Request ID',
                          border: OutlineInputBorder(),
                          helperText: 'Integer ID matching backend pickup_requests.id',
                        ),
                        keyboardType: TextInputType.number,
                        validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // E-Waste Details Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('E-Waste Item Information', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        key: ValueKey('cat_$_selectedCategory'),
                        initialValue: _selectedCategory,
                        decoration: const InputDecoration(
                          labelText: 'Category',
                          border: OutlineInputBorder(),
                        ),
                        items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                        onChanged: (v) => setState(() => _selectedCategory = v!),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _weightController,
                              decoration: const InputDecoration(
                                labelText: 'Declared Weight (kg)',
                                border: OutlineInputBorder(),
                              ),
                              keyboardType: const TextInputType.numberWithOptions(decimal: true),
                              validator: (v) {
                                if (v == null || v.isEmpty) return 'Required';
                                if ((double.tryParse(v) ?? 0) <= 0) return '> 0 required';
                                return null;
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _quantityController,
                              decoration: const InputDecoration(
                                labelText: 'Quantity',
                                border: OutlineInputBorder(),
                              ),
                              keyboardType: TextInputType.number,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _conditionController,
                        decoration: const InputDecoration(
                          labelText: 'Item Condition',
                          border: OutlineInputBorder(),
                          helperText: 'e.g. Non-working, Scratched, Damaged screen',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Hazard Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Hazard Status', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<HazardType>(
                        key: ValueKey('hazard_$_selectedHazard'),
                        initialValue: _selectedHazard,
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                        ),
                        items: HazardType.values.map((h) {
                          Color badgeColor = Colors.grey;
                          if (h == HazardType.swollenBattery || h == HazardType.damagedBattery) {
                            badgeColor = Colors.red;
                          } else if (h == HazardType.leakage) {
                            badgeColor = Colors.orange;
                          } else if (h == HazardType.noHazard) {
                            badgeColor = Colors.green;
                          }
                          return DropdownMenuItem(
                            value: h,
                            child: Row(
                              children: [
                                Icon(Icons.circle, size: 10, color: badgeColor),
                                const SizedBox(width: 8),
                                Text(h.label),
                              ],
                            ),
                          );
                        }).toList(),
                        onChanged: (v) => setState(() => _selectedHazard = v!),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // GPS & Evidence Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Collection Evidence (GPS)', style: TextStyle(fontWeight: FontWeight.bold)),
                          TextButton.icon(
                            icon: const Icon(Icons.my_location, size: 16),
                            label: const Text('Refresh GPS'),
                            onPressed: _isLocating ? null : _refreshGps,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.black12),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.location_on, color: Color(0xFF059669)),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _latitude != null && _longitude != null
                                    ? '${_latitude!.toStringAsFixed(5)}, ${_longitude!.toStringAsFixed(5)}'
                                    : 'Locating...',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                            ),
                            if (_isLocating) const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: _isSaving ? null : _saveCollection,
                child: _isSaving
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Save Collection (Offline-Safe)',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
              const SizedBox(height: 12),
              const Text(
                '🔒 Generates UUID client_transaction_id. Guaranteed idempotent.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11, color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
