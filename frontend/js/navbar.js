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
          <div>
            <div class="navbar-username">${usuario}</div>
            <div class="navbar-rol">${rol}</div>
          </div>
          <div class="navbar-avatar" onclick="navbar.toggleDropdown()">${iniciales}</div>
          <div class="navbar-dropdown" id="navbar-dropdown">
            <div class="navbar-dropdown-info">
              <div class="navbar-dropdown-username">${usuario}</div>
              <div class="navbar-dropdown-rol">${rol}</div>
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
      const avatar = document.querySelector('.navbar-avatar');
      if (dropdown && !dropdown.contains(e.target) && !avatar.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  },

  toggleDropdown: () => {
    document.getElementById('navbar-dropdown')?.classList.toggle('open');
  },

  toggleMenu: (button) => {
    const open = document.querySelector('.navbar-links')?.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  }
};
