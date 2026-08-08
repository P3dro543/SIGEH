auth.verificarAcceso();
navbar.render('permisos.html');

let permisosData = [];

const permisosModule = {
  cargar: async () => {
    ui.loader(true);
    try {
      permisosData = await api.get('/permisos');
      permisosModule.renderTabla(permisosData);
    } catch (err) {
      ui.alerta('Error cargando permisos', 'error');
    } finally {
      ui.loader(false);
    }
  },

  renderTabla: (datos) => {
    ui.tabla(
      'tabla-permisos',
      [
        { label: 'Empleado', key: 'nombre_completo' },
        { label: 'Cédula', key: 'cedula' },
        { label: 'Fecha inicio', key: 'inicio_fmt' },
        { label: 'Fecha fin', key: 'fin_fmt' },
        { label: 'Motivo', key: 'motivo' },
        { label: 'Estado', key: 'estado_fmt' },
      ],
      datos.map(p => ({
        ...p,
        nombre_completo: `${p.nombre} ${p.apellido}`,
        inicio_fmt: new Date(p.fecha_inicio).toLocaleDateString('es-CR'),
        fin_fmt: new Date(p.fecha_fin).toLocaleDateString('es-CR'),
        estado_fmt: permisosModule.badgeEstado(p.estado)
      })),
      (permiso) =>
        permiso.estado === 'pendiente'
          ? `
            <div style="display:flex;gap:6px;">
              <button class="btn btn-success" onclick="permisosModule.aprobar(${permiso.id_permiso})">
                Aprobar
              </button>
              <button class="btn btn-danger" onclick="permisosModule.rechazar(${permiso.id_permiso})">
                Rechazar
              </button>
            </div>
          `
          : '–'
    );
  },

  filtrar: () => {
    const busqueda = document.getElementById('filtro-busqueda').value.toLowerCase();
    const estado = document.getElementById('filtro-estado').value;

    const filtrados = permisosData.filter(p => {
      const texto = `${p.nombre} ${p.apellido} ${p.cedula}`.toLowerCase();

      const coincideBusqueda =
        !busqueda || texto.includes(busqueda);

      const coincideEstado =
        !estado || p.estado === estado;

      return coincideBusqueda && coincideEstado;
    });

    permisosModule.renderTabla(filtrados);
  },

  limpiarFiltros: () => {
    document.getElementById('filtro-busqueda').value = '';
    document.getElementById('filtro-estado').value = '';

    permisosModule.renderTabla(permisosData);
  },

  badgeEstado: (estado) => {
    const clases = {
      pendiente: 'badge-amber',
      aprobado: 'badge-green',
      rechazado: 'badge-red'
    };

    return `<span class="badge ${clases[estado] || 'badge-gray'}">${estado}</span>`;
  },

  abrirModal: async () => {
    ui.abrirModal('modal-permiso');

    await cargarEmpleados('f-id-empleado');

    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('f-fecha-inicio').min = hoy;
    document.getElementById('f-fecha-fin').min = hoy;
  },

  guardar: async () => {
    const select = document.getElementById('f-id-empleado');

    const id_empleado = select.tomselect
      ? parseInt(select.tomselect.getValue())
      : parseInt(select.value);

    const fecha_inicio = document.getElementById('f-fecha-inicio').value;
    const fecha_fin = document.getElementById('f-fecha-fin').value;
    const motivo = document.getElementById('f-motivo').value.trim();

    ui.ocultarError('permiso-error');

    if (!id_empleado) {
      ui.mostrarError('permiso-error', 'Seleccioná un empleado');
      return;
    }

    if (!fecha_inicio || !fecha_fin) {
      ui.mostrarError('permiso-error', 'Las fechas son requeridas');
      return;
    }

    const hoy = new Date().toISOString().split('T')[0];

    if (fecha_inicio < hoy) {
      ui.mostrarError(
        'permiso-error',
        'No podés solicitar un permiso para una fecha pasada'
      );
      return;
    }

    if (new Date(fecha_inicio) > new Date(fecha_fin)) {
      ui.mostrarError(
        'permiso-error',
        'La fecha inicio no puede ser mayor a la fecha fin'
      );
      return;
    }

    if (!motivo) {
      ui.mostrarError('permiso-error', 'El motivo es requerido');
      return;
    }

    try {
      await api.post('/permisos', {
        id_empleado,
        fecha_inicio,
        fecha_fin,
        motivo
      });

      ui.cerrarModal('modal-permiso');
      ui.alerta('Permiso creado correctamente', 'success');

      permisosModule.limpiarForm();
      permisosModule.cargar();
    } catch (err) {
      ui.mostrarError('permiso-error', err.message);
    }
  },

  aprobar: async (id) => {
    try {
      await api.put(`/permisos/${id}/aprobar`);
      ui.alerta('Permiso aprobado', 'success');
      permisosModule.cargar();
    } catch (err) {
      ui.alerta(err.message, 'error');
    }
  },

  rechazar: async (id) => {
    try {
      await api.put(`/permisos/${id}/rechazar`);
      ui.alerta('Permiso rechazado', 'warning');
      permisosModule.cargar();
    } catch (err) {
      ui.alerta(err.message, 'error');
    }
  },

  limpiarForm: () => {
    ['f-fecha-inicio', 'f-fecha-fin', 'f-motivo'].forEach(id => {
      document.getElementById(id).value = '';
    });

    document.getElementById('f-id-empleado').innerHTML = '';
  }
};

permisosModule.cargar();