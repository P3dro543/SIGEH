import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';
import 'horario_screen.dart';
import 'inconsistencias_screen.dart';
import 'permisos_screen.dart';
import 'vacaciones_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  String _username = '';
  String _rol = '';

  final List<Widget> _screens = [
    const HorarioScreen(),
    const InconsistenciasScreen(),
    const PermisosScreen(),
    const VacacionesScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final username = await AuthService.getUsername();
    final rol = await AuthService.getRol();
    setState(() {
      _username = username ?? '';
      _rol = rol ?? '';
    });
  }

  Future<void> _logout() async {
    await AuthService.logout();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        backgroundColor: const Color(0xFF111827),
        elevation: 0,
        title: RichText(
          text: const TextSpan(
            children: [
              TextSpan(text: 'VIG', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w500)),
              TextSpan(text: 'SAFE', style: TextStyle(color: Color(0xFF1D4ED8), fontSize: 18, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: PopupMenuButton<String>(
              child: CircleAvatar(
                backgroundColor: const Color(0xFF1D4ED8),
                radius: 16,
                child: Text(
                  _username.isNotEmpty ? _username.substring(0, 2).toUpperCase() : 'U',
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500),
                ),
              ),
              itemBuilder: (_) => <PopupMenuEntry<String>>[
                PopupMenuItem<String>(
                  enabled: false,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_username, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
                      Text(_rol, style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 11)),
                    ],
                  ),
                ),
                const PopupMenuDivider(),
                PopupMenuItem<String>(
                  value: 'logout',
                  child: const Row(
                    children: [
                      Icon(Icons.logout, size: 16, color: Color(0xFFEF4444)),
                      SizedBox(width: 8),
                      Text('Cerrar sesión', style: TextStyle(color: Color(0xFFEF4444), fontSize: 13)),
                    ],
                  ),
                ),
              ],
              onSelected: (value) {
                if (value == 'logout') _logout();
              },
            ),
          ),
        ],
      ),
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        backgroundColor: const Color(0xFF111827),
        selectedItemColor: const Color(0xFF1D4ED8),
        unselectedItemColor: const Color(0xFF6B7280),
        selectedLabelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today_outlined), label: 'Horario'),
          BottomNavigationBarItem(icon: Icon(Icons.warning_amber_outlined), label: 'Inconsistencias'),
          BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), label: 'Permisos'),
          BottomNavigationBarItem(icon: Icon(Icons.beach_access_outlined), label: 'Vacaciones'),
        ],
      ),
    );
  }
}