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
    loadCMSPresident(),
    loadCMSParametres(),
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
    const imgStyle = a.image_url
      ? `background-image:url('${a.image_url}');background-size:cover;background-position:center;`
      : `background:${gradients[i % gradients.length]};`;

    return `
      <article class="news-card" data-cat="${catSlug}">
        <div class="news-card__img" style="${imgStyle}">
          ${!a.image_url ? `<span>${emoji}</span>` : ''}
        </div>
        <div class="news-card__body">
          <div class="news-card__meta">
            <span class="badge ${badgeClass}">${esc(a.category)}</span>
            <span class="news-card__date">${esc(a.date_text)}</span>
          </div>
          <h3 class="news-card__title">${esc(a.title)}</h3>
          <a href="#" class="news-card__link">Lire la suite →</a>
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

  grid.innerHTML = data.map((m, i) => `
    <div class="bureau-card${i === 0 ? ' president' : ''}">
      <div class="bureau-avatar">
        ${m.photo_url
          ? `<img src="${esc(m.photo_url)}" alt="${esc(m.name)}" loading="lazy" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
          : '👤'}
      </div>
      <p class="bureau-role">${esc(m.role_title)}</p>
      <p class="bureau-name">${esc(m.name)}</p>
    </div>`).join('');
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
