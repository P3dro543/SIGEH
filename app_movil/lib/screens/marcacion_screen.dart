import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

class MarcacionScreen extends StatefulWidget {
  const MarcacionScreen({super.key});

  @override
  State<MarcacionScreen> createState() => _MarcacionScreenState();
}

class _MarcacionScreenState extends State<MarcacionScreen> {
  Map<String, dynamic>? _asistenciaHoy;
  Map<String, dynamic>? _horario;
  bool _loading = true;
  String? _error;
  int? _idEmpleado;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() { _loading = true; _error = null; });
    try {
      _idEmpleado = await AuthService.getIdEmpleado();
      if (_idEmpleado == null) throw Exception('No se encontró el empleado');

      final asistencias = await ApiService.get('/asistencias/empleado/$_idEmpleado');
      final horarios = await ApiService.get('/horarios/empleado/$_idEmpleado');

  final hoy = DateFormat('yyyy-MM-dd').format(DateTime.now());
  final asistenciaHoy = asistencias.where((a) {
    final fecha = a['fecha']?.toString() ?? '';
    final fechaLocal = fecha.length >= 10 ? fecha.substring(0, 10) : fecha;
    return fechaLocal == hoy;
  }).toList();

      setState(() {
        _asistenciaHoy = asistenciaHoy.isNotEmpty ? asistenciaHoy.first : null;
        _horario = horarios.isNotEmpty ? horarios.first : null;
      });
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _marcarEntrada() async {
    try {
      await ApiService.post('/asistencias/entrada/$_idEmpleado', {});
      _cargar();
      _mostrarSnack('Entrada registrada correctamente', const Color(0xFF34D399));
    } catch (e) {
      _mostrarSnack(e.toString().replaceAll('Exception: ', ''), const Color(0xFFF87171));
    }
  }

  Future<void> _marcarSalida() async {
    try {
      await ApiService.post('/asistencias/salida/$_idEmpleado', {});
      _cargar();
      _mostrarSnack('Salida registrada correctamente', const Color(0xFF34D399));
    } catch (e) {
      _mostrarSnack(e.toString().replaceAll('Exception: ', ''), const Color(0xFFF87171));
    }
  }

  void _mostrarSnack(String msg, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: color));
  }

  String _formatHora(String? hora) {
    if (hora == null) return '–';
    try {
      return DateFormat('HH:mm').format(DateTime.parse(hora));
    } catch (_) { return hora; }
  }

  @override
  Widget build(BuildContext context) {
    final ahora = DateFormat('EEEE, d \'de\' MMMM yyyy', 'es').format(DateTime.now());

    return RefreshIndicator(
      onRefresh: _cargar,
      color: const Color(0xFF4F46E5),
      child: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF4F46E5)))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Text(ahora,
                      style: const TextStyle(fontSize: 13, color: Color(0xFF9CA3AF))),
                    const SizedBox(height: 20),

                    // Jornada activa
                    if (_horario != null)
                      Container(
                        padding: const EdgeInsets.all(16),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white.withOpacity(0.1)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Tu jornada hoy',
                              style: TextStyle(fontSize: 11, color: Color(0xFF818CF8), letterSpacing: 0.5)),
                            const SizedBox(height: 8),
                            Text(_horario!['jornada'] ?? '–',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                _InfoItem(label: 'Entrada esperada', value: _horario!['hora_inicio'] ?? '–'),
                                const SizedBox(width: 24),
                                _InfoItem(label: 'Salida esperada', value: _horario!['hora_fin'] ?? '–'),
                              ],
                            ),
                          ],
                        ),
                      ),

                    // Estado actual
                    Container(
                      padding: const EdgeInsets.all(20),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.white.withOpacity(0.1)),
                      ),
                      child: Column(
                        children: [
                          Icon(
                            _asistenciaHoy?.containsKey('hora_salida') == true && _asistenciaHoy!['hora_salida'] != null
                                ? Icons.check_circle_outline
                                : _asistenciaHoy != null
                                    ? Icons.access_time
                                    : Icons.radio_button_unchecked,
                            size: 48,
                            color: _asistenciaHoy?.containsKey('hora_salida') == true && _asistenciaHoy!['hora_salida'] != null
                                ? const Color(0xFF34D399)
                                : _asistenciaHoy != null
                                    ? const Color(0xFFFBBF24)
                                    : const Color(0xFF9CA3AF),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _asistenciaHoy?.containsKey('hora_salida') == true && _asistenciaHoy!['hora_salida'] != null
                                ? 'Jornada completada'
                                : _asistenciaHoy != null
                                    ? 'En turno'
                                    : 'Sin marcar hoy',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              _InfoItem(
                                label: 'Entrada',
                                value: _formatHora(_asistenciaHoy?['hora_entrada']?.toString()),
                              ),
                              const SizedBox(width: 32),
                              _InfoItem(
                                label: 'Salida',
                                value: _formatHora(_asistenciaHoy?['hora_salida']?.toString()),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Botones
                    if (_asistenciaHoy == null)
                      _BotonMarcacion(
                        label: 'Marcar entrada',
                        color: const Color(0xFF4F46E5),
                        onTap: _marcarEntrada,
                      ),

                    if (_asistenciaHoy != null && _asistenciaHoy!['hora_salida'] == null)
                      _BotonMarcacion(
                        label: 'Marcar salida',
                        color: const Color(0xFF059669),
                        onTap: _marcarSalida,
                      ),

                    if (_asistenciaHoy != null && _asistenciaHoy!['hora_salida'] != null)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF34D399).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF34D399).withOpacity(0.3)),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.check, color: Color(0xFF34D399), size: 18),
                            SizedBox(width: 8),
                            Text('Jornada completada por hoy',
                              style: TextStyle(color: Color(0xFF34D399), fontSize: 13, fontWeight: FontWeight.w500)),
                          ],
                        ),
                      ),
                  ],
                ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  final String label;
  final String value;

  const _InfoItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF9CA3AF), letterSpacing: 0.5)),
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.white)),
      ],
    );
  }
}

class _BotonMarcacion extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _BotonMarcacion({required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: color.withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4))],
        ),
        child: Text(label,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
      ),
    );
  }
}