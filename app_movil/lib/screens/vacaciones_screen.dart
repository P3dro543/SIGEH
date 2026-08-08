import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class VacacionesScreen extends StatefulWidget {
  const VacacionesScreen({super.key});

  @override
  State<VacacionesScreen> createState() => _VacacionesScreenState();
}

class _VacacionesScreenState extends State<VacacionesScreen> {
  List<dynamic> _vacaciones = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() { _loading = true; _error = null; });
    try {
      final data = await ApiService.get('/vacaciones');
      setState(() => _vacaciones = data);
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      setState(() => _loading = false);
    }
  }

  String _formatFecha(String? fecha) {
    if (fecha == null) return '–';
    try {
      return DateFormat('dd/MM/yyyy').format(DateTime.parse(fecha));
    } catch (_) { return fecha; }
  }

  Color _colorEstado(String estado) {
    switch (estado) {
      case 'pendiente': return const Color(0xFFFEF3C7);
      case 'aprobada': return const Color(0xFFD1FAE5);
      case 'rechazada': return const Color(0xFFFEE2E2);
      default: return const Color(0xFFF3F4F6);
    }
  }

  Color _colorTextoEstado(String estado) {
    switch (estado) {
      case 'pendiente': return const Color(0xFF92400E);
      case 'aprobada': return const Color(0xFF065F46);
      case 'rechazada': return const Color(0xFF991B1B);
      default: return const Color(0xFF6B7280);
    }
  }

  int _diasEntre(String? inicio, String? fin) {
    if (inicio == null || fin == null) return 0;
    try {
      final i = DateTime.parse(inicio);
      final f = DateTime.parse(fin);
      return f.difference(i).inDays + 1;
    } catch (_) { return 0; }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _cargar,
      color: const Color(0xFF1D4ED8),
      child: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF1D4ED8)))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : _vacaciones.isEmpty
                  ? const Center(child: Text('No hay solicitudes de vacaciones'))
                  : ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        const Text('Mis vacaciones', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: Color(0xFF111827))),
                        const SizedBox(height: 12),
                        ..._vacaciones.map((v) => Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFE5E7EB)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${_formatFecha(v['fecha_inicio']?.toString())} – ${_formatFecha(v['fecha_fin']?.toString())}',
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF111827)),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: _colorEstado(v['estado']),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      v['estado'],
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: _colorTextoEstado(v['estado'])),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '${_diasEntre(v['fecha_inicio']?.toString(), v['fecha_fin']?.toString())} días',
                                style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
                              ),
                            ],
                          ),
                        )),
                      ],
                    ),
    );
  }
}