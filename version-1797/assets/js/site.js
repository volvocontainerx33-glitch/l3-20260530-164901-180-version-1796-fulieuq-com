(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll('[data-search-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var url = './search.html';
        if (value) {
          url += '?q=' + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    if (!slides.length) {
      return;
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupLocalFilters() {
    var panels = document.querySelectorAll('[data-filter-panel]');
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-local-search]');
      var typeSelect = panel.querySelector('[data-type-filter]');
      var yearSelect = panel.querySelector('[data-year-filter]');
      var gridId = panel.getAttribute('data-filter-panel');
      var grid = document.querySelector('[data-card-grid="' + gridId + '"]');
      var empty = document.querySelector('[data-empty-state="' + gridId + '"]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

      function apply() {
        var q = normalize(input && input.value);
        var typeValue = normalize(typeSelect && typeSelect.value);
        var yearValue = normalize(yearSelect && yearSelect.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.textContent);
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matched = true;
          if (q && text.indexOf(q) === -1) {
            matched = false;
          }
          if (typeValue && cardType !== typeValue) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  function attachHls(video, stream) {
    if (video._hlsInstance) {
      video._hlsInstance.destroy();
      video._hlsInstance = null;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }
    video.src = stream;
  }

  function setupPlayers() {
    var players = document.querySelectorAll('[data-player]');
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      var stream = player.getAttribute('data-stream');
      if (!video || !stream) {
        return;
      }

      function start() {
        if (video.getAttribute('data-ready') !== 'true') {
          attachHls(video, stream);
          video.setAttribute('data-ready', 'true');
        }
        video.controls = true;
        if (overlay) {
          overlay.hidden = true;
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (overlay) {
              overlay.hidden = false;
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }
      player.addEventListener('click', function (event) {
        if (event.target === video && video.paused) {
          start();
        }
      });
      document.querySelectorAll('[data-start-player]').forEach(function (link) {
        link.addEventListener('click', function () {
          window.setTimeout(start, 150);
        });
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupSearchForms();
    setupHero();
    setupLocalFilters();
    setupPlayers();
  });
})();
