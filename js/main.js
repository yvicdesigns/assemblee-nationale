/* =========================================
   ASSEMBLÉE NATIONALE - JAVASCRIPT PRINCIPAL
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Date courante ----
  const dateEl = document.querySelector('.top-bar__date');
  if (dateEl) {
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('fr-FR', opts);
  }

  // ---- Menu hamburger ----
  const hamburger = document.querySelector('.hamburger');
  const mainNav   = document.querySelector('.main-nav');
  const overlay   = document.querySelector('.nav-overlay');

  function closeMenu() {
    hamburger?.classList.remove('active');
    mainNav?.classList.remove('open');
    overlay?.classList.remove('show');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    overlay?.classList.toggle('show', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  overlay?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // Menu mobile : dépliage sous-menus
  if (window.innerWidth <= 768) {
    document.querySelectorAll('.nav-item').forEach(item => {
      const link = item.querySelector('.nav-link');
      const dd   = item.querySelector('.dropdown');
      if (link && dd) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const isOpen = item.classList.toggle('open');
          document.querySelectorAll('.nav-item').forEach(other => {
            if (other !== item) other.classList.remove('open');
          });
        });
      }
    });
  }

  // ---- Carrousel Hero ----
  const slides    = document.querySelectorAll('.slide');
  const dots      = document.querySelectorAll('.slider-dot');
  const prevBtn   = document.querySelector('.slider-btn.prev');
  const nextBtn   = document.querySelector('.slider-btn.next');
  let current     = 0;
  let autoTimer   = null;

  function goTo(idx) {
    slides[current]?.classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current]?.classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  if (slides.length > 0) {
    goTo(0);
    startAuto();
    prevBtn?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    nextBtn?.addEventListener('click', () => { goTo(current + 1); startAuto(); });
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); startAuto(); });
    });
    // Swipe
    let touchStartX = 0;
    const slider = document.querySelector('.hero-slider');
    slider?.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    slider?.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 50) { dx < 0 ? goTo(current + 1) : goTo(current - 1); startAuto(); }
    });
  }

  // ---- Filtres actualités ----
  const filterBtns = document.querySelectorAll('.filter-btn');
  const newsCards  = document.querySelectorAll('.news-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      newsCards.forEach(card => {
        if (cat === 'tout' || card.dataset.cat === cat) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ---- Countdown ----
  function setupCountdown(containerId, targetDate) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const target = new Date(targetDate);
    const nums   = container.querySelectorAll('.countdown-num');

    function update() {
      const now  = new Date();
      const diff = target - now;

      if (diff <= 0) {
        nums.forEach(n => n.textContent = '00');
        return;
      }

      const d  = Math.floor(diff / 86400000);
      const h  = Math.floor((diff % 86400000) / 3600000);
      const m  = Math.floor((diff % 3600000)  / 60000);
      const s  = Math.floor((diff % 60000)    / 1000);

      const vals = [d, h, m, s];
      nums.forEach((n, i) => {
        n.textContent = String(vals[i]).padStart(2, '0');
      });
    }

    update();
    setInterval(update, 1000);
  }

  setupCountdown('countdown1', '2025-10-08T09:00:00');
  setupCountdown('countdown2', '2025-10-15T09:00:00');

  // ---- Scroll to top ----
  const scrollBtn = document.querySelector('.scroll-top');
  window.addEventListener('scroll', () => {
    scrollBtn?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  scrollBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ---- Formulaire de contact ----
  const form = document.querySelector('.contact-form form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    btn.textContent = 'Message envoyé ✓';
    btn.style.background = '#009A44';
    btn.disabled = true;
    setTimeout(() => {
      form.reset();
      btn.textContent = 'Envoyer le message';
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  });

  // ---- Sticky header shadow ----
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // ---- Animation on scroll ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.bureau-card, .commission-card, .news-card, .fonct-card').forEach(el => {
    el.style.animation = 'fadeInUp 0.5s ease both paused';
    observer.observe(el);
  });

});

// Inject CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
