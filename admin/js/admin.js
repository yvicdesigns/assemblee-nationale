/* =========================================
   ASSEMBLÉE NATIONALE — CMS Admin Logic
   ========================================= */

const SUPABASE_URL = 'https://djqrmcuagrfvahmcwbro.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXJtY3VhZ3JmdmFobWN3YnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjExMDEsImV4cCI6MjA5MzI5NzEwMX0.S8xpx9xLGIilit5OME-GsxM59X7ezIyplFKFDZBWmjE';
const BUCKET = 'images';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentSection = 'accueil';
let modalType = null;
let editingId = null;
let editorInstance = null;
let deputesData = [];
let messagesData = [];
const CATEGORIES_ACTU = ['Actualité','Audience','Audition','Conférence des Présidents','Congrès','Interpellation','Plénière','Présidence'];
const CATEGORIES_ART  = ['Publication','Communiqué','Discours','Rapport','Plénière','Actualité','Audition','Présidence'];

// =========================================
// INIT
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await db.auth.getSession();
  if (!session) { window.location.href = 'index.html'; return; }

  const email = session.user.email;
  document.getElementById('userEmail').textContent = email;
  document.getElementById('userInitial').textContent = email[0].toUpperCase();

  document.getElementById('btnLogout').addEventListener('click', async () => {
    await db.auth.signOut();
    window.location.href = 'index.html';
  });

  // Nav
  document.querySelectorAll('[data-section]').forEach(btn => {
    btn.addEventListener('click', () => goTo(btn.dataset.section));
  });

  goTo('accueil');
});

// =========================================
// NAVIGATION
// =========================================
const TITLES = {
  accueil:              'Tableau de bord',
  articles:             'Articles & Publications',
  'cms-pages':          'Pages personnalisées',
  slides:               'Carrousel — Bannières',
  actualites:           'Actualités',
  president:            'Le Président',
  bureau:               'Le Bureau',
  agenda:               'Agenda institutionnel',
  deputes:              'Les Députés',
  messages:             'Messages reçus',
  media:                'Médiathèque',
  live:                 'En Direct',
  archives:             'Archives & Documents',
  seances:              'Séances plénières',
  groupes:              'Groupes parlementaires',
  newsletter:           'Newsletter',
  parametres:           'Paramètres généraux',
  'questions-ecrites':  'Questions écrites',
  'questions-orales':   'Questions orales',
  interpellations:      'Interpellations',
  'journaux-debats':    'Journaux des débats',
};

function goTo(name) {
  currentSection = name;
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById(`section-${name}`)?.classList.remove('hidden');
  document.querySelectorAll('[data-section]').forEach(b => b.classList.toggle('active', b.dataset.section === name));
  document.getElementById('pageTitle').textContent = TITLES[name] || name;
  loadSection(name);
}

async function loadSection(name) {
  switch (name) {
    case 'accueil':     await loadStats(); break;
    case 'articles':    await loadArticles(); break;
    case 'cms-pages':   await loadCmsPages(); break;
    case 'slides':      await loadSlides(); break;
    case 'actualites':  await loadActualites(); break;
    case 'bureau':      await loadBureau(); break;
    case 'president':   await loadPresident(); break;
    case 'agenda':      await loadAgenda(); break;
    case 'deputes':     await loadDeputes(); break;
    case 'messages':    await loadMessages(); break;
    case 'newsletter':  await loadNewsletter(); break;
    case 'media':       await loadMediaSection(); break;
    case 'archives':    await loadArchives(); break;
    case 'seances':     await loadSeances(); break;
    case 'groupes':     await loadGroupes(); break;
    case 'live':                await loadLive(); break;
    case 'parametres':          await loadParametres(); break;
    case 'questions-ecrites':   await loadQuestionsEcrites(); break;
    case 'questions-orales':    await loadQuestionsOrales(); break;
    case 'interpellations':     await loadInterpellations(); break;
    case 'journaux-debats':     await loadJournauxDebats(); break;
  }
}

// =========================================
// STATS
// =========================================
async function loadStats() {
  const [s, a, b, ag, art, pg, dep, msg, sc, nl] = await Promise.all([
    db.from('slides').select('id', { count: 'exact', head: true }),
    db.from('actualites').select('id', { count: 'exact', head: true }),
    db.from('bureau').select('id', { count: 'exact', head: true }),
    db.from('agenda').select('id', { count: 'exact', head: true }),
    db.from('articles').select('id', { count: 'exact', head: true }),
    db.from('pages').select('id', { count: 'exact', head: true }),
    db.from('deputes').select('id', { count: 'exact', head: true }),
    db.from('contact_messages').select('id', { count: 'exact', head: true }).eq('lu', false),
    db.from('seances_plenieres').select('id', { count: 'exact', head: true }),
    db.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('active', true),
  ]);
  const set = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n ?? '—'; };
  // Dashboard stats
  set('stat-slides',     s.count);
  set('stat-actualites', a.count);
  set('stat-bureau',     b.count);
  set('stat-agenda',     ag.count);
  set('stat-messages',   msg.count ?? 0);
  set('stat-deputes',    dep.count);
  set('stat-seances',    sc.count);
  set('stat-newsletter', nl.count);
  // Sidebar badges
  set('badge-slides',     s.count);
  set('badge-actualites', a.count);
  set('badge-bureau',     b.count);
  set('badge-agenda',     ag.count);
  set('badge-articles',   art.count);
  set('badge-cms-pages',  pg.count);
  set('badge-deputes',    dep.count);
  set('badge-messages',   msg.count ?? 0);
  set('badge-seances',    sc.count);
  set('badge-newsletter', nl.count);
}

// =========================================
// SEARCH HELPER
// =========================================
function attachTableSearch(inputId, tbodyId) {
  const input = document.getElementById(inputId);
  const tbody = document.getElementById(tbodyId);
  if (!input || !tbody) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    let visible = 0;
    tbody.querySelectorAll('tr').forEach(row => {
      const match = row.textContent.toLowerCase().includes(q);
      row.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    const counter = document.getElementById(inputId + '-count');
    if (counter) counter.textContent = visible;
  });
}

function searchBarHTML(inputId, placeholder, extraButtons = '') {
  return `<div style="padding:12px 20px;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
    <input id="${inputId}" type="search" placeholder="🔍 ${placeholder}" style="flex:1;min-width:180px;padding:7px 12px;border:1px solid var(--border);border-radius:6px;font-size:.85rem;outline:none;">
    ${extraButtons}
  </div>`;
}

// =========================================
// ARTICLES
// =========================================
async function loadArticles() {
  const el = document.getElementById('articles-list');
  el.innerHTML = loadingHTML();
  const { data, error } = await db.from('articles').select('*').order('created_at', { ascending: false });
  if (error) { el.innerHTML = errorHTML(error.message); return; }
  if (!data.length) { el.innerHTML = emptyHTML('Aucun article. Créez votre premier article.'); return; }

  el.innerHTML = searchBarHTML('search-articles', 'Rechercher un article…') + `
    <table class="data-table">
      <thead><tr>
        <th style="width:72px">Image</th>
        <th>Titre</th>
        <th>Catégorie</th>
        <th>Statut</th>
        <th>Date</th>
        <th>Actions</th>
      </tr></thead>
      <tbody id="tbody-articles">
        ${data.map(a => `
          <tr>
            <td>${thumbHTML(a.featured_image)}</td>
            <td style="max-width:240px;">
              <span style="font-weight:600;font-size:.85rem;">${esc(a.title)}</span><br>
              <span style="font-size:.75rem;color:var(--muted);">/${esc(a.slug)}</span>
            </td>
            <td><span class="badge badge-blue">${esc(a.category)}</span></td>
            <td><span class="status-badge ${a.status === 'published' ? 'status-published' : 'status-draft'}">${a.status === 'published' ? '✓ Publié' : '✎ Brouillon'}</span></td>
            <td style="font-size:.8rem;color:var(--muted);">${esc(a.published_at ? a.published_at.slice(0,10) : '—')}</td>
            <td><div class="actions">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="openModal('article','${a.id}')" title="Modifier">✏️</button>
              <a href="../pages/article.html?slug=${esc(a.slug)}" target="_blank" class="btn btn-ghost btn-icon btn-sm" title="Voir">🔗</a>
              <button class="btn btn-ghost btn-icon btn-sm" onclick="duplicateArticle('${a.id}')" title="Dupliquer">📋</button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="deleteItem('articles','${a.id}')" title="Supprimer">🗑️</button>
            </div></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  attachTableSearch('search-articles', 'tbody-articles');
}

async function duplicateArticle(id) {
  const { data, error } = await db.from('articles').select('*').eq('id', id).single();
  if (error || !data) { toast('Impossible de dupliquer cet article', 'error'); return; }
  const { id: _id, created_at, updated_at, ...rest } = data;
  const copy = {
    ...rest,
    title:        data.title + ' (copie)',
    slug:         data.slug + '-copie-' + Date.now().toString().slice(-4),
    status:       'draft',
    active:       false,
    updated_at:   new Date().toISOString(),
  };
  const { error: err } = await db.from('articles').insert(copy);
  if (err) { toast('Erreur duplication : ' + err.message, 'error'); return; }
  toast('✓ Article dupliqué en brouillon', 'success');
  await loadArticles();
}

// =========================================
// PAGES CMS
// =========================================
async function loadCmsPages() {
  const el = document.getElementById('cms-pages-list');
  el.innerHTML = loadingHTML();
  const { data, error } = await db.from('pages').select('*').order('created_at', { ascending: false });
  if (error) { el.innerHTML = errorHTML(error.message); return; }
  if (!data.length) { el.innerHTML = emptyHTML('Aucune page. Créez votre première page.'); return; }

  el.innerHTML = searchBarHTML('search-pages', 'Rechercher une page…') + `
    <table class="data-table">
      <thead><tr>
        <th>Titre</th>
        <th>Slug (URL)</th>
        <th>Statut</th>
        <th>Actions</th>
      </tr></thead>
      <tbody id="tbody-pages">
        ${data.map(p => `
          <tr>
            <td style="font-weight:600;">${esc(p.title)}</td>
            <td><code style="font-size:.78rem;background:var(--bg);padding:2px 8px;border-radius:4px;">pages/page.html?slug=${esc(p.slug)}</code></td>
            <td><span class="status-badge ${p.status === 'published' ? 'status-published' : 'status-draft'}">${p.status === 'published' ? '✓ Publiée' : '✎ Brouillon'}</span></td>
            <td><div class="actions">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="openModal('cms-page','${p.id}')" title="Modifier">✏️</button>
              <a href="../pages/page.html?slug=${esc(p.slug)}" target="_blank" class="btn btn-ghost btn-icon btn-sm" title="Voir">🔗</a>
              <button class="btn btn-danger btn-icon btn-sm" onclick="deleteItem('pages','${p.id}')" title="Supprimer">🗑️</button>
            </div></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  attachTableSearch('search-pages', 'tbody-pages');
}

