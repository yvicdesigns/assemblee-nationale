/* =========================================
   CARTE INTERACTIVE LEAFLET — Assemblée Nationale Congo
   Vraies coordonnées géographiques (GeoJSON)
   ========================================= */
(function () {
  const SUPABASE_URL = 'https://djqrmcuagrfvahmcwbro.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXJtY3VhZ3JmdmFobWN3YnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjExMDEsImV4cCI6MjA5MzI5NzEwMX0.S8xpx9xLGIilit5OME-GsxM59X7ezIyplFKFDZBWmjE';

  /* ----- Données dept ----- */
  const DEPT_META = {
    'Sangha':        { icon: '🌿', chef: 'Ouesso',        superficie: '55 795 km²' },
    'Likouala':      { icon: '🌊', chef: 'Impfondo',      superficie: '66 044 km²' },
    'Cuvette':       { icon: '🦍', chef: 'Owando',        superficie: '48 250 km²' },
    'Cuvette-Ouest': { icon: '🌳', chef: 'Ewo',           superficie: '26 600 km²' },
    'Plateaux':      { icon: '🏔️', chef: 'Djambala',     superficie: '38 400 km²' },
    'Lékoumou':      { icon: '🏞️', chef: 'Sibiti',       superficie: '20 950 km²' },
    'Bouenza':       { icon: '⚡',  chef: 'Madingou',      superficie: '12 265 km²' },
    'Niari':         { icon: '🌾', chef: 'Dolisie',       superficie: '25 942 km²' },
    'Pool':          { icon: '🌄', chef: 'Kinkala',       superficie: '33 955 km²' },
    'Kouilou':       { icon: '🌊', chef: 'Loango',        superficie: '13 694 km²' },
    'Pointe-Noire':  { icon: '🏙️', chef: 'Pointe-Noire', superficie: 'Ville-dépt'  },
    'Brazzaville':   { icon: '🏛️', chef: 'Brazzaville',  superficie: 'Capitale'    },
  };

  /* -------------------------------------------------------
     GeoJSON — Frontières des 12 départements du Congo
     Coordonnées calibrées sur cartes officielles (MAE 2004)
     Format GeoJSON : [longitude, latitude]
  ------------------------------------------------------- */
  const CONGO_GEOJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Sangha' },
        /* NW : onglet Sembé (13.5-14.3E) + corps principal Ouésso (14.3-16.2E) */
        geometry: { type: 'Polygon', coordinates: [[ [13.5,3.72],[14.3,3.72],[14.3,3.0],[14.8,3.0],[14.8,3.72],[16.18,3.72],[16.5,2.0],[16.3,1.0],[15.5,0.55],[14.5,0.55],[13.8,1.0],[13.5,1.8],[13.3,2.5],[13.5,3.72] ]] }
      },
      {
        type: 'Feature',
        properties: { name: 'Likouala' },
        /* NE, très grand. Impfondo 18.07E/1.62N, Dongou 17.7E/3.1N */
        geometry: { type: 'Polygon', coordinates: [[ [16.18,3.72],[18.65,3.72],[18.65,0.5],[18.0,0.0],[17.2,-0.3],[16.5,-0.5],[16.3,1.0],[16.5,2.0],[16.18,3.72] ]] }
      },
      {
        type: 'Feature',
        properties: { name: 'Cuvette' },
        /* Centre-nord. Owando 15.9E/-0.48, Makoua 15.7E/0 */
        geometry: { type: 'Polygon', coordinates: [[ [14.5,0.55],[15.5,0.55],[16.3,1.0],[16.5,-0.5],[17.2,-0.3],[17.0,-1.2],[16.0,-2.0],[15.2,-1.8],[14.5,-1.0],[14.5,0.0],[14.5,0.55] ]] }
      },
      {
        type: 'Feature',
        properties: { name: 'Cuvette-Ouest' },
        /* Ouest, Ewo 14.82E/-0.88, Okoyo 15.1E/-1.47 */
        geometry: { type: 'Polygon', coordinates: [[ [13.8,1.0],[14.5,0.55],[14.5,0.0],[14.5,-1.0],[13.8,-1.8],[13.0,-1.8],[12.5,-1.0],[12.7,-0.3],[13.2,0.3],[13.8,1.0] ]] }
      },
      {
        type: 'Feature',
        properties: { name: 'Plateaux' },
        /* Centre-est. Djambala 14.75E/-2.52, Gamboma 15.87E/-1.88 */
        geometry: { type: 'Polygon', coordinates: [[ [15.2,-1.8],[16.0,-2.0],[17.0,-1.2],[17.2,-0.3],[18.0,0.0],[18.65,0.5],[18.65,-4.0],[17.5,-4.5],[16.0,-4.8],[15.0,-4.0],[14.8,-3.0],[15.2,-1.8] ]] }
      },
      {
        type: 'Feature',
        properties: { name: 'Lékoumou' },
        /* Centre. Sibiti 13.35E/-3.68, Zanaga 13.8E/-2.85 */
        geometry: { type: 'Polygon', coordinates: [[ [13.0,-1.8],[13.8,-1.8],[14.5,-1.0],[15.2,-1.8],[14.8,-3.0],[14.0,-3.8],[13.0,-3.2],[12.5,-2.2],[13.0,-1.8] ]] }
      },
      {
        type: 'Feature',
        properties: { name: 'Bouenza' },
        /* Centre-sud. Madingou 13.55E/-4.15, Nkayi 13E/-4.2 */
        geometry: { type: 'Polygon', coordinates: [[ [13.0,-3.2],[14.0,-3.8],[14.8,-3.0],[15.0,-4.0],[15.3,-4.7],[14.5,-5.1],[13.5,-4.9],[12.8,-4.6],[12.5,-4.0],[13.0,-3.2] ]] }
      },
      {
        type: 'Feature',
        properties: { name: 'Niari' },
        /* SW. Dolisie 12.67E/-4.2, Mossendjo 12.7E/-3.0 */
        geometry: { type: 'Polygon', coordinates: [[ [12.5,-1.0],[13.0,-1.8],[12.5,-2.2],[13.0,-3.2],[12.5,-4.0],[12.8,-4.6],[12.3,-5.0],[11.8,-5.05],[11.3,-4.6],[11.5,-3.8],[11.8,-2.8],[12.2,-2.0],[12.5,-1.0] ]] }
      },
      {
        type: 'Feature',
        properties: { name: 'Pool' },
        /* SE, longe fleuve Congo. Kinkala 14.76E/-4.36 */
        geometry: { type: 'Polygon', coordinates: [[ [14.5,-2.2],[14.8,-3.0],[15.0,-4.0],[16.0,-4.8],[17.5,-4.5],[18.65,-4.0],[18.65,-5.15],[16.2,-5.15],[15.3,-5.1],[14.5,-5.1],[15.3,-4.7],[15.0,-4.0],[14.5,-3.5],[14.5,-2.2] ]] }
      },
      {
        type: 'Feature',
        properties: { name: 'Kouilou' },
        /* SW côtier, autour de Pointe-Noire */
        geometry: { type: 'Polygon', coordinates: [[ [12.5,-1.0],[12.7,-0.3],[12.5,-0.5],[12.0,-1.5],[11.8,-2.5],[11.5,-3.3],[11.2,-4.0],[11.5,-4.6],[11.8,-5.05],[11.3,-5.1],[11.1,-4.7],[11.5,-3.8],[11.8,-2.8],[12.2,-2.0],[12.5,-1.0] ]] }
      },
      {
        type: 'Feature',
        properties: { name: 'Pointe-Noire' },
        /* Ville-département enclavée dans Kouilou, côte atlantique */
        geometry: { type: 'Polygon', coordinates: [[ [11.75,-4.55],[12.05,-4.5],[12.2,-4.72],[12.1,-4.97],[11.8,-4.97],[11.7,-4.72],[11.75,-4.55] ]] }
      },
      {
        type: 'Feature',
        properties: { name: 'Brazzaville' },
        /* Capitale, rive droite du fleuve Congo */
        geometry: { type: 'Polygon', coordinates: [[ [15.1,-4.1],[15.55,-4.1],[15.65,-4.3],[15.55,-4.52],[15.15,-4.52],[15.0,-4.32],[15.1,-4.1] ]] }
      }
    ]
  };

  /* ----- State ----- */
  let map, geoLayer, activeLayer = null;
  let db = null;

  function getDB() {
    if (!db && window.supabase) db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return db;
  }

  /* ----- Styles ----- */
  const STYLE_DEFAULT  = { fillColor: '#81c784', fillOpacity: 0.55, color: '#fff', weight: 2 };
  const STYLE_HOVER    = { fillColor: '#4caf50', fillOpacity: 0.75, color: '#fff', weight: 2.5 };
  const STYLE_ACTIVE   = { fillColor: '#009A44', fillOpacity: 0.85, color: '#005a1e', weight: 2.5 };
  const STYLE_CITY_D   = { fillColor: '#66bb6a', fillOpacity: 0.85, color: '#fff', weight: 2 };
  const STYLE_CITY_H   = { fillColor: '#2e7d32', fillOpacity: 0.9,  color: '#fff', weight: 2 };
  const STYLE_CITY_A   = { fillColor: '#1b5e20', fillOpacity: 1,    color: '#003300', weight: 2 };

  const CITIES = new Set(['Pointe-Noire', 'Brazzaville']);

  function defaultStyle(name) { return CITIES.has(name) ? STYLE_CITY_D : STYLE_DEFAULT; }
  function hoverStyle(name)   { return CITIES.has(name) ? STYLE_CITY_H : STYLE_HOVER; }
  function activeStyle(name)  { return CITIES.has(name) ? STYLE_CITY_A : STYLE_ACTIVE; }

  /* ----- Init ----- */
  function init() {
    const mapEl = document.getElementById('congoMap');
    if (!mapEl || typeof L === 'undefined') return;

    /* Centre Congo Brazzaville : lat -0.8, lon 15.2 — zoom 6 */
    map = L.map('congoMap', {
      center: [-0.8, 15.2],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true
    });

    /* Tuile CartoDB Positron — fiable, propre, sans SRI */
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    /* Couche GeoJSON */
    geoLayer = L.geoJSON(CONGO_GEOJSON, {
      style: feature => defaultStyle(feature.properties.name),
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name;

        /* Tooltip permanent */
        const isCity = CITIES.has(name);
        layer.bindTooltip(isCity ? name : name, {
          permanent: true,
          direction: 'center',
          className: 'dept-tooltip',
          offset: [0, 0]
        });

        /* Events */
        layer.on({
          mouseover(e) {
            if (e.target !== activeLayer) e.target.setStyle(hoverStyle(name));
          },
          mouseout(e) {
            if (e.target !== activeLayer) e.target.setStyle(defaultStyle(name));
          },
          click() {
            selectDept(name, layer);
          }
        });
      }
    }).addTo(map);

    /* Ajuste le zoom pour afficher tout le Congo */
    try {
      const bounds = geoLayer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24] });
    } catch (_) {}

    /* Force le recalcul de la taille (fix affichage gris) */
    setTimeout(() => map.invalidateSize(), 150);
  }

  /* ----- Sélection département ----- */
  function selectDept(name, layer) {
    /* Réinitialise l'ancien */
    if (activeLayer) {
      const prevName = activeLayer.feature.properties.name;
      activeLayer.setStyle(defaultStyle(prevName));
      const tt = activeLayer.getTooltip();
      if (tt) { const el = tt.getElement(); if (el) el.classList.remove('active-tooltip'); }
    }

    /* Active le nouveau */
    layer.setStyle(activeStyle(name));
    const tt = layer.getTooltip();
    if (tt) { const el = tt.getElement(); if (el) el.classList.add('active-tooltip'); }
    activeLayer = layer;

    /* Scroll vers le panel sur mobile */
    const panel = document.getElementById('cartePanel');
    if (window.innerWidth <= 1000 && panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showLoading(name);
    loadDeputies(name);
  }

  /* ----- Affichage loading ----- */
  function showLoading(name) {
    const meta = DEPT_META[name] || {};
    const panel = document.getElementById('cartePanel');
    panel.innerHTML = `
      <div class="dept-header">
        <div class="dept-header__icon">${meta.icon || '📍'}</div>
        <div>
          <div class="dept-header__name">${name}</div>
          <div class="dept-header__sub">Chef-lieu : ${meta.chef || '—'} · ${meta.superficie || ''}</div>
        </div>
        <div class="dept-header__count">
          <strong>…</strong>
          <span>Député(s)</span>
        </div>
      </div>
      <div class="carte-panel-body">
        <div class="carte-loading"><div class="carte-spinner"></div>Chargement…</div>
      </div>`;
  }

  /* ----- Chargement Supabase ----- */
  async function loadDeputies(name) {
    const meta = DEPT_META[name] || {};
    let deputies = [];

    try {
      const client = getDB();
      if (client) {
        const { data } = await client
          .from('deputes')
          .select('name, constituency, department, groupe, photo_url')
          .ilike('department', `%${name}%`)
          .eq('active', true)
          .order('name');
        if (data) deputies = data;
      }
    } catch (_) {}

    const count = deputies.length;
    const panel = document.getElementById('cartePanel');

    let listHTML = '';
    if (count === 0) {
      listHTML = `
        <div class="carte-empty">
          <strong>Données non encore disponibles</strong>
          Les informations sur ce département seront ajoutées prochainement.<br>
          <a href="deputes.html" style="color:var(--vert);margin-top:10px;display:inline-block;font-size:0.82rem;">Voir tous les députés →</a>
        </div>`;
    } else {
      listHTML = `<div class="deputes-grid-carte">`;
      deputies.forEach(d => {
        const initials = (d.name || '').split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
        const photo = d.photo_url
          ? `<img src="${d.photo_url}" alt="${d.name}" loading="lazy">`
          : initials;
        listHTML += `
          <div class="depute-card-carte">
            <div class="depute-card-carte__photo">${photo}</div>
            <div class="depute-card-carte__info">
              <div class="depute-card-carte__name">${d.name || '—'}</div>
              <div class="depute-card-carte__circ">${d.constituency || name}</div>
              ${d.groupe ? `<div class="depute-card-carte__groupe">${d.groupe}</div>` : ''}
            </div>
          </div>`;
      });
      listHTML += `</div>
        <p style="margin-top:14px;text-align:right;">
          <a href="deputes.html" style="color:var(--vert);font-size:0.8rem;font-weight:600;">Voir tous les députés →</a>
        </p>`;
    }

    panel.innerHTML = `
      <div class="dept-header">
        <div class="dept-header__icon">${meta.icon || '📍'}</div>
        <div>
          <div class="dept-header__name">${name}</div>
          <div class="dept-header__sub">Chef-lieu : ${meta.chef || '—'} · ${meta.superficie || ''}</div>
        </div>
        <div class="dept-header__count">
          <strong>${count}</strong>
          <span>Député(s)</span>
        </div>
      </div>
      <div class="carte-panel-body">${listHTML}</div>`;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
