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
     GeoJSON — Frontières approximatives des 12 départements
     Coordonnées : [longitude, latitude]
     Source : approximation basée sur la géographie officielle
  ------------------------------------------------------- */
  const CONGO_GEOJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Sangha' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[13.3,3.7],[16.2,3.7],[16.5,1.6],[16.0,0.8],[15.0,0.4],[13.8,0.5],[13.2,1.3],[13.0,2.5],[13.3,3.7]]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Likouala' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[16.2,3.7],[18.65,3.5],[18.65,0.2],[18.0,-0.2],[17.2,-0.5],[16.5,-0.5],[16.5,0.8],[16.0,0.8],[16.5,1.6],[16.2,3.7]]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Cuvette' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[14.8,0.4],[15.0,0.4],[16.0,0.8],[16.5,0.8],[16.5,-0.5],[17.2,-0.5],[17.0,-1.3],[15.8,-1.9],[14.8,-1.6],[14.5,-0.9],[14.8,0.1],[14.8,0.4]]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Cuvette-Ouest' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[13.8,0.5],[14.8,0.4],[14.8,0.1],[14.5,-0.9],[13.8,-1.6],[13.0,-1.6],[12.5,-0.9],[12.8,-0.3],[13.2,0.3],[13.8,0.5]]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Plateaux' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[15.8,-1.9],[17.0,-1.3],[17.2,-0.5],[18.0,-0.2],[18.65,0.2],[18.65,-3.5],[18.0,-4.3],[17.0,-4.6],[15.5,-4.1],[14.8,-3.1],[14.5,-2.1],[15.8,-1.9]]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Lékoumou' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[13.0,-1.6],[13.8,-1.6],[14.5,-0.9],[14.8,-1.6],[14.8,-3.1],[13.8,-3.6],[13.0,-3.1],[12.5,-2.1],[12.5,-1.6],[13.0,-1.6]]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Bouenza' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[13.0,-3.1],[13.8,-3.6],[14.8,-3.1],[15.5,-4.1],[15.0,-4.6],[14.5,-5.1],[13.5,-4.9],[12.8,-4.6],[12.5,-3.9],[13.0,-3.1]]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Niari' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[12.5,-1.6],[13.0,-1.6],[13.0,-3.1],[12.5,-3.9],[12.8,-4.6],[12.5,-4.9],[12.0,-5.1],[11.5,-5.1],[11.2,-4.5],[11.5,-3.6],[12.0,-2.6],[12.5,-2.1],[12.5,-1.6]]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Pool' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[14.5,-2.1],[14.8,-3.1],[15.5,-4.1],[17.0,-4.6],[18.0,-4.3],[18.65,-3.5],[18.65,-5.1],[16.0,-5.1],[15.2,-5.0],[14.5,-5.1],[14.5,-4.1],[14.5,-2.1]]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Kouilou' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[11.2,-3.6],[12.5,-3.2],[12.5,-3.9],[12.0,-5.1],[11.5,-5.1],[11.1,-4.8],[11.1,-3.6],[11.2,-3.6]]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Pointe-Noire' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[11.7,-4.6],[12.1,-4.55],[12.25,-4.75],[12.1,-4.98],[11.8,-4.98],[11.7,-4.75],[11.7,-4.6]]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Brazzaville' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[15.1,-4.1],[15.5,-4.1],[15.6,-4.3],[15.5,-4.5],[15.15,-4.5],[15.0,-4.3],[15.1,-4.1]]]
        }
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

    map = L.map('congoMap', {
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

    /* Centrer sur tout le Congo */
    map.fitBounds(geoLayer.getBounds(), { padding: [20, 20] });

    /* Force le recalcul de la taille (fix affichage gris) */
    setTimeout(() => map.invalidateSize(), 100);
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
