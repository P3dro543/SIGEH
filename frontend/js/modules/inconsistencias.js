auth.verificarAcceso();
navbar.render('inconsistencias.html');

let inconsistenciasData = [];

const inconsistenciasModule = {
  cargar: async () => {
    ui.loader(true);
    try {
      inconsistenciasData = await api.get('/inconsistencias');
      inconsistenciasModule.renderTabla(inconsistenciasData);
    } catch (err) {
      ui.alerta('Error cargando inconsistencias', 'error');
    } finally {
      ui.loader(false);
    }
  },

  renderTabla: (datos) => {
    ui.tabla(
      'tabla-inconsistencias',
      [
        { label: 'Empleado', key: 'nombre_completo' },
        { label: 'Cédula', key: 'cedula' },
        { label: 'Área', key: 'area' },
        { label: 'Tipo', key: 'tipo_fmt' },
        { label: 'Descripción', key: 'descripcion' },
        { label: 'Fecha', key: 'fecha_fmt' },
        { label: 'Estado', key: 'estado_fmt' },
      ],
      datos.map(i => ({
        ...i,
        nombre_completo: `${i.nombre} ${i.apellido}`,
        tipo_fmt: inconsistenciasModule.badgeTipo(i.tipo),
        fecha_fmt: new Date(i.fecha_hora).toLocaleString('es-CR'),
        estado_fmt: inconsistenciasModule.badgeEstado(i.estado)
      })),
      (inconsistencia) =>
        inconsistencia.estado === 'pendiente'
          ? `
            <button class="btn btn-secondary" onclick="inconsistenciasModule.abrirJustificacion(${inconsistencia.id_inconsistencia})">
              Justificar
            </button>
          `
          : '–'
    );
  },

  filtrar: () => {
    const busqueda = document.getElementById('filtro-busqueda').value.toLowerCase();
    const tipo = document.getElementById('f-tipo').value;
    const estado = document.getElementById('f-estado').value;
    const fecha = document.getElementById('filtro-fecha').value;

    const filtrados = inconsistenciasData.filter(i => {
      const texto = `${i.nombre} ${i.apellido} ${i.cedula} ${i.area}`.toLowerCase();

      const coincideBusqueda =
        !busqueda || texto.includes(busqueda);

      const coincideTipo =
        !tipo || i.tipo === tipo;

      const coincideEstado =
        !estado || i.estado === estado;

      const fechaReal = i.fecha_hora
        ? i.fecha_hora.split('T')[0]
        : '';

      const coincideFecha =
        !fecha || fechaReal === fecha;

      return (
        coincideBusqueda &&
        coincideTipo &&
        coincideEstado &&
        coincideFecha
      );
    });

    inconsistenciasModule.renderTabla(filtrados);
  },

  limpiarFiltros: () => {
    document.getElementById('filtro-busqueda').value = '';
    document.getElementById('f-tipo').value = '';
    document.getElementById('f-estado').value = '';
    document.getElementById('filtro-fecha').value = '';

    inconsistenciasModule.renderTabla(inconsistenciasData);
  },

  badgeTipo: (tipo) => {
    const clases = {
      tardanza: 'badge-amber',
      ausencia: 'badge-red',
      salida_anticipada: 'badge-blue'
    };

    return `<span class="badge ${clases[tipo] || 'badge-gray'}">${tipo}</span>`;
  },

  badgeEstado: (estado) => {
    const clases = {
      pendiente: 'badge-amber',
      justificada: 'badge-green',
      cubierta: 'badge-blue'
    };

    return `<span class="badge ${clases[estado] || 'badge-gray'}">${estado}</span>`;
  },

  abrirJustificacion: (id) => {
    document.getElementById('f-id-inconsistencia').value = id;
    document.getElementById('f-descripcion').value = '';
    ui.ocultarError('justificacion-error');
    ui.abrirModal('modal-justificacion');
  },

  justificar: async () => {
    const id_inconsistencia = document.getElementById('f-id-inconsistencia').value;
    const descripcion = document.getElementById('f-descripcion').value.trim();

    if (!descripcion) {
      ui.mostrarError('justificacion-error', 'La descripción es requerida');
      return;
    }

    try {
      await api.post('/justificaciones', {
        id_inconsistencia,
        descripcion
      });

      ui.cerrarModal('modal-justificacion');
      ui.alerta('Justificación registrada correctamente', 'success');
      inconsistenciasModule.cargar();
    } catch (err) {
      ui.mostrarError('justificacion-error', err.message);
    }
  }
};

inconsistenciasModule.cargar();