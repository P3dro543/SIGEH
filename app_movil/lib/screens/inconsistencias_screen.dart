import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

class InconsistenciasScreen extends StatefulWidget {
  const InconsistenciasScreen({super.key});

  @override
  State<InconsistenciasScreen> createState() => _InconsistenciasScreenState();
}

class _InconsistenciasScreenState extends State<InconsistenciasScreen> {
  List<dynamic> _inconsistencias = [];
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
      final idEmpleado = await AuthService.getIdEmpleado();
      if (idEmpleado == null) throw Exception('No se encontró el empleado');

      final data = await ApiService.get('/inconsistencias?id_empleado=$idEmpleado');
      setState(() => _inconsistencias = data);
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      setState(() => _loading = false);
    }
  }

  String _formatFecha(String? fecha) {
    if (fecha == null) return '–';
    try {
      return DateFormat('dd/MM/yyyy HH:mm').format(DateTime.parse(fecha));
    } catch (_) { return fecha; }
  }

  Color _colorTipo(String tipo) {
    switch (tipo) {
      case 'tardanza': return const Color(0xFFFBBF24);
      case 'ausencia': return const Color(0xFFF87171);
      case 'salida_anticipada': return const Color(0xFF60A5FA);
      default: return const Color(0xFF9CA3AF);
    }
  }

  Color _colorEstado(String estado) {
    switch (estado) {
      case 'pendiente': return const Color(0xFFFBBF24);
      case 'justificada': return const Color(0xFF34D399);
      case 'cubierta': return const Color(0xFF60A5FA);
      default: return const Color(0xFF9CA3AF);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: RefreshIndicator(
        onRefresh: _cargar,
        color: const Color(0xFF4F46E5),
        child: _loading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF4F46E5)))
            : _error != null
                ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
                : _inconsistencias.isEmpty
                    ? const Center(
                        child: Text('No tenés inconsistencias registradas',
                          style: TextStyle(color: Color(0xFF9CA3AF))))
                    : ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          const Text('Mis inconsistencias',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: Colors.white)),
                          const SizedBox(height: 12),
                          ..._inconsistencias.map((i) => Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.06),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    _Badge(texto: i['tipo'], color: _colorTipo(i['tipo'])),
                                    _Badge(texto: i['estado'], color: _colorEstado(i['estado'])),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  i['descripcion'] ?? '–',
                                  style: const TextStyle(fontSize: 13, color: Color(0xFFD1D5DB)),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  _formatFecha(i['fecha_hora']?.toString()),
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
                                ),
                              ],
                            ),
                          )),
                        ],
                      ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String texto;
  final Color color;

  const _Badge({required this.texto, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(texto,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: color)),
    );
  }
}