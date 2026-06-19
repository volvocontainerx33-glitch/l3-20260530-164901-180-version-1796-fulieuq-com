(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.hero-dot'));
    const prev = slider.querySelector('[data-prev]');
    const next = slider.querySelector('[data-next]');
    let current = 0;

    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-scroll-row]').forEach(function (wrap) {
    const row = wrap.querySelector('.scroll-row');
    const left = wrap.querySelector('[data-scroll-left]');
    const right = wrap.querySelector('[data-scroll-right]');
    const move = function (dir) {
      if (row) {
        row.scrollBy({ left: dir * 420, behavior: 'smooth' });
      }
    };
    if (left) left.addEventListener('click', function () { move(-1); });
    if (right) right.addEventListener('click', function () { move(1); });
  });

  const searchInput = document.querySelector('[data-search-input]');
  const regionSelect = document.querySelector('[data-region-select]');
  const yearSelect = document.querySelector('[data-year-select]');
  const cards = Array.from(document.querySelectorAll('[data-title][data-meta]'));
  const count = document.querySelector('[data-result-count]');
  const empty = document.querySelector('[data-empty]');

  function filterCards() {
    if (!searchInput && !regionSelect && !yearSelect) return;
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const region = regionSelect ? regionSelect.value : '';
    const year = yearSelect ? yearSelect.value : '';
    let visible = 0;

    cards.forEach(function (card) {
      const meta = (card.getAttribute('data-meta') || '').toLowerCase();
      const okText = !q || meta.includes(q);
      const okRegion = !region || meta.includes(region.toLowerCase());
      const okYear = !year || meta.includes(year.toLowerCase());
      const show = okText && okRegion && okYear;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });

    if (count) count.textContent = String(visible);
    if (empty) empty.classList.toggle('show', visible === 0);
  }

  if (searchInput) searchInput.addEventListener('input', filterCards);
  if (regionSelect) regionSelect.addEventListener('change', filterCards);
  if (yearSelect) yearSelect.addEventListener('change', filterCards);
  filterCards();
})();
