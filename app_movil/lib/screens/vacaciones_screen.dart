import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

class VacacionesScreen extends StatefulWidget {
  const VacacionesScreen({super.key});

  @override
  State<VacacionesScreen> createState() => _VacacionesScreenState();
}

class _VacacionesScreenState extends State<VacacionesScreen> {
  List<dynamic> _vacaciones = [];
  bool _loading = true;
  String? _error;
  int? _idEmpleado;

  final _fechaInicioCtrl = TextEditingController();
  final _fechaFinCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  @override
  void dispose() {
    _fechaInicioCtrl.dispose();
    _fechaFinCtrl.dispose();
    super.dispose();
  }

  Future<void> _cargar() async {
    setState(() { _loading = true; _error = null; });
    try {
      _idEmpleado = await AuthService.getIdEmpleado();
      if (_idEmpleado == null) throw Exception('No se encontró el empleado');
      final data = await ApiService.get('/vacaciones/empleado/$_idEmpleado');
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

  int _diasEntre(String? inicio, String? fin) {
    if (inicio == null || fin == null) return 0;
    try {
      return DateTime.parse(fin).difference(DateTime.parse(inicio)).inDays + 1;
    } catch (_) { return 0; }
  }

  Color _colorEstado(String estado) {
    switch (estado) {
      case 'pendiente': return const Color(0xFFFBBF24);
      case 'aprobada': return const Color(0xFF34D399);
      case 'rechazada': return const Color(0xFFF87171);
      default: return const Color(0xFF9CA3AF);
    }
  }

  Future<void> _seleccionarFecha(TextEditingController ctrl) async {
    final manana = DateTime.now().add(const Duration(days: 1));
    final picked = await showDatePicker(
      context: context,
      initialDate: manana,
      firstDate: manana,
      lastDate: DateTime(2027),
      builder: (context, child) => Theme(
        data: ThemeData.dark().copyWith(
          colorScheme: const ColorScheme.dark(primary: Color(0xFF4F46E5)),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      ctrl.text = DateFormat('yyyy-MM-dd').format(picked);
    }
  }

  Future<void> _solicitarVacacion() async {
    final inicio = _fechaInicioCtrl.text.trim();
    final fin = _fechaFinCtrl.text.trim();

    if (inicio.isEmpty || fin.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Seleccioná ambas fechas'), backgroundColor: Color(0xFFF87171)));
      return;
    }

    try {
      await ApiService.post('/vacaciones', {
        'id_empleado': _idEmpleado,
        'fecha_inicio': inicio,
        'fecha_fin': fin,
      });
      Navigator.pop(context);
      _fechaInicioCtrl.clear();
      _fechaFinCtrl.clear();
      _cargar();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vacaciones solicitadas correctamente'),
          backgroundColor: Color(0xFF34D399)));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceAll('Exception: ', '')),
          backgroundColor: const Color(0xFFF87171)));
    }
  }

  void _abrirModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1a1a4e),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: EdgeInsets.only(
          left: 20, right: 20, top: 24,
          bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Solicitar vacaciones',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600, color: Colors.white)),
            const SizedBox(height: 20),
            _CampoFecha(label: 'Fecha inicio', ctrl: _fechaInicioCtrl,
              onTap: () => _seleccionarFecha(_fechaInicioCtrl)),
            const SizedBox(height: 12),
            _CampoFecha(label: 'Fecha fin', ctrl: _fechaFinCtrl,
              onTap: () => _seleccionarFecha(_fechaFinCtrl)),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _solicitarVacacion,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Enviar solicitud',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton(
        onPressed: _abrirModal,
        backgroundColor: const Color(0xFF4F46E5),
        child: const Icon(Icons.add),
      ),
      body: RefreshIndicator(
        onRefresh: _cargar,
        color: const Color(0xFF4F46E5),
        child: _loading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF4F46E5)))
            : _error != null
                ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
                : _vacaciones.isEmpty
                    ? const Center(child: Text('No tenés vacaciones registradas',
                        style: TextStyle(color: Color(0xFF9CA3AF))))
                    : ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          const Text('Mis vacaciones',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: Colors.white)),
                          const SizedBox(height: 12),
                          ..._vacaciones.map((v) => Container(
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
                                      '${_formatFecha(v['fecha_inicio']?.toString())} – ${_formatFecha(v['fecha_fin']?.toString())}',
                                      style: const TextStyle(fontSize: 13,
                                        fontWeight: FontWeight.w500, color: Colors.white),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: _colorEstado(v['estado']).withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(color: _colorEstado(v['estado']).withOpacity(0.3)),
                                      ),
                                      child: Text(v['estado'],
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500,
                                          color: _colorEstado(v['estado']))),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  '${_diasEntre(v['fecha_inicio']?.toString(), v['fecha_fin']?.toString())} días',
                                  style: const TextStyle(fontSize: 13, color: Color(0xFF9CA3AF)),
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

class _CampoFecha extends StatelessWidget {
  final String label;
  final TextEditingController ctrl;
  final VoidCallback onTap;

  const _CampoFecha({required this.label, required this.ctrl, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF), letterSpacing: 0.5)),
        const SizedBox(height: 6),
        GestureDetector(
          onTap: onTap,
          child: AbsorbPointer(
            child: TextField(
              controller: ctrl,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Seleccioná una fecha',
                hintStyle: const TextStyle(color: Color(0xFF6B7280)),
                filled: true,
                fillColor: Colors.white.withOpacity(0.06),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                ),
                suffixIcon: const Icon(Icons.calendar_today, color: Color(0xFF6B7280), size: 16),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
            ),
          ),
        ),
      ],
    );
  }
}