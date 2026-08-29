const navbar = {
  render: (paginaActiva) => {
    const usuario = auth.getUsername();
    const rol = auth.getRol();
    const iniciales = usuario.substring(0, 2).toUpperCase();

    const links = [
      { href: 'dashboard.html', label: 'Dashboard' },
      { href: 'empleados.html', label: 'Empleados' },
      { href: 'jornadas.html', label: 'Jornadas' },
      { href: 'asistencia.html', label: 'Asistencia' },
      { href: 'inconsistencias.html', label: 'Inconsistencias' },
      { href: 'coberturas.html', label: 'Coberturas' },
      { href: 'permisos.html', label: 'Permisos' },
      { href: 'vacaciones.html', label: 'Vacaciones' },
      { href: 'reportes.html', label: 'Reportes' },
    ];

    const linksHTML = links.map(link => `
      <a href="${link.href}" class="navbar-link ${paginaActiva === link.href ? 'active' : ''}">
        ${link.label}
      </a>
    `).join('');

    const html = `
      <nav class="navbar">
        <a href="dashboard.html" class="navbar-brand">
          <span class="navbar-brand-vig">VIG</span><span class="navbar-brand-safe">SAFE</span>
        </a>

        <button class="navbar-menu-toggle" type="button" aria-label="Abrir navegación" aria-expanded="false" onclick="navbar.toggleMenu(this)"><span></span><span></span><span></span></button>
        <div class="navbar-links">${linksHTML}</div>

        <div class="navbar-user">
          <button class="navbar-profile-trigger" type="button" aria-label="Abrir menú de usuario" aria-expanded="false" onclick="navbar.toggleDropdown(this)">
            <span class="navbar-avatar" aria-hidden="true">${iniciales}</span>
            <span class="navbar-user-summary">
              <span class="navbar-username">${usuario}</span>
              <span class="navbar-role-row"><span class="navbar-status-dot"></span><span class="navbar-rol">${rol}</span></span>
            </span>
            <span class="navbar-chevron" aria-hidden="true">⌄</span>
          </button>
          <div class="navbar-dropdown" id="navbar-dropdown">
            <div class="navbar-dropdown-info">
              <div class="navbar-dropdown-profile">
                <div class="navbar-dropdown-avatar">${iniciales}</div>
                <div><div class="navbar-dropdown-username">${usuario}</div><span class="navbar-role-badge">${rol}</span></div>
              </div>
              <div class="navbar-session-status"><span class="navbar-status-dot"></span> Sesión activa</div>
            </div>
            <div class="navbar-dropdown-actions">
              <button class="navbar-dropdown-option" type="button" disabled><span>Mi perfil</span><small>Próximamente</small></button>
              <button class="navbar-dropdown-option" type="button" disabled><span>Cambiar contraseña</span><small>Próximamente</small></button>
            </div>
            <button class="navbar-dropdown-btn" onclick="auth.logout()">Cerrar sesión</button>
          </div>
        </div>
      </nav>
    `;

    const contenedor = document.getElementById('navbar-container');
    if (contenedor) contenedor.innerHTML = html;

    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('navbar-dropdown');
      const trigger = document.querySelector('.navbar-profile-trigger');
      if (dropdown && trigger && !dropdown.contains(e.target) && !trigger.contains(e.target)) {
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  },

  toggleDropdown: (button) => {
    const dropdown = document.getElementById('navbar-dropdown');
    const open = dropdown?.classList.toggle('open');
    button?.setAttribute('aria-expanded', String(open));
  },

  toggleMenu: (button) => {
    const open = document.querySelector('.navbar-links')?.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  }
};
