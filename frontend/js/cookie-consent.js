(() => {
  const storageKey = 'sigeh_cookie_consent';
  if (localStorage.getItem(storageKey)) return;
  const legalPath = window.location.pathname.includes('/pages/') ? '../' : '';
  const banner = document.createElement('aside');
  banner.className = 'cookie-banner';
  banner.setAttribute('aria-label', 'Preferencias de cookies');
  banner.innerHTML = `<div class="cookie-title">Tu privacidad importa</div><p class="cookie-copy">Usamos solo cookies necesarias para mantener tu sesión segura y recordar tus preferencias. Consultá nuestra <a href="${legalPath}privacidad.html">Política de privacidad</a>.</p><div class="cookie-actions"><button class="btn btn-secondary" type="button" data-cookie-choice="necessary">Solo necesarias</button><button class="btn btn-primary" type="button" data-cookie-choice="accepted">Aceptar</button></div>`;
  banner.addEventListener('click', (event) => {
    const choice = event.target.dataset.cookieChoice;
    if (!choice) return;
    localStorage.setItem(storageKey, choice);
    banner.remove();
  });
  document.body.appendChild(banner);
})();
