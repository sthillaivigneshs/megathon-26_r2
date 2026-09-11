import 'hazard_type.dart';

class CollectionItem {
  final String category;
  final String? subcategory;
  final int quantity;
  final double declaredWeight;
  final String? condition;
  final String? photoUrl;
  final String? photoHash;
  final HazardType hazardStatus;
  final double latitude;
  final double longitude;

  CollectionItem({
    required this.category,
    this.subcategory,
    this.quantity = 1,
    required this.declaredWeight,
    this.condition,
    this.photoUrl,
    this.photoHash,
    this.hazardStatus = HazardType.noHazard,
    required this.latitude,
    required this.longitude,
  });

  Map<String, dynamic> toJson() {
    return {
      'category': category,
      if (subcategory != null) 'subcategory': subcategory,
      'quantity': quantity,
      'declared_weight': declaredWeight,
      if (condition != null) 'condition': condition,
      if (photoUrl != null) 'photo_url': photoUrl,
      if (photoHash != null) 'photo_hash': photoHash,
      'hazard_status': hazardStatus.apiValue,
      'latitude': latitude,
      'longitude': longitude,
    };
  }

  factory CollectionItem.fromJson(Map<String, dynamic> json) {
    return CollectionItem(
      category: json['category'] as String? ?? 'Other E-Waste',
      subcategory: json['subcategory'] as String?,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      declaredWeight: (json['declared_weight'] as num?)?.toDouble() ?? 0.0,
      condition: json['condition'] as String?,
      photoUrl: json['photo_url'] as String?,
      photoHash: json['photo_hash'] as String?,
      hazardStatus: HazardType.fromApiValue(json['hazard_status'] as String?),
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
