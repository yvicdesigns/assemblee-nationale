/* =========================================
   ASSEMBLÉE NATIONALE — CMS Frontend Loader
   Charge les données depuis Supabase et
   met à jour le site dynamiquement.
   ========================================= */

const SUPABASE_URL = 'https://djqrmcuagrfvahmcwbro.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXJtY3VhZ3JmdmFobWN3YnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjExMDEsImV4cCI6MjA5MzI5NzEwMX0.S8xpx9xLGIilit5OME-GsxM59X7ezIyplFKFDZBWmjE';

const { createClient } = supabase;
const cms = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATS_COLOR = {
  'Plénière': 'badge-vert',
  'Actualité': 'badge-gris',
  'Audience': 'badge-rouge',
  'Audition': 'badge-gris',
  'Conférence des Présidents': 'badge-jaune',
  'Congrès': 'badge-gris',
  'Interpellation': 'badge-rouge',
  'Présidence': 'badge-gris',
};
const SLIDE_EMOJIS = ['🏛️','📜','🎙️','📢','🤝','🌍','⚖️'];
const NEWS_EMOJIS  = ['🏛️','📋','📊','📜','🌱','🎙️','🏥','🎉','🤝','🏢','🌐','📱','📢','🗓️','📅','⚡','⚖️','🎤','📰'];
const FALLBACK_GRADIENT = 'linear-gradient(135deg, #0a3d1f, #1a6b36)';

// =========================================
// INIT — lance tout dès que le DOM est prêt
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadCMSSlides(),
    loadCMSActualites(),
    loadCMSBureau(),
    loadCMSBureauPage(),
    loadCMSPresident(),
    loadCMSParametres(),
    loadCMSAgenda(),
  ]);
});

// =========================================
// SLIDES / CARROUSEL
// =========================================
async function loadCMSSlides() {
  const { data, error } = await cms
    .from('slides')
    .select('*')
    .eq('active', true)
    .order('display_order');

  if (error || !data?.length) return;

  const slider = document.querySelector('.hero-slider');
  if (!slider) return;

  // Vider les slides statiques
  slider.querySelectorAll('.slide').forEach(s => s.remove());
  slider.querySelector('.slider-dots')?.remove();

  // Créer les nouveaux slides
  data.forEach((slide, i) => {
    const el = document.createElement('div');
    el.className = `slide${i === 0 ? ' active' : ''}`;

    const bg = slide.image_url
      ? ''
      : (slide.bg_gradient || FALLBACK_GRADIENT);

    el.innerHTML = `
      <div class="slide-bg" style="${slide.image_url
        ? `background-image:url('${slide.image_url}');background-size:cover;background-position:center;`
        : `background:${bg};`}"></div>
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <span class="slide-badge">${esc(slide.category || 'Actualité')}</span>
        <h2 class="slide-title">${esc(slide.title)}</h2>
        ${slide.date_text ? `<p class="slide-date">📅 ${esc(slide.date_text)}</p>` : ''}
      </div>`;
    slider.insertBefore(el, slider.querySelector('.slider-controls'));
  });

  // Recréer les dots
  const dotsEl = document.createElement('div');
  dotsEl.className = 'slider-dots';
  dotsEl.innerHTML = data.map((_, i) => `<span class="slider-dot${i === 0 ? ' active' : ''}"></span>`).join('');
  slider.insertBefore(dotsEl, slider.querySelector('.slider-controls'));

  // Relancer le carrousel JS (défini dans main.js)
  if (typeof initSlider === 'function') initSlider();
}

