/* =============================================
   RECHERCHE GLOBALE — Assemblée Nationale
   Recherche : noms, pages, commissions,
   articles, agenda, bureau, actualités
   ============================================= */
(function () {

  const SUPABASE_URL = 'https://djqrmcuagrfvahmcwbro.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXJtY3VhZ3JmdmFobWN3YnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjExMDEsImV4cCI6MjA5MzI5NzEwMX0.S8xpx9xLGIilit5OME-GsxM59X7ezIyplFKFDZBWmjE';

  const STATIC_INDEX = [
    // Pages principales
    { type: 'page', icon: '🏛️', name: 'Présidence',                sub: 'Isidore MVOUBA, Président de l\'Assemblée',           url: 'pages/presidence.html' },
    { type: 'page', icon: '👥', name: 'Bureau de l\'Assemblée',     sub: 'Vice-Présidents, Secrétaires, Questeurs',              url: 'pages/bureau.html' },
    { type: 'page', icon: '👤', name: 'Les 151 Députés',            sub: 'Annuaire, recherche par nom, département, groupe',     url: 'pages/deputes.html' },
    { type: 'page', icon: '🗺️', name: 'Carte des départements',     sub: 'Carte interactive des 12 départements',                url: 'pages/carte.html' },
    { type: 'page', icon: '📰', name: 'Actualités & Blog',          sub: 'Publications, communiqués, séances plénières',         url: 'pages/blog.html' },
    { type: 'page', icon: '📜', name: 'Histoire',                   sub: 'Histoire du parlement congolais',                     url: 'pages/histoire.html' },
    { type: 'page', icon: '🎯', name: 'Rôle & Missions',            sub: 'Fonctions constitutionnelles, législation, contrôle',  url: 'pages/role.html' },
    { type: 'page', icon: '🔴', name: 'Direct / Live',              sub: 'Diffusion en direct des séances plénières',            url: 'pages/direct.html' },
    { type: 'page', icon: '✉️', name: 'Contact',                    sub: 'Formulaire, adresse, téléphone',                       url: 'pages/contact.html' },
    { type: 'page', icon: '🏛️', name: 'Commissions',               sub: 'Les 8 commissions permanentes',                        url: 'pages/commissions.html' },
    // Commissions
    { type: 'commission', icon: '💰', name: 'Commission Économie & Finances',        sub: 'Budget, fiscalité, économie nationale',         url: 'pages/commission-ecofin.html' },
    { type: 'commission', icon: '⚖️', name: 'Commission Juridique',                 sub: 'Lois, Constitution, droits',                    url: 'pages/commission-juridique.html' },
    { type: 'commission', icon: '🌍', name: 'Commission Affaires Étrangères',        sub: 'Diplomatie, coopération internationale',         url: 'pages/commission-affaires-etrangeres.html' },
    { type: 'commission', icon: '🛡️', name: 'Commission Défense & Sécurité',        sub: 'Armée, sécurité nationale, ordre public',        url: 'pages/commission-defense.html' },
    { type: 'commission', icon: '🎓', name: 'Commission Éducation & Culture',        sub: 'Enseignement, sciences, culture, technologie',   url: 'pages/commission-education.html' },
    { type: 'commission', icon: '🏥', name: 'Commission Santé & Affaires Sociales',  sub: 'Santé publique, famille, genre, travail',        url: 'pages/commission-sante.html' },
    { type: 'commission', icon: '🏗️', name: 'Commission Plan & Infrastructures',    sub: 'Développement local, travaux publics',           url: 'pages/commission-plan.html' },
    { type: 'commission', icon: '🌿', name: 'Commission Environnement',              sub: 'Développement durable, ressources naturelles',   url: 'pages/commission-environnement.html' },
    // Départements (mots-clés carte)
    { type: 'page', icon: '🗺️', name: 'Département Sangha',        sub: 'Carte — chef-lieu Ouésso',         url: 'pages/carte.html' },
    { type: 'page', icon: '🗺️', name: 'Département Likouala',      sub: 'Carte — chef-lieu Impfondo',       url: 'pages/carte.html' },
    { type: 'page', icon: '🗺️', name: 'Département Cuvette',       sub: 'Carte — chef-lieu Owando',         url: 'pages/carte.html' },
    { type: 'page', icon: '🗺️', name: 'Département Cuvette-Ouest', sub: 'Carte — chef-lieu Ewo',            url: 'pages/carte.html' },
    { type: 'page', icon: '🗺️', name: 'Département Plateaux',      sub: 'Carte — chef-lieu Djambala',       url: 'pages/carte.html' },
    { type: 'page', icon: '🗺️', name: 'Département Lékoumou',      sub: 'Carte — chef-lieu Sibiti',         url: 'pages/carte.html' },
    { type: 'page', icon: '🗺️', name: 'Département Bouenza',       sub: 'Carte — chef-lieu Madingou',       url: 'pages/carte.html' },
    { type: 'page', icon: '🗺️', name: 'Département Niari',         sub: 'Carte — chef-lieu Dolisie',        url: 'pages/carte.html' },
    { type: 'page', icon: '🗺️', name: 'Département Pool',          sub: 'Carte — chef-lieu Kinkala',        url: 'pages/carte.html' },
    { type: 'page', icon: '🗺️', name: 'Département Kouilou',       sub: 'Carte — chef-lieu Loango',         url: 'pages/carte.html' },
    { type: 'page', icon: '🗺️', name: 'Pointe-Noire',              sub: 'Carte — ville-département côtier', url: 'pages/carte.html' },
    { type: 'page', icon: '🗺️', name: 'Brazzaville',               sub: 'Carte — capitale, ville-département', url: 'pages/carte.html' },
  ];

  const LABELS = { page: 'Page', commission: 'Commission', depute: 'Député', article: 'Article', bureau: 'Bureau', agenda: 'Agenda', actualite: 'Actualité' };

  let overlay, input, results, clearBtn;
  let debounceTimer = null;
  let activeIndex = -1;

  function init() {
    overlay  = document.getElementById('gsOverlay');
    input    = document.getElementById('gsInput');
    results  = document.getElementById('gsResults');
    clearBtn = document.getElementById('gsClear');

    if (!overlay) return;

    document.getElementById('searchToggle')?.addEventListener('click', open);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    clearBtn?.addEventListener('click', () => {
      input.value = '';
      clearBtn.classList.remove('show');
      results.innerHTML = '<div class="gs-hint">Tapez pour rechercher dans tout le site</div>';
      input.focus();
    });

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
      results.innerHTML = '<div class="gs-hint gs-loading">Recherche en cours…</div>';
      debounceTimer = setTimeout(() => search(q), 200);
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
    results.querySelectorAll('.gs-item')[activeIndex]?.click();
  }

  async function search(q) {
    const ql = q.toLowerCase();
    const groups = {};

    // Index statique (pages, commissions, départements)
    const staticHits = STATIC_INDEX.filter(item =>
      item.name.toLowerCase().includes(ql) || item.sub.toLowerCase().includes(ql)
    );
    staticHits.forEach(item => {
      groups[item.type] = groups[item.type] || [];
      groups[item.type].push(item);
    });

    // Supabase
    try {
      const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

      const [
        depNomRes, depDeptRes, depCircRes, depGroupeRes,
        artRes, bureauRes, agendaRes, actRes
      ] = await Promise.all([

        // Députés — par nom (sans filtre active pour tout trouver)
        db.from('deputes')
          .select('name, constituency, department, groupe, photo_url')
          .ilike('name', `%${q}%`)
          .limit(10),

        // Députés — par département
        db.from('deputes')
          .select('name, constituency, department, groupe, photo_url')
          .ilike('department', `%${q}%`)
          .limit(6),

        // Députés — par circonscription
        db.from('deputes')
          .select('name, constituency, department, groupe, photo_url')
          .ilike('constituency', `%${q}%`)
          .limit(6),

        // Députés — par groupe politique
        db.from('deputes')
          .select('name, constituency, department, groupe, photo_url')
          .ilike('groupe', `%${q}%`)
          .limit(6),

        // Articles
        db.from('articles')
          .select('title, excerpt, category, slug')
          .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,category.ilike.%${q}%,content.ilike.%${q}%`)
          .eq('status', 'published')
          .limit(5),

        // Bureau
        db.from('bureau')
          .select('name, role_title, biography')
          .or(`name.ilike.%${q}%,role_title.ilike.%${q}%,biography.ilike.%${q}%`)
          .limit(5),

        // Agenda
        db.from('agenda')
          .select('title, event_date, description, location')
          .or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`)
          .limit(4),

        // Actualités
        db.from('actualites')
          .select('title, excerpt, category')
          .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,category.ilike.%${q}%`)
          .limit(4),
      ]);

      // Fusion et dédoublonnage des députés
      const deputeMap = new Map();
      [...(depNomRes.data||[]), ...(depDeptRes.data||[]), ...(depCircRes.data||[]), ...(depGroupeRes.data||[])]
        .forEach(d => { if (d.name && !deputeMap.has(d.name)) deputeMap.set(d.name, d); });

      if (deputeMap.size) {
        groups['depute'] = [...deputeMap.values()].slice(0, 12).map(d => ({
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
          url: `pages/blog.html${a.slug ? '#' + a.slug : ''}`
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
          sub: a.event_date
            ? new Date(a.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
              + (a.location ? ' · ' + a.location : '')
            : (a.location || ''),
          url: 'index.html#agenda'
        }));
      }

      if (actRes.data?.length) {
        groups['actualite'] = actRes.data.map(a => ({
          type: 'actualite', icon: '📢',
          name: a.title,
          sub: a.excerpt?.slice(0, 80) || a.category || '',
          url: 'pages/blog.html'
        }));
      }

    } catch (_) {}

    renderResults(groups, q);
  }

  function renderResults(groups, q) {
    const order = ['depute', 'bureau', 'article', 'actualite', 'agenda', 'commission', 'page'];
    let html = '';

    order.forEach(type => {
      const items = groups[type];
      if (!items?.length) return;
      html += `<div class="gs-section">
        <div class="gs-section-title">${LABELS[type]}s</div>`;
      items.forEach(item => {
        const name = highlight(item.name, q);
        const sub  = item.sub ? highlight(item.sub, q) : '';
        html += `<a class="gs-item" href="${item.url}">
          <span class="gs-item-icon">${item.icon}</span>
          <div class="gs-item-body">
            <div class="gs-item-name">${name}</div>
            ${sub ? `<div class="gs-item-sub">${sub}</div>` : ''}
          </div>
          ${item.badge ? `<span class="gs-item-badge">${item.badge}</span>` : ''}
        </a>`;
      });
      html += `</div>`;
    });

    results.innerHTML = html || `<div class="gs-empty">Aucun résultat pour « <strong>${q}</strong> »</div>`;
  }

  function highlight(text, q) {
    if (!text || !q) return text || '';
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark style="background:#bbf7d0;border-radius:2px;padding:0 1px">$1</mark>');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
