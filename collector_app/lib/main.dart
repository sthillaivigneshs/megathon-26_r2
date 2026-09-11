import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'services/database_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Ensure SQLite is initialized
  await DatabaseService.instance.database;

  runApp(const ReLoopCollectorApp());
}

class ReLoopCollectorApp extends StatelessWidget {
  const ReLoopCollectorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ReLoop Collector',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF059669),
          primary: const Color(0xFF059669),
          secondary: const Color(0xFF2563EB),
        ),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}
