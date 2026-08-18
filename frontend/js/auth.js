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

  isAuthenticated: () => !!localStorage.getItem('token'),

  verificarAcceso: () => {
    if (!auth.isAuthenticated()) {
      window.location.href = '/index.html';
    }
  },

  tieneRol: (...roles) => {
    return roles.includes(auth.getRol());
  }
};
