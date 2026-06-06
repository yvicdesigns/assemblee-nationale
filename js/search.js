/* =========================================
   RECHERCHE GLOBALE — Assemblée Nationale
   ========================================= */
(function () {

  const SUPABASE_URL = 'https://djqrmcuagrfvahmcwbro.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXJtY3VhZ3JmdmFobWN3YnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjExMDEsImV4cCI6MjA5MzI5NzEwMX0.S8xpx9xLGIilit5OME-GsxM59X7ezIyplFKFDZBWmjE';

  // Données statiques indexées
  const STATIC_INDEX = [
    { type: 'page', icon: '🏛️', name: 'Présidence',              sub: 'L\'Honorable Isidore MVOUBA',       url: 'pages/presidence.html' },
    { type: 'page', icon: '👥', name: 'Bureau de l\'Assemblée',   sub: 'Vice-Présidents, Secrétaires…',    url: 'pages/bureau.html' },
    { type: 'page', icon: '👤', name: 'Les 151 Députés',          sub: 'Liste et recherche par département',url: 'pages/deputes.html' },
    { type: 'page', icon: '📰', name: 'Actualités & Blog',        sub: 'Publications parlementaires',       url: 'pages/blog.html' },
    { type: 'page', icon: '📜', name: 'Histoire',                 sub: 'Histoire du parlement congolais',   url: 'pages/histoire.html' },
    { type: 'page', icon: '🎯', name: 'Rôle & Missions',          sub: 'Fonctions constitutionnelles',      url: 'pages/role.html' },
    { type: 'page', icon: '✉️', name: 'Contact',                  sub: 'Formulaire et coordonnées',         url: 'pages/contact.html' },
    { type: 'commission', icon: '💰', name: 'Commission Économie & Finances',       sub: 'Eco-Fin, Budget', url: 'pages/commission-ecofin.html' },
    { type: 'commission', icon: '⚖️', name: 'Commission Juridique',                sub: 'Lois, Constitution', url: 'pages/commission-juridique.html' },
    { type: 'commission', icon: '🌍', name: 'Commission Affaires Étrangères',       sub: 'Coopération internationale', url: 'pages/commission-affaires-etrangeres.html' },
    { type: 'commission', icon: '🛡️', name: 'Commission Défense & Sécurité',       sub: 'Sécurité nationale', url: 'pages/commission-defense.html' },
    { type: 'commission', icon: '🎓', name: 'Commission Éducation & Culture',       sub: 'Sciences, Technologie', url: 'pages/commission-education.html' },
    { type: 'commission', icon: '🏥', name: 'Commission Santé & Affaires Sociales', sub: 'Genre, Famille', url: 'pages/commission-sante.html' },
    { type: 'commission', icon: '🏗️', name: 'Commission Plan & Infrastructures',   sub: 'Développement local', url: 'pages/commission-plan.html' },
    { type: 'commission', icon: '🌿', name: 'Commission Environnement',             sub: 'Développement durable', url: 'pages/commission-environnement.html' },
  ];

  const LABELS = { page: 'Page', commission: 'Commission', depute: 'Député', article: 'Article', bureau: 'Bureau', agenda: 'Agenda' };

  let overlay, input, results, clearBtn;
  let debounceTimer = null;
  let activeIndex = -1;
  let currentItems = [];

  function init() {
    overlay  = document.getElementById('gsOverlay');
    input    = document.getElementById('gsInput');
    results  = document.getElementById('gsResults');
    clearBtn = document.getElementById('gsClear');

    if (!overlay) return;

    // Toggle
    document.getElementById('searchToggle')?.addEventListener('click', open);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    clearBtn?.addEventListener('click', () => { input.value = ''; clearBtn.classList.remove('show'); results.innerHTML = '<div class="gs-hint">Tapez pour rechercher dans tout le site</div>'; input.focus(); });

    // Keyboard
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); open(); }
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
      if (overlay.classList.contains('open')) {
        if (e.key === 'ArrowDown') { e.preventDefault(); navigate(1); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); navigate(-1); }
        if (e.key === 'Enter')     { e.preventDefault(); selectActive(); }
      }
    });

    input?.addEventListener('input', () => {
      const q = input.value.trim();
      clearBtn?.classList.toggle('show', q.length > 0);
      activeIndex = -1;
      clearTimeout(debounceTimer);
      if (q.length < 2) {
        results.innerHTML = '<div class="gs-hint">Tapez au moins 2 caractères…</div>';
        return;
      }
      results.innerHTML = '<div class="gs-hint">Recherche en cours…</div>';
      debounceTimer = setTimeout(() => search(q), 220);
    });
  }

  function open() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input?.focus(), 80);
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    const items = results.querySelectorAll('.gs-item');
    if (!items.length) return;
    items[activeIndex]?.classList.remove('active');
    activeIndex = Math.max(0, Math.min(items.length - 1, activeIndex + dir));
    items[activeIndex]?.classList.add('active');
    items[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }

  function selectActive() {
    const items = results.querySelectorAll('.gs-item');
    if (activeIndex >= 0 && items[activeIndex]) items[activeIndex].click();
  }

  async function search(q) {
    const ql = q.toLowerCase();
    const groups = {};

    // Static index
    const staticHits = STATIC_INDEX.filter(item =>
      item.name.toLowerCase().includes(ql) || item.sub.toLowerCase().includes(ql)
    );
    staticHits.forEach(item => {
      groups[item.type] = groups[item.type] || [];
      groups[item.type].push(item);
    });

    // Supabase: députés
    try {
      const { createClient } = supabase;
      const db = createClient(SUPABASE_URL, SUPABASE_KEY);

      const [depRes, depDeptRes, depCircRes, depGroupRes, artRes, bureauRes, agendaRes] = await Promise.all([
        // Députés — par nom
        db.from('deputes').select('name, constituency, department, groupe').ilike('name', `%${q}%`).eq('active', true).limit(8),
        // Députés — par département
        db.from('deputes').select('name, constituency, department, groupe').ilike('department', `%${q}%`).eq('active', true).limit(4),
        // Députés — par circonscription
        db.from('deputes').select('name, constituency, department, groupe').ilike('constituency', `%${q}%`).eq('active', true).limit(4),
        // Députés — par groupe politique
        db.from('deputes').select('name, constituency, department, groupe').ilike('groupe', `%${q}%`).eq('active', true).limit(4),
        // Articles
        db.from('articles').select('title, excerpt, category').or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,category.ilike.%${q}%`).eq('status', 'published').limit(5),
        // Bureau
        db.from('bureau').select('name, role_title, biography').or(`name.ilike.%${q}%,role_title.ilike.%${q}%`).eq('active', true).limit(4),
        // Agenda
        db.from('agenda').select('title, event_date, description').ilike('title', `%${q}%`).limit(4),
      ]);

      // Fusion et dédoublonnage des députés
      const deputeMap = new Map();
      [...(depRes.data||[]), ...(depDeptRes.data||[]), ...(depCircRes.data||[]), ...(depGroupRes.data||[])].forEach(d => {
        if (!deputeMap.has(d.name)) deputeMap.set(d.name, d);
      });
      if (deputeMap.size) {
        groups['depute'] = [...deputeMap.values()].slice(0, 10).map(d => ({
          type: 'depute', icon: '👤',
          name: d.name,
          sub: [d.constituency, d.department].filter(Boolean).join(' — '),
          badge: d.groupe,
          url: 'pages/deputes.html'
        }));
      }

      if (artRes.data?.length) {
        groups['article'] = artRes.data.map(a => ({
          type: 'article', icon: '📰',
          name: a.title,
          sub: a.excerpt?.slice(0, 80) || a.category || '',
          url: 'pages/blog.html'
        }));
      }

      if (bureauRes.data?.length) {
        groups['bureau'] = bureauRes.data.map(b => ({
          type: 'bureau', icon: '🏛️',
          name: b.name,
          sub: b.role_title || '',
          url: 'pages/bureau.html'
        }));
      }

      if (agendaRes.data?.length) {
        groups['agenda'] = agendaRes.data.map(a => ({
          type: 'agenda', icon: '📅',
          name: a.title,
          sub: a.event_date ? new Date(a.event_date).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'}) : '',
          url: 'index.html#agenda'
        }));
      }
    } catch (_) {}

    renderResults(groups, q);
  }

  function renderResults(groups, q) {
    currentItems = [];
    const order = ['depute', 'bureau', 'article', 'agenda', 'commission', 'page'];
    let html = '';

    order.forEach(type => {
      const items = groups[type];
      if (!items?.length) return;
      html += `<div class="gs-section">
        <div class="gs-section-title">${LABELS[type]}s</div>`;
      items.forEach(item => {
        currentItems.push(item);
        const name = highlight(item.name, q);
        html += `<a class="gs-item" href="${item.url}">
          <span class="gs-item-icon">${item.icon}</span>
          <div class="gs-item-body">
            <div class="gs-item-name">${name}</div>
            ${item.sub ? `<div class="gs-item-sub">${item.sub}</div>` : ''}
          </div>
          ${item.badge ? `<span class="gs-item-badge">${item.badge}</span>` : ''}
        </a>`;
      });
      html += `</div>`;
    });

    results.innerHTML = html || `<div class="gs-empty">Aucun résultat pour "<strong>${q}</strong>"</div>`;
  }

  function highlight(text, q) {
    if (!q) return text;
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark style="background:#bbf7d0;border-radius:2px;padding:0 1px">$1</mark>');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
