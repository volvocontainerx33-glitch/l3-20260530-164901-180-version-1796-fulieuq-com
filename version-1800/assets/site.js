(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var menu = document.querySelector('#mobile-menu');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupImageFallbacks() {
    var images = document.querySelectorAll('.poster-img, .hero-slide__image, .detail-hero__bg, .category-card__thumbs img');
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
        image.classList.add('image-failed');
        var frame = image.closest('.poster-frame');
        if (frame) {
          frame.classList.add('image-failed');
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        schedule();
      });
    });

    show(0);
    schedule();
  }

  function setupFilters() {
    var panels = document.querySelectorAll('[data-filter-panel]');
    panels.forEach(function (panel) {
      var section = panel.closest('.section-block');
      var cards = section ? Array.prototype.slice.call(section.querySelectorAll('.movie-card')) : [];
      var keyword = panel.querySelector('[data-filter-keyword]');
      var year = panel.querySelector('[data-filter-year]');
      var type = panel.querySelector('[data-filter-type]');
      var reset = panel.querySelector('[data-filter-reset]');
      var count = section ? section.querySelector('[data-filter-count]') : null;

      function apply() {
        var keywordValue = (keyword && keyword.value ? keyword.value : '').trim().toLowerCase();
        var yearValue = year && year.value ? year.value : '';
        var typeValue = type && type.value ? type.value : '';
        var visibleCount = 0;

        cards.forEach(function (card) {
          var matchesKeyword = !keywordValue || (card.dataset.search || '').indexOf(keywordValue) !== -1;
          var matchesYear = !yearValue || card.dataset.year === yearValue;
          var matchesType = !typeValue || card.dataset.type === typeValue;
          var visible = matchesKeyword && matchesYear && matchesType;
          card.hidden = !visible;
          if (visible) {
            visibleCount += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visibleCount + ' 部影片';
        }
      }

      [keyword, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (keyword) {
            keyword.value = '';
          }
          if (year) {
            year.value = '';
          }
          if (type) {
            type.value = '';
          }
          apply();
        });
      }
    });
  }

  function getSearchParam() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-card__poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <span class="poster-frame" data-title="' + escapeHtml(movie.title) + '">',
      '      <img class="poster-img" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="poster-shine"></span>',
      '    </span>',
      '  </a>',
      '  <div class="movie-card__body">',
      '    <div class="movie-card__meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <h3 class="movie-card__title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="movie-card__line">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var desc = document.querySelector('[data-search-desc]');
    var input = document.querySelector('[data-search-page-input]');
    var index = window.MOVIE_SEARCH_INDEX;

    if (!results || !Array.isArray(index)) {
      return;
    }

    var query = getSearchParam();
    if (input) {
      input.value = query;
    }

    if (!query) {
      setupImageFallbacks();
      return;
    }

    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = index.filter(function (movie) {
      var searchText = movie.searchText || '';
      return words.every(function (word) {
        return searchText.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    if (title) {
      title.textContent = '“' + query + '” 的搜索结果';
    }

    if (desc) {
      desc.textContent = '共匹配 ' + matches.length + ' 部影片，最多展示前 120 条。';
    }

    if (matches.length) {
      results.innerHTML = matches.map(createSearchCard).join('\n');
    } else {
      results.innerHTML = '<p class="filter-count">没有找到匹配影片，请尝试更短的关键词、地区、年份或题材。</p>';
    }

    setupImageFallbacks();
  }

  ready(function () {
    setupMobileMenu();
    setupImageFallbacks();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
