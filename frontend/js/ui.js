const ui = {
  alerta: (mensaje, tipo = 'success') => {
    const clases = {
      success: 'toast-success',
      error: 'toast-error',
      warning: 'toast-warning',
      info: 'toast-info'
    };

    let contenedor = document.getElementById('toast-container');
    if (!contenedor) {
      contenedor = document.createElement('div');
      contenedor.id = 'toast-container';
      contenedor.className = 'toast-container';
      document.body.appendChild(contenedor);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${clases[tipo]}`;
    toast.innerHTML = `
      <span>${mensaje}</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-size:16px;color:inherit;opacity:0.6;">&times;</button>
    `;
    contenedor.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  },

  loader: (mostrar) => {
    let loader = document.getElementById('loader');
    if (mostrar) {
      if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loader';
        loader.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.2);z-index:99;display:flex;align-items:center;justify-content:center;';
        loader.innerHTML = `
          <div style="background:#fff;padding:1.5rem 2rem;border-radius:12px;display:flex;align-items:center;gap:12px;">
            <div style="width:20px;height:20px;border:2px solid #e5e7eb;border-top-color:#1D4ED8;border-radius:50%;animation:spin 0.7s linear infinite;"></div>
            <span style="font-size:13px;color:#374151;">Cargando...</span>
          </div>
        `;
        if (!document.getElementById('spin-style')) {
          const style = document.createElement('style');
          style.id = 'spin-style';
          style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
          document.head.appendChild(style);
        }
        document.body.appendChild(loader);
      }
    } else {
      if (loader) loader.remove();
    }
  },

  tabla: (contenedorId, columnas, datos, acciones = null) => {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    if (datos.length === 0) {
      contenedor.innerHTML = `
        <div class="empty-state">
          <p>No hay datos para mostrar</p>
        </div>
      `;
      return;
    }

    const thead = columnas.map(c => `<th>${c.label}</th>`).join('');
    const accionHeader = acciones ? '<th>Acciones</th>' : '';

    const tbody = datos.map(fila => {
      const celdas = columnas.map(c => `<td>${fila[c.key] ?? '–'}</td>`).join('');
      const accionesHtml = acciones ? `<td>${acciones(fila)}</td>` : '';
      return `<tr>${celdas}${accionesHtml}</tr>`;
    }).join('');

    contenedor.innerHTML = `
      <div class="table-container">
        <table>
          <thead><tr>${thead}${accionHeader}</tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
    `;
  },

  abrirModal: (id) => {
    document.getElementById(id)?.classList.add('open');
  },

  cerrarModal: (id) => {
    document.getElementById(id)?.classList.remove('open');
  },

  mostrarError: (id, mensaje) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = mensaje;
    el.classList.add('show');
  },

  ocultarError: (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('show');
  }
};