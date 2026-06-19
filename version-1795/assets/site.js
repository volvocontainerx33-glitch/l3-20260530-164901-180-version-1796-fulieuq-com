(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mainNav = document.querySelector('[data-main-nav]');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        setSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      setSlide(current + 1);
    }, 5000);
  }

  var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

  scopes.forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var list = document.querySelector('[data-filter-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.children);

    function filterCards() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        var typeText = card.getAttribute('data-type') || '';
        var queryMatch = !query || text.indexOf(query) !== -1;
        var typeMatch = !typeValue || typeText.indexOf(typeValue) !== -1;
        card.hidden = !(queryMatch && typeMatch);
      });
    }

    if (input) {
      input.addEventListener('input', filterCards);

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', filterCards);
    }

    filterCards();
  });

  var video = document.getElementById('video-player');
  var playButton = document.querySelector('[data-play-button]');
  var videoReady = false;

  function startVideo() {
    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-play');

    if (!stream) {
      return;
    }

    if (!videoReady) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
      videoReady = true;
    }

    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }

    if (playButton) {
      playButton.classList.add('is-hidden');
    }
  }

  if (playButton) {
    playButton.addEventListener('click', startVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!videoReady || video.paused) {
        startVideo();
      }
    });
  }
})();
