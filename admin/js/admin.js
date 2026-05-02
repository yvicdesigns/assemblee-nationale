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
const CATEGORIES_ACTU = ['Actualité','Audience','Audition','Conférence des Présidents','Congrès','Interpellation','Plénière','Présidence'];

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
  accueil: '🏠 Tableau de bord',
  slides: '🖼️ Carrousel — Bannières',
  actualites: '📰 Actualités',
  president: '👤 Le Président',
  bureau: '👥 Le Bureau',
  agenda: '📅 Agenda',
  parametres: '⚙️ Paramètres généraux',
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
    case 'accueil':    await loadStats(); break;
    case 'slides':     await loadSlides(); break;
    case 'actualites': await loadActualites(); break;
    case 'bureau':     await loadBureau(); break;
    case 'president':  await loadPresident(); break;
    case 'agenda':     await loadAgenda(); break;
    case 'parametres': await loadParametres(); break;
  }
}

// =========================================
// STATS
// =========================================
async function loadStats() {
  const [s, a, b, ag] = await Promise.all([
    db.from('slides').select('id', { count: 'exact', head: true }),
    db.from('actualites').select('id', { count: 'exact', head: true }),
    db.from('bureau').select('id', { count: 'exact', head: true }),
    db.from('agenda').select('id', { count: 'exact', head: true }),
  ]);
  const set = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n ?? '—'; };
  set('stat-slides', s.count);
  set('stat-actualites', a.count);
  set('stat-bureau', b.count);
  set('stat-agenda', ag.count);
  set('badge-slides', s.count);
  set('badge-actualites', a.count);
  set('badge-bureau', b.count);
  set('badge-agenda', ag.count);
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

  el.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th style="width:72px">Image</th>
        <th>Titre</th>
        <th>Catégorie</th>
        <th>Date</th>
        <th>Actif</th>
        <th>Actions</th>
      </tr></thead>
      <tbody>
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

  el.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th style="width:60px">Photo</th>
        <th>Nom</th>
        <th>Rôle / Fonction</th>
        <th>Ordre</th>
        <th>Actions</th>
      </tr></thead>
      <tbody>
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

  el.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th>Titre</th>
        <th>Date</th>
        <th>Description</th>
        <th>Actif</th>
        <th>Actions</th>
      </tr></thead>
      <tbody>
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
// PARAMÈTRES
// =========================================
async function loadParametres() {
  const { data } = await db.from('parametres').select('*').in('key', ['site_address', 'live_url']);
  data?.forEach(p => {
    const el = document.getElementById(`param-${p.key}`);
    if (el) el.value = p.value || '';
  });
}

async function saveParametres() {
  const keys = ['site_address', 'live_url'];
  const updates = keys.map(key => {
    const el = document.getElementById(`param-${key}`);
    return { key, value: el ? el.value : '', updated_at: new Date().toISOString() };
  });

  const { error } = await db.from('parametres').upsert(updates, { onConflict: 'key' });
  if (error) { toast('Erreur : ' + error.message, 'error'); return; }
  toast('✓ Paramètres enregistrés', 'success');
}

// =========================================
// MODAL
// =========================================
async function openModal(type, id = null) {
  modalType = type;
  editingId = id;

  let data = null;
  if (id) {
    const table = type === 'slide' ? 'slides' : type === 'actu' ? 'actualites' : type === 'bureau' ? 'bureau' : 'agenda';
    const { data: row } = await db.from(table).select('*').eq('id', id).single();
    data = row;
  }

  const overlay = document.getElementById('modalOverlay');
  document.getElementById('modalTitle').textContent = id ? `Modifier — ${type}` : `Ajouter — ${type}`;
  document.getElementById('modalBody').innerHTML = getModalForm(type, data);
  overlay.classList.add('open');

  // Setup file input handlers after DOM insertion
  setupModalUploads(type, data);
}

function getModalForm(type, data) {
  if (type === 'slide') return slideForm(data);
  if (type === 'actu')  return actuForm(data);
  if (type === 'bureau') return bureauForm(data);
  if (type === 'agenda') return agendaForm(data);
  return '';
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
      const folder = type === 'slide' ? 'slides' : type === 'actu' ? 'actualites' : type === 'bureau' ? 'bureau' : 'general';
      const ext = file.name.split('.').pop();
      const path = `${folder}/${Date.now()}.${ext}`;

      const { error: upErr } = await db.storage.from(BUCKET).upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(path);

      const urlField = document.getElementById(type === 'bureau' ? 'm_photo_url' : 'm_image_url');
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

function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = '.3s'; setTimeout(() => el.remove(), 300); }, 3000);
}
