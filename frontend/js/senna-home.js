(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Navbar ---------- */
  var header = document.getElementById('site-header');
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  function setMenu(open) {
    links.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
    var m = links.querySelector('.nav-cta-m');
    if (m) m.style.display = open ? 'inline-block' : 'none';
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () { setMenu(!links.classList.contains('is-open')); });
    links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 961px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Hero: progresso de scroll + parallax do mouse ---------- */
  var hero = document.getElementById('hero');
  var move = document.getElementById('sculpt-move');
  var ticking = false;
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    if (!hero) return;
    if (reduce) return;
    var p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.85)));
    hero.style.setProperty('--p', p.toFixed(3));
  }
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  if (hero && move && fine && !reduce) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty('--mx', (x * 12).toFixed(1) + 'px'); // máx. ±6px
      hero.style.setProperty('--my', (y * 8).toFixed(1) + 'px');  // máx. ±4px
    });
    hero.addEventListener('pointerleave', function () {
      hero.style.setProperty('--mx', '0px'); hero.style.setProperty('--my', '0px');
    });
  }

  /* ---------- Selected work (API existente) ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u) { return /^(https?:\/\/|\/|\.\/)/i.test(u || '') ? u : ''; }
  function pad(n) { return String(n).padStart(2, '0'); }

  function caseHtml(p, i) {
    var year = '';
    try { year = p.created_at ? new Date(p.created_at).getFullYear() : ''; } catch (_) {}
    var techs = (p.technologies || []).slice(0, 4).map(esc).join(' · ');
    var href = 'projetos/' + encodeURIComponent(p.slug);
    var img = safeUrl(p.cover_image);
    var media = img
      ? '<img src="' + esc(img) + '" alt="' + esc(p.title) + '" loading="lazy" decoding="async">'
      : '<span class="ph tiny">' + esc(p.category || 'Projeto') + '</span>';
    return '<article class="case">' +
      '<div class="case-info">' +
        '<p class="tiny">' + pad(i + 1) + (year ? ' / ' + year : '') + '</p>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p class="cats">' + esc(p.category || '') + (techs ? '<br>' + techs : '') + '</p>' +
        (p.summary ? '<p class="sum">' + esc(p.summary) + '</p>' : '') +
        '<a class="link-arrow" href="' + href + '" data-track="portfolio_view" data-track-label="' + esc(p.slug) + '">View case ↗</a>' +
      '</div>' +
      '<div class="case-media"><a href="' + href + '" tabindex="-1" aria-hidden="true">' + media + '</a></div>' +
    '</article>';
  }

  (async function loadWork() {
    var el = document.getElementById('work-list');
    if (!el || !window.AURELIA || !window.AURELIA.api) return;
    try {
      var res = await window.AURELIA.api.get('/projects?featured=true');
      var list = (res && res.data) || [];
      if (!list.length) { res = await window.AURELIA.api.get('/projects'); list = (res && res.data) || []; }
      list = list.slice(0, 5);
      el.innerHTML = list.length ? list.map(caseHtml).join('') : '<p class="work-empty">Nenhum projeto publicado no momento.</p>';
      el.querySelectorAll('[data-track]').forEach(function (a) {
        a.addEventListener('click', function () {
          if (window.AURELIA.analytics) window.AURELIA.analytics.track('portfolio_view', { label: a.getAttribute('data-track-label') });
        });
      });
    } catch (e) {
      el.innerHTML = '<p class="work-empty">Não foi possível carregar os projetos agora.</p>';
    }
  })();
})();
