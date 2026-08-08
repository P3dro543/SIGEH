auth.verificarAcceso();
navbar.render('reportes.html');

const reportesModule = {
  getFiltros: () => {
    const fecha_inicio = document.getElementById('f-fecha-inicio').value;
    const fecha_fin = document.getElementById('f-fecha-fin').value;
    const id_area = document.getElementById('f-area').value;
    const id_empleado = document.getElementById('f-empleado').value;

    if (!fecha_inicio || !fecha_fin) {
      ui.alerta('Seleccioná un rango de fechas', 'warning');
      return null;
    }

    if (new Date(fecha_inicio) > new Date(fecha_fin)) {
      ui.alerta('La fecha inicio no puede ser mayor a la fecha fin', 'warning');
      return null;
    }

    return {
      fecha_inicio,
      fecha_fin,
      id_area,
      id_empleado
    };
  },

  buildQuery: (base, filtros) => {
    let url = `${base}?fecha_inicio=${filtros.fecha_inicio}&fecha_fin=${filtros.fecha_fin}`;

    if (filtros.id_area) {
      url += `&id_area=${filtros.id_area}`;
    }

    if (filtros.id_empleado) {
      url += `&id_empleado=${filtros.id_empleado}`;
    }

    return url;
  },

  cargar: async () => {
    const filtros = reportesModule.getFiltros();
    if (!filtros) return;

    ui.loader(true);

    try {
      const resumen = await api.get(
        reportesModule.buildQuery('/reportes/resumen', filtros)
      );

      if (!resumen || resumen.length === 0) {
        document.getElementById('tabla-reportes').innerHTML = `
          <div class="empty-state">
            <p>No hay datos para el período seleccionado.</p>
          </div>
        `;
        return;
      }

      ui.tabla(
        'tabla-reportes',
        [
          { label: 'Empleado', key: 'nombre_completo' },
          { label: 'Cédula', key: 'cedula' },
          { label: 'Área', key: 'area' },
          { label: 'Días trabajados', key: 'dias_trabajados' },
          { label: 'Tardanzas', key: 'tardanzas' },
          { label: 'Ausencias', key: 'ausencias' },
          { label: 'Salidas anticipadas', key: 'salidas_anticipadas' }
        ],
        resumen.map(r => ({
          ...r,
          nombre_completo: `${r.nombre} ${r.apellido}`
        }))
      );

    } catch (err) {
      ui.alerta('Error cargando reporte', 'error');
    } finally {
      ui.loader(false);
    }
  },

  descargarExcel: async () => {
    const filtros = reportesModule.getFiltros();
    if (!filtros) return;

    try {
      await api.descargar(
        reportesModule.buildQuery('/reportes/excel', filtros),
        `reporte_${filtros.fecha_inicio}_${filtros.fecha_fin}.xlsx`
      );

      ui.alerta('Excel descargado correctamente', 'success');

    } catch (err) {
      ui.alerta('Error descargando Excel', 'error');
    }
  },

  descargarPDF: async () => {
    const filtros = reportesModule.getFiltros();
    if (!filtros) return;

    try {
      await api.descargar(
        reportesModule.buildQuery('/reportes/pdf', filtros),
        `reporte_${filtros.fecha_inicio}_${filtros.fecha_fin}.pdf`
      );

      ui.alerta('PDF descargado correctamente', 'success');

    } catch (err) {
      ui.alerta('Error descargando PDF', 'error');
    }
  },

  limpiarFiltros: async () => {
    document.getElementById('f-area').value = '';
    document.getElementById('f-empleado').value = '';

    const hoy = new Date();

    const primerDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      1
    ).toISOString().split('T')[0];

    const ultimoDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth() + 1,
      0
    ).toISOString().split('T')[0];

    document.getElementById('f-fecha-inicio').value = primerDia;
    document.getElementById('f-fecha-fin').value = ultimoDia;

    await reportesModule.cargar();
  }
};

// Inicialización
(async () => {
  const hoy = new Date();

  const primerDia = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    1
  ).toISOString().split('T')[0];

  const ultimoDia = new Date(
    hoy.getFullYear(),
    hoy.getMonth() + 1,
    0
  ).toISOString().split('T')[0];

  document.getElementById('f-fecha-inicio').value = primerDia;
  document.getElementById('f-fecha-fin').value = ultimoDia;

  await cargarEmpleados('f-empleado');

  await reportesModule.cargar();
})();