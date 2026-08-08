auth.verificarAcceso();
navbar.render('asistencia.html');

let asistenciasData = [];

const asistenciaModule = {
  cargar: async () => {
    ui.loader(true);
    try {
      asistenciasData = await api.get('/asistencias');
      asistenciaModule.renderTabla(asistenciasData);
    } catch (err) {
      ui.alerta('Error cargando asistencias', 'error');
    } finally {
      ui.loader(false);
    }
  },

  renderTabla: (datos) => {
    ui.tabla(
      'tabla-asistencia',
      [
        { label: 'Empleado', key: 'nombre_completo' },
        { label: 'Cédula', key: 'cedula' },
        { label: 'Fecha', key: 'fecha_fmt' },
        { label: 'Entrada', key: 'entrada_fmt' },
        { label: 'Salida', key: 'salida_fmt' },
        { label: 'Estado', key: 'estado_fmt' },
      ],
      datos.map(a => ({
        ...a,
        nombre_completo: `${a.nombre} ${a.apellido}`,
        fecha_fmt: a.fecha
          ? new Date(a.fecha).toLocaleDateString('es-CR')
          : '–',
        entrada_fmt: a.hora_entrada
          ? new Date(a.hora_entrada).toLocaleTimeString('es-CR', {
              hour: '2-digit',
              minute: '2-digit'
            })
          : '–',
        salida_fmt: a.hora_salida
          ? new Date(a.hora_salida).toLocaleTimeString('es-CR', {
              hour: '2-digit',
              minute: '2-digit'
            })
          : '–',
        estado_fmt: a.hora_salida
          ? '<span class="badge badge-green">Completo</span>'
          : a.hora_entrada
            ? '<span class="badge badge-amber">En turno</span>'
            : '<span class="badge badge-red">Ausente</span>',
        _estado: a.hora_salida
          ? 'completo'
          : a.hora_entrada
            ? 'turno'
            : 'ausente'
      }))
    );
  },

  filtrar: () => {
    const busqueda = document.getElementById('filtro-busqueda').value.toLowerCase();
    const estado = document.getElementById('filtro-estado').value;
    const fecha = document.getElementById('filtro-fecha').value;

    const filtrados = asistenciasData.filter(a => {
      const texto = `${a.nombre} ${a.apellido} ${a.cedula}`.toLowerCase();

      const coincideBusqueda =
        !busqueda || texto.includes(busqueda);

      const estadoReal = a.hora_salida
        ? 'completo'
        : a.hora_entrada
          ? 'turno'
          : 'ausente';

      const coincideEstado =
        !estado || estadoReal === estado;

      const fechaReal = a.fecha
        ? a.fecha.split('T')[0]
        : '';

      const coincideFecha =
        !fecha || fechaReal === fecha;

      return coincideBusqueda && coincideEstado && coincideFecha;
    });

    asistenciaModule.renderTabla(filtrados);
  },

  limpiarFiltros: () => {
    document.getElementById('filtro-busqueda').value = '';
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-fecha').value = '';

    asistenciaModule.renderTabla(asistenciasData);
  },

  getIdEmpleado: () => {
    const select = document.getElementById('f-id-empleado');

    return select.tomselect
      ? parseInt(select.tomselect.getValue())
      : parseInt(select.value);
  },

  marcarEntrada: async () => {
    const id = asistenciaModule.getIdEmpleado();

    if (!id) {
      ui.alerta('Seleccioná un empleado', 'warning');
      return;
    }

    try {
      await api.post(`/asistencias/entrada/${id}`);
      ui.alerta('Entrada registrada correctamente', 'success');
      asistenciaModule.cargar();
    } catch (err) {
      ui.alerta(err.message, 'error');
    }
  },

  marcarSalida: async () => {
    const id = asistenciaModule.getIdEmpleado();

    if (!id) {
      ui.alerta('Seleccioná un empleado', 'warning');
      return;
    }

    try {
      await api.post(`/asistencias/salida/${id}`);
      ui.alerta('Salida registrada correctamente', 'success');
      asistenciaModule.cargar();
    } catch (err) {
      ui.alerta(err.message, 'error');
    }
  }
};

cargarEmpleados('f-id-empleado');
asistenciaModule.cargar();