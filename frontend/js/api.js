const API_URL = 'https://sigeh-dusky.vercel.app/api'; // Cambia esto a la URL de tu backend

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  const esSesionInvalida = response.status === 401 ||
    (response.status === 403 && /token|sesión|sesion|expirado|inválido|invalido/i.test(data.error || ''));

  if (esSesionInvalida) {
    auth.sesionExpirada();
    throw new Error('Tu sesión expiró. Redirigiendo al inicio de sesión.');
  }
  if (!response.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
};

const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: headers()
    });
    return handleResponse(res);
  },

  post: async (endpoint, body) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  put: async (endpoint, body) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: headers()
    });
    return handleResponse(res);
  },

  descargar: async (endpoint, nombre) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: headers()
    });
    if (!res.ok) throw new Error('Error al descargar');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};

const cargarEmpleados = async (selectId) => {
  try {
    const empleados = await api.get('/empleados');
    console.log('Empleados recibidos:', empleados);

    const select = document.getElementById(selectId);
    if (!select) return;

    if (select.tomselect) {
      select.tomselect.destroy();
    }

    select.innerHTML = '';

    // Agregar opciones al select
    empleados.forEach(e => {
      const option = document.createElement('option');
      option.value = e.id_empleado;
      option.textContent = `${e.nombre} ${e.apellido} – ${e.cedula}`;
      select.appendChild(option);
    });

    // Inicializar Tom Select
new TomSelect(`#${selectId}`, {
  placeholder: 'Buscar empleado...',
  allowEmptyOption: true,
  dropdownParent: 'body'
});

    console.log('Cantidad de opciones:', select.options.length);

  } catch (err) {
    console.error('Error cargando empleados:', err);
  }
};

const cargarJornadas = async (selectId) => {
  try {
    const jornadas = await api.get('/jornadas');
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Seleccioná una jornada</option>';
    jornadas.forEach(j => {
      const opt = document.createElement('option');
      opt.value = j.id_jornada;
      opt.textContent = `${j.nombre} (${j.hora_inicio} – ${j.hora_fin})`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Error cargando jornadas:', err);
  }
};

const cargarInconsistenciasPendientes = async (selectId) => {
  try {
    const inconsistencias = await api.get('/inconsistencias?estado=pendiente');
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Seleccioná una inconsistencia</option>';
    inconsistencias.forEach(i => {
      const opt = document.createElement('option');
      opt.value = i.id_inconsistencia;
      opt.textContent = `#${i.id_inconsistencia} – ${i.nombre} ${i.apellido} – ${i.tipo}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Error cargando inconsistencias:', err);
  }
};
