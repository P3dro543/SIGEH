import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';
import 'marcacion_screen.dart';
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
    const MarcacionScreen(),
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
      backgroundColor: const Color(0xFF0f0c29),
      extendBody: true,
      appBar: AppBar(
        backgroundColor: Colors.white.withOpacity(0.05),
        elevation: 0,
        title: RichText(
          text: const TextSpan(
            children: [
              TextSpan(text: 'VIG', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600)),
              TextSpan(text: 'SAFE', style: TextStyle(color: Color(0xFF818CF8), fontSize: 18, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: PopupMenuButton<String>(
              color: const Color(0xFF1a1a4e),
              child: CircleAvatar(
                backgroundColor: const Color(0xFF4F46E5),
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
                      Text(_username, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13, color: Colors.white)),
                      Text(_rol, style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 11)),
                    ],
                  ),
                ),
                const PopupMenuDivider(),
                PopupMenuItem<String>(
                  value: 'logout',
                  child: const Row(
                    children: [
                      Icon(Icons.logout, size: 16, color: Color(0xFFF87171)),
                      SizedBox(width: 8),
                      Text('Cerrar sesión', style: TextStyle(color: Color(0xFFF87171), fontSize: 13)),
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
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0f0c29), Color(0xFF1a1a4e), Color(0xFF24243e)],
          ),
        ),
        child: _screens[_selectedIndex],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1))),
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (index) => setState(() => _selectedIndex = index),
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.transparent,
          selectedItemColor: const Color(0xFF818CF8),
          unselectedItemColor: const Color(0xFF6B7280),
          selectedLabelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.w500),
          unselectedLabelStyle: const TextStyle(fontSize: 10),
          elevation: 0,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.fingerprint, size: 22), label: 'Marcación'),
            BottomNavigationBarItem(icon: Icon(Icons.calendar_today_outlined, size: 20), label: 'Horario'),
            BottomNavigationBarItem(icon: Icon(Icons.warning_amber_outlined, size: 20), label: 'Alertas'),
            BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined, size: 20), label: 'Permisos'),
            BottomNavigationBarItem(icon: Icon(Icons.beach_access_outlined, size: 20), label: 'Vacaciones'),
          ],
        ),
      ),
    );
  }
}