const sidebar = {
  render: (paginaActiva) => {
    const usuario = auth.getUsername();
    const rol = auth.getRol();
    const iniciales = usuario.substring(0, 2).toUpperCase();

    const items = [
      {
        seccion: 'PRINCIPAL',
        links: [
          { href: 'dashboard.html', label: 'Dashboard' },
          { href: 'empleados.html', label: 'Empleados' },
          { href: 'jornadas.html', label: 'Jornadas' },
        ]
      },
      {
        seccion: 'OPERACIONES',
        links: [
          { href: 'asistencia.html', label: 'Asistencia' },
          { href: 'inconsistencias.html', label: 'Inconsistencias' },
          { href: 'coberturas.html', label: 'Coberturas' },
        ]
      },
      {
        seccion: 'PERSONAL',
        links: [
          { href: 'permisos.html', label: 'Permisos' },
          { href: 'vacaciones.html', label: 'Vacaciones' },
          { href: 'reportes.html', label: 'Reportes' },
        ]
      },
    ];

    const navHTML = items.map(grupo => `
      <div>
        <p class="sidebar-section-label">${grupo.seccion}</p>
        ${grupo.links.map(link => `
          <a href="${link.href}" class="nav-item ${paginaActiva === link.href ? 'active' : ''}">
            <span class="nav-dot"></span> ${link.label}
          </a>
        `).join('')}
      </div>
    `).join('');

    const html = `
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-brand-name">
            <span class="sidebar-brand-vig">VIG</span><span class="sidebar-brand-safe">SAFE</span>
          </div>
          <div class="sidebar-brand-sub">SIGEH · PANEL</div>
        </div>

        <nav class="sidebar-nav">${navHTML}</nav>

        <div class="sidebar-footer">
          <div class="sidebar-user">
            <div class="sidebar-avatar">${iniciales}</div>
            <div>
              <div class="sidebar-username">${usuario}</div>
              <div class="sidebar-rol">${rol}</div>
            </div>
          </div>
          <button class="btn-logout" onclick="auth.logout()">Cerrar sesión</button>
        </div>
      </aside>
    `;

    const contenedor = document.getElementById('sidebar-container');
    if (contenedor) contenedor.innerHTML = html;
  }
};