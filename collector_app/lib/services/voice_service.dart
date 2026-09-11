import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/voice_command.dart';
import '../models/hazard_type.dart';
import 'connectivity_service.dart';

class VoiceService {
  static final VoiceService instance = VoiceService._internal();
  VoiceService._internal();

  static const String defaultBaseUrl = 'http://localhost:8000';

  Future<VoiceCommandResponse> processCommand(
    String text, {
    String? token,
    String? baseUrl,
  }) async {
    final cleanText = text.trim();
    if (cleanText.isEmpty) {
      return VoiceCommandResponse(
        intent: 'unknown',
        spokenFeedback: 'No command text provided.',
        confidence: 0.0,
        provider: 'local',
      );
    }

    final isOnline = ConnectivityService.instance.isOnline;
    final activeBaseUrl = baseUrl ?? defaultBaseUrl;

    // 1. If online and token provided, try backend voice API first
    if (isOnline && token != null && token.isNotEmpty) {
      try {
        final uri = Uri.parse('$activeBaseUrl/api/v1/voice/parse-command');
        final resp = await http.post(
          uri,
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({'command_text': cleanText}),
        ).timeout(const Duration(seconds: 4));

        if (resp.statusCode == 200) {
          final data = jsonDecode(resp.body) as Map<String, dynamic>;
          return VoiceCommandResponse.fromJson(data);
        }
      } catch (_) {
        // Network timeout / connection error - fall through to offline local parser
      }
    }

    // 2. Offline deterministic fallback
    return localParseCommand(cleanText);
  }

