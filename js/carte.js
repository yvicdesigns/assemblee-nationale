/* =========================================
   CARTE INTERACTIVE — Assemblée Nationale
   ========================================= */
(function () {
  const SUPABASE_URL = 'https://djqrmcuagrfvahmcwbro.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXJtY3VhZ3JmdmFobWN3YnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjExMDEsImV4cCI6MjA5MzI5NzEwMX0.S8xpx9xLGIilit5OME-GsxM59X7ezIyplFKFDZBWmjE';

  const DEPT_INFO = {
    'Sangha':        { icon: '🌿', chef: 'Ouesso',       superficie: '55 795 km²' },
    'Likouala':      { icon: '🌊', chef: 'Impfondo',     superficie: '66 044 km²' },
    'Cuvette':       { icon: '🦍', chef: 'Owando',       superficie: '48 250 km²' },
    'Cuvette-Ouest': { icon: '🌳', chef: 'Ewo',          superficie: '26 600 km²' },
    'Plateaux':      { icon: '🏔️', chef: 'Djambala',    superficie: '38 400 km²' },
    'Lékoumou':      { icon: '🏞️', chef: 'Sibiti',      superficie: '20 950 km²' },
    'Bouenza':       { icon: '⚡', chef: 'Madingou',     superficie: '12 265 km²' },
    'Niari':         { icon: '🌾', chef: 'Dolisie',      superficie: '25 942 km²' },
    'Pool':          { icon: '🌄', chef: 'Kinkala',      superficie: '33 955 km²' },
    'Kouilou':       { icon: '🌊', chef: 'Pointe-Noire', superficie: '13 694 km²' },
    'Pointe-Noire':  { icon: '🏙️', chef: 'Pointe-Noire', superficie: 'Ville-dépt' },
    'Brazzaville':   { icon: '🏛️', chef: 'Brazzaville', superficie: 'Capitale' },
  };

  let activeShape = null;
  let db = null;

  function getDB() {
    if (!db && window.supabase) {
      db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return db;
  }

  function init() {
    const shapes = document.querySelectorAll('.dept-shape');
    shapes.forEach(shape => {
      shape.addEventListener('click', () => selectDept(shape));
      shape.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') selectDept(shape);
      });
      shape.setAttribute('role', 'button');
      shape.setAttribute('tabindex', '0');
      shape.setAttribute('aria-label', `Département ${shape.dataset.dept}`);
    });
  }

  function selectDept(shape) {
    const dept = shape.dataset.dept;

    // Deselect previous
    if (activeShape) {
      activeShape.classList.remove('active');
      const prevLabel = document.getElementById('label-' + getShapeId(activeShape.dataset.dept));
      if (prevLabel) prevLabel.classList.remove('active');
    }

    // Select new
    shape.classList.add('active');
    const label = document.getElementById('label-' + getShapeId(dept));
    if (label) label.classList.add('active');
    activeShape = shape;

    showLoading(dept);
    loadDeputies(dept);
  }

  function getShapeId(dept) {
    const map = {
      'Sangha': 'sangha',
      'Cuvette': 'cuvette',
      'Likouala': 'likouala',
      'Cuvette-Ouest': 'cuvette-ouest',
      'Plateaux': 'plateaux',
      'Lékoumou': 'lekoumou',
      'Bouenza': 'bouenza',
      'Niari': 'niari',
      'Pool': 'pool',
      'Kouilou': 'kouilou',
      'Pointe-Noire': 'pn',
      'Brazzaville': 'brazza',
    };
    return map[dept] || dept.toLowerCase().replace(/[^a-z]/g, '');
  }

  function showLoading(dept) {
    const panel = document.getElementById('cartePanel');
    const info = DEPT_INFO[dept] || {};
    panel.innerHTML = `
      <div class="dept-header">
        <div class="dept-header__icon">${info.icon || '📍'}</div>
        <div>
          <div class="dept-header__name">${dept}</div>
          <div class="dept-header__sub">Chef-lieu : ${info.chef || '—'} · ${info.superficie || ''}</div>
        </div>
        <div class="dept-header__count">
          <strong id="deptCount">…</strong>
          <span>Député(s)</span>
        </div>
      </div>
      <div class="carte-loading">
        <div class="carte-spinner"></div>
        Chargement des députés…
      </div>`;
  }

  async function loadDeputies(dept) {
    const panel = document.getElementById('cartePanel');
    const info = DEPT_INFO[dept] || {};
    const client = getDB();

    let deputies = [];
    try {
      if (client) {
        const { data, error } = await client
          .from('deputes')
          .select('name, constituency, department, groupe, photo_url, gender')
          .ilike('department', `%${dept}%`)
          .eq('active', true)
          .order('name');

        if (!error && data) deputies = data;
      }
    } catch (_) {}

    const count = deputies.length;
    const countEl = document.getElementById('deptCount');
    if (countEl) countEl.textContent = count;

    let html = `
      <div class="dept-header">
        <div class="dept-header__icon">${info.icon || '📍'}</div>
        <div>
          <div class="dept-header__name">${dept}</div>
          <div class="dept-header__sub">Chef-lieu : ${info.chef || '—'} · ${info.superficie || ''}</div>
        </div>
        <div class="dept-header__count">
          <strong>${count}</strong>
          <span>Député(s)</span>
        </div>
      </div>`;

    if (count === 0) {
      html += `
        <div class="carte-empty">
          <strong>Aucun député trouvé</strong>
          Les données de ce département ne sont pas encore disponibles.<br>
          <a href="deputes.html" style="color:var(--vert);margin-top:12px;display:inline-block;">Voir tous les députés →</a>
        </div>`;
    } else {
      html += `<div class="deputes-grid-carte">`;
      deputies.forEach(d => {
        const initials = (d.name || '').split(' ').map(w => w[0] || '').slice(0, 2).join('').toUpperCase();
        const photoHtml = d.photo_url
          ? `<img src="${d.photo_url}" alt="${d.name}" loading="lazy">`
          : initials;
        html += `
          <div class="depute-card-carte">
            <div class="depute-card-carte__photo">${photoHtml}</div>
            <div class="depute-card-carte__name">${d.name || '—'}</div>
            <div class="depute-card-carte__circ">${d.constituency || dept}</div>
            ${d.groupe ? `<span class="depute-card-carte__groupe">${d.groupe}</span>` : ''}
          </div>`;
      });
      html += `</div>`;
      html += `<p style="margin-top:20px;text-align:right;"><a href="deputes.html?dept=${encodeURIComponent(dept)}" style="color:var(--vert);font-size:0.85rem;font-weight:600;">Voir la fiche complète →</a></p>`;
    }

    panel.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
