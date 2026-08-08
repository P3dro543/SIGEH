auth.verificarAcceso();
navbar.render('vacaciones.html');

let vacacionesData = [];

const vacacionesModule = {
  cargar: async () => {
    ui.loader(true);

    try {
      vacacionesData = await api.get('/vacaciones');
      vacacionesModule.renderTabla(vacacionesData);
    } catch (err) {
      ui.alerta('Error cargando vacaciones', 'error');
    } finally {
      ui.loader(false);
    }
  },

  renderTabla: (datos) => {
    ui.tabla(
      'tabla-vacaciones',
      [
        { label: 'Empleado', key: 'nombre_completo' },
        { label: 'Cédula', key: 'cedula' },
        { label: 'Fecha inicio', key: 'inicio_fmt' },
        { label: 'Fecha fin', key: 'fin_fmt' },
        { label: 'Días', key: 'dias' },
        { label: 'Estado', key: 'estado_fmt' },
      ],
      datos.map(v => ({
        ...v,
        nombre_completo: `${v.nombre} ${v.apellido}`,
        inicio_fmt: new Date(v.fecha_inicio).toLocaleDateString('es-CR'),
        fin_fmt: new Date(v.fecha_fin).toLocaleDateString('es-CR'),
        dias:
          Math.round(
            (new Date(v.fecha_fin) - new Date(v.fecha_inicio)) /
              (1000 * 60 * 60 * 24)
          ) + 1,
        estado_fmt: vacacionesModule.badgeEstado(v.estado)
      })),
      (vacacion) =>
        vacacion.estado === 'pendiente'
          ? `
            <div style="display:flex;gap:6px;">
              <button class="btn btn-success" onclick="vacacionesModule.aprobar(${vacacion.id_vacacion})">Aprobar</button>
              <button class="btn btn-danger" onclick="vacacionesModule.rechazar(${vacacion.id_vacacion})">Rechazar</button>
            </div>
          `
          : '–'
    );
  },

  filtrar: () => {
    const busqueda = document
      .getElementById('filtro-busqueda')
      .value.toLowerCase();

    const estado = document.getElementById('filtro-estado').value;

    const filtrados = vacacionesData.filter(v => {
      const texto = `${v.nombre} ${v.apellido} ${v.cedula}`.toLowerCase();

      const coincideBusqueda =
        !busqueda || texto.includes(busqueda);

      const coincideEstado =
        !estado || v.estado === estado;

      return coincideBusqueda && coincideEstado;
    });

    vacacionesModule.renderTabla(filtrados);
  },

  limpiarFiltros: () => {
    document.getElementById('filtro-busqueda').value = '';
    document.getElementById('filtro-estado').value = '';
    vacacionesModule.renderTabla(vacacionesData);
  },

  badgeEstado: (estado) => {
    const clases = {
      pendiente: 'badge-amber',
      aprobada: 'badge-green',
      rechazada: 'badge-red'
    };

    return `<span class="badge ${clases[estado] || 'badge-gray'}">${estado}</span>`;
  },

  abrirModal: async () => {
    ui.abrirModal('modal-vacacion');

    await cargarEmpleados('f-id-empleado');

    const manana = new Date();
    manana.setDate(manana.getDate() + 1);

    const minFecha = manana.toISOString().split('T')[0];

    document.getElementById('f-fecha-inicio').min = minFecha;
    document.getElementById('f-fecha-fin').min = minFecha;
  },

  guardar: async () => {
    const select = document.getElementById('f-id-empleado');

    const id_empleado = select.tomselect
      ? parseInt(select.tomselect.getValue())
      : parseInt(select.value);

    const fecha_inicio = document.getElementById('f-fecha-inicio').value;
    const fecha_fin = document.getElementById('f-fecha-fin').value;

    ui.ocultarError('vacacion-error');

    if (!id_empleado) {
      ui.mostrarError('vacacion-error', 'Seleccioná un empleado');
      return;
    }

    if (!fecha_inicio || !fecha_fin) {
      ui.mostrarError('vacacion-error', 'Las fechas son requeridas');
      return;
    }

    if (new Date(fecha_inicio) > new Date(fecha_fin)) {
      ui.mostrarError(
        'vacacion-error',
        'La fecha inicio no puede ser mayor a la fecha fin'
      );
      return;
    }

    const hoy = new Date().toISOString().split('T')[0];

    if (fecha_inicio <= hoy) {
      ui.mostrarError(
        'vacacion-error',
        'No podés solicitar vacaciones para hoy o una fecha pasada'
      );
      return;
    }

    try {
      await api.post('/vacaciones', {
        id_empleado,
        fecha_inicio,
        fecha_fin
      });

      ui.cerrarModal('modal-vacacion');
      ui.alerta('Solicitud de vacaciones creada correctamente', 'success');

      vacacionesModule.limpiarForm();
      vacacionesModule.cargar();

    } catch (err) {
      ui.mostrarError('vacacion-error', err.message);
    }
  },

  aprobar: async (id) => {
    try {
      await api.put(`/vacaciones/${id}/aprobar`);
      ui.alerta('Vacaciones aprobadas', 'success');
      vacacionesModule.cargar();
    } catch (err) {
      ui.alerta(err.message, 'error');
    }
  },

  rechazar: async (id) => {
    try {
      await api.put(`/vacaciones/${id}/rechazar`);
      ui.alerta('Vacaciones rechazadas', 'warning');
      vacacionesModule.cargar();
    } catch (err) {
      ui.alerta(err.message, 'error');
    }
  },

  limpiarForm: () => {
    const select = document.getElementById('f-id-empleado');

    if (select.tomselect) {
      select.tomselect.clear();
    }

    document.getElementById('f-fecha-inicio').value = '';
    document.getElementById('f-fecha-fin').value = '';
  }
};

vacacionesModule.cargar();