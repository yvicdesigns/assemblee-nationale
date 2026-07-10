/* =========================================
   CARTE SVG INTERACTIVE — Congo Brazzaville
   Projection équirectangulaire depuis coordonnées réelles
   x = (lon - 11.0) * 49.35
   y = (3.75 - lat) * 54.75
   ========================================= */
(function () {
  const SUPABASE_URL = 'https://djqrmcuagrfvahmcwbro.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXJtY3VhZ3JmdmFobWN3YnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjExMDEsImV4cCI6MjA5MzI5NzEwMX0.S8xpx9xLGIilit5OME-GsxM59X7ezIyplFKFDZBWmjE';

  const DEPT_META = {
    'Sangha':        { icon: '🌿', chef: 'Ouésso',       superficie: '55 795 km²' },
    'Likouala':      { icon: '🌊', chef: 'Impfondo',     superficie: '66 044 km²' },
    'Cuvette':       { icon: '🦍', chef: 'Owando',       superficie: '48 250 km²' },
    'Cuvette-Ouest': { icon: '🌳', chef: 'Ewo',          superficie: '26 600 km²' },
    'Plateaux':      { icon: '🏔️', chef: 'Djambala',    superficie: '38 400 km²' },
    'Lékoumou':      { icon: '🏞️', chef: 'Sibiti',      superficie: '20 950 km²' },
    'Bouenza':       { icon: '⚡',  chef: 'Madingou',     superficie: '12 265 km²' },
    'Niari':         { icon: '🌾', chef: 'Dolisie',      superficie: '25 942 km²' },
    'Pool':          { icon: '🌄', chef: 'Kinkala',      superficie: '33 955 km²' },
    'Kouilou':       { icon: '🌊', chef: 'Loango',       superficie: '13 694 km²' },
    'Pointe-Noire':  { icon: '🏙️', chef: 'Pointe-Noire',superficie: 'Ville-dépt'  },
    'Brazzaville':   { icon: '🏛️', chef: 'Brazzaville', superficie: 'Capitale'    },
  };

  let activeShape = null;
  let db = null;

  function getDB() {
    if (!db && window.supabase) db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return db;
  }

  function init() {
    document.querySelectorAll('.dept-shape').forEach(shape => {
      shape.addEventListener('click', () => selectDept(shape));
      shape.style.cursor = 'pointer';
    });
  }

  function selectDept(shape) {
    if (activeShape) {
      activeShape.classList.remove('active');
      const prevId = activeShape.dataset.labelId;
      if (prevId) document.getElementById(prevId)?.classList.remove('active');
    }
    shape.classList.add('active');
    const labelId = shape.dataset.labelId;
    if (labelId) document.getElementById(labelId)?.classList.add('active');
    activeShape = shape;

    const dept = shape.dataset.dept;
    if (window.innerWidth <= 900) {
      document.getElementById('cartePanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    showLoading(dept);
    loadDeputies(dept);
  }

  function showLoading(dept) {
    const meta = DEPT_META[dept] || {};
    document.getElementById('cartePanel').innerHTML = `
      <div class="dept-header">
        <div class="dept-header__icon">${meta.icon || '📍'}</div>
        <div>
          <div class="dept-header__name">${dept}</div>
          <div class="dept-header__sub">Chef-lieu : ${meta.chef || '—'} · ${meta.superficie || ''}</div>
        </div>
        <div class="dept-header__count"><strong>…</strong><span>Député(s)</span></div>
      </div>
      <div class="carte-panel-body">
        <div class="carte-loading"><div class="carte-spinner"></div>Chargement…</div>
      </div>`;
  }

  async function loadDeputies(dept) {
    const meta = DEPT_META[dept] || {};
    let deputies = [];
    try {
      const client = getDB();
      if (client) {
        const { data } = await client
          .from('deputes').select('name, constituency, department, groupe, photo_url')
          .ilike('department', `%${dept}%`).order('name');
        if (data) deputies = data;
      }
    } catch (_) {}

    const count = deputies.length;
    let listHTML = count === 0
      ? `<div class="carte-empty"><strong>Données non disponibles</strong>Ce département sera mis à jour prochainement.<br><a href="deputes.html" style="color:var(--vert);margin-top:10px;display:inline-block;font-size:.82rem;">Voir tous les députés →</a></div>`
      : `<div class="deputes-grid-carte">${deputies.map(d => {
          const ini = (d.name||'').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();
          const ph = d.photo_url ? `<img src="${d.photo_url}" alt="${d.name}" loading="lazy">` : ini;
          return `<div class="depute-card-carte">
            <div class="depute-card-carte__photo">${ph}</div>
            <div class="depute-card-carte__info">
              <div class="depute-card-carte__name">${d.name||'—'}</div>
              <div class="depute-card-carte__circ">${d.constituency||dept}</div>
              ${d.groupe?`<div class="depute-card-carte__groupe">${d.groupe}</div>`:''}
            </div></div>`;
        }).join('')}</div>
        <p style="margin-top:14px;text-align:right;"><a href="deputes.html" style="color:var(--vert);font-size:.8rem;font-weight:600;">Voir tous les députés →</a></p>`;

    document.getElementById('cartePanel').innerHTML = `
      <div class="dept-header">
        <div class="dept-header__icon">${meta.icon||'📍'}</div>
        <div>
          <div class="dept-header__name">${dept}</div>
          <div class="dept-header__sub">Chef-lieu : ${meta.chef||'—'} · ${meta.superficie||''}</div>
        </div>
        <div class="dept-header__count"><strong>${count}</strong><span>Député(s)</span></div>
      </div>
      <div class="carte-panel-body">${listHTML}</div>`;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
