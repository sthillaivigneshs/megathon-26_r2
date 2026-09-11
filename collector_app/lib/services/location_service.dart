import 'package:geolocator/geolocator.dart';
import 'package:flutter/foundation.dart';

class LocationCoordinates {
  final double latitude;
  final double longitude;
  final bool isMocked;

  LocationCoordinates({
    required this.latitude,
    required this.longitude,
    this.isMocked = false,
  });
}

class LocationService {
  static final LocationService instance = LocationService._internal();
  LocationService._internal();

  // Fallback demo coordinates (Bangalore Indiranagar Hub)
  static const double defaultLat = 12.9716;
  static const double defaultLon = 77.5946;

  Future<LocationCoordinates> getCurrentLocation() async {
    try {
      if (kIsWeb) {
        return LocationCoordinates(latitude: defaultLat, longitude: defaultLon, isMocked: true);
      }

      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return LocationCoordinates(latitude: defaultLat, longitude: defaultLon, isMocked: true);
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return LocationCoordinates(latitude: defaultLat, longitude: defaultLon, isMocked: true);
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return LocationCoordinates(latitude: defaultLat, longitude: defaultLon, isMocked: true);
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 5),
      );

      return LocationCoordinates(
        latitude: position.latitude,
        longitude: position.longitude,
        isMocked: position.isMocked,
      );
    } catch (e) {
      debugPrint('[LocationService] Using fallback GPS: $e');
      return LocationCoordinates(latitude: defaultLat, longitude: defaultLon, isMocked: true);
    }
  }
}
