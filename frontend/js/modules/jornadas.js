auth.verificarAcceso();
navbar.render('jornadas.html');

const jornadasModule = {
  cargar: async () => {
    ui.loader(true);
    try {
      const jornadas = await api.get('/jornadas');
      ui.tabla('tabla-jornadas',
        [
          { label: 'Nombre', key: 'nombre' },
          { label: 'Hora inicio', key: 'hora_inicio' },
          { label: 'Hora fin', key: 'hora_fin' },
          { label: 'Horas máximas', key: 'horas_maximas' },
        ],
        jornadas,
        (jornada) => `
          <button class="btn btn-danger" onclick="jornadasModule.eliminar(${jornada.id_jornada})">
            Eliminar
          </button>
        `
      );
    } catch (err) {
      ui.alerta('Error cargando jornadas', 'error');
    } finally {
      ui.loader(false);
    }
  },

  guardar: async () => {
    const data = {
      nombre: document.getElementById('f-nombre').value.trim(),
      hora_inicio: document.getElementById('f-hora-inicio').value,
      hora_fin: document.getElementById('f-hora-fin').value,
      horas_maximas: parseFloat(document.getElementById('f-horas-maximas').value),
    };

    ui.ocultarError('jornada-error');

    try {
      await api.post('/jornadas', data);
      ui.cerrarModal('modal-jornada');
      ui.alerta('Jornada creada correctamente', 'success');
      jornadasModule.limpiarForm();
      jornadasModule.cargar();
    } catch (err) {
      ui.mostrarError('jornada-error', err.message);
    }
  },

  eliminar: async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta jornada?')) return;
    try {
      await api.delete(`/jornadas/${id}`);
      ui.alerta('Jornada eliminada correctamente', 'success');
      jornadasModule.cargar();
    } catch (err) {
      ui.alerta(err.message, 'error');
    }
  },

  limpiarForm: () => {
    ['f-nombre', 'f-hora-inicio', 'f-hora-fin', 'f-horas-maximas'].forEach(id => {
      document.getElementById(id).value = '';
    });
  }
};

jornadasModule.cargar();