  VoiceCommandResponse localParseCommand(String text) {
    final lower = text.toLowerCase();
    final isHindi = lower.contains('karo') ||
        lower.contains('hai') ||
        lower.contains('kilo') ||
        lower.contains('wajan') ||
        lower.contains('jodo') ||
        lower.contains('kiya') ||
        lower.contains('jama');

    // Cancel
    if (lower.contains('cancel') ||
        lower.contains('radd') ||
        lower.contains('chhor do') ||
        lower.contains('hatao') ||
        lower.contains('stop') ||
        lower.contains('abort')) {
      return VoiceCommandResponse(
        intent: 'cancel',
        confidence: 0.95,
        spokenFeedback: isHindi ? 'कमांड रद्द कर दी गई।' : 'Command cancelled.',
        rawTranscript: text,
        language: isHindi ? 'hi' : 'en',
        provider: 'local_offline',
      );
    }

    // Save collection (Explicit save commands, not sentences reporting item collections)
    final isExplicitSave = lower.contains('save this') ||
        lower.contains('save collection') ||
        lower.contains('submit collection') ||
        lower.contains('kolekshan save') ||
        lower.contains('save karo') ||
        lower.contains('jama karo') ||
        lower.trim() == 'save' ||
        lower.trim() == 'submit' ||
        lower.trim() == 'jama';

    if (isExplicitSave) {
      return VoiceCommandResponse(
        intent: 'save_collection',
        confidence: 0.95,
        requiresConfirmation: true,
        spokenFeedback: isHindi
            ? 'क्या आप इस कलेक्शन को सुरक्षित सेव करना चाहते हैं?'
            : 'Ready to save collection. Please confirm to proceed.',
        rawTranscript: text,
        language: isHindi ? 'hi' : 'en',
        provider: 'local_offline',
      );
    }

    // Trigger sync
    if (lower.contains('sync') || lower.contains('upload') || lower.contains('bhejo')) {
      return VoiceCommandResponse(
        intent: 'trigger_sync',
        confidence: 0.95,
        spokenFeedback: isHindi ? 'सिंक शुरू किया जा रहा है...' : 'Syncing pending collections...',
        rawTranscript: text,
        language: isHindi ? 'hi' : 'en',
        provider: 'local_offline',
      );
    }

    // Hazard detection
    HazardType hazard = HazardType.noHazard;
    if (lower.contains('swollen') || lower.contains('phooli') || lower.contains('fooli')) {
      hazard = HazardType.swollenBattery;
    } else if (lower.contains('leak') || lower.contains('ras') || lower.contains('bah')) {
      hazard = HazardType.leakage;
    } else if (lower.contains('broken battery') || lower.contains('damaged battery') || lower.contains('tooti')) {
      hazard = HazardType.damagedBattery;
    }

    if (hazard != HazardType.noHazard &&
        !lower.contains('laptop') &&
        !lower.contains('phone') &&
        !lower.contains('mobile')) {
      return VoiceCommandResponse(
        intent: 'report_hazard',
        hazardStatus: hazard,
        confidence: 0.92,
        spokenFeedback: isHindi
            ? 'खतरा दर्ज किया गया: ${hazard.label}।'
            : 'Hazard flagged: ${hazard.label}.',
        rawTranscript: text,
        language: isHindi ? 'hi' : 'en',
        provider: 'local_offline',
      );
    }

    // Weight extraction: look for number preceding kg/kilo/etc
    double? weight;
    final weightMatch = RegExp(r'(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilo|kilos|kilograms?|किलो|किग्रा)\b').firstMatch(lower);
    if (weightMatch != null) {
      weight = double.tryParse(weightMatch.group(1) ?? '');
    }

    // Category detection
    String? category;
    if (lower.contains('laptop') || lower.contains('macbook') || lower.contains('notebook')) {
      category = 'Laptop';
    } else if (lower.contains('phone') || lower.contains('mobile') || lower.contains('smartphone') || lower.contains('iphone')) {
      category = 'Mobile';
    } else if (lower.contains('printer') || lower.contains('scanner')) {
      category = 'Printer';
    } else if (lower.contains('tv') || lower.contains('television') || lower.contains('screen') || lower.contains('monitor')) {
      category = 'Television / Screen';
    } else if (lower.contains('charger') || lower.contains('cable') || lower.contains('wire') || lower.contains('adapter')) {
      category = 'Charger / Cable';
    } else if (lower.contains('battery') || lower.contains('cell')) {
      category = 'Battery';
    } else if (lower.contains('pcb') || lower.contains('motherboard') || lower.contains('circuit')) {
      category = 'PCB / Motherboard';
    }

    // Number extraction: find first integer that is not the start of the weight match
    int quantity = 1;
    final allDigitMatches = RegExp(r'\b(\d+)\b').allMatches(lower);
    for (final m in allDigitMatches) {
      if (weightMatch != null && m.start == weightMatch.start) {
        continue;
      }
      final parsed = int.tryParse(m.group(1) ?? '');
      if (parsed != null && parsed > 0) {
        quantity = parsed;
        break;
      }
    }

    if (quantity == 1) {
      if (RegExp(r'\b(do|दो)\b').hasMatch(lower)) {
        quantity = 2;
      } else if (RegExp(r'\b(teen|तीन)\b').hasMatch(lower)) {
        quantity = 3;
      } else if (RegExp(r'\b(char|चार)\b').hasMatch(lower)) {
        quantity = 4;
      } else if (RegExp(r'\b(paanch|पाँच|पांच)\b').hasMatch(lower)) {
        quantity = 5;
      }
    }

    if (category != null) {
      final item = VoiceCommandItem(
        category: category,
        quantity: quantity,
        declaredWeight: weight,
        hazardStatus: hazard,
      );
      final weightText = weight != null ? ', weight $weight kg' : '';
      return VoiceCommandResponse(
        intent: lower.contains('add') || lower.contains('jodo') ? 'add_item' : 'create_collection',
        items: [item],
        totalWeightKg: weight,
        hazardStatus: hazard,
        confidence: 0.94,
        spokenFeedback: isHindi
            ? '$quantity $category दर्ज किया गया$weightText।'
            : 'Recorded $quantity $category$weightText.',
        rawTranscript: text,
        language: isHindi ? 'hi' : 'en',
        provider: 'local_offline',
      );
    }

    if (weight != null) {
      return VoiceCommandResponse(
        intent: 'update_weight',
        totalWeightKg: weight,
        confidence: 0.90,
        spokenFeedback: isHindi ? 'वजन $weight kg दर्ज किया गया।' : 'Weight updated to $weight kg.',
        rawTranscript: text,
        language: isHindi ? 'hi' : 'en',
        provider: 'local_offline',
      );
    }

    return VoiceCommandResponse(
      intent: 'unknown',
      confidence: 0.40,
      spokenFeedback: isHindi
          ? 'कमांड समझ नहीं आई। आप बोल सकते हैं: "2 लैपटॉप 3 किलो" या "कलेक्शन सेव करो"।'
          : 'Command not recognized. Try: "Collect 2 phones 1 kg" or "Save collection".',
      rawTranscript: text,
      language: isHindi ? 'hi' : 'en',
      provider: 'local_offline',
    );
  }
}
