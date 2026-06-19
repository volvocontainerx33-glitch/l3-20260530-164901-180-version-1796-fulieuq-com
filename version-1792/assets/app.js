
(function () {
  const state = {
    heroIndex: 0,
    heroTimer: null
  };

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function debounce(fn, wait = 120) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function initHeroCarousel() {
    const stage = qs('[data-hero-stage]');
    const titleEl = qs('[data-hero-title]');
    const descEl = qs('[data-hero-desc]');
    const metaEl = qs('[data-hero-meta]');
    const ctaEl = qs('[data-hero-cta]');
    const indicators = qsa('[data-hero-indicator]');
    const slides = qsa('[data-hero-slide]');
    if (!stage || !slides.length) return;

    const movies = slides.map(slide => ({
      title: slide.dataset.title,
      desc: slide.dataset.desc,
      meta: slide.dataset.meta,
      href: slide.dataset.href,
    }));

    function activate(index) {
      state.heroIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === state.heroIndex));
      indicators.forEach((dot, i) => dot.classList.toggle('active', i === state.heroIndex));
      if (titleEl) titleEl.innerHTML = movies[state.heroIndex].title;
      if (descEl) descEl.textContent = movies[state.heroIndex].desc;
      if (metaEl) metaEl.textContent = movies[state.heroIndex].meta;
      if (ctaEl) ctaEl.href = movies[state.heroIndex].href;
    }

    indicators.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        activate(idx);
        restart();
      });
    });

    function restart() {
      if (state.heroTimer) clearInterval(state.heroTimer);
      state.heroTimer = setInterval(() => activate(state.heroIndex + 1), 4500);
    }

    activate(0);
    restart();
  }

  function initFilters() {
    const search = qs('[data-card-search]');
    const category = qs('[data-card-category]');
    const year = qs('[data-card-year]');
    const cards = qsa('[data-filter-card]');

    if (!search && !category && !year) return;

    const apply = () => {
      const q = (search?.value || '').trim().toLowerCase();
      const cat = (category?.value || '').trim();
      const y = (year?.value || '').trim();

      let visible = 0;
      cards.forEach(card => {
        const title = (card.dataset.title || '').toLowerCase();
        const tags = (card.dataset.tags || '').toLowerCase();
        const bucket = card.dataset.category || '';
        const movieYear = card.dataset.year || '';

        const okQ = !q || title.includes(q) || tags.includes(q);
        const okC = !cat || bucket === cat;
        const okY = !y || movieYear === y;
        const show = okQ && okC && okY;
        card.classList.toggle('hidden', !show);
        if (show) visible += 1;
      });

      const counter = qs('[data-filter-count]');
      if (counter) counter.textContent = String(visible);
      const empty = qs('[data-filter-empty]');
      if (empty) empty.classList.toggle('hidden', visible !== 0);
    };

    [search, category, year].forEach(el => {
      if (!el) return;
      el.addEventListener('input', debounce(apply));
      el.addEventListener('change', apply);
    });

    apply();
  }

  async function loadMoviesData() {
    if (!window.__MOVIE_DATA__) {
      const url = window.__MOVIE_DATA_URL__ || '/data/movies.json';
      const response = await fetch(url, { cache: 'force-cache' });
      window.__MOVIE_DATA__ = await response.json();
    }
    return window.__MOVIE_DATA__;
  }

  async function initSearchPage() {
    const root = qs('[data-search-page]');
    if (!root) return;

    const input = qs('[data-search-input]', root);
    const results = qs('[data-search-results]', root);
    const counter = qs('[data-search-count]', root);
    const empty = qs('[data-search-empty]', root);
    const q = new URLSearchParams(location.search).get('q') || '';
    if (input) input.value = q;

    const movies = await loadMoviesData();

    function render(list) {
      if (counter) counter.textContent = String(list.length);
      if (!list.length) {
        results.innerHTML = '';
        empty.classList.remove('hidden');
        return;
      }
      empty.classList.add('hidden');
      results.innerHTML = list.map(movie => `
        <a class="card" href="${movie.path}" data-filter-card data-title="${escapeAttr(movie.title)}" data-tags="${escapeAttr((movie.tags || []).join(' '))}" data-category="${escapeAttr(movie.bucket_key)}" data-year="${movie.year}">
          <div class="poster">
            <img src="${movie.cover.replace(/^\//, '')}" alt="${escapeAttr(movie.title)}">
            <div class="shade"></div>
            <div class="badge-top">${movie.year}</div>
            <div class="badge-top right">${escapeAttr(movie.bucket_name)}</div>
          </div>
          <div class="card-body">
            <h3>${escapeHtml(movie.title)}</h3>
            <p>${escapeHtml(movie.one_line)}</p>
            <div class="meta-line"><span>${escapeHtml(movie.region)}</span><span>${escapeHtml(movie.type)}</span></div>
            <div class="meta-tags">
              ${(movie.tags || []).slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
          </div>
        </a>
      `).join('');
    }

    function searchNow() {
      const term = (input?.value || '').trim().toLowerCase();
      const list = !term
        ? movies.slice(0, 120)
        : movies.filter(movie => {
            const hay = [
              movie.title, movie.one_line, movie.summary, movie.review,
              movie.region, movie.type, movie.genre, ...(movie.tags || [])
            ].join(' ').toLowerCase();
            return hay.includes(term);
          });
      render(list.slice(0, 300));
    }

    if (input) {
      input.addEventListener('input', debounce(searchNow, 80));
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          searchNow();
        }
      });
    }

    searchNow();
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replaceAll("'", '&#39;');
  }

  async function initPlayer() {
    const video = qs('[data-player]');
    if (!video) return;

    const hlsSrc = video.dataset.hls;
    const poster = video.dataset.poster;
    if (poster) video.setAttribute('poster', poster);

    function attachHls() {
      if (!hlsSrc) return false;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSrc;
        return true;
      }
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(hlsSrc);
        hls.attachMedia(video);
        video._hls = hls;
        return true;
      }
      return false;
    }

    if (!attachHls()) {
      // keep any mp4 source already present in the markup
      if (!video.src && video.dataset.mp4) {
        video.src = video.dataset.mp4;
      }
    }
  }

  function initBackToTop() {
    const btn = qs('[data-back-top]');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('hidden', window.scrollY < 500);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function init() {
    initHeroCarousel();
    initFilters();
    initSearchPage();
    initPlayer();
    initBackToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
