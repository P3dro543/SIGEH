import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

class HorarioScreen extends StatefulWidget {
  const HorarioScreen({super.key});

  @override
  State<HorarioScreen> createState() => _HorarioScreenState();
}

class _HorarioScreenState extends State<HorarioScreen> {
  List<dynamic> _asistencias = [];
  Map<String, dynamic>? _horarioActivo;
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

      final data = await ApiService.get('/asistencias/empleado/$idEmpleado');
      final horario = await ApiService.get('/horarios/empleado/$idEmpleado');

      setState(() {
        _asistencias = data;
        _horarioActivo = horario.isNotEmpty ? horario[0] : null;
      });
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

  String _formatHora(String? hora) {
    if (hora == null) return '–';
    try {
      return DateFormat('HH:mm').format(DateTime.parse(hora));
    } catch (_) { return hora; }
  }

  @override
  Widget build(BuildContext context) {
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
                    if (_horarioActivo != null) ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF4F46E5).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF4F46E5).withOpacity(0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Jornada activa', style: TextStyle(fontSize: 11, color: Color(0xFF818CF8), letterSpacing: 0.5)),
                            const SizedBox(height: 6),
                            Text(
                              _horarioActivo!['jornada'] ?? '–',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                _InfoChip(label: 'Entrada', value: _horarioActivo!['hora_inicio'] ?? '–'),
                                const SizedBox(width: 16),
                                _InfoChip(label: 'Salida', value: _horarioActivo!['hora_fin'] ?? '–'),
                                const SizedBox(width: 16),
                                _InfoChip(label: 'Horas máx.', value: '${_horarioActivo!['horas_maximas'] ?? '–'}h'),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    const Text('Mi asistencia reciente',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: Colors.white)),
                    const SizedBox(height: 12),

                    if (_asistencias.isEmpty)
                      const Center(child: Text('No hay registros', style: TextStyle(color: Color(0xFF9CA3AF))))
                    else
                      ..._asistencias.map((a) => _AsistenciaCard(
                        asistencia: a,
                        formatFecha: _formatFecha,
                        formatHora: _formatHora,
                      )),
                  ],
                ),
    );
  }
}

class _AsistenciaCard extends StatelessWidget {
  final dynamic asistencia;
  final String Function(String?) formatFecha;
  final String Function(String?) formatHora;

  const _AsistenciaCard({required this.asistencia, required this.formatFecha, required this.formatHora});

  @override
  Widget build(BuildContext context) {
    final tieneSalida = asistencia['hora_salida'] != null;
    final tieneEntrada = asistencia['hora_entrada'] != null;

    return Container(
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
              Text(
                formatFecha(asistencia['fecha']?.toString()),
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Colors.white),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: tieneSalida
                      ? const Color(0xFF34D399).withOpacity(0.15)
                      : tieneEntrada
                          ? const Color(0xFFFBBF24).withOpacity(0.15)
                          : const Color(0xFFF87171).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: tieneSalida
                        ? const Color(0xFF34D399).withOpacity(0.3)
                        : tieneEntrada
                            ? const Color(0xFFFBBF24).withOpacity(0.3)
                            : const Color(0xFFF87171).withOpacity(0.3),
                  ),
                ),
                child: Text(
                  tieneSalida ? 'Completo' : tieneEntrada ? 'En turno' : 'Ausente',
                  style: TextStyle(
                    fontSize: 11, fontWeight: FontWeight.w500,
                    color: tieneSalida
                        ? const Color(0xFF34D399)
                        : tieneEntrada
                            ? const Color(0xFFFBBF24)
                            : const Color(0xFFF87171),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _InfoChip(label: 'Entrada', value: formatHora(asistencia['hora_entrada']?.toString())),
              const SizedBox(width: 16),
              _InfoChip(label: 'Salida', value: formatHora(asistencia['hora_salida']?.toString())),
            ],
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final String value;

  const _InfoChip({required this.label, required this.value});

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