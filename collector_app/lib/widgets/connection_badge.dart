import 'package:flutter/material.dart';
import '../services/connectivity_service.dart';

class ConnectionBadge extends StatelessWidget {
  final bool showToggle;

  const ConnectionBadge({super.key, this.showToggle = true});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: ConnectivityService.instance,
      builder: (context, _) {
        final service = ConnectivityService.instance;
        final status = service.status;

        Color bgColor;
        Color textColor;
        IconData icon;

        switch (status) {
          case ConnectionStateStatus.online:
            bgColor = const Color(0xFFD1FAE5);
            textColor = const Color(0xFF065F46);
            icon = Icons.wifi;
            break;
          case ConnectionStateStatus.offline:
            bgColor = const Color(0xFFFEF3C7);
            textColor = const Color(0xFF92400E);
            icon = Icons.wifi_off;
            break;
          case ConnectionStateStatus.syncing:
            bgColor = const Color(0xFFDBEAFE);
            textColor = const Color(0xFF1E40AF);
            icon = Icons.sync;
            break;
        }

        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: textColor.withAlpha(80)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon, size: 14, color: textColor),
                  const SizedBox(width: 4),
                  Text(
                    status.label,
                    style: TextStyle(
                      color: textColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),
            if (showToggle) ...[
              const SizedBox(width: 8),
              IconButton(
                tooltip: service.isManualOffline ? 'Disable Airplane Demo' : 'Simulate Offline (Airplane Mode)',
                icon: Icon(
                  service.isManualOffline ? Icons.flight_takeoff : Icons.flight,
                  color: service.isManualOffline ? Colors.orange : Colors.grey.shade600,
                  size: 20,
                ),
                onPressed: () {
                  service.setManualOffline(!service.isManualOffline);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      duration: const Duration(seconds: 2),
                      content: Text(
                        service.isManualOffline
                            ? '✈️ Airplane / Offline simulation ENABLED'
                            : '📶 Online network RESTORED',
                      ),
                    ),
                  );
                },
              ),
            ],
          ],
        );
      },
    );
  }
}
