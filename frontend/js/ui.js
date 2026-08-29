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
        loader.className = 'loading-bar';
        loader.setAttribute('role', 'status');
        loader.setAttribute('aria-label', 'Cargando contenido');
        document.body.appendChild(loader);
      }
    } else {
      if (loader) loader.remove();
    }
  },

  tabla: (contenedorId, columnas, datos, acciones = null, opciones = {}) => {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    if (datos.length === 0) {
      contenedor.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" aria-hidden="true">⌁</div>
          <p class="empty-state-title">No hay registros todavía</p>
          <span>No encontramos información con los filtros actuales.</span>
        </div>
      `;
      return;
    }

    const pageSizes = opciones.pageSizes || [10, 25, 50];
    let pageSize = opciones.pageSize || pageSizes[0];
    let page = 1;

    const render = () => {
      const totalPages = Math.ceil(datos.length / pageSize);
      page = Math.min(page, totalPages);
      const start = (page - 1) * pageSize;
      const pageRows = datos.slice(start, start + pageSize);
      const thead = columnas.map(c => `<th>${c.label}</th>`).join('');
      const accionHeader = acciones ? '<th>Acciones</th>' : '';
      const tbody = pageRows.map(fila => {
        const celdas = columnas.map(c => `<td data-label="${c.label}">${fila[c.key] ?? '–'}</td>`).join('');
        const accionesHtml = acciones ? `<td data-label="Acciones">${acciones(fila)}</td>` : '';
        return `<tr>${celdas}${accionesHtml}</tr>`;
      }).join('');

      const controls = totalPages > 1 ? `
        <div class="table-pagination" aria-label="Paginación de tabla">
          <span class="table-pagination-summary">Mostrando ${start + 1}–${Math.min(start + pageSize, datos.length)} de ${datos.length}</span>
          <label class="table-page-size">Filas <select aria-label="Filas por página">${pageSizes.map(size => `<option value="${size}" ${size === pageSize ? 'selected' : ''}>${size}</option>`).join('')}</select></label>
          <div class="table-page-actions"><button class="btn btn-secondary" type="button" data-table-page="prev" ${page === 1 ? 'disabled' : ''}>Anterior</button><span>Página ${page} de ${totalPages}</span><button class="btn btn-secondary" type="button" data-table-page="next" ${page === totalPages ? 'disabled' : ''}>Siguiente</button></div>
        </div>` : `<div class="table-pagination table-pagination-single"><span class="table-pagination-summary">${datos.length} registro${datos.length === 1 ? '' : 's'}</span></div>`;

      contenedor.innerHTML = `<div class="table-container"><table><thead><tr>${thead}${accionHeader}</tr></thead><tbody>${tbody}</tbody></table></div>${controls}`;
      contenedor.querySelector('[data-table-page="prev"]')?.addEventListener('click', () => { page--; render(); });
      contenedor.querySelector('[data-table-page="next"]')?.addEventListener('click', () => { page++; render(); });
      contenedor.querySelector('.table-page-size select')?.addEventListener('change', (event) => { pageSize = Number(event.target.value); page = 1; render(); });
    };

    render();
  },

  confirmar: (titulo, mensaje, etiquetaAccion = 'Confirmar') => new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open confirmation-overlay';
    overlay.innerHTML = `<div class="modal confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirmation-title"><div class="modal-body"><div class="confirmation-icon" aria-hidden="true">!</div><h2 id="confirmation-title" class="confirmation-title"></h2><p class="confirmation-copy"></p></div><div class="modal-footer"><button class="btn btn-secondary" type="button" data-confirm="cancel">Cancelar</button><button class="btn btn-danger" type="button" data-confirm="accept"></button></div></div>`;
    overlay.querySelector('.confirmation-title').textContent = titulo;
    overlay.querySelector('.confirmation-copy').textContent = mensaje;
    overlay.querySelector('[data-confirm="accept"]').textContent = etiquetaAccion;
    const close = (accepted) => { overlay.remove(); resolve(accepted); };
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(false); });
    overlay.querySelector('[data-confirm="cancel"]').addEventListener('click', () => close(false));
    overlay.querySelector('[data-confirm="accept"]').addEventListener('click', () => close(true));
    document.body.appendChild(overlay);
    overlay.querySelector('[data-confirm="cancel"]').focus();
  }),

  abrirModal: (id) => {
    document.getElementById(id)?.classList.add('open');
  },

  cerrarModal: (id) => {
    document.getElementById(id)?.classList.remove('open');
  },

  mostrarError: (id, mensaje, fieldIds = []) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = mensaje;
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'assertive');
    el.classList.add('show');
    const scope = el.closest('.modal, .login-form, form') || el.parentElement;
    scope?.classList.add('form-has-error');
    fieldIds.forEach((fieldId) => document.getElementById(fieldId)?.setAttribute('aria-invalid', 'true'));
  },

  ocultarError: (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('show');
    const scope = el.closest('.modal, .login-form, form') || el.parentElement;
    scope?.classList.remove('form-has-error');
    scope?.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
  }
};

document.addEventListener('input', (event) => {
  if (event.target.matches('.form-input, .form-select, textarea')) event.target.removeAttribute('aria-invalid');
});
