(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMobileNav() {
    var toggle = document.querySelector(".mobile-toggle");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-go-slide]"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-go-slide")) || 0);
        restart();
      });
    });
    restart();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var root = panel.parentElement || document;
      var inputs = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
      var rows = Array.prototype.slice.call(root.querySelectorAll(".ranking-row"));
      var items = cards.concat(rows);
      var counter = panel.querySelector("[data-result-count]");
      var noResult = root.querySelector(".no-result");

      function value(name) {
        var input = panel.querySelector('[data-filter="' + name + '"]');
        return input ? input.value.trim().toLowerCase() : "";
      }

      function apply() {
        var keyword = value("keyword");
        var year = value("year");
        var type = value("type");
        var region = value("region");
        var visible = 0;
        items.forEach(function (item) {
          var haystack = [
            item.getAttribute("data-title") || "",
            item.getAttribute("data-region") || "",
            item.getAttribute("data-type") || "",
            item.getAttribute("data-genre") || "",
            item.getAttribute("data-tags") || ""
          ].join(" ").toLowerCase();
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (year && (item.getAttribute("data-year") || "") !== year) {
            ok = false;
          }
          if (type && (item.getAttribute("data-type") || "").toLowerCase() !== type) {
            ok = false;
          }
          if (region && (item.getAttribute("data-region") || "").toLowerCase() !== region) {
            ok = false;
          }
          item.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (counter) {
          counter.textContent = String(visible);
        }
        if (noResult) {
          noResult.classList.toggle("is-visible", visible === 0);
        }
      }

      inputs.forEach(function (input) {
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      });
      apply();
    });
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(source) {
  var player = document.querySelector(".detail-player");
  if (!player) {
    return;
  }
  var video = player.querySelector("video");
  var layer = player.querySelector(".play-layer");
  var loaded = false;
  var hls = null;

  function loadSource() {
    if (loaded || !video || !source) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playNow() {
    loadSource();
    if (layer) {
      layer.classList.add("is-hidden");
    }
    if (video) {
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
  }

  if (layer) {
    layer.addEventListener("click", playNow);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (!loaded) {
        playNow();
      }
    });
  }
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
