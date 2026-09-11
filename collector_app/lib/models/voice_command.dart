import 'hazard_type.dart';

class VoiceCommandItem {
  final String category;
  final String? subcategory;
  final int quantity;
  final double? declaredWeight;
  final HazardType hazardStatus;

  VoiceCommandItem({
    required this.category,
    this.subcategory,
    this.quantity = 1,
    this.declaredWeight,
    this.hazardStatus = HazardType.noHazard,
  });

  factory VoiceCommandItem.fromJson(Map<String, dynamic> json) {
    return VoiceCommandItem(
      category: json['category'] as String? ?? 'Other E-Waste',
      subcategory: json['subcategory'] as String?,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      declaredWeight: (json['declared_weight'] as num?)?.toDouble(),
      hazardStatus: HazardType.fromApiValue(json['hazard_status'] as String?),
    );
  }

  Map<String, dynamic> toJson() => {
    'category': category,
    if (subcategory != null) 'subcategory': subcategory,
    'quantity': quantity,
    if (declaredWeight != null) 'declared_weight': declaredWeight,
    'hazard_status': hazardStatus.apiValue,
  };
}

class VoiceCommandResponse {
  final String intent;
  final List<VoiceCommandItem> items;
  final double? totalWeightKg;
  final HazardType hazardStatus;
  final String? notes;
  final double confidence;
  final bool requiresConfirmation;
  final String spokenFeedback;
  final String? rawTranscript;
  final String language;
  final String provider;

  VoiceCommandResponse({
    required this.intent,
    this.items = const [],
    this.totalWeightKg,
    this.hazardStatus = HazardType.noHazard,
    this.notes,
    this.confidence = 0.0,
    this.requiresConfirmation = false,
    required this.spokenFeedback,
    this.rawTranscript,
    this.language = 'en',
    this.provider = 'demo',
  });

  factory VoiceCommandResponse.fromJson(Map<String, dynamic> json) {
    var rawItems = json['items'] as List<dynamic>? ?? [];
    var parsedItems = rawItems
        .map((i) => VoiceCommandItem.fromJson(i as Map<String, dynamic>))
        .toList();

    return VoiceCommandResponse(
      intent: json['intent'] as String? ?? 'unknown',
      items: parsedItems,
      totalWeightKg: (json['total_weight_kg'] as num?)?.toDouble(),
      hazardStatus: HazardType.fromApiValue(json['hazard_status'] as String?),
      notes: json['notes'] as String?,
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0.0,
      requiresConfirmation: json['requires_confirmation'] as bool? ?? false,
      spokenFeedback: json['spoken_feedback'] as String? ?? '',
      rawTranscript: json['raw_transcript'] as String?,
      language: json['language'] as String? ?? 'en',
      provider: json['provider'] as String? ?? 'demo',
    );
  }

  Map<String, dynamic> toJson() => {
    'intent': intent,
    'items': items.map((i) => i.toJson()).toList(),
    if (totalWeightKg != null) 'total_weight_kg': totalWeightKg,
    'hazard_status': hazardStatus.apiValue,
    if (notes != null) 'notes': notes,
    'confidence': confidence,
    'requires_confirmation': requiresConfirmation,
    'spoken_feedback': spokenFeedback,
    if (rawTranscript != null) 'raw_transcript': rawTranscript,
    'language': language,
    'provider': provider,
  };
}