// =========================================
// ACTUALITÉS
// Images Wikimedia Commons libres de droits pour l'Assemblée nationale du Congo
const WM = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
const NEWS_IMAGES = [
  { re: /anniversaire|proclamation|indépend|drapeau|national.*congo|congo.*national/i,
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Flag_of_the_Republic_of_the_Congo.svg' },
  { re: /santé|médic|hôpital|soin|maladie|épidémie/i,
    url: WM + 'Dispensaire_de_Pointe-Noire_(Congo).jpg' },
  { re: /pléni|session|budget|loi.*finance|finance.*loi|ordinaire/i,
    url: WM + 'Parlementaires_congolais_-_2019.jpg' },
  { re: /commission|réorganis|réform|structure/i,
    url: WM + 'Parlementaires_congolais_-_2019.jpg' },
  { re: /audience|rencontr|visite|délégat/i,
    url: WM + 'Palais_du_Parlement_de_Brazzaville.jpg' },
  { re: /quinquennat|bilan|mandat|résultat/i,
    url: WM + 'Parlementaires_congolais_-_2019.jpg' },
  { re: /présid/i,
    url: WM + 'Palais_du_Parlement_de_Brazzaville.jpg' },
  { re: /congrès|sénat/i,
    url: WM + 'Palais_du_Parlement_de_Brazzaville.jpg' },
];

function resolveNewsImage(title) {
  for (const { re, url } of NEWS_IMAGES) {
    if (re.test(title)) return url;
  }
  return WM + 'Parlementaires_congolais_-_2019.jpg';
}

// =========================================
async function loadCMSActualites() {
  const { data, error } = await cms
    .from('actualites')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error || !data?.length) return;

  const grid = document.querySelector('.news-grid');
  if (!grid) return;

  grid.innerHTML = data.map((a, i) => {
    const catSlug = slugify(a.category);
    const badgeClass = CATS_COLOR[a.category] || 'badge-gris';
    const emoji = NEWS_EMOJIS[i % NEWS_EMOJIS.length];
    const gradients = [
      'linear-gradient(135deg,#0a3d1f,#1a6b36)',
      'linear-gradient(135deg,#0a1a3d,#1a3d6b)',
      'linear-gradient(135deg,#3d2a00,#6b5000)',
      'linear-gradient(135deg,#1a0a2a,#3a1a5a)',
      'linear-gradient(135deg,#0a2a1a,#1a5a3a)',
      'linear-gradient(135deg,#001a3d,#003a6b)',
    ];
    const imgSrc = a.image_url || resolveNewsImage(a.title || '');
    const imgStyle = `background-image:url('${imgSrc}');background-size:cover;background-position:center;`;

    return `
      <article class="news-card" data-cat="${catSlug}">
        <div class="news-card__img" style="${imgStyle}">
        </div>
        <div class="news-card__body">
          <div class="news-card__meta">
            <span class="badge ${badgeClass}">${esc(a.category)}</span>
            <span class="news-card__date">${esc(a.date_text)}</span>
          </div>
          <h3 class="news-card__title">${esc(a.title)}</h3>
          <a href="pages/blog.html" class="news-card__link">Lire la suite →</a>
        </div>
      </article>`;
  }).join('');

  // Ré-attacher les filtres
  attachNewsFilters();
}