// =========================================
// SLIDES
// =========================================
async function loadSlides() {
  const el = document.getElementById('slides-list');
  el.innerHTML = loadingHTML();
  const { data, error } = await db.from('slides').select('*').order('display_order');
  if (error) { el.innerHTML = errorHTML(error.message); return; }
  if (!data.length) { el.innerHTML = emptyHTML('Aucun slide. Ajoutez votre première bannière.'); return; }

  el.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th style="width:72px">Image</th>
        <th>Titre</th>
        <th>Catégorie</th>
        <th>Date</th>
        <th>Ordre</th>
        <th>Actif</th>
        <th>Actions</th>
      </tr></thead>
      <tbody>
        ${data.map(s => `
          <tr>
            <td>${thumbHTML(s.image_url)}</td>
            <td style="max-width:240px;"><span style="font-weight:600;font-size:.85rem;">${esc(s.title)}</span></td>
            <td><span class="badge badge-green">${esc(s.category)}</span></td>
            <td style="font-size:.8rem;color:var(--muted);">${esc(s.date_text || '—')}</td>
            <td style="text-align:center;">${s.display_order}</td>
            <td><label class="toggle"><input type="checkbox" ${s.active ? 'checked' : ''} onchange="toggleActive('slides','${s.id}',this.checked)"><span class="toggle-slider"></span></label></td>
            <td><div class="actions">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="openModal('slide','${s.id}')" title="Modifier">✏️</button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="deleteItem('slides','${s.id}')" title="Supprimer">🗑️</button>
            </div></td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

// =========================================
// ACTUALITÉS
// =========================================
async function loadActualites() {
  const el = document.getElementById('actualites-list');
  el.innerHTML = loadingHTML();
  const { data, error } = await db.from('actualites').select('*').order('created_at', { ascending: false });
  if (error) { el.innerHTML = errorHTML(error.message); return; }
  if (!data.length) { el.innerHTML = emptyHTML('Aucune actualité. Publiez votre premier article.'); return; }

  el.innerHTML = searchBarHTML('search-actualites', 'Rechercher une actualité…') + `
    <table class="data-table">
      <thead><tr>
        <th style="width:72px">Image</th>
        <th>Titre</th>
        <th>Catégorie</th>
        <th>Date</th>
        <th>Actif</th>
        <th>Actions</th>
      </tr></thead>
      <tbody id="tbody-actualites">
        ${data.map(a => `
          <tr>
            <td>${thumbHTML(a.image_url)}</td>
            <td style="max-width:260px;"><span style="font-weight:600;font-size:.85rem;">${esc(a.title)}</span></td>
            <td><span class="badge badge-blue">${esc(a.category)}</span></td>
            <td style="font-size:.8rem;color:var(--muted);">${esc(a.date_text)}</td>
            <td><label class="toggle"><input type="checkbox" ${a.active ? 'checked' : ''} onchange="toggleActive('actualites','${a.id}',this.checked)"><span class="toggle-slider"></span></label></td>
            <td><div class="actions">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="openModal('actu','${a.id}')" title="Modifier">✏️</button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="deleteItem('actualites','${a.id}')" title="Supprimer">🗑️</button>
            </div></td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
  attachTableSearch('search-actualites', 'tbody-actualites');
}

// =========================================
// BUREAU
// =========================================
async function loadBureau() {
  const el = document.getElementById('bureau-list');
  el.innerHTML = loadingHTML();
  const { data, error } = await db.from('bureau').select('*').order('display_order');
  if (error) { el.innerHTML = errorHTML(error.message); return; }
  if (!data.length) { el.innerHTML = emptyHTML('Aucun membre. Ajoutez les membres du Bureau.'); return; }

  el.innerHTML = searchBarHTML('search-bureau', 'Rechercher un membre…') + `
    <table class="data-table">
      <thead><tr>
        <th style="width:60px">Photo</th>
        <th>Nom</th>
        <th>Rôle / Fonction</th>
        <th>Ordre</th>
        <th>Actions</th>
      </tr></thead>
      <tbody id="tbody-bureau">
        ${data.map(m => `
          <tr>
            <td>
              <div class="thumb" style="background:var(--primary-light);border-radius:50%;width:44px;height:44px;">
                ${m.photo_url
                  ? `<img src="${esc(m.photo_url)}" alt="${esc(m.name)}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">`
                  : `<span style="font-size:1.2rem;">👤</span>`}
              </div>
            </td>
            <td><span style="font-weight:700;">${esc(m.name)}</span></td>
            <td><span class="badge badge-green">${esc(m.role_title)}</span></td>
            <td style="text-align:center;">${m.display_order}</td>
            <td><div class="actions">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="openModal('bureau','${m.id}')" title="Modifier">✏️</button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="deleteItem('bureau','${m.id}')" title="Supprimer">🗑️</button>
            </div></td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
  attachTableSearch('search-bureau', 'tbody-bureau');
}

// =========================================
// AGENDA
// =========================================
async function loadAgenda() {
  const el = document.getElementById('agenda-list');
  el.innerHTML = loadingHTML();
  const { data, error } = await db.from('agenda').select('*').order('created_at', { ascending: false });
  if (error) { el.innerHTML = errorHTML(error.message); return; }
  if (!data.length) { el.innerHTML = emptyHTML('Aucun événement. Ajoutez votre premier événement agenda.'); return; }

  el.innerHTML = searchBarHTML('search-agenda', 'Rechercher un événement…') + `
    <table class="data-table">
      <thead><tr>
        <th>Titre</th>
        <th>Date</th>
        <th>Description</th>
        <th>Actif</th>
        <th>Actions</th>
      </tr></thead>
      <tbody id="tbody-agenda">
        ${data.map(ev => `
          <tr>
            <td style="font-weight:600;max-width:200px;">${esc(ev.title)}</td>
            <td><span class="badge badge-green">${esc(ev.date_text)}</span></td>
            <td style="max-width:260px;font-size:.82rem;color:var(--muted);">${esc(ev.description || '—').substring(0, 80)}${(ev.description || '').length > 80 ? '...' : ''}</td>
            <td><label class="toggle"><input type="checkbox" ${ev.active ? 'checked' : ''} onchange="toggleActive('agenda','${ev.id}',this.checked)"><span class="toggle-slider"></span></label></td>
            <td><div class="actions">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="openModal('agenda','${ev.id}')" title="Modifier">✏️</button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="deleteItem('agenda','${ev.id}')" title="Supprimer">🗑️</button>
            </div></td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
  attachTableSearch('search-agenda', 'tbody-agenda');
}

// =========================================
// PRÉSIDENT
// =========================================
async function loadPresident() {
  const { data, error } = await db.from('parametres').select('*').in('key', [
    'president_name', 'president_role', 'president_bio', 'president_facts', 'president_photo'
  ]);
  if (error) { toast('Erreur lors du chargement', 'error'); return; }

  const map = {};
  data.forEach(p => { map[p.key] = p.value; });

  setValue('president_name', map.president_name || '');
  setValue('president_role', map.president_role || '');
  setValue('president_bio', map.president_bio || '');
  setValue('president_facts', map.president_facts || '');
  setValue('president_photo', map.president_photo || '');

  const photo = map.president_photo;
  if (photo) {
    document.getElementById('presidentPhotoPreview').src = photo;
    document.getElementById('presidentPhotoPreview').style.display = 'block';
    document.getElementById('presidentPhotoPlaceholder').style.display = 'none';
    document.getElementById('presidentPhotoZone').classList.add('has-image');
  }
}

async function savePresident() {
  const fields = ['president_name', 'president_role', 'president_bio', 'president_facts', 'president_photo'];
  const updates = fields.map(key => ({ key, value: getValue(key), updated_at: new Date().toISOString() }));

  const { error } = await db.from('parametres').upsert(updates, { onConflict: 'key' });
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('✓ Informations du Président enregistrées', 'success');
}

// =========================================
// EN DIRECT
// =========================================
async function loadLive() {
  const keys = ['live_is_active','live_youtube_id','live_session_name','live_session_date','live_replays'];
  const { data } = await db.from('parametres').select('*').in('key', keys);
  data?.forEach(p => {
    if (p.key === 'live_is_active') {
      const cb = document.getElementById('live-is_active');
      if (cb) {
        cb.checked = p.value === 'true';
        updateLiveLabel(cb.checked);
      }
    } else if (p.key === 'live_replays') {
      try { renderReplays(JSON.parse(p.value || '[]')); } catch { renderReplays([]); }
    } else {
      const el = document.getElementById(`live-${p.key.replace('live_','')}`);
      if (el) el.value = p.value || '';
    }
  });

  // Toggle label live
  document.getElementById('live-is_active')?.addEventListener('change', e => updateLiveLabel(e.target.checked));
}

function updateLiveLabel(isActive) {
  const lbl = document.getElementById('live-status-label');
  if (lbl) lbl.textContent = isActive ? '🔴 En antenne' : 'Hors antenne';
}

function renderReplays(replays) {
  const list = document.getElementById('replays-list');
  if (!list) return;
  if (!replays.length) {
    list.innerHTML = '<p style="font-size:.8rem;color:var(--muted);">Aucun replay. Cliquez sur "+ Ajouter" après chaque séance.</p>';
    return;
  }
  list.innerHTML = replays.map((r, i) => `
    <div class="replay-row" data-idx="${i}">
      <input class="field-input" placeholder="ID YouTube" value="${r.youtubeId || ''}" data-field="youtubeId">
      <input class="field-input" placeholder="Titre de la séance" value="${r.title || ''}" data-field="title">
      <button class="btn btn-danger btn-sm" onclick="removeReplay(${i})">✕</button>
    </div>`).join('');
}

function addReplayRow() {
  const list = document.getElementById('replays-list');
  const existing = list.querySelectorAll('.replay-row');
  const idx = existing.length;
  const p = list.querySelector('p');
  if (p) p.remove();
  const row = document.createElement('div');
  row.className = 'replay-row';
  row.dataset.idx = idx;
  row.innerHTML = `
    <input class="field-input" placeholder="ID YouTube" data-field="youtubeId">
    <input class="field-input" placeholder="Titre de la séance" data-field="title">
    <button class="btn btn-danger btn-sm" onclick="this.closest('.replay-row').remove()">✕</button>`;
  list.appendChild(row);
}

function removeReplay(idx) {
  document.querySelector(`.replay-row[data-idx="${idx}"]`)?.remove();
}

function collectReplays() {
  const rows = document.querySelectorAll('.replay-row');
  const replays = [];
  rows.forEach(row => {
    const id    = row.querySelector('[data-field="youtubeId"]')?.value.trim();
    const title = row.querySelector('[data-field="title"]')?.value.trim();
    if (id) replays.push({ youtubeId: id, title: title || '' });
  });
  return replays;
}

async function saveLive() {
  const isActive  = document.getElementById('live-is_active')?.checked ? 'true' : 'false';
  const youtubeId = document.getElementById('live-youtube_id')?.value.trim() || '';
  const sessName  = document.getElementById('live-session_name')?.value.trim() || '';
  const sessDate  = document.getElementById('live-session_date')?.value.trim() || '';
  const replays   = JSON.stringify(collectReplays());

  const updates = [
    { key: 'live_is_active',    value: isActive },
    { key: 'live_youtube_id',   value: youtubeId },
    { key: 'live_session_name', value: sessName },
    { key: 'live_session_date', value: sessDate },
    { key: 'live_replays',      value: replays },
  ].map(u => ({ ...u, updated_at: new Date().toISOString() }));

  const { error } = await db.from('parametres').upsert(updates, { onConflict: 'key' });
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast(isActive === 'true' ? '🔴 Direct activé — le live est en ligne !' : '✓ Configuration enregistrée', 'success');
}

// =========================================
// PARAMÈTRES
// =========================================
async function loadParametres() {
  const { data } = await db.from('parametres').select('*').in('key', ['site_address', 'live_url', 'site_logo', 'maintenance_mode']);
  data?.forEach(p => {
    if (p.key === 'maintenance_mode') {
      const cb = document.getElementById('param-maintenance_mode');
      const st = document.getElementById('maintenance-status');
      if (cb) cb.checked = p.value === 'true';
      if (st) {
        st.textContent = p.value === 'true' ? '🔴 ACTIVÉ — Site en maintenance' : 'Désactivé';
        st.style.color  = p.value === 'true' ? '#dc2626' : '#9ca3af';
      }
      return;
    }
    const el = document.getElementById(`param-${p.key}`);
    if (el) el.value = p.value || '';
    if (p.key === 'site_logo' && p.value) {
      const preview = document.getElementById('logoPreview');
      if (preview) {
        preview.src = p.value;
        preview.style.display = 'block';
        document.getElementById('logoPlaceholder').style.display = 'none';
        document.getElementById('logoUploadZone').classList.add('has-image');
      }
    }
  });
}

async function handleLogoUpload() {
  const file = document.getElementById('logoFile')?.files[0];
  if (!file) return;

  document.getElementById('logoSpinner').classList.add('show');
  try {
    const ext = file.name.split('.').pop();
    const path = `general/logo-${Date.now()}.${ext}`;
    const { error } = await db.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (error) throw error;

    const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(path);
    document.getElementById('param-site_logo').value = publicUrl;

    const preview = document.getElementById('logoPreview');
    preview.src = publicUrl;
    preview.style.display = 'block';
    document.getElementById('logoPlaceholder').style.display = 'none';
    document.getElementById('logoUploadZone').classList.add('has-image');

    toast('✓ Logo uploadé — cliquez sur Enregistrer pour sauvegarder', 'success');
  } catch (err) {
    toast('Erreur upload logo : ' + err.message, 'error');
  } finally {
    document.getElementById('logoSpinner').classList.remove('show');
  }
}

async function saveParametres() {
  const keys = ['site_address', 'live_url', 'site_logo'];
  const updates = keys.map(key => {
    const el = document.getElementById(`param-${key}`);
    return { key, value: el ? el.value : '', updated_at: new Date().toISOString() };
  });

  const { error } = await db.from('parametres').upsert(updates, { onConflict: 'key' });
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('✓ Paramètres enregistrés', 'success');
}

async function toggleMaintenance(active) {
  const st = document.getElementById('maintenance-status');
  const { error } = await db.from('parametres').upsert(
    [{ key: 'maintenance_mode', value: String(active), updated_at: new Date().toISOString() }],
    { onConflict: 'key' }
  );
  if (error) {
    toast('Erreur : ' + error.message, 'error');
    document.getElementById('param-maintenance_mode').checked = !active;
    return;
  }
  if (st) {
    st.textContent = active ? '🔴 ACTIVÉ — Site en maintenance' : 'Désactivé';
    st.style.color  = active ? '#dc2626' : '#9ca3af';
  }
  toast(active ? '🚧 Mode maintenance activé — site indisponible pour les visiteurs' : '✅ Site remis en ligne', active ? 'error' : 'success');
}

// =========================================
// MODAL
// =========================================
async function openModal(type, id = null) {
  modalType = type;
  editingId = id;

  let data = null;
  if (id) {
    const table = type === 'slide' ? 'slides' : type === 'actu' ? 'actualites' : type === 'bureau' ? 'bureau' : type === 'article' ? 'articles' : type === 'cms-page' ? 'pages' : type === 'depute' ? 'deputes' : 'agenda';
    const { data: row } = await db.from(table).select('*').eq('id', id).single();
    data = row;
  }

  const overlay = document.getElementById('modalOverlay');
  document.getElementById('modalTitle').textContent = id ? `Modifier — ${type}` : `Ajouter — ${type}`;
  document.getElementById('modalTitle').textContent = id
    ? `Modifier — ${type === 'cms-page' ? 'Page' : type}`
    : `Créer — ${type === 'cms-page' ? 'Page' : type}`;
  document.getElementById('modalBody').innerHTML = getModalForm(type, data);
  overlay.classList.add('open');

  // Init EditorJS for article/page types
  if (type === 'article' || type === 'cms-page') {
    let initialData = {};
    if (data?.content) {
      try {
        const parsed = JSON.parse(data.content);
        if (parsed.blocks) initialData = parsed;
      } catch {
        initialData = { blocks: [{ type: 'raw', data: { html: data.content } }] };
      }
    }
    // Attendre que le modal soit complètement rendu dans le DOM
    await new Promise(r => setTimeout(r, 80));
    const holder = document.getElementById('editorjs');
    if (!holder) { editorInstance = null; }
    else {
      try {
        editorInstance = new EditorJS({
          holder: 'editorjs',
          tools: {
            header:     { class: Header, inlineToolbar: true },
            list:       { class: List,   inlineToolbar: true },
            image:      SimpleImage,
            quote:      { class: Quote,  inlineToolbar: true },
            delimiter:  Delimiter,
            table:      { class: Table,  inlineToolbar: true },
            code:       CodeTool,
            warning:    Warning,
            embed:      Embed,
            marker:     Marker,
            inlineCode: InlineCode,
            raw:        RawTool,
          },
          data: initialData,
          placeholder: 'Cliquez ici pour commencer à écrire…',
          minHeight: 200,
        });
      } catch(err) {
        console.error('EditorJS init error:', err);
        editorInstance = null;
      }
    }
  } else {
    editorInstance = null;
  }

  // Setup file input handlers after DOM insertion
  setupModalUploads(type, data);
}

function getModalForm(type, data) {
  if (type === 'slide')    return slideForm(data);
  if (type === 'actu')     return actuForm(data);
  if (type === 'bureau')   return bureauForm(data);
  if (type === 'agenda')   return agendaForm(data);
  if (type === 'article')  return articleForm(data);
  if (type === 'cms-page') return cmsPageForm(data);
  if (type === 'depute')   return deputeForm(data);
  return '';
}

function articleForm(d) {
  return `
    <div class="field-group">
      <label class="field-label">Image à la une</label>
      <div class="upload-zone ${d?.featured_image ? 'has-image' : ''}" id="mUploadZone" onclick="document.getElementById('mFileInput').click()" style="cursor:pointer;height:160px;">
        <div class="upload-placeholder" id="mUploadPlaceholder" ${d?.featured_image ? 'style="display:none"' : ''}>
          <div class="up-icon">🖼️</div><p>Image principale de l'article</p><small>Recommandé : 1200×630 px</small>
        </div>
        ${d?.featured_image ? `<img src="${esc(d.featured_image)}" class="upload-preview-img" id="mPreviewImg" alt="Preview">` : `<img id="mPreviewImg" class="upload-preview-img" style="display:none" alt="Preview">`}
        <div class="upload-overlay">📷 Changer l'image</div>
        <div class="upload-spinner" id="mSpinner"><div class="spinner"></div></div>
      </div>
      <input type="file" id="mFileInput" accept="image/*" hidden>
      <input type="hidden" id="m_featured_image" value="${esc(d?.featured_image || '')}">
    </div>
    <div class="field-group">
      <label class="field-label">Titre <span class="req">*</span></label>
      <input class="field-input" id="m_title" value="${esc(d?.title || '')}" placeholder="Titre de l'article..." oninput="autoSlug('m_title','m_slug')">
    </div>
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Slug (URL) <span class="req">*</span></label>
        <div class="slug-row">
          <span class="slug-prefix">article.html?slug=</span>
          <input class="field-input" id="m_slug" value="${esc(d?.slug || '')}" placeholder="mon-article" style="flex:1;">
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Catégorie</label>
        <select class="field-select" id="m_category">
          ${CATEGORIES_ART.map(c => `<option value="${c}" ${d?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Auteur</label>
        <input class="field-input" id="m_author" value="${esc(d?.author || 'Assemblée Nationale')}" placeholder="Assemblée Nationale">
      </div>
      <div class="field-group">
        <label class="field-label">Date de publication</label>
        <input class="field-input" type="date" id="m_published_at" value="${d?.published_at ? d.published_at.slice(0,10) : new Date().toISOString().slice(0,10)}">
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Statut</label>
      <select class="field-select" id="m_status">
        <option value="draft" ${d?.status !== 'published' ? 'selected' : ''}>✎ Brouillon</option>
        <option value="published" ${d?.status === 'published' ? 'selected' : ''}>✓ Publié</option>
      </select>
    </div>
    <div class="field-group">
      <label class="field-label">Résumé (extrait)</label>
      <textarea class="field-textarea" id="m_excerpt" rows="2" placeholder="Court résumé affiché dans les listes...">${esc(d?.excerpt || '')}</textarea>
    </div>
    <div class="field-group">
      <label class="field-label">Contenu de l'article <span class="req">*</span></label>
      <div id="editorjs" style="border:1px solid var(--border);border-radius:6px;min-height:280px;padding:12px 56px 12px 56px;cursor:text;background:#fff;position:relative;"></div>
      <p style="font-size:.73rem;color:var(--muted);margin-top:6px;">💡 Cliquez dans la zone pour écrire. Utilisez le bouton <strong>+</strong> pour insérer un bloc (image, titre, liste, tableau, embed YouTube…)</p>
    </div>`;
}

function cmsPageForm(d) {
  return `
    <div class="field-group">
      <label class="field-label">Titre de la page <span class="req">*</span></label>
      <input class="field-input" id="m_title" value="${esc(d?.title || '')}" placeholder="Titre de la page..." oninput="autoSlug('m_title','m_slug')">
    </div>
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Slug (URL) <span class="req">*</span></label>
        <div class="slug-row">
          <span class="slug-prefix">page.html?slug=</span>
          <input class="field-input" id="m_slug" value="${esc(d?.slug || '')}" placeholder="ma-page" style="flex:1;">
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Statut</label>
        <select class="field-select" id="m_status">
          <option value="draft" ${d?.status !== 'published' ? 'selected' : ''}>✎ Brouillon</option>
          <option value="published" ${d?.status === 'published' ? 'selected' : ''}>✓ Publiée</option>
        </select>
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Description SEO</label>
      <input class="field-input" id="m_meta_description" value="${esc(d?.meta_description || '')}" placeholder="Résumé pour les moteurs de recherche...">
    </div>
    <div class="field-group">
      <label class="field-label">Contenu de la page <span class="req">*</span></label>
      <div id="editorjs" style="border:1px solid var(--border);border-radius:6px;min-height:280px;padding:12px 56px 12px 56px;cursor:text;background:#fff;position:relative;"></div>
      <p style="font-size:.73rem;color:var(--muted);margin-top:6px;">💡 Cliquez dans la zone pour écrire. Utilisez le bouton <strong>+</strong> pour insérer un bloc (image, titre, liste, tableau, embed YouTube…)</p>
    </div>`;
}

function slideForm(d) {
  return `
    <div class="field-group">
      <label class="field-label">Image de bannière</label>
      <div class="upload-zone ${d?.image_url ? 'has-image' : ''}" id="mUploadZone" onclick="document.getElementById('mFileInput').click()" style="cursor:pointer;">
        <div class="upload-placeholder" id="mUploadPlaceholder" ${d?.image_url ? 'style="display:none"' : ''}>
          <div class="up-icon">🖼️</div>
          <p>Cliquer ou glisser une image</p>
          <small>JPG, PNG, WEBP — recommandé : 1920×600 px</small>
        </div>
        ${d?.image_url ? `<img src="${esc(d.image_url)}" class="upload-preview-img" id="mPreviewImg" alt="Preview">` : `<img id="mPreviewImg" class="upload-preview-img" style="display:none" alt="Preview">`}
        <div class="upload-overlay">📷 Changer l'image</div>
        <div class="upload-spinner" id="mSpinner"><div class="spinner"></div></div>
      </div>
      <input type="file" id="mFileInput" accept="image/*" hidden>
      <input type="hidden" id="m_image_url" value="${esc(d?.image_url || '')}">
    </div>
    <div class="field-group">
      <label class="field-label">Titre <span class="req">*</span></label>
      <input class="field-input" id="m_title" value="${esc(d?.title || '')}" placeholder="Titre du slide...">
    </div>
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Catégorie</label>
        <select class="field-select" id="m_category">
          ${CATEGORIES_ACTU.map(c => `<option value="${c}" ${d?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="field-group">
        <label class="field-label">Date</label>
        <input class="field-input" id="m_date_text" value="${esc(d?.date_text || '')}" placeholder="ex: 30 décembre 2025">
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Ordre d'affichage</label>
      <input class="field-input" type="number" id="m_display_order" value="${d?.display_order ?? 0}" min="0">
    </div>`;
}

function actuForm(d) {
  return `
    <div class="field-group">
      <label class="field-label">Photo de l'article</label>
      <div class="upload-zone ${d?.image_url ? 'has-image' : ''}" id="mUploadZone" onclick="document.getElementById('mFileInput').click()" style="cursor:pointer;">
        <div class="upload-placeholder" id="mUploadPlaceholder" ${d?.image_url ? 'style="display:none"' : ''}>
          <div class="up-icon">📷</div>
          <p>Cliquer pour ajouter une photo</p>
          <small>JPG, PNG — recommandé : 800×500 px</small>
        </div>
        ${d?.image_url ? `<img src="${esc(d.image_url)}" class="upload-preview-img" id="mPreviewImg" alt="Preview">` : `<img id="mPreviewImg" class="upload-preview-img" style="display:none" alt="Preview">`}
        <div class="upload-overlay">📷 Changer la photo</div>
        <div class="upload-spinner" id="mSpinner"><div class="spinner"></div></div>
      </div>
      <input type="file" id="mFileInput" accept="image/*" hidden>
      <input type="hidden" id="m_image_url" value="${esc(d?.image_url || '')}">
    </div>
    <div class="field-group">
      <label class="field-label">Titre <span class="req">*</span></label>
      <input class="field-input" id="m_title" value="${esc(d?.title || '')}" placeholder="Titre de l'actualité...">
    </div>
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Catégorie <span class="req">*</span></label>
        <select class="field-select" id="m_category">
          ${CATEGORIES_ACTU.map(c => `<option value="${c}" ${d?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="field-group">
        <label class="field-label">Date <span class="req">*</span></label>
        <input class="field-input" id="m_date_text" value="${esc(d?.date_text || '')}" placeholder="ex: 30 déc. 2025">
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Contenu / Résumé</label>
      <textarea class="field-textarea" id="m_content" rows="4" placeholder="Résumé de l'actualité...">${esc(d?.content || '')}</textarea>
    </div>`;
}

function bureauForm(d) {
  return `
    <div class="field-group">
      <label class="field-label">Photo officielle</label>
      <div class="upload-zone ${d?.photo_url ? 'has-image' : ''}" id="mUploadZone" onclick="document.getElementById('mFileInput').click()" style="cursor:pointer;max-width:200px;aspect-ratio:1;">
        <div class="upload-placeholder" id="mUploadPlaceholder" ${d?.photo_url ? 'style="display:none"' : ''}>
          <div class="up-icon">👤</div>
          <p>Photo</p>
        </div>
        ${d?.photo_url ? `<img src="${esc(d.photo_url)}" class="upload-preview-img" id="mPreviewImg" style="height:200px;" alt="Photo">` : `<img id="mPreviewImg" class="upload-preview-img" style="display:none;height:200px;" alt="Photo">`}
        <div class="upload-overlay">📷 Changer</div>
        <div class="upload-spinner" id="mSpinner"><div class="spinner"></div></div>
      </div>
      <input type="file" id="mFileInput" accept="image/*" hidden>
      <input type="hidden" id="m_photo_url" value="${esc(d?.photo_url || '')}">
    </div>
    <div class="field-group">
      <label class="field-label">Nom complet <span class="req">*</span></label>
      <input class="field-input" id="m_name" value="${esc(d?.name || '')}" placeholder="Prénom NOM">
    </div>
    <div class="field-group">
      <label class="field-label">Rôle / Fonction <span class="req">*</span></label>
      <input class="field-input" id="m_role_title" value="${esc(d?.role_title || '')}" placeholder="ex: Président, 1ᵉʳ Vice-président...">
    </div>
    <div class="field-group">
      <label class="field-label">Biographie / Présentation</label>
      <textarea class="field-textarea" id="m_biography" rows="3" placeholder="Courte biographie ou présentation du membre...">${esc(d?.biography || '')}</textarea>
    </div>
    <div class="field-group">
      <label class="field-label">Circonscription / Département</label>
      <input class="field-input" id="m_constituency" value="${esc(d?.constituency || '')}" placeholder="ex: Brazzaville I, Pool, Bouenza...">
    </div>
    <div class="field-group">
      <label class="field-label">Ordre d'affichage</label>
      <input class="field-input" type="number" id="m_display_order" value="${d?.display_order ?? 0}" min="0">
    </div>`;
}

function agendaForm(d) {
  return `
    <div class="field-group">
      <label class="field-label">Titre de l'événement <span class="req">*</span></label>
      <input class="field-input" id="m_title" value="${esc(d?.title || '')}" placeholder="ex: Conférence des Présidents">
    </div>
    <div class="field-group">
      <label class="field-label">Date <span class="req">*</span></label>
      <input class="field-input" id="m_date_text" value="${esc(d?.date_text || '')}" placeholder="ex: Mardi 08 Octobre 2024">
    </div>
    <div class="field-group">
      <label class="field-label">Description</label>
      <textarea class="field-textarea" id="m_description" rows="4" placeholder="Détails de l'événement...">${esc(d?.description || '')}</textarea>
    </div>`;
}

function setupModalUploads(type, data) {
  const fileInput = document.getElementById('mFileInput');
  if (!fileInput) return;

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const spinner = document.getElementById('mSpinner');
    const preview = document.getElementById('mPreviewImg');
    const placeholder = document.getElementById('mUploadPlaceholder');
    const zone = document.getElementById('mUploadZone');

    spinner.classList.add('show');

    try {
      const folder = type === 'slide' ? 'slides' : type === 'actu' ? 'actualites' : type === 'bureau' ? 'bureau' : type === 'depute' ? 'deputes' : 'general';
      const ext = file.name.split('.').pop();
      const path = `${folder}/${Date.now()}.${ext}`;

      const { error: upErr } = await db.storage.from(BUCKET).upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(path);

      const urlField = document.getElementById(
        type === 'bureau' || type === 'depute' ? 'm_photo_url' : type === 'article' ? 'm_featured_image' : 'm_image_url'
      );
      if (urlField) urlField.value = publicUrl;

      preview.src = publicUrl;
      preview.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
      zone.classList.add('has-image');

      toast('✓ Image uploadée', 'success');
    } catch (err) {
      toast('Erreur upload : ' + err.message, 'error');
    } finally {
      spinner.classList.remove('show');
    }
  });

  // Drag and drop
  const zone = document.getElementById('mUploadZone');
  if (zone) {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--primary)'; });
    zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.style.borderColor = '';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const dt = new DataTransfer();
        dt.items.add(file);
        document.getElementById('mFileInput').files = dt.files;
        document.getElementById('mFileInput').dispatchEvent(new Event('change'));
      }
    });
  }
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modalOverlay')) return;
  if (editorInstance) { try { editorInstance.destroy(); } catch(_) {} editorInstance = null; }
  document.getElementById('modalOverlay').classList.remove('open');
  modalType = null;
  editingId = null;
}

async function saveModal() {
  const saveBtn = document.getElementById('modalSaveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Enregistrement...';

  try {
    let payload = {};
    let table = '';

    if (modalType === 'slide') {
      table = 'slides';
      const title = getValue('m_title');
      if (!title) { toast('Le titre est obligatoire', 'error'); return; }
      payload = {
        title,
        category:      getValue('m_category'),
        date_text:     getValue('m_date_text'),
        image_url:     getValue('m_image_url') || null,
        display_order: parseInt(getValue('m_display_order')) || 0,
        ...(editingId ? {} : { active: true }),
      };
    } else if (modalType === 'actu') {
      table = 'actualites';
      const title = getValue('m_title');
      const date  = getValue('m_date_text');
      if (!title || !date) { toast('Titre et date obligatoires', 'error'); return; }
      payload = {
        title,
        date_text: date,
        category:  getValue('m_category'),
        image_url: getValue('m_image_url') || null,
        content:   getValue('m_content') || null,
        ...(editingId ? {} : { active: true }),
      };
    } else if (modalType === 'bureau') {
      table = 'bureau';
      const name = getValue('m_name');
      const role = getValue('m_role_title');
      if (!name || !role) { toast('Nom et rôle obligatoires', 'error'); return; }
      payload = {
        name,
        role_title:    role,
        photo_url:     getValue('m_photo_url') || null,
        biography:     getValue('m_biography') || null,
        constituency:  getValue('m_constituency') || null,
        display_order: parseInt(getValue('m_display_order')) || 0,
      };
    } else if (modalType === 'agenda') {
      table = 'agenda';
      const title = getValue('m_title');
      const date  = getValue('m_date_text');
      if (!title || !date) { toast('Titre et date obligatoires', 'error'); return; }
      payload = {
        title,
        date_text:   date,
        description: getValue('m_description') || null,
        ...(editingId ? {} : { active: true }),
      };
    } else if (modalType === 'article') {
      table = 'articles';
      const title = getValue('m_title');
      const slug  = getValue('m_slug');
      if (!title || !slug) { toast('Titre et slug obligatoires', 'error'); return; }
      payload = {
        title,
        slug,
        category:       getValue('m_category'),
        author:         getValue('m_author') || 'Assemblée Nationale',
        excerpt:        getValue('m_excerpt') || null,
        featured_image: getValue('m_featured_image') || null,
        status:         getValue('m_status'),
        content:        editorInstance ? JSON.stringify(await editorInstance.save()) : '',
        published_at:   getValue('m_published_at') || new Date().toISOString(),
        updated_at:     new Date().toISOString(),
        ...(editingId ? {} : { active: true }),
      };
    } else if (modalType === 'depute') {
      table = 'deputes';
      const name = getValue('m_name');
      if (!name) { toast('Le nom est obligatoire', 'error'); return; }
      payload = {
        num:          parseInt(getValue('m_num')) || null,
        name,
        department:   getValue('m_department') || null,
        constituency: getValue('m_constituency') || null,
        groupe:       getValue('m_groupe') || 'PCT',
        photo_url:    getValue('m_photo_url') || null,
        ...(editingId ? {} : { active: true }),
      };
    } else if (modalType === 'cms-page') {
      table = 'pages';
      const title = getValue('m_title');
      const slug  = getValue('m_slug');
      if (!title || !slug) { toast('Titre et slug obligatoires', 'error'); return; }
      payload = {
        title,
        slug,
        meta_description: getValue('m_meta_description') || null,
        status:           getValue('m_status'),
        content:          editorInstance ? JSON.stringify(await editorInstance.save()) : '',
        updated_at:       new Date().toISOString(),
        ...(editingId ? {} : { active: true }),
      };
    }

    let error;
    if (editingId) {
      ({ error } = await db.from(table).update(payload).eq('id', editingId));
    } else {
      ({ error } = await db.from(table).insert(payload));
    }

    if (error) throw error;

    document.getElementById('modalOverlay').classList.remove('open');
    const wasEditing = !!editingId;
    modalType = null;
    editingId = null;
    toast(`✓ ${wasEditing ? 'Modifié' : 'Ajouté'} avec succès`, 'success');
    await loadSection(currentSection);
    await loadStats();

  } catch (err) {
    toast('Erreur : ' + err.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Enregistrer';
  }
}

// =========================================
// SHARED ACTIONS
// =========================================
async function toggleActive(table, id, active) {
  const { error } = await db.from(table).update({ active }).eq('id', id);
  if (error) toast('Erreur : ' + error.message, 'error');
  else toast(`✓ ${active ? 'Activé' : 'Désactivé'}`, 'success');
}

async function deleteItem(table, id) {
  if (!confirm('Supprimer cet élément ? Cette action est irréversible.')) return;
  const { error } = await db.from(table).delete().eq('id', id);
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('✓ Supprimé', 'success');
  await loadSection(currentSection);
  await loadStats();
}

// =========================================
// PHOTO UPLOAD (président)
// =========================================
async function handlePhotoUpload(fieldId, fileInputId, previewId, placeholderId, spinnerId) {
  const file = document.getElementById(fileInputId)?.files[0];
  if (!file) return;

  document.getElementById(spinnerId).classList.add('show');

  try {
    const ext = file.name.split('.').pop();
    const path = `general/${fieldId}-${Date.now()}.${ext}`;

    const { error } = await db.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (error) throw error;

    const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(path);

    document.getElementById(fieldId).value = publicUrl;

    const preview = document.getElementById(previewId);
    preview.src = publicUrl;
    preview.style.display = 'block';
    document.getElementById(placeholderId).style.display = 'none';
    document.getElementById(spinnerId.replace('Spinner', 'Zone'))?.classList.add('has-image');

    toast('✓ Photo uploadée', 'success');
  } catch (err) {
    toast('Erreur upload : ' + err.message, 'error');
  } finally {
    document.getElementById(spinnerId).classList.remove('show');
  }
}

// =========================================
// HELPERS
// =========================================
function autoSlug(titleId, slugId) {
  const slugEl = document.getElementById(slugId);
  if (!slugEl || slugEl.dataset.manual === '1') return;
  const title = document.getElementById(titleId)?.value || '';
  slugEl.value = title.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}
function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function thumbHTML(url) {
  return url
    ? `<div class="thumb"><img src="${esc(url)}" alt="thumb" loading="lazy"></div>`
    : `<div class="thumb" style="display:flex;align-items:center;justify-content:center;">🖼️</div>`;
}
function loadingHTML() {
  return `<div class="loading-state"><div class="loading-dots"><span></span><span></span><span></span></div></div>`;
}
function emptyHTML(msg) {
  return `<div class="empty-state"><div class="empty-icon">📭</div><p>${msg}</p></div>`;
}
function errorHTML(msg) {
  return `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Erreur : ${esc(msg)}</p></div>`;
}

// =========================================
// DÉPUTÉS
// =========================================
async function loadDeputes() {
  const el = document.getElementById('deputes-list');
  el.innerHTML = loadingHTML();
  const { data, error } = await db.from('deputes').select('*').order('num', { ascending: true, nullsFirst: false });
  if (error) { el.innerHTML = errorHTML(error.message); return; }
  if (!data.length) { el.innerHTML = emptyHTML('Aucun député. Ajoutez les membres ou importez la liste.'); return; }

  deputesData = data;
  const exportBtn = `<button onclick="exportDeputesCSV()" class="btn btn-ghost btn-sm" style="white-space:nowrap;font-size:.8rem;">📥 CSV</button>`;

  el.innerHTML = searchBarHTML('search-deputes', 'Rechercher un député…', exportBtn) + `
    <table class="data-table">
      <thead><tr>
        <th style="width:44px">#</th>
        <th>Nom</th>
        <th>Département</th>
        <th>Circonscription</th>
        <th>Groupe</th>
        <th>Actif</th>
        <th>Actions</th>
      </tr></thead>
      <tbody id="tbody-deputes">
        ${data.map(d => `
          <tr>
            <td style="color:var(--muted);font-size:.8rem;">${d.num ?? '—'}</td>
            <td style="font-weight:600;font-size:.85rem;">${esc(d.name)}</td>
            <td style="font-size:.82rem;">${esc(d.department || '—')}</td>
            <td style="font-size:.82rem;">${esc(d.constituency || '—')}</td>
            <td><span class="badge badge-blue">${esc(d.groupe || '—')}</span></td>
            <td><label class="toggle"><input type="checkbox" ${d.active ? 'checked' : ''} onchange="toggleActive('deputes','${d.id}',this.checked)"><span class="toggle-slider"></span></label></td>
            <td><div class="actions">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="openModal('depute','${d.id}')" title="Modifier">✏️</button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="deleteItem('deputes','${d.id}')" title="Supprimer">🗑️</button>
            </div></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  attachTableSearch('search-deputes', 'tbody-deputes');
}

function deputeForm(d) {
  const GROUPES = ['PCT','MCDDI','UPADS','RDD','MAR','Indépendant','Autre'];
  return `
    <div class="field-row">
      <div class="field-group" style="flex:0 0 80px;">
        <label class="field-label">N°</label>
        <input class="field-input" type="number" id="m_num" value="${d?.num ?? ''}" placeholder="1">
      </div>
      <div class="field-group">
        <label class="field-label">Nom complet <span class="req">*</span></label>
        <input class="field-input" id="m_name" value="${esc(d?.name || '')}" placeholder="Prénom NOM">
      </div>
    </div>
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Département</label>
        <input class="field-input" id="m_department" value="${esc(d?.department || '')}" placeholder="ex: Brazzaville">
      </div>
      <div class="field-group">
        <label class="field-label">Circonscription</label>
        <input class="field-input" id="m_constituency" value="${esc(d?.constituency || '')}" placeholder="ex: Poto-Poto">
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Groupe parlementaire</label>
      <select class="field-select" id="m_groupe">
        ${GROUPES.map(g => `<option value="${g}" ${d?.groupe === g ? 'selected' : ''}>${g}</option>`).join('')}
      </select>
    </div>
    <div class="field-group">
      <label class="field-label">Photo officielle</label>
      <div class="upload-zone ${d?.photo_url ? 'has-image' : ''}" id="mUploadZone" onclick="document.getElementById('mFileInput').click()" style="cursor:pointer;max-width:140px;aspect-ratio:1;">
        <div class="upload-placeholder" id="mUploadPlaceholder" ${d?.photo_url ? 'style="display:none"' : ''}>
          <div class="up-icon">👤</div>
          <p>Photo</p>
        </div>
        ${d?.photo_url ? `<img src="${esc(d.photo_url)}" class="upload-preview-img" id="mPreviewImg" style="height:140px;" alt="Photo">` : `<img id="mPreviewImg" class="upload-preview-img" style="display:none;height:140px;" alt="Photo">`}
        <div class="upload-overlay">📷 Changer</div>
        <div class="upload-spinner" id="mSpinner"><div class="spinner"></div></div>
      </div>
      <input type="file" id="mFileInput" accept="image/*" hidden>
      <input type="hidden" id="m_photo_url" value="${esc(d?.photo_url || '')}">
    </div>`;
}

// =========================================
// MESSAGES DE CONTACT
// =========================================
async function loadMessages() {
  const el = document.getElementById('messages-list');
  el.innerHTML = loadingHTML();
  const { data, error } = await db.from('contact_messages').select('*').order('created_at', { ascending: false });
  if (error) { el.innerHTML = errorHTML(error.message); return; }
  if (!data.length) { el.innerHTML = emptyHTML('Aucun message reçu pour le moment.'); return; }

  messagesData = data;
  const exportBtn = `<button onclick="exportMessagesCSV()" class="btn btn-ghost btn-sm" style="white-space:nowrap;font-size:.8rem;">📥 CSV</button>`;

  el.innerHTML = searchBarHTML('search-messages', 'Rechercher un message…', exportBtn) + `
    <table class="data-table">
      <thead><tr>
        <th>Date</th>
        <th>Expéditeur</th>
        <th>Email</th>
        <th>Sujet</th>
        <th>Message</th>
        <th>Lu</th>
        <th>Actions</th>
      </tr></thead>
      <tbody id="tbody-messages">
        ${data.map(m => `
          <tr style="${!m.lu ? 'font-weight:600;background:#f0fdf4;' : ''}">
            <td style="font-size:.78rem;color:var(--muted);white-space:nowrap;">${m.created_at ? m.created_at.slice(0,10) : '—'}</td>
            <td>${esc(m.prenom ? m.prenom + ' ' + m.nom : m.nom)}</td>
            <td style="font-size:.8rem;"><a href="mailto:${esc(m.email)}" style="color:var(--primary);">${esc(m.email)}</a></td>
            <td style="max-width:160px;font-size:.82rem;">${esc(m.sujet)}</td>
            <td style="max-width:240px;font-size:.8rem;color:var(--muted);">${esc((m.message || '').substring(0,80))}${(m.message||'').length > 80 ? '…' : ''}</td>
            <td><label class="toggle"><input type="checkbox" ${m.lu ? 'checked' : ''} onchange="markMessageRead('${m.id}',this.checked)"><span class="toggle-slider"></span></label></td>
            <td><button class="btn btn-danger btn-icon btn-sm" onclick="deleteItem('contact_messages','${m.id}')" title="Supprimer">🗑️</button></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  attachTableSearch('search-messages', 'tbody-messages');
}

async function markMessageRead(id, lu) {
  const { error } = await db.from('contact_messages').update({ lu }).eq('id', id);
  if (error) toast('Erreur : ' + error.message, 'error');
  else { toast(lu ? '✓ Marqué comme lu' : 'Marqué non lu', 'success'); await loadStats(); }
}

function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = '.3s'; setTimeout(() => el.remove(), 300); }, 3000);
}

// =========================================
// EXPORT CSV
// =========================================
function exportCSV(data, filename) {
  if (!data || !data.length) { toast('Aucune donnée à exporter', 'error'); return; }
  const cols = Object.keys(data[0]);
  const rows = [
    cols.join(','),
    ...data.map(row => cols.map(c => `"${String(row[c] ?? '').replace(/"/g, '""')}"`).join(',')),
  ];
  const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportDeputesCSV() {
  exportCSV(
    deputesData.map(d => ({ num: d.num, nom: d.name, departement: d.department, circonscription: d.constituency, groupe: d.groupe, actif: d.active ? 'Oui' : 'Non' })),
    `deputes-${new Date().toISOString().slice(0,10)}.csv`
  );
}

function exportMessagesCSV() {
  exportCSV(
    messagesData.map(m => ({ date: m.created_at?.slice(0,10), prenom: m.prenom, nom: m.nom, email: m.email, sujet: m.sujet, message: m.message, lu: m.lu ? 'Oui' : 'Non' })),
    `messages-${new Date().toISOString().slice(0,10)}.csv`
  );
}

// =========================================
// MÉDIATHÈQUE
// =========================================
// =============================================
// NEWSLETTER
// =============================================

let nlAllData = [];

async function loadNewsletter() {
  const el = document.getElementById('newsletter-list');
  if (!el) return;
  el.innerHTML = loadingHTML();

  const { data, error } = await db.from('newsletter_subscribers')
    .select('*').order('subscribed_at', { ascending: false });

  if (error) { el.innerHTML = emptyHTML('Erreur : ' + error.message); return; }
  nlAllData = data || [];

  const total  = nlAllData.length;
  const active = nlAllData.filter(s => s.active).length;
  const unsub  = total - active;

  document.getElementById('nl-total').textContent = total;
  document.getElementById('nl-active').textContent = active;
  document.getElementById('nl-unsub').textContent  = unsub;
  document.getElementById('badge-newsletter').textContent = active;

  renderNewsletter(nlAllData);
}

function filterNewsletter(q) {
  const filter = document.getElementById('nl-filter').value;
  let list = nlAllData;
  if (filter === 'active')   list = list.filter(s => s.active);
  if (filter === 'inactive') list = list.filter(s => !s.active);
  if (q) list = list.filter(s => s.email.toLowerCase().includes(q.toLowerCase()) || (s.prenom||'').toLowerCase().includes(q.toLowerCase()));
  renderNewsletter(list);
}

function renderNewsletter(list) {
  const el = document.getElementById('newsletter-list');
  if (!list.length) { el.innerHTML = emptyHTML('Aucun abonné trouvé.'); return; }

  el.innerHTML = `<table style="width:100%;border-collapse:collapse;">
    <thead><tr style="background:var(--bg-alt);font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">
      <th style="padding:10px 16px;text-align:left;">Email</th>
      <th style="padding:10px 16px;text-align:left;">Prénom</th>
      <th style="padding:10px 16px;text-align:left;">Centres d'intérêt</th>
      <th style="padding:10px 16px;text-align:left;">Date</th>
      <th style="padding:10px 16px;text-align:center;">Statut</th>
      <th style="padding:10px 16px;text-align:right;">Action</th>
    </tr></thead>
    <tbody>
      ${list.map(s => `<tr style="border-bottom:1px solid var(--border);font-size:.82rem;">
        <td style="padding:10px 16px;font-weight:600;">${esc(s.email)}</td>
        <td style="padding:10px 16px;color:var(--muted);">${esc(s.prenom||'—')}</td>
        <td style="padding:10px 16px;color:var(--muted);font-size:.75rem;">${esc(s.topics||'—')}</td>
        <td style="padding:10px 16px;color:var(--muted);">${s.subscribed_at ? new Date(s.subscribed_at).toLocaleDateString('fr-FR') : '—'}</td>
        <td style="padding:10px 16px;text-align:center;">
          ${s.active
            ? '<span style="background:#dcfce7;color:#166534;font-size:.7rem;padding:2px 8px;border-radius:10px;font-weight:700;">Actif</span>'
            : '<span style="background:#fee2e2;color:#dc2626;font-size:.7rem;padding:2px 8px;border-radius:10px;font-weight:700;">Désabonné</span>'}
        </td>
        <td style="padding:10px 16px;text-align:right;">
          <button onclick="deleteSubscriber('${s.id}')" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:.78rem;" title="Supprimer">🗑️</button>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

async function deleteSubscriber(id) {
  if (!confirm('Supprimer cet abonné définitivement ?')) return;
  const { error } = await db.from('newsletter_subscribers').delete().eq('id', id);
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('Abonné supprimé', 'success');
  loadNewsletter();
}

function exportNewsletter() {
  const active = nlAllData.filter(s => s.active);
  if (!active.length) { toast('Aucun abonné actif à exporter', 'error'); return; }
  const csv = ['Email,Prénom,Centres d\'intérêt,Date inscription',
    ...active.map(s => `"${s.email}","${s.prenom||''}","${s.topics||''}","${s.subscribed_at ? new Date(s.subscribed_at).toLocaleDateString('fr-FR') : ''}"`)
  ].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `newsletter-abonnes-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
  toast(`✓ ${active.length} abonnés exportés`, 'success');
}

// =============================================
// MÉDIATHÈQUE — Photos & Vidéos
// =============================================

async function loadMediaSection() {
  await Promise.all([loadMediaPhotos(), loadMediaVideos()]);
}

function switchMediaTab(tab) {
  document.getElementById('media-panel-photos').style.display = tab === 'photos' ? 'block' : 'none';
  document.getElementById('media-panel-videos').style.display = tab === 'videos' ? 'block' : 'none';
  document.getElementById('media-tab-photos').className = 'media-tab-btn' + (tab === 'photos' ? ' active' : '');
  document.getElementById('media-tab-videos').className = 'media-tab-btn' + (tab === 'videos' ? ' active' : '');
}

/* ── PHOTOS ── */
async function loadMediaPhotos() {
  const el = document.getElementById('media-photo-list');
  if (!el) return;
  el.innerHTML = loadingHTML();
  const { data, error } = await db.from('media_photos').select('*').order('taken_at', { ascending: false });
  if (error) { el.innerHTML = emptyHTML('Erreur : ' + error.message); return; }
  if (!data?.length) { el.innerHTML = emptyHTML('Aucune photo. Cliquez sur « Ajouter une photo ».'); return; }

  el.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px;padding:20px;">
    ${data.map(p => `
      <div class="media-card">
        <div class="media-card-img">
          ${p.photo_url
            ? `<img src="${esc(p.photo_url)}" alt="${esc(p.title)}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=no-img style=height:140px;display:flex;align-items:center;justify-content:center;font-size:2rem>🖼️</div>'">`
            : `<div class="no-img" style="height:140px;display:flex;align-items:center;justify-content:center;font-size:2rem;">🖼️</div>`}
        </div>
        <div class="media-card-body">
          <p class="media-card-title">${esc(p.title)}</p>
          <div class="media-card-meta">
            <span style="background:#dcfce7;color:#166534;padding:1px 7px;border-radius:10px;font-size:.68rem;">${esc(p.category)}</span>
            ${p.taken_at ? '<span>' + new Date(p.taken_at).toLocaleDateString('fr-FR') + '</span>' : ''}
          </div>
          <div class="media-card-actions">
            ${p.photo_url ? `<a href="${esc(p.photo_url)}" target="_blank" rel="noopener" class="btn-voir"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>Voir</a>` : ''}
            <button onclick="editMediaPhoto('${p.id}')" class="btn btn-ghost btn-sm" style="flex:1;font-size:.72rem;">Modifier</button>
            <button onclick="deleteMediaPhoto('${p.id}')" class="btn btn-sm" style="padding:4px 8px;font-size:.72rem;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;cursor:pointer;">🗑</button>
          </div>
        </div>
      </div>`).join('')}
  </div>`;
}

function openMediaPhotoModal(photo) {
  document.getElementById('photoModalTitle').textContent = photo ? 'Modifier la photo' : 'Ajouter une photo';
  document.getElementById('photo-id').value          = photo?.id || '';
  document.getElementById('photo-title').value       = photo?.title || '';
  document.getElementById('photo-url').value         = photo?.photo_url || '';
  document.getElementById('photo-category').value    = photo?.category || 'Session';
  document.getElementById('photo-taken-at').value    = photo?.taken_at || '';
  document.getElementById('photo-description').value = photo?.description || '';
  previewPhoto(photo?.photo_url || '');
  const overlay = document.getElementById('modalMediaPhoto');
  overlay.classList.remove('hidden');
  overlay.classList.add('open');
}

function closeMediaPhotoModal() {
  const overlay = document.getElementById('modalMediaPhoto');
  overlay.classList.remove('open');
  overlay.classList.add('hidden');
}

function previewPhoto(url) {
  const img         = document.getElementById('photo-preview');
  const placeholder = document.getElementById('mediaPhotoPlaceholder');
  const zone        = document.getElementById('mediaPhotoZone');
  if (url && url.startsWith('http')) {
    img.src = url; img.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
    if (zone) zone.classList.add('has-image');
  } else {
    img.src = ''; img.style.display = 'none';
    if (placeholder) placeholder.style.display = '';
    if (zone) zone.classList.remove('has-image');
  }
}

async function handleMediaPhotoUpload() {
  const file = document.getElementById('mediaPhotoFile')?.files[0];
  if (!file) return;
  const spinner = document.getElementById('mediaPhotoSpinner');
  if (spinner) spinner.classList.add('active');
  try {
    const ext  = file.name.split('.').pop();
    const path = `mediatheque/photos/${Date.now()}.${ext}`;
    const { error: upErr } = await db.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (upErr) throw upErr;
    const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(path);
    document.getElementById('photo-url').value = publicUrl;
    previewPhoto(publicUrl);
    toast('✓ Photo uploadée', 'success');
  } catch (err) {
    toast('Erreur upload : ' + err.message, 'error');
  } finally {
    if (spinner) spinner.classList.remove('active');
  }
}

async function editMediaPhoto(id) {
  const { data } = await db.from('media_photos').select('*').eq('id', id).single();
  if (data) openMediaPhotoModal(data);
}

async function savePhoto() {
  const id    = document.getElementById('photo-id').value;
  const title = document.getElementById('photo-title').value.trim();
  const url   = document.getElementById('photo-url').value.trim();
  if (!title || !url) { toast('Titre et URL sont obligatoires', 'error'); return; }

  const payload = {
    title,
    photo_url:   url,
    category:    document.getElementById('photo-category').value,
    taken_at:    document.getElementById('photo-taken-at').value || null,
    description: document.getElementById('photo-description').value.trim() || null,
  };

  const { error } = id
    ? await db.from('media_photos').update(payload).eq('id', id)
    : await db.from('media_photos').insert([payload]);

  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('✓ Photo enregistrée', 'success');
  closeMediaPhotoModal();
  loadMediaPhotos();
}

async function deleteMediaPhoto(id) {
  if (!confirm('Supprimer cette photo ?')) return;
  const { error } = await db.from('media_photos').delete().eq('id', id);
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('Photo supprimée', 'success');
  loadMediaPhotos();
}

/* ── VIDÉOS ── */
async function loadMediaVideos() {
  const el = document.getElementById('media-video-list');
  if (!el) return;
  el.innerHTML = loadingHTML();
  const { data, error } = await db.from('media_videos').select('*').order('published_at', { ascending: false });
  if (error) { el.innerHTML = emptyHTML('Erreur : ' + error.message); return; }
  if (!data?.length) { el.innerHTML = emptyHTML('Aucune vidéo. Cliquez sur « Ajouter une vidéo ».'); return; }

  el.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;padding:20px;">
    ${data.map(v => `
      <div class="media-card">
        <div class="media-card-img" style="aspect-ratio:16/9;height:auto">
          <img src="https://img.youtube.com/vi/${esc(v.youtube_id)}/mqdefault.jpg" alt="${esc(v.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">
          <div style="position:absolute;inset:0;background:rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;">
            <a href="https://youtu.be/${esc(v.youtube_id)}" target="_blank" rel="noopener" style="width:40px;height:40px;background:rgba(255,255,255,.9);border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#009A44" style="margin-left:3px"><path d="M8 5v14l11-7z"/></svg>
            </a>
          </div>
        </div>
        <div class="media-card-body">
          <p class="media-card-title">${esc(v.title)}</p>
          <div class="media-card-meta">
            <span style="background:#dcfce7;color:#166534;padding:1px 7px;border-radius:10px;font-size:.68rem;">${esc(v.category)}</span>
            ${v.published_at ? '<span>' + new Date(v.published_at).toLocaleDateString('fr-FR') + '</span>' : ''}
          </div>
          <div class="media-card-actions">
            <a href="https://youtu.be/${esc(v.youtube_id)}" target="_blank" rel="noopener" class="btn-voir"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>YouTube</a>
            <button onclick="editMediaVideo('${v.id}')" class="btn btn-ghost btn-sm" style="flex:1;font-size:.72rem;">Modifier</button>
            <button onclick="deleteMediaVideo('${v.id}')" class="btn btn-sm" style="padding:4px 8px;font-size:.72rem;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;cursor:pointer;">🗑</button>
          </div>
        </div>
      </div>`).join('')}
  </div>`;
}

function openMediaVideoModal(video) {
  document.getElementById('videoModalTitle').textContent = video ? 'Modifier la vidéo' : 'Ajouter une vidéo';
  document.getElementById('video-id').value           = video?.id || '';
  document.getElementById('video-title').value        = video?.title || '';
  document.getElementById('video-youtube-id').value   = video?.youtube_id || '';
  document.getElementById('video-category').value     = video?.category || 'Séances plénières';
  document.getElementById('video-published-at').value = video?.published_at || '';
  document.getElementById('video-description').value  = video?.description || '';
  previewVideo(video?.youtube_id || '');
  const overlay = document.getElementById('modalMediaVideo');
  overlay.classList.remove('hidden');
  overlay.classList.add('open');
}

function closeMediaVideoModal() {
  const overlay = document.getElementById('modalMediaVideo');
  overlay.classList.remove('open');
  overlay.classList.add('hidden');
}

function previewVideo(ytId) {
  const img  = document.getElementById('video-preview');
  const link = document.getElementById('video-yt-link');
  if (ytId && ytId.length >= 6) {
    img.src = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
    img.style.display = 'block';
    if (link) { link.href = `https://youtu.be/${ytId}`; link.style.display = 'inline-flex'; }
  } else {
    img.style.display = 'none';
    if (link) link.style.display = 'none';
  }
}

async function editMediaVideo(id) {
  const { data } = await db.from('media_videos').select('*').eq('id', id).single();
  if (data) openMediaVideoModal(data);
}

async function saveVideo() {
  const id    = document.getElementById('video-id').value;
  const title = document.getElementById('video-title').value.trim();
  const ytId  = document.getElementById('video-youtube-id').value.trim();
  if (!title || !ytId) { toast('Titre et ID YouTube sont obligatoires', 'error'); return; }

  const payload = {
    title,
    youtube_id:   ytId,
    category:     document.getElementById('video-category').value,
    published_at: document.getElementById('video-published-at').value || null,
    description:  document.getElementById('video-description').value.trim() || null,
  };

  const { error } = id
    ? await db.from('media_videos').update(payload).eq('id', id)
    : await db.from('media_videos').insert([payload]);

  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('✓ Vidéo enregistrée', 'success');
  closeMediaVideoModal();
  loadMediaVideos();
}

async function deleteMediaVideo(id) {
  if (!confirm('Supprimer cette vidéo ?')) return;
  const { error } = await db.from('media_videos').delete().eq('id', id);
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('Vidéo supprimée', 'success');
  loadMediaVideos();
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => toast('✓ URL copiée dans le presse-papier !', 'success'))
    .catch(() => toast('Impossible de copier — vérifiez les permissions', 'error'));
}

// =========================================
// ARCHIVES
// =========================================
let archivesData = [];
let archiveEditingId = null;

const CAT_ICONS_ADMIN = {
  'Constitution': '📜', 'Loi': '⚖️', 'Loi organique': '📋',
  'Traité': '🤝', 'Décret': '📄', 'Compte rendu': '📝', 'Rapport': '📊'
};

async function loadArchives() {
  const el = document.getElementById('archive-list');
  if (el) el.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">Chargement…</td></tr>';

  const { data, error } = await db.from('archives_documents')
    .select('*').order('published_at', { ascending: false });

  if (error) { toast('Erreur chargement archives : ' + error.message, 'error'); return; }
  archivesData = data || [];

  // Badge + count
  const badge = document.getElementById('badge-archives');
  if (badge) badge.textContent = archivesData.length;

  // Populate year filter
  const years = [...new Set(archivesData.map(d => d.year).filter(Boolean))].sort((a, b) => b - a);
  const yf = document.getElementById('arch-year-filter');
  if (yf) {
    const cur = yf.value;
    yf.innerHTML = '<option value="">Toutes années</option>' + years.map(y => `<option${y == cur ? ' selected' : ''}>${y}</option>`).join('');
  }

  filterArchives();
}

function filterArchives() {
  const q   = (document.getElementById('arch-search')?.value || '').toLowerCase();
  const cat = document.getElementById('arch-cat-filter')?.value || '';
  const yr  = document.getElementById('arch-year-filter')?.value || '';

  const filtered = archivesData.filter(d => {
    if (cat && d.category !== cat) return false;
    if (yr  && String(d.year) !== yr) return false;
    if (q   && !d.title.toLowerCase().includes(q) && !(d.description||'').toLowerCase().includes(q)) return false;
    return true;
  });

  document.getElementById('arch-count').textContent = filtered.length;
  renderArchives(filtered);
}

function renderArchives(docs) {
  const el = document.getElementById('archive-list');
  if (!el) return;
  if (!docs.length) {
    el.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">Aucun document</td></tr>';
    return;
  }
  el.innerHTML = docs.map(d => {
    const icon = CAT_ICONS_ADMIN[d.category] || '📄';
    const date = d.published_at ? new Date(d.published_at).toLocaleDateString('fr-FR') : '—';
    return `<tr>
      <td><strong>${icon} ${d.title}</strong>${d.description ? `<br><small style="color:var(--muted)">${d.description}</small>` : ''}</td>
      <td><span class="status-badge status-published">${d.category}</span></td>
      <td>${d.year || '—'}</td>
      <td style="font-size:.75rem;color:var(--muted)">${d.legislature || '—'}</td>
      <td style="font-size:.75rem">${d.file_size || '—'}</td>
      <td style="font-size:.75rem">${date}</td>
      <td>
        <button class="btn btn-ghost" style="padding:4px 8px;font-size:.75rem" onclick="editArchive('${d.id}')">✏️</button>
        <button class="btn btn-ghost" style="padding:4px 8px;font-size:.75rem;color:#dc2626" onclick="deleteArchive('${d.id}')">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openArchiveModal(id) {
  archiveEditingId = id || null;
  document.getElementById('archiveModalTitle').textContent = id ? 'Modifier le document' : 'Nouveau document';
  document.getElementById('arch-title').value = '';
  document.getElementById('arch-category').value = 'Loi';
  document.getElementById('arch-year').value = new Date().getFullYear();
  document.getElementById('arch-legislature').value = '15ème Législature';
  document.getElementById('arch-description').value = '';
  document.getElementById('arch-file-url').value = '';
  document.getElementById('arch-file-size').value = '';
  document.getElementById('arch-date').value = '';
  document.getElementById('archiveModalOverlay').classList.remove('hidden');
}

async function editArchive(id) {
  const doc = archivesData.find(d => d.id === id);
  if (!doc) return;
  archiveEditingId = id;
  document.getElementById('archiveModalTitle').textContent = 'Modifier le document';
  document.getElementById('arch-title').value       = doc.title || '';
  document.getElementById('arch-category').value    = doc.category || 'Loi';
  document.getElementById('arch-year').value        = doc.year || '';
  document.getElementById('arch-legislature').value = doc.legislature || '15ème Législature';
  document.getElementById('arch-description').value = doc.description || '';
  document.getElementById('arch-file-url').value    = doc.file_url || '';
  document.getElementById('arch-file-size').value   = doc.file_size || '';
  document.getElementById('arch-date').value        = doc.published_at || '';
  document.getElementById('archiveModalOverlay').classList.remove('hidden');
}

function closeArchiveModal() {
  document.getElementById('archiveModalOverlay').classList.add('hidden');
  archiveEditingId = null;
}

async function saveArchive() {
  const title = document.getElementById('arch-title').value.trim();
  if (!title) { toast('Le titre est obligatoire', 'error'); return; }

  const payload = {
    title,
    category:    document.getElementById('arch-category').value,
    year:        parseInt(document.getElementById('arch-year').value) || null,
    legislature: document.getElementById('arch-legislature').value.trim() || null,
    description: document.getElementById('arch-description').value.trim() || null,
    file_url:    document.getElementById('arch-file-url').value.trim() || null,
    file_size:   document.getElementById('arch-file-size').value.trim() || null,
    published_at:document.getElementById('arch-date').value || null,
  };

  const { error } = archiveEditingId
    ? await db.from('archives_documents').update(payload).eq('id', archiveEditingId)
    : await db.from('archives_documents').insert([payload]);

  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast(archiveEditingId ? 'Document mis à jour' : 'Document ajouté', 'success');
  closeArchiveModal();
  loadArchives();
}

async function deleteArchive(id) {
  if (!confirm('Supprimer ce document ?')) return;
  const { error } = await db.from('archives_documents').delete().eq('id', id);
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('Document supprimé', 'success');
  loadArchives();
}

// =========================================
// SÉANCES PLÉNIÈRES
// =========================================
let seancesData = [];
let seanceEditingId = null;
const MONTHS_FR = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];

async function loadSeances() {
  const el = document.getElementById('seance-list');
  if (el) el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted)">Chargement…</td></tr>';

  const { data, error } = await db.from('seances_plenieres')
    .select('*').order('date_seance', { ascending: false });

  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  seancesData = data || [];

  const badge = document.getElementById('badge-seances');
  if (badge) badge.textContent = seancesData.length;

  filterSeances();
}

function filterSeances() {
  const q  = (document.getElementById('seance-search')?.value || '').toLowerCase();
  const st = document.getElementById('seance-statut-filter')?.value || '';
  const ty = document.getElementById('seance-type-filter')?.value || '';

  const filtered = seancesData.filter(s => {
    if (st && s.statut !== st) return false;
    if (ty && s.type_seance !== ty) return false;
    if (q  && !s.titre.toLowerCase().includes(q)) return false;
    return true;
  });

  document.getElementById('seance-count').textContent = filtered.length;
  renderSeances(filtered);
}

function renderSeances(list) {
  const el = document.getElementById('seance-list');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted)">Aucune séance</td></tr>';
    return;
  }
  el.innerHTML = list.map(s => {
    const d   = new Date(s.date_seance + 'T00:00:00');
    const df  = `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
    const statutBadge = s.statut === 'Terminee'
      ? '<span class="status-badge" style="background:#f1f5f9;color:#64748b">Terminée</span>'
      : s.statut === 'A venir'
        ? '<span class="status-badge" style="background:#dbeafe;color:#1d4ed8">À venir</span>'
        : '<span class="status-badge status-published">En cours</span>';
    const typeBadge = s.type_seance === 'Extraordinaire'
      ? '<span class="status-badge" style="background:#f3e8ff;color:#7e22ce">Extraordinaire</span>'
      : `<span class="status-badge status-published">${s.type_seance}</span>`;
    const crLink = s.compte_rendu_url
      ? `<a href="${s.compte_rendu_url}" target="_blank" style="color:#009A44;font-size:.75rem">📄 Voir</a>`
      : '<span style="color:var(--muted);font-size:.75rem">—</span>';
    return `<tr>
      <td style="font-size:.8rem;white-space:nowrap">${df}</td>
      <td><strong style="font-size:.82rem">${s.titre}</strong></td>
      <td>${typeBadge}</td>
      <td>${statutBadge}</td>
      <td>${crLink}</td>
      <td>
        <button class="btn btn-ghost" style="padding:4px 8px;font-size:.75rem" onclick="editSeance('${s.id}')">✏️</button>
        <button class="btn btn-ghost" style="padding:4px 8px;font-size:.75rem;color:#dc2626" onclick="deleteSeance('${s.id}')">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openSeanceModal() {
  seanceEditingId = null;
  document.getElementById('seanceModalTitle').textContent = 'Nouvelle séance';
  document.getElementById('sc-titre').value = '';
  document.getElementById('sc-date').value  = '';
  document.getElementById('sc-heure').value = '09:00';
  document.getElementById('sc-type').value  = 'Ordinaire';
  document.getElementById('sc-session').value = '15ème Législature';
  document.getElementById('sc-statut').value = 'A venir';
  document.getElementById('sc-description').value = '';
  document.getElementById('sc-odj').value = '';
  document.getElementById('sc-cr-url').value = '';
  document.getElementById('seanceModalOverlay').classList.remove('hidden');
}

async function editSeance(id) {
  const s = seancesData.find(x => x.id === id);
  if (!s) return;
  seanceEditingId = id;
  document.getElementById('seanceModalTitle').textContent = 'Modifier la séance';
  document.getElementById('sc-titre').value       = s.titre || '';
  document.getElementById('sc-date').value        = s.date_seance || '';
  document.getElementById('sc-heure').value       = (s.heure || '09:00').slice(0,5);
  document.getElementById('sc-type').value        = s.type_seance || 'Ordinaire';
  document.getElementById('sc-session').value     = s.session || '15ème Législature';
  document.getElementById('sc-statut').value      = s.statut || 'A venir';
  document.getElementById('sc-description').value = s.description || '';
  document.getElementById('sc-odj').value         = s.ordre_du_jour || '';
  document.getElementById('sc-cr-url').value      = s.compte_rendu_url || '';
  document.getElementById('seanceModalOverlay').classList.remove('hidden');
}

function closeSeanceModal() {
  document.getElementById('seanceModalOverlay').classList.add('hidden');
  seanceEditingId = null;
}

async function saveSeance() {
  const titre = document.getElementById('sc-titre').value.trim();
  const date  = document.getElementById('sc-date').value;
  if (!titre) { toast('Le titre est obligatoire', 'error'); return; }
  if (!date)  { toast('La date est obligatoire', 'error'); return; }

  const payload = {
    titre,
    date_seance:    date,
    heure:          document.getElementById('sc-heure').value || '09:00',
    type_seance:    document.getElementById('sc-type').value,
    session:        document.getElementById('sc-session').value.trim() || null,
    statut:         document.getElementById('sc-statut').value,
    description:    document.getElementById('sc-description').value.trim() || null,
    ordre_du_jour:  document.getElementById('sc-odj').value.trim() || null,
    compte_rendu_url: document.getElementById('sc-cr-url').value.trim() || null,
  };

  const { error } = seanceEditingId
    ? await db.from('seances_plenieres').update(payload).eq('id', seanceEditingId)
    : await db.from('seances_plenieres').insert([payload]);

  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast(seanceEditingId ? 'Séance mise à jour' : 'Séance ajoutée', 'success');
  closeSeanceModal();
  loadSeances();
}

async function deleteSeance(id) {
  if (!confirm('Supprimer cette séance ?')) return;
  const { error } = await db.from('seances_plenieres').delete().eq('id', id);
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('Séance supprimée', 'success');
  loadSeances();
}

// =========================================
// GROUPES PARLEMENTAIRES
// =========================================
let groupesData = [];
let groupeEditingId = null;

async function loadGroupes() {
  const el = document.getElementById('groupe-list');
  if (el) el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted)">Chargement…</td></tr>';

  const { data, error } = await db.from('groupes_parlementaires')
    .select('*').order('ordre', { ascending: true });

  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  groupesData = data || [];

  const badge = document.getElementById('badge-groupes');
  if (badge) badge.textContent = groupesData.length;

  renderGroupes();
}

function renderGroupes() {
  const el = document.getElementById('groupe-list');
  if (!el) return;
  if (!groupesData.length) {
    el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted)">Aucun groupe</td></tr>';
    return;
  }
  el.innerHTML = groupesData.map(g => `<tr>
    <td><div style="width:24px;height:24px;border-radius:6px;background:${g.couleur}"></div></td>
    <td><strong>${g.sigle || '—'}</strong></td>
    <td style="font-size:.82rem">${g.nom}</td>
    <td style="font-size:.78rem">${g.president || '—'}</td>
    <td><span class="status-badge status-published">${g.nb_membres} sièges</span></td>
    <td>
      <button class="btn btn-ghost" style="padding:4px 8px;font-size:.75rem" onclick="editGroupe('${g.id}')">✏️</button>
      <button class="btn btn-ghost" style="padding:4px 8px;font-size:.75rem;color:#dc2626" onclick="deleteGroupe('${g.id}')">🗑️</button>
    </td>
  </tr>`).join('');
}

function openGroupeModal() {
  groupeEditingId = null;
  document.getElementById('groupeModalTitle').textContent = 'Nouveau groupe';
  document.getElementById('grp-nom').value         = '';
  document.getElementById('grp-sigle').value       = '';
  document.getElementById('grp-couleur').value     = '#009A44';
  document.getElementById('grp-membres').value     = '';
  document.getElementById('grp-ordre').value       = '';
  document.getElementById('grp-president').value   = '';
  document.getElementById('grp-secretaire').value  = '';
  document.getElementById('grp-description').value = '';
  document.getElementById('groupeModalOverlay').classList.remove('hidden');
}

async function editGroupe(id) {
  const g = groupesData.find(x => x.id === id);
  if (!g) return;
  groupeEditingId = id;
  document.getElementById('groupeModalTitle').textContent  = 'Modifier le groupe';
  document.getElementById('grp-nom').value         = g.nom || '';
  document.getElementById('grp-sigle').value       = g.sigle || '';
  document.getElementById('grp-couleur').value     = g.couleur || '#009A44';
  document.getElementById('grp-membres').value     = g.nb_membres || 0;
  document.getElementById('grp-ordre').value       = g.ordre || 0;
  document.getElementById('grp-president').value   = g.president || '';
  document.getElementById('grp-secretaire').value  = g.secretaire || '';
  document.getElementById('grp-description').value = g.description || '';
  document.getElementById('groupeModalOverlay').classList.remove('hidden');
}

function closeGroupeModal() {
  document.getElementById('groupeModalOverlay').classList.add('hidden');
  groupeEditingId = null;
}

async function saveGroupe() {
  const nom = document.getElementById('grp-nom').value.trim();
  if (!nom) { toast('Le nom est obligatoire', 'error'); return; }

  const payload = {
    nom,
    sigle:       document.getElementById('grp-sigle').value.trim() || null,
    couleur:     document.getElementById('grp-couleur').value,
    nb_membres:  parseInt(document.getElementById('grp-membres').value) || 0,
    ordre:       parseInt(document.getElementById('grp-ordre').value) || 0,
    president:   document.getElementById('grp-president').value.trim() || null,
    secretaire:  document.getElementById('grp-secretaire').value.trim() || null,
    description: document.getElementById('grp-description').value.trim() || null,
  };

  const { error } = groupeEditingId
    ? await db.from('groupes_parlementaires').update(payload).eq('id', groupeEditingId)
    : await db.from('groupes_parlementaires').insert([payload]);

  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast(groupeEditingId ? 'Groupe mis à jour' : 'Groupe ajouté', 'success');
  closeGroupeModal();
  loadGroupes();
}

async function deleteGroupe(id) {
  if (!confirm('Supprimer ce groupe ?')) return;
  const { error } = await db.from('groupes_parlementaires').delete().eq('id', id);
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('Groupe supprimé', 'success');
  loadGroupes();
}

// =========================================
// QUESTIONS ÉCRITES
// =========================================
let qeData = [];
let qeEditingId = null;

const QE_STATUT_BADGES = {
  'Posee':       'badge badge-posee',
  'Repondue':    'badge badge-repondue',
  'Sans reponse':'badge badge-sans-rep',
};
const QE_STATUT_LABELS = { 'Posee':'Posée', 'Repondue':'Répondue', 'Sans reponse':'Sans réponse' };

async function loadQuestionsEcrites() {
  const tbody = document.getElementById('qe-list');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted)">Chargement…</td></tr>';

  const { data, error } = await db.from('questions_ecrites').select('*').order('date', { ascending: false });
  if (error) { toast('Erreur : ' + error.message, 'error'); qeData = []; renderQE([]); return; }
  qeData = data || [];

  const badge = document.getElementById('badge-questions-ecrites');
  if (badge) badge.textContent = qeData.length;
  filterQuestionsEcrites();
}

function filterQuestionsEcrites() {
  const q  = (document.getElementById('qe-search')?.value || '').toLowerCase();
  const st = document.getElementById('qe-statut')?.value || '';
  const filtered = qeData.filter(r => {
    if (st && r.statut !== st) return false;
    if (q && !((r.sujet||'').toLowerCase().includes(q) || (r.auteur_nom||'').toLowerCase().includes(q) || (r.destinataire||'').toLowerCase().includes(q))) return false;
    return true;
  });
  document.getElementById('qe-count').textContent = filtered.length;
  renderQE(filtered);
}

function renderQE(list) {
  const el = document.getElementById('qe-list');
  if (!el) return;
  if (!list.length) { el.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted)">Aucune question écrite</td></tr>'; return; }
  el.innerHTML = list.map(r => {
    const d = r.date ? new Date(r.date + 'T00:00:00').toLocaleDateString('fr-FR') : '—';
    const cls = QE_STATUT_BADGES[r.statut] || 'badge badge-gray';
    const lbl = QE_STATUT_LABELS[r.statut] || r.statut || '—';
    return `<tr>
      <td style="font-size:.8rem;color:var(--muted)">${r.numero ?? '—'}</td>
      <td style="font-size:.8rem;white-space:nowrap">${d}</td>
      <td style="font-weight:600;font-size:.82rem">${esc(r.auteur_nom || '—')}</td>
      <td style="font-size:.8rem">${esc(r.destinataire || '—')}</td>
      <td style="max-width:240px;font-size:.82rem">${esc(r.sujet || '—')}</td>
      <td style="font-size:.75rem;color:var(--muted)">${esc(r.session || '—')}</td>
      <td><span class="${cls}">${lbl}</span>${r.reponse_url ? ` <a href="${esc(r.reponse_url)}" target="_blank" style="font-size:.7rem;color:var(--primary);margin-left:4px">PDF</a>` : ''}</td>
      <td><div class="actions">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editQE('${r.id}')" title="Modifier">✏️</button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="deleteQE('${r.id}')" title="Supprimer">🗑️</button>
      </div></td>
    </tr>`;
  }).join('');
}

function openQEModal(data) {
  qeEditingId = data?.id || null;
  document.getElementById('qeModalTitle').textContent = data ? 'Modifier la question écrite' : 'Nouvelle question écrite';
  document.getElementById('qe-numero').value       = data?.numero ?? '';
  document.getElementById('qe-date').value         = data?.date || '';
  document.getElementById('qe-session').value      = data?.session || 'Session mars 2026';
  document.getElementById('qe-auteur').value       = data?.auteur_nom || '';
  document.getElementById('qe-destinataire').value = data?.destinataire || '';
  document.getElementById('qe-sujet').value        = data?.sujet || '';
  document.getElementById('qe-contenu').value      = data?.contenu || '';
  document.getElementById('qe-statut-form').value  = data?.statut || 'Posee';
  document.getElementById('qe-reponse-url').value  = data?.reponse_url || '';
  document.getElementById('qeModalOverlay').classList.remove('hidden');
}

async function editQE(id) {
  const r = qeData.find(x => x.id === id);
  if (r) openQEModal(r);
}

function closeQEModal() { document.getElementById('qeModalOverlay').classList.add('hidden'); qeEditingId = null; }

async function saveQE() {
  const sujet  = document.getElementById('qe-sujet').value.trim();
  const auteur = document.getElementById('qe-auteur').value.trim();
  const date   = document.getElementById('qe-date').value;
  if (!sujet || !auteur || !date) { toast('Sujet, auteur et date sont obligatoires', 'error'); return; }

  const payload = {
    numero:        parseInt(document.getElementById('qe-numero').value) || null,
    date,
    session:       document.getElementById('qe-session').value.trim() || null,
    auteur_nom:    auteur,
    destinataire:  document.getElementById('qe-destinataire').value.trim() || null,
    sujet,
    contenu:       document.getElementById('qe-contenu').value.trim() || null,
    statut:        document.getElementById('qe-statut-form').value,
    reponse_url:   document.getElementById('qe-reponse-url').value.trim() || null,
  };

  const { error } = qeEditingId
    ? await db.from('questions_ecrites').update(payload).eq('id', qeEditingId)
    : await db.from('questions_ecrites').insert([payload]);

  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast(qeEditingId ? 'Question mise à jour' : 'Question enregistrée', 'success');
  closeQEModal();
  loadQuestionsEcrites();
}

async function deleteQE(id) {
  if (!confirm('Supprimer cette question écrite ?')) return;
  const { error } = await db.from('questions_ecrites').delete().eq('id', id);
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('Question supprimée', 'success');
  loadQuestionsEcrites();
}

// =========================================
// QUESTIONS ORALES
// =========================================
let qoData = [];
let qoEditingId = null;

const QO_STATUT_BADGES = {
  'Programmee': 'badge badge-programmee',
  'Posee':      'badge badge-posee',
  'Repondue':   'badge badge-repondue',
};
const QO_STATUT_LABELS = { 'Programmee':'Programmée', 'Posee':'Posée', 'Repondue':'Répondue' };

async function loadQuestionsOrales() {
  const tbody = document.getElementById('qo-list');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted)">Chargement…</td></tr>';

  const { data, error } = await db.from('questions_orales').select('*').order('date_seance', { ascending: false });
  if (error) { toast('Erreur : ' + error.message, 'error'); qoData = []; renderQO([]); return; }
  qoData = data || [];

  const badge = document.getElementById('badge-questions-orales');
  if (badge) badge.textContent = qoData.length;
  filterQuestionsOrales();
}

function filterQuestionsOrales() {
  const q  = (document.getElementById('qo-search')?.value || '').toLowerCase();
  const st = document.getElementById('qo-statut')?.value || '';
  const filtered = qoData.filter(r => {
    if (st && r.statut !== st) return false;
    if (q && !((r.sujet||'').toLowerCase().includes(q) || (r.auteur_nom||'').toLowerCase().includes(q))) return false;
    return true;
  });
  document.getElementById('qo-count').textContent = filtered.length;
  renderQO(filtered);
}

function renderQO(list) {
  const el = document.getElementById('qo-list');
  if (!el) return;
  if (!list.length) { el.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted)">Aucune question orale</td></tr>'; return; }
  el.innerHTML = list.map(r => {
    const d = r.date_seance ? new Date(r.date_seance + 'T00:00:00').toLocaleDateString('fr-FR') : '—';
    const cls = QO_STATUT_BADGES[r.statut] || 'badge badge-gray';
    const lbl = QO_STATUT_LABELS[r.statut] || r.statut || '—';
    return `<tr>
      <td style="font-size:.8rem;color:var(--muted)">${r.numero ?? '—'}</td>
      <td style="font-size:.8rem;white-space:nowrap">${d}</td>
      <td style="font-weight:600;font-size:.82rem">${esc(r.auteur_nom || '—')}</td>
      <td style="font-size:.8rem">${esc(r.destinataire || '—')}</td>
      <td style="max-width:240px;font-size:.82rem">${esc(r.sujet || '—')}</td>
      <td style="font-size:.75rem;color:var(--muted)">${esc(r.session || '—')}</td>
      <td><span class="${cls}">${lbl}</span></td>
      <td><div class="actions">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editQO('${r.id}')" title="Modifier">✏️</button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="deleteQO('${r.id}')" title="Supprimer">🗑️</button>
      </div></td>
    </tr>`;
  }).join('');
}

function openQOModal(data) {
  qoEditingId = data?.id || null;
  document.getElementById('qoModalTitle').textContent = data ? 'Modifier la question orale' : 'Nouvelle question orale';
  document.getElementById('qo-numero').value       = data?.numero ?? '';
  document.getElementById('qo-date').value         = data?.date_seance || '';
  document.getElementById('qo-session').value      = data?.session || 'Session mars 2026';
  document.getElementById('qo-auteur').value       = data?.auteur_nom || '';
  document.getElementById('qo-destinataire').value = data?.destinataire || '';
  document.getElementById('qo-sujet').value        = data?.sujet || '';
  document.getElementById('qo-statut-form').value  = data?.statut || 'Programmee';
  document.getElementById('qoModalOverlay').classList.remove('hidden');
}

async function editQO(id) {
  const r = qoData.find(x => x.id === id);
  if (r) openQOModal(r);
}

function closeQOModal() { document.getElementById('qoModalOverlay').classList.add('hidden'); qoEditingId = null; }

async function saveQO() {
  const sujet  = document.getElementById('qo-sujet').value.trim();
  const auteur = document.getElementById('qo-auteur').value.trim();
  const date   = document.getElementById('qo-date').value;
  if (!sujet || !auteur || !date) { toast('Sujet, auteur et date sont obligatoires', 'error'); return; }

  const payload = {
    numero:       parseInt(document.getElementById('qo-numero').value) || null,
    date_seance:  date,
    session:      document.getElementById('qo-session').value.trim() || null,
    auteur_nom:   auteur,
    destinataire: document.getElementById('qo-destinataire').value.trim() || null,
    sujet,
    statut:       document.getElementById('qo-statut-form').value,
  };

  const { error } = qoEditingId
    ? await db.from('questions_orales').update(payload).eq('id', qoEditingId)
    : await db.from('questions_orales').insert([payload]);

  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast(qoEditingId ? 'Question mise à jour' : 'Question enregistrée', 'success');
  closeQOModal();
  loadQuestionsOrales();
}

async function deleteQO(id) {
  if (!confirm('Supprimer cette question orale ?')) return;
  const { error } = await db.from('questions_orales').delete().eq('id', id);
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('Question supprimée', 'success');
  loadQuestionsOrales();
}

// =========================================
// INTERPELLATIONS
// =========================================
let interpData = [];
let interpEditingId = null;

const INTERP_STATUT_BADGES = {
  'Deposee':    'badge badge-deposee',
  'Programmee': 'badge badge-programmee',
  'Debattue':   'badge badge-debattue',
  'Classee':    'badge badge-classee',
};
const INTERP_STATUT_LABELS = { 'Deposee':'Déposée', 'Programmee':'Programmée', 'Debattue':'Débattue', 'Classee':'Classée' };

async function loadInterpellations() {
  const tbody = document.getElementById('interp-list');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">Chargement…</td></tr>';

  const { data, error } = await db.from('interpellations').select('*').order('date', { ascending: false });
  if (error) { toast('Erreur : ' + error.message, 'error'); interpData = []; renderInterp([]); return; }
  interpData = data || [];

  const badge = document.getElementById('badge-interpellations');
  if (badge) badge.textContent = interpData.length;
  filterInterpellations();
}

function filterInterpellations() {
  const q  = (document.getElementById('interp-search')?.value || '').toLowerCase();
  const st = document.getElementById('interp-statut')?.value || '';
  const filtered = interpData.filter(r => {
    if (st && r.statut !== st) return false;
    if (q && !((r.sujet||'').toLowerCase().includes(q) || (r.auteur_nom||'').toLowerCase().includes(q))) return false;
    return true;
  });
  document.getElementById('interp-count').textContent = filtered.length;
  renderInterp(filtered);
}

function renderInterp(list) {
  const el = document.getElementById('interp-list');
  if (!el) return;
  if (!list.length) { el.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted)">Aucune interpellation</td></tr>'; return; }
  el.innerHTML = list.map(r => {
    const d = r.date ? new Date(r.date + 'T00:00:00').toLocaleDateString('fr-FR') : '—';
    const cls = INTERP_STATUT_BADGES[r.statut] || 'badge badge-gray';
    const lbl = INTERP_STATUT_LABELS[r.statut] || r.statut || '—';
    return `<tr>
      <td style="font-size:.8rem;color:var(--muted)">${r.numero ?? '—'}</td>
      <td style="font-size:.8rem;white-space:nowrap">${d}</td>
      <td style="font-weight:600;font-size:.82rem">${esc(r.auteur_nom || '—')}</td>
      <td style="max-width:240px;font-size:.82rem">${esc(r.sujet || '—')}</td>
      <td style="font-size:.75rem;color:var(--muted)">${esc(r.session || '—')}</td>
      <td><span class="${cls}">${lbl}</span></td>
      <td><div class="actions">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editInterp('${r.id}')" title="Modifier">✏️</button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="deleteInterp('${r.id}')" title="Supprimer">🗑️</button>
      </div></td>
    </tr>`;
  }).join('');
}

function openInterpModal(data) {
  interpEditingId = data?.id || null;
  document.getElementById('interpModalTitle').textContent = data ? 'Modifier l\'interpellation' : 'Nouvelle interpellation';
  document.getElementById('interp-numero').value       = data?.numero ?? '';
  document.getElementById('interp-date').value         = data?.date || '';
  document.getElementById('interp-session').value      = data?.session || 'Session mars 2026';
  document.getElementById('interp-auteur').value       = data?.auteur_nom || '';
  document.getElementById('interp-sujet').value        = data?.sujet || '';
  document.getElementById('interp-description').value  = data?.description || '';
  document.getElementById('interp-statut-form').value  = data?.statut || 'Deposee';
  document.getElementById('interpModalOverlay').classList.remove('hidden');
}

async function editInterp(id) {
  const r = interpData.find(x => x.id === id);
  if (r) openInterpModal(r);
}

function closeInterpModal() { document.getElementById('interpModalOverlay').classList.add('hidden'); interpEditingId = null; }

async function saveInterp() {
  const sujet  = document.getElementById('interp-sujet').value.trim();
  const auteur = document.getElementById('interp-auteur').value.trim();
  const date   = document.getElementById('interp-date').value;
  if (!sujet || !auteur || !date) { toast('Sujet, auteur et date sont obligatoires', 'error'); return; }

  const payload = {
    numero:      parseInt(document.getElementById('interp-numero').value) || null,
    date,
    session:     document.getElementById('interp-session').value.trim() || null,
    auteur_nom:  auteur,
    sujet,
    description: document.getElementById('interp-description').value.trim() || null,
    statut:      document.getElementById('interp-statut-form').value,
  };

  const { error } = interpEditingId
    ? await db.from('interpellations').update(payload).eq('id', interpEditingId)
    : await db.from('interpellations').insert([payload]);

  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast(interpEditingId ? 'Interpellation mise à jour' : 'Interpellation enregistrée', 'success');
  closeInterpModal();
  loadInterpellations();
}

async function deleteInterp(id) {
  if (!confirm('Supprimer cette interpellation ?')) return;
  const { error } = await db.from('interpellations').delete().eq('id', id);
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('Interpellation supprimée', 'success');
  loadInterpellations();
}

// =========================================
// JOURNAUX DES DÉBATS
// =========================================
let jdData = [];
let jdEditingId = null;

const JD_TYPE_BADGES = {
  'Integral':   'badge badge-integral',
  'Resume':     'badge badge-resume',
  'Provisoire': 'badge badge-provisoire',
};
const JD_TYPE_LABELS = { 'Integral':'CR Intégral', 'Resume':'CR Analytique', 'Provisoire':'Provisoire' };

async function loadJournauxDebats() {
  const tbody = document.getElementById('jd-list');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted)">Chargement…</td></tr>';

  const { data, error } = await db.from('journaux_debats').select('*').order('date_seance', { ascending: false });
  if (error) { toast('Erreur : ' + error.message, 'error'); jdData = []; renderJD([]); return; }
  jdData = data || [];

  const badge = document.getElementById('badge-journaux-debats');
  if (badge) badge.textContent = jdData.length;
  filterJournauxDebats();
}

function filterJournauxDebats() {
  const q  = (document.getElementById('jd-search')?.value || '').toLowerCase();
  const ty = document.getElementById('jd-type')?.value || '';
  const filtered = jdData.filter(r => {
    if (ty && r.type_doc !== ty) return false;
    if (q && !((r.titre||'').toLowerCase().includes(q) || (r.numero_ref||'').toLowerCase().includes(q))) return false;
    return true;
  });
  document.getElementById('jd-count').textContent = filtered.length;
  renderJD(filtered);
}

function renderJD(list) {
  const el = document.getElementById('jd-list');
  if (!el) return;
  if (!list.length) { el.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--muted)">Aucun journal des débats</td></tr>'; return; }
  el.innerHTML = list.map(r => {
    const d = r.date_seance ? new Date(r.date_seance + 'T00:00:00').toLocaleDateString('fr-FR') : '—';
    const cls = JD_TYPE_BADGES[r.type_doc] || 'badge badge-gray';
    const lbl = JD_TYPE_LABELS[r.type_doc] || r.type_doc || '—';
    const pdf = r.file_url
      ? `<a href="${esc(r.file_url)}" target="_blank" class="btn btn-ghost btn-sm" style="font-size:.72rem;">PDF</a>`
      : '<span style="color:var(--muted);font-size:.75rem">—</span>';
    const pub = r.is_public
      ? '<span class="badge badge-green">Publié</span>'
      : '<span class="badge badge-gray">Masqué</span>';
    return `<tr>
      <td style="font-family:monospace;font-size:.78rem">${esc(r.numero_ref || '—')}</td>
      <td style="max-width:220px;font-weight:600;font-size:.82rem">${esc(r.titre || '—')}</td>
      <td style="font-size:.8rem;white-space:nowrap">${d}</td>
      <td style="font-size:.75rem;color:var(--muted)">${esc(r.session || '—')}</td>
      <td><span class="${cls}">${lbl}</span></td>
      <td>${pdf}</td>
      <td>${pub}</td>
      <td><div class="actions">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editJD('${r.id}')" title="Modifier">✏️</button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="deleteJD('${r.id}')" title="Supprimer">🗑️</button>
      </div></td>
    </tr>`;
  }).join('');
}

function openJDModal(data) {
  jdEditingId = data?.id || null;
  document.getElementById('jdModalTitle').textContent = data ? 'Modifier le journal' : 'Nouveau journal des débats';
  document.getElementById('jd-ref').value        = data?.numero_ref || '';
  document.getElementById('jd-date').value       = data?.date_seance || '';
  document.getElementById('jd-titre').value      = data?.titre || '';
  document.getElementById('jd-session').value    = data?.session || 'Session mars 2026';
  document.getElementById('jd-type-form').value  = data?.type_doc || 'Integral';
  document.getElementById('jd-file-url').value   = data?.file_url || '';
  document.getElementById('jd-published').value  = data?.published_at || '';
  document.getElementById('jd-is-public').checked = data ? !!data.is_public : true;
  document.getElementById('jdModalOverlay').classList.remove('hidden');
}

async function editJD(id) {
  const r = jdData.find(x => x.id === id);
  if (r) openJDModal(r);
}

function closeJDModal() { document.getElementById('jdModalOverlay').classList.add('hidden'); jdEditingId = null; }

async function saveJD() {
  const ref   = document.getElementById('jd-ref').value.trim();
  const titre = document.getElementById('jd-titre').value.trim();
  const date  = document.getElementById('jd-date').value;
  if (!ref || !titre || !date) { toast('Référence, titre et date sont obligatoires', 'error'); return; }

  const payload = {
    numero_ref:   ref,
    titre,
    date_seance:  date,
    session:      document.getElementById('jd-session').value.trim() || null,
    type_doc:     document.getElementById('jd-type-form').value,
    file_url:     document.getElementById('jd-file-url').value.trim() || null,
    published_at: document.getElementById('jd-published').value || null,
    is_public:    document.getElementById('jd-is-public').checked,
  };

  const { error } = jdEditingId
    ? await db.from('journaux_debats').update(payload).eq('id', jdEditingId)
    : await db.from('journaux_debats').insert([payload]);

  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast(jdEditingId ? 'Journal mis à jour' : 'Journal enregistré', 'success');
  closeJDModal();
  loadJournauxDebats();
}

async function deleteJD(id) {
  if (!confirm('Supprimer ce journal des débats ?')) return;
  const { error } = await db.from('journaux_debats').delete().eq('id', id);
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('Journal supprimé', 'success');
  loadJournauxDebats();
}
