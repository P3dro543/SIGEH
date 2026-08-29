auth.verificarAcceso();
navbar.render('coberturas.html');

const coberturasModule = {
  cargar: async () => {
    ui.loader(true);
    try {
      const coberturas = await api.get('/coberturas');
      ui.tabla(
        'tabla-coberturas',
        [
          { label: 'Fecha', key: 'fecha_fmt' },
          { label: 'Sustituto', key: 'sustituto_completo' },
          { label: 'Tipo inconsistencia', key: 'inconsistencia_tipo' },
          { label: 'Estado', key: 'estado_fmt' },
        ],
        coberturas.map(c => ({
          ...c,
          fecha_fmt: new Date(c.fecha).toLocaleDateString('es-CR'),
          sustituto_completo: `${c.sustituto_nombre} ${c.sustituto_apellido}`,
          estado_fmt: coberturasModule.badgeEstado(c.estado)
        })),
        (cobertura) =>
          cobertura.estado === 'pendiente'
            ? `
          <button class="btn btn-success" onclick="coberturasModule.confirmar(${cobertura.id_cobertura})">
            Confirmar
          </button>
        `
            : '–'
      );
    } catch (err) {
      ui.alerta('Error cargando coberturas', 'error');
    } finally {
      ui.loader(false);
    }
  },

  badgeEstado: (estado) => {
    const clases = {
      pendiente: 'badge-amber',
      confirmada: 'badge-green',
      cancelada: 'badge-red'
    };
    return `<span class="badge ${clases[estado] || 'badge-gray'}">${estado}</span>`;
  },

  abrirModal: async () => {
    ui.abrirModal('modal-cobertura');
    ui.ocultarError('cobertura-error');

    document.getElementById('sustitutos-container').style.display = 'none';

    await cargarInconsistenciasPendientes('f-id-inconsistencia');

    const selectInc = document.getElementById('f-id-inconsistencia');
    if (selectInc.tomselect) {
      selectInc.tomselect.destroy();
    }

    new TomSelect('#f-id-inconsistencia', {
      placeholder: 'Seleccioná una inconsistencia...',
      onChange: async (value) => {
        if (!value) return;
        await coberturasModule.cargarSustitutos(value);
      }
    });
  },

  cargarSustitutos: async (id_inconsistencia) => {
    try {
      const sustitutos = await api.get(`/coberturas/sustitutos/${id_inconsistencia}`);

      const contenedor = document.getElementById('sustitutos-container');
      const select = document.getElementById('f-id-sustituto');

      if (sustitutos.length === 0) {
        ui.mostrarError(
          'cobertura-error',
          'No hay sustitutos disponibles para esta inconsistencia', ['f-id-inconsistencia']
        );
        contenedor.style.display = 'none';
        return;
      }

      ui.ocultarError('cobertura-error');

      if (select.tomselect) {
        select.tomselect.destroy();
      }

      select.innerHTML = '';

      new TomSelect('#f-id-sustituto', {
        valueField: 'id',
        labelField: 'text',
        searchField: 'text',
        placeholder: 'Buscar sustituto...',
        options: sustitutos.map(s => ({
          id: String(s.id_empleado),
          text: `${s.nombre} ${s.apellido} – ${s.horas_trabajadas}h trabajadas`
        }))
      });

      contenedor.style.display = 'block';
    } catch (err) {
      ui.mostrarError('cobertura-error', err.message);
    }
  },

  guardar: async () => {
    const selectInc = document.getElementById('f-id-inconsistencia');
    const selectSus = document.getElementById('f-id-sustituto');

    const id_inconsistencia = selectInc.tomselect
      ? parseInt(selectInc.tomselect.getValue())
      : parseInt(selectInc.value);

    const id_empleado_sustituto = selectSus.tomselect
      ? parseInt(selectSus.tomselect.getValue())
      : parseInt(selectSus.value);

    if (!id_inconsistencia || !id_empleado_sustituto) {
      ui.mostrarError(
        'cobertura-error',
        'Seleccioná una inconsistencia y un sustituto', ['f-id-inconsistencia', 'f-id-sustituto']
      );
      return;
    }

    ui.ocultarError('cobertura-error');

    try {
      await api.post('/coberturas', {
        id_inconsistencia,
        id_empleado_sustituto
      });

      ui.cerrarModal('modal-cobertura');
      ui.alerta('Cobertura asignada correctamente', 'success');
      coberturasModule.cargar();
    } catch (err) {
      ui.mostrarError('cobertura-error', err.message);
    }
  },

  confirmar: async (id) => {
    try {
      await api.put(`/coberturas/${id}/confirmar`);
      ui.alerta('Cobertura confirmada', 'success');
      coberturasModule.cargar();
    } catch (err) {
      ui.alerta(err.message, 'error');
    }
  }
};

coberturasModule.cargar();
