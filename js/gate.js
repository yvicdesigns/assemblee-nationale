/* =========================================
   PORTAIL D'ACCÈS — Site Assemblée Nationale
   Vérifie le mot de passe avant chaque page.
   Vérifie aussi le mode maintenance.
   ========================================= */
(function () {
  const KEY  = 'an_site_access';
  const PASS = 'AN2026';

  const SUPABASE_URL = 'https://djqrmcuagrfvahmcwbro.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXJtY3VhZ3JmdmFobWN3YnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjExMDEsImV4cCI6MjA5MzI5NzEwMX0.S8xpx9xLGIilit5OME-GsxM59X7ezIyplFKFDZBWmjE';

  const path = window.location.pathname;

  // Pages exemptées : gate, admin, maintenance elle-même
  const isExempt = path.endsWith('/gate.html')
    || path.includes('/admin/')
    || path.endsWith('/maintenance.html');

  if (isExempt) return;

  // 1. Vérification du mot de passe
  if (sessionStorage.getItem(KEY) !== PASS) {
    sessionStorage.setItem('gate_back', window.location.href);
    window.location.replace('/gate.html');
    return;
  }

  // 2. Vérification du mode maintenance (async, non bloquant)
  fetch(`${SUPABASE_URL}/rest/v1/parametres?key=eq.maintenance_mode&select=value`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    }
  })
  .then(r => r.json())
  .then(data => {
    if (data?.[0]?.value === 'true') {
      window.location.replace('/maintenance.html');
    }
  })
  .catch(() => {}); // En cas d'erreur réseau, on laisse passer
})();
