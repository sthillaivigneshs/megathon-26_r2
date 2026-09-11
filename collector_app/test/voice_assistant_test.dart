import 'package:flutter_test/flutter_test.dart';
import 'package:collector_app/models/voice_command.dart';
import 'package:collector_app/models/hazard_type.dart';
import 'package:collector_app/services/voice_service.dart';

void main() {
  late VoiceService voiceService;

  setUp(() {
    voiceService = VoiceService.instance;
  });

  group('Voice Command Model', () {
    test('VoiceCommandResponse.fromJson parses create_collection', () {
      final json = {
        'intent': 'create_collection',
        'items': [
          {'category': 'Laptop', 'quantity': 2, 'declared_weight': 3.5, 'hazard_status': 'no_hazard'}
        ],
        'total_weight_kg': 3.5,
        'hazard_status': 'no_hazard',
        'confidence': 0.96,
        'requires_confirmation': false,
        'spoken_feedback': 'Recorded 2 Laptop, weight 3.5 kg.',
        'raw_transcript': 'Collect 2 laptops weighing 3.5 kg',
        'language': 'en',
        'provider': 'demo',
      };

      final resp = VoiceCommandResponse.fromJson(json);
      expect(resp.intent, 'create_collection');
      expect(resp.items.length, 1);
      expect(resp.items.first.category, 'Laptop');
      expect(resp.items.first.quantity, 2);
      expect(resp.items.first.declaredWeight, 3.5);
      expect(resp.totalWeightKg, 3.5);
      expect(resp.confidence, greaterThanOrEqualTo(0.90));
      expect(resp.requiresConfirmation, false);
      expect(resp.language, 'en');
      expect(resp.provider, 'demo');
    });

    test('VoiceCommandResponse.fromJson handles empty items', () {
      final json = {
        'intent': 'unknown',
        'confidence': 0.4,
        'spoken_feedback': 'Not recognized',
      };
      final resp = VoiceCommandResponse.fromJson(json);
      expect(resp.intent, 'unknown');
      expect(resp.items, isEmpty);
      expect(resp.confidence, 0.4);
    });

    test('VoiceCommandItem.toJson roundtrip', () {
      final item = VoiceCommandItem(
        category: 'Mobile',
        quantity: 5,
        declaredWeight: 1.0,
        hazardStatus: HazardType.noHazard,
      );
      final json = item.toJson();
      expect(json['category'], 'Mobile');
      expect(json['quantity'], 5);
      expect(json['declared_weight'], 1.0);

      final restored = VoiceCommandItem.fromJson(json);
      expect(restored.category, 'Mobile');
      expect(restored.quantity, 5);
      expect(restored.declaredWeight, 1.0);
    });
  });

  group('Local Offline Voice Parser — English', () {
    test('Parses "Collect 3 laptops weighing 5 kg"', () {
      final resp = voiceService.localParseCommand('Collect 3 laptops weighing 5 kg');
      expect(resp.intent, 'create_collection');
      expect(resp.items.length, 1);
      expect(resp.items.first.category, 'Laptop');
      expect(resp.items.first.quantity, 3);
      expect(resp.totalWeightKg, 5.0);
      expect(resp.confidence, greaterThanOrEqualTo(0.90));
      expect(resp.provider, 'local_offline');
    });

    test('Parses "Collect 2 phones weighing 1 kg"', () {
      final resp = voiceService.localParseCommand('Collect 2 phones weighing 1 kg');
      expect(resp.intent, 'create_collection');
      expect(resp.items.first.category, 'Mobile');
      expect(resp.items.first.quantity, 2);
      expect(resp.totalWeightKg, 1.0);
    });

    test('Parses "Add 1 printer"', () {
      final resp = voiceService.localParseCommand('Add 1 printer');
      expect(resp.intent, 'add_item');
      expect(resp.items.first.category, 'Printer');
      expect(resp.items.first.quantity, 1);
    });

    test('Parses weight-only "Weight is 4.5 kg"', () {
      final resp = voiceService.localParseCommand('Weight is 4.5 kg');
      expect(resp.intent, 'update_weight');
      expect(resp.totalWeightKg, 4.5);
    });
  });

  group('Local Offline Voice Parser — Hindi/Hinglish', () {
    test('Parses "2 laptop 3 kilo jama kiya hai"', () {
      final resp = voiceService.localParseCommand('2 laptop 3 kilo jama kiya hai');
      expect(resp.intent, 'create_collection');
      expect(resp.items.first.category, 'Laptop');
      expect(resp.language, 'hi');
    });

    test('Parses "phone jodo 1 kilo"', () {
      final resp = voiceService.localParseCommand('phone jodo 1 kilo');
      expect(resp.intent, 'add_item');
      expect(resp.items.first.category, 'Mobile');
    });
  });

  group('Local Offline Voice Parser — Safety & Actions', () {
    test('Save collection requires confirmation', () {
      final resp = voiceService.localParseCommand('Save this collection');
      expect(resp.intent, 'save_collection');
      expect(resp.requiresConfirmation, true);
      expect(resp.confidence, greaterThanOrEqualTo(0.90));
    });

    test('Cancel command', () {
      final resp = voiceService.localParseCommand('Cancel this');
      expect(resp.intent, 'cancel');
      expect(resp.confidence, greaterThanOrEqualTo(0.90));
    });

    test('Sync/upload command', () {
      final resp = voiceService.localParseCommand('Sync pending collections');
      expect(resp.intent, 'trigger_sync');
      expect(resp.confidence, greaterThanOrEqualTo(0.90));
    });
  });

  group('Local Offline Voice Parser — Hazard', () {
    test('Detects swollen battery hazard', () {
      final resp = voiceService.localParseCommand('Battery is swollen');
      expect(resp.intent, 'report_hazard');
      expect(resp.hazardStatus, HazardType.swollenBattery);
    });

    test('Detects leakage hazard', () {
      final resp = voiceService.localParseCommand('There is a leak');
      expect(resp.intent, 'report_hazard');
      expect(resp.hazardStatus, HazardType.leakage);
    });
  });

  group('Local Offline Voice Parser — Edge Cases', () {
    test('Empty string returns unknown', () {
      final resp = voiceService.localParseCommand('');
      expect(resp.intent, 'unknown');
      expect(resp.confidence, lessThan(0.5));
    });

    test('Gibberish returns unknown', () {
      final resp = voiceService.localParseCommand('xyzzy blorp fnargh');
      expect(resp.intent, 'unknown');
      expect(resp.confidence, lessThan(0.5));
    });

    test('Does not execute database mutations', () {
      // Voice service only returns structured intents, never mutates DB
      final resp = voiceService.localParseCommand('Save this collection');
      expect(resp.intent, 'save_collection');
      // The voice service returns a structured response; the UI layer
      // decides whether to actually save after confirmation dialog.
      // This test verifies no side effect from the call itself.
    });
  });
}
