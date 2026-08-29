/* Se ejecuta en el <head> para impedir mostrar páginas privadas con sesión vencida. */
(() => {
  const token = localStorage.getItem('token');
  let valido = Boolean(token);

  if (valido) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      valido = Boolean(payload.exp) && payload.exp * 1000 > Date.now();
    } catch {
      valido = false;
    }
  }

  if (!valido) {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
    window.location.replace('../index.html?sesion=expirada');
  }
})();
