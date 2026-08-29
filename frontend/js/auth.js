const auth = {
  login: async (username, password) => {
    const res = await fetch('https://sigeh-dusky.vercel.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');

    localStorage.setItem('token', data.token);
    localStorage.setItem('rol', data.rol);
    localStorage.setItem('username', data.username);
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
    window.location.href = '/index.html';
  },

  getToken: () => localStorage.getItem('token'),
  getRol: () => localStorage.getItem('rol'),
  getUsername: () => localStorage.getItem('username'),

  tokenExpirado: () => {
    const token = auth.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return !payload.exp || payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  },

  limpiarSesion: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
  },

  isAuthenticated: () => !!auth.getToken() && !auth.tokenExpirado(),

  verificarAcceso: () => {
    if (!auth.isAuthenticated()) {
      auth.limpiarSesion();
      window.location.replace('../index.html');
    }
  },

  sesionExpirada: () => {
    auth.limpiarSesion();
    window.location.replace('../index.html?sesion=expirada');
  },

  tieneRol: (...roles) => {
    return roles.includes(auth.getRol());
  }
};
