auth.verificarAcceso();
navbar.render('empleados.html');

let empleadosData = [];

const empleadosModule = {
  cargar: async () => {
    ui.loader(true);
    try {
      empleadosData = await api.get('/empleados');
      empleadosModule.renderTabla(empleadosData);
    } catch (err) {
      ui.alerta('Error cargando empleados', 'error');
    } finally {
      ui.loader(false);
    }
  },

  renderTabla: (datos) => {
    ui.tabla(
      'tabla-empleados',
      [
        { label: 'Nombre', key: 'nombre_completo' },
        { label: 'Cédula', key: 'cedula' },
        { label: 'Área', key: 'area' },
        { label: 'Jornada', key: 'jornada' },
        { label: 'Usuario', key: 'username' },
        { label: 'Estado', key: 'estado_fmt' },
      ],
      datos.map(e => ({
        ...e,
        nombre_completo: `${e.nombre} ${e.apellido}`,
        jornada: e.jornada || '–',
        estado_fmt: e.activo
          ? '<span class="badge badge-green">Activo</span>'
          : '<span class="badge badge-red">Inactivo</span>'
      }))
    );
  },

  filtrar: () => {
    const busqueda = document.getElementById('filtro-busqueda').value.toLowerCase();
    const area = document.getElementById('filtro-area').value;
    const estado = document.getElementById('filtro-estado').value;

    const filtrados = empleadosData.filter(e => {
      const texto = `${e.nombre} ${e.apellido} ${e.cedula} ${e.area} ${e.username}`.toLowerCase();

      const coincideBusqueda = !busqueda || texto.includes(busqueda);
      const coincideArea = !area || e.area === area;
      const coincideEstado =
        !estado ||
        (estado === 'activo' && e.activo) ||
        (estado === 'inactivo' && !e.activo);

      return coincideBusqueda && coincideArea && coincideEstado;
    });

    empleadosModule.renderTabla(filtrados);
  },

  limpiarFiltros: () => {
    document.getElementById('filtro-busqueda').value = '';
    document.getElementById('filtro-area').value = '';
    document.getElementById('filtro-estado').value = '';

    empleadosModule.renderTabla(empleadosData);
  },

  abrirModal: async () => {
    ui.abrirModal('modal-empleado');

    await cargarJornadas('f-jornada');

    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('f-horario-inicio').value = hoy;
    document.getElementById('f-horario-inicio').min = hoy;
  },

  guardar: async () => {
    const nombre = document.getElementById('f-nombre').value.trim();
    const apellido = document.getElementById('f-apellido').value.trim();
    const cedula = document.getElementById('f-cedula').value.trim();
    const telefono = document.getElementById('f-telefono').value.trim();
    const email = document.getElementById('f-email').value.trim();
    const id_area = parseInt(document.getElementById('f-area').value);
    const id_rol = parseInt(document.getElementById('f-rol').value);
    const username = document.getElementById('f-username').value.trim();
    const password = document.getElementById('f-password').value;
    const id_jornada = parseInt(document.getElementById('f-jornada').value);
    const fecha_inicio = document.getElementById('f-horario-inicio').value;
    const fecha_fin = document.getElementById('f-horario-fin').value;

    ui.ocultarError('empleado-error');

    if (!nombre || !apellido || !cedula || !username || !password) {
      ui.mostrarError('empleado-error', 'Completá todos los campos obligatorios', ['f-nombre', 'f-apellido', 'f-cedula', 'f-username', 'f-password']);
      return;
    }

    if (!id_jornada) {
      ui.mostrarError('empleado-error', 'Seleccioná una jornada', ['f-jornada']);
      return;
    }

    if (!fecha_inicio || !fecha_fin) {
      ui.mostrarError('empleado-error', 'Las fechas de jornada son requeridas', ['f-horario-inicio', 'f-horario-fin']);
      return;
    }

    if (new Date(fecha_inicio) > new Date(fecha_fin)) {
      ui.mostrarError(
        'empleado-error',
        'La fecha inicio no puede ser mayor a la fecha fin', ['f-horario-inicio', 'f-horario-fin']
      );
      return;
    }

    try {
      const empleado = await api.post('/empleados', {
        nombre,
        apellido,
        cedula,
        telefono,
        email,
        id_area,
        id_rol,
        username,
        password
      });

      await api.post('/horarios', {
        id_empleado: empleado.id_empleado,
        id_jornada,
        fecha_inicio,
        fecha_fin
      });

      ui.cerrarModal('modal-empleado');
      ui.alerta('Empleado creado y jornada asignada correctamente', 'success');

      empleadosModule.limpiarForm();
      empleadosModule.cargar();
    } catch (err) {
      ui.mostrarError('empleado-error', err.message);
    }
  },

  limpiarForm: () => {
    [
      'f-nombre',
      'f-apellido',
      'f-cedula',
      'f-telefono',
      'f-email',
      'f-username',
      'f-password',
      'f-horario-inicio',
      'f-horario-fin'
    ].forEach(id => {
      document.getElementById(id).value = '';
    });

    document.getElementById('f-jornada').innerHTML = '';
  }
};

empleadosModule.cargar();
