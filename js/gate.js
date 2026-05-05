/* =========================================
   PORTAIL D'ACCÈS — Site Assemblée Nationale
   Vérifie le mot de passe avant chaque page.
   ========================================= */
(function () {
  const KEY  = 'an_site_access';
  const PASS = 'AN2026';

  const path = window.location.pathname;

  // Ne pas bloquer : la page gate elle-même, et l'admin (qui a sa propre auth)
  if (path.endsWith('/gate.html') || path.includes('/admin/')) return;

  if (sessionStorage.getItem(KEY) !== PASS) {
    sessionStorage.setItem('gate_back', window.location.href);
    window.location.replace('/gate.html');
  }
})();