// =========================================
// BUREAU
// =========================================
async function loadCMSBureau() {
  const { data, error } = await cms
    .from('bureau')
    .select('*')
    .eq('active', true)
    .order('display_order');

  if (error || !data?.length) return;

  const grid = document.querySelector('.bureau-grid');
  if (!grid) return;

  const av = (m, cls) => `<div class="${cls}">${
    m.photo_url
      ? `<img src="${esc(m.photo_url)}" alt="${esc(m.name)}" loading="lazy">`
      : '👤'
  }</div>`;

  const roleIcon = r => /secr/i.test(r) ? '🍃' : /quest/i.test(r) ? '⚖️' : '📋';

  const president = data[0];
  const vps       = data.slice(1, 3);
  const bottom    = data.slice(3);

  grid.innerHTML = `
    <!-- ── Président ── -->
    <div class="bh-president" data-bureau-id="0">
      ${av(president, 'bh-president__photo')}
      <div class="bh-president__info">
        <span class="bh-badge">PRÉSIDENT</span>
        <h3 class="bh-president__name">${esc(president.name)}</h3>
        <div class="bh-star">★</div>
      </div>
    </div>

    ${vps.length ? `
    <!-- ── Vice-Présidents ── -->
    <div class="bh-section-header">
      <div class="bh-line"></div>
      <span class="bh-section-label">VICE-PRÉSIDENTS</span>
      <div class="bh-line"></div>
    </div>
    <div class="bh-vp-grid">
      ${vps.map((m, i) => `
      <div class="bh-card-h" data-bureau-id="${i + 1}">
        <div class="bh-card-h__bar"></div>
        ${av(m, 'bh-card-h__photo')}
        <div class="bh-card-h__info">
          <span class="bh-card-h__role">${esc(m.role_title)}</span>
          <p class="bh-card-h__name">${esc(m.name)}</p>
          <div class="bh-card-h__line"></div>
        </div>
      </div>`).join('')}
    </div>` : ''}

    ${bottom.length ? `
    <!-- ── Secrétaires & Questeurs ── -->
    <div class="bh-section-header">
      <div class="bh-line"></div>
      <span class="bh-section-label">SECRÉTAIRES ET QUESTEURS</span>
      <div class="bh-line"></div>
    </div>
    <div class="bh-bottom-grid">
      ${bottom.map((m, i) => `
      <div class="bh-card-sm" data-bureau-id="${i + 3}">
        <div class="bh-card-sm__bar"></div>
        ${av(m, 'bh-card-sm__photo')}
        <div class="bh-card-sm__info">
          <span class="bh-card-sm__icon">${roleIcon(m.role_title)}</span>
          <span class="bh-card-sm__role">${esc(m.role_title)}</span>
          <p class="bh-card-sm__name">${esc(m.name)}</p>
          <div class="bh-card-sm__line"></div>
        </div>
      </div>`).join('')}
    </div>` : ''}
  `;

  // Inject modal if not present
  if (!document.getElementById('bureauModal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="bureauModal" class="bm-overlay" role="dialog" aria-modal="true">
        <div class="bm-box">
          <button class="bm-close" aria-label="Fermer">&times;</button>
          <div class="bm-photo-wrap">
            <div class="bm-photo" id="bmPhoto"></div>
          </div>
          <div class="bm-info">
            <span class="bm-role" id="bmRole"></span>
            <h2 class="bm-name" id="bmName"></h2>
            <div class="bm-divider"></div>
            <p class="bm-bio" id="bmBio"></p>
            <div class="bm-meta" id="bmMeta"></div>
          </div>
        </div>
      </div>`);

    const overlay = document.getElementById('bureauModal');
    overlay.addEventListener('click', e => { if (e.target === overlay) closeBureauModal(); });
    overlay.querySelector('.bm-close').addEventListener('click', closeBureauModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBureauModal(); });
  }

  // Click handlers — tous les éléments avec data-bureau-id
  grid.querySelectorAll('[data-bureau-id]').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => openBureauModal(data[+el.dataset.bureauId]));
  });
}

function openBureauModal(m) {
  const modal = document.getElementById('bureauModal');
  document.getElementById('bmRole').textContent = m.role_title || '';
  document.getElementById('bmName').textContent = m.name || '';
  document.getElementById('bmBio').textContent  = m.biography || 'Aucune biographie disponible.';
  document.getElementById('bmPhoto').innerHTML  = m.photo_url
    ? `<img src="${esc(m.photo_url)}" alt="${esc(m.name)}">`
    : '<span class="bm-placeholder">👤</span>';
  const meta = [];
  if (m.constituency) meta.push(`<span>📍 ${esc(m.constituency)}</span>`);
  document.getElementById('bmMeta').innerHTML = meta.join('');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBureauModal() {
  const modal = document.getElementById('bureauModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// =========================================
// BUREAU — PAGE DÉDIÉE (grandes photos)
// =========================================
async function loadCMSBureauPage() {
  const grid = document.querySelector('.bureau-page-grid');
  if (!grid) return;

  const { data, error } = await cms
    .from('bureau')
    .select('*')
    .eq('active', true)
    .order('display_order');

  if (error || !data?.length) return;

  grid.innerHTML = data.map((m, i) => {
    const isPresident = i === 0;
    const photoHTML = m.photo_url
      ? `<img src="${esc(m.photo_url)}" alt="${esc(m.name)}" loading="lazy">`
      : `<div class="bpg-no-photo">👤</div>`;
    return `
      <div class="bpg-card${isPresident ? ' bpg-president' : ''}">
        <div class="bpg-photo">${photoHTML}</div>
        <div class="bpg-body">
          <span class="bpg-role">${esc(m.role_title)}</span>
          <h3 class="bpg-name">${esc(m.name)}</h3>
          ${m.constituency ? `<p class="bpg-constituency">📍 ${esc(m.constituency)}</p>` : ''}
          ${m.biography ? `<p class="bpg-bio">${esc(m.biography)}</p>` : ''}
          ${isPresident ? '<div class="bpg-tricolor"><span></span><span></span><span></span></div>' : ''}
        </div>
      </div>`;
  }).join('');
}

// =========================================
// PRÉSIDENT
// =========================================
async function loadCMSPresident() {
  const { data, error } = await cms
    .from('parametres')
    .select('*')
    .in('key', ['president_name','president_role','president_bio','president_facts','president_photo']);

  if (error || !data?.length) return;

  const map = {};
  data.forEach(p => { map[p.key] = p.value; });

  const setTxt = (sel, val) => {
    const el = document.querySelector(sel);
    if (el && val) el.textContent = val;
  };

  setTxt('.president-name', map.president_name);
  setTxt('.president-role', map.president_role);
  setTxt('.president-bio', map.president_bio);

  if (map.president_facts) {
    const listEl = document.querySelector('.president-facts');
    if (listEl) {
      const facts = map.president_facts.split('|').filter(Boolean);
      listEl.innerHTML = facts.map(f => `<li>${esc(f.trim())}</li>`).join('');
    }
  }

  if (map.president_photo) {
    const frame = document.querySelector('.president-photo__frame');
    if (frame) {
      frame.innerHTML = `<img src="${esc(map.president_photo)}" alt="Président" style="width:100%;height:100%;object-fit:cover;">`;
    }
  }
}

// =========================================
// PARAMÈTRES
// =========================================
async function loadCMSParametres() {
  const { data, error } = await cms
    .from('parametres')
    .select('*')
    .in('key', ['site_address', 'live_url', 'site_logo']);

  if (error || !data?.length) return;

  const map = {};
  data.forEach(p => { map[p.key] = p.value; });

  if (map.site_address) {
    document.querySelectorAll('.footer-address span:last-child, .contact-address').forEach(el => {
      el.textContent = map.site_address;
    });
  }

  if (map.live_url) {
    document.querySelectorAll('.live-btn, .top-bar__live a').forEach(el => {
      el.href = map.live_url;
      el.target = '_blank';
      el.rel = 'noopener';
    });
  }

  if (map.site_logo) {
    const emblem = document.querySelector('.logo-emblem');
    if (emblem) {
      emblem.innerHTML = `<img src="${esc(map.site_logo)}" alt="Logo Assemblée Nationale" style="height:64px;width:auto;object-fit:contain;">`;
    }
  }
}

// =========================================
// AGENDA
// =========================================
async function loadCMSAgenda() {
  const grid = document.querySelector('.agenda-grid');
  if (!grid) return;

  const { data, error } = await cms
    .from('agenda')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(4);

  if (error || !data?.length) return;

  grid.innerHTML = data.map(ev => `
    <div class="agenda-card">
      <p class="agenda-date">📅 ${esc(ev.date_text)}</p>
      <h3 class="agenda-title">${esc(ev.title)}</h3>
      ${ev.description ? `<p class="agenda-desc">${esc(ev.description)}</p>` : ''}
    </div>`).join('');
}

// =========================================
// HELPERS
// =========================================
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function slugify(str) {
  if (!str) return 'tout';
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function attachNewsFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const newsCards  = document.querySelectorAll('.news-card');

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      newsCards.forEach(card => {
        card.classList.toggle('hidden', cat !== 'tout' && card.dataset.cat !== cat);
      });
    };
  });
}
