import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

enum ConnectionStateStatus {
  online,
  offline,
  syncing;

  String get label {
    switch (this) {
      case ConnectionStateStatus.online:
        return 'ONLINE';
      case ConnectionStateStatus.offline:
        return 'OFFLINE';
      case ConnectionStateStatus.syncing:
        return 'SYNCING';
    }
  }
}

class ConnectivityService extends ChangeNotifier {
  static final ConnectivityService instance = ConnectivityService._internal();
  ConnectivityService._internal() {
    _init();
  }

  bool _isManualOffline = false; // Demo toggle for hackathon testing
  bool _isDeviceConnected = true;
  bool _isSyncing = false;
  StreamSubscription? _sub;

  bool get isOnline => !_isManualOffline && _isDeviceConnected;
  bool get isManualOffline => _isManualOffline;
  bool get isSyncing => _isSyncing;

  ConnectionStateStatus get status {
    if (_isSyncing) return ConnectionStateStatus.syncing;
    if (isOnline) return ConnectionStateStatus.online;
    return ConnectionStateStatus.offline;
  }

  void _init() {
    Connectivity().checkConnectivity().then((results) {
      _updateStatus(results);
    });

    _sub = Connectivity().onConnectivityChanged.listen((results) {
      _updateStatus(results);
    });
  }

  void _updateStatus(List<ConnectivityResult> results) {
    final connected = results.any((r) => r != ConnectivityResult.none);
    if (_isDeviceConnected != connected) {
      _isDeviceConnected = connected;
      notifyListeners();
    }
  }

  // Demo toggle: allows forcing offline mode for testing airplane-mode scenarios
  void setManualOffline(bool offline) {
    if (_isManualOffline != offline) {
      _isManualOffline = offline;
      notifyListeners();
    }
  }

  void setSyncing(bool syncing) {
    if (_isSyncing != syncing) {
      _isSyncing = syncing;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}
