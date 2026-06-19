(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 1) {
    var index = 0;
    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var typeFilter = document.querySelector('[data-filter-type]');
  var yearFilter = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var applyFilter = function () {
    if (!cards.length) {
      return;
    }
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var type = typeFilter ? typeFilter.value : '';
    var year = yearFilter ? yearFilter.value : '';
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre')
      ].join(' ').toLowerCase();
      var matched = true;
      if (query && haystack.indexOf(query) === -1) {
        matched = false;
      }
      if (type && card.getAttribute('data-type') !== type) {
        matched = false;
      }
      if (year && card.getAttribute('data-year') !== year) {
        matched = false;
      }
      card.style.display = matched ? '' : 'none';
    });
  };
  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }
  if (typeFilter) {
    typeFilter.addEventListener('change', applyFilter);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilter);
  }
})();
