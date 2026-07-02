/* =========================================
   PORTAIL D'ACCÈS — Site Assemblée Nationale
   Mode maintenance uniquement.
   ========================================= */
(function () {
  const SUPABASE_URL = 'https://djqrmcuagrfvahmcwbro.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXJtY3VhZ3JmdmFobWN3YnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjExMDEsImV4cCI6MjA5MzI5NzEwMX0.S8xpx9xLGIilit5OME-GsxM59X7ezIyplFKFDZBWmjE';

  const path = window.location.pathname;

  // Pages exemptées : admin et maintenance elle-même
  if (path.includes('/admin/') || path.endsWith('/maintenance.html')) return;

  // Vérification du mode maintenance
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
  .catch(() => {});
})();
