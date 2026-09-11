enum HazardType {
  noHazard('No Hazard', 'no_hazard'),
  swollenBattery('Swollen Battery', 'swollen_battery'),
  damagedBattery('Damaged Battery', 'damaged_battery'),
  leakage('Leakage', 'leakage'),
  unknownHazard('Unknown Hazard', 'unknown');

  final String label;
  final String apiValue;

  const HazardType(this.label, this.apiValue);

  static HazardType fromApiValue(String? val) {
    if (val == null) return HazardType.noHazard;
    for (var h in HazardType.values) {
      if (h.apiValue == val || h.label == val) return h;
    }
    return HazardType.noHazard;
  }
}
