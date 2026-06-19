(function () {
  const qs = new URLSearchParams(window.location.search);

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function fallbackImages() {
    document.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        img.classList.add("image-missing");
      }, { once: true });
    });
  }

  function setupMobileMenu() {
    const button = document.querySelector(".menu-toggle");
    const panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", () => {
      const open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("form[data-search-base]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = form.querySelector('input[name="q"]');
        const base = form.getAttribute("data-search-base") || "./search.html";
        const query = input ? input.value.trim() : "";
        window.location.href = query ? `${base}?q=${encodeURIComponent(query)}` : base;
      });
    });
  }

  function setupHero() {
    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    let active = 0;
    const show = (next) => {
      active = (next + slides.length) % slides.length;
      slides.forEach((slide, index) => slide.classList.toggle("is-active", index === active));
      dots.forEach((dot, index) => dot.classList.toggle("is-active", index === active));
    };
    dots.forEach((dot, index) => dot.addEventListener("click", () => show(index)));
    window.setInterval(() => show(active + 1), 5200);
  }

  function setupLocalFilter() {
    document.querySelectorAll("[data-local-filter]").forEach((input) => {
      const section = input.closest("section") || document;
      const cards = Array.from(section.querySelectorAll("[data-card]"));
      input.addEventListener("input", () => {
        const keyword = normalize(input.value);
        cards.forEach((card) => {
          const haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year")
          ].join(" "));
          card.classList.toggle("is-hidden", keyword && !haystack.includes(keyword));
        });
      });
    });
  }

  function movieCard(movie) {
    const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    return `
      <article class="movie-card" data-card>
        <a href="${escapeHtml(movie.url)}">
          <div class="poster-frame">
            <img src="./${escapeHtml(movie.cover)}.jpg" alt="${escapeHtml(movie.title)}" loading="lazy">
            <span class="poster-badge">${escapeHtml(movie.year)}</span>
          </div>
          <div class="card-content">
            <h3>${escapeHtml(movie.title)}</h3>
            <p>${escapeHtml(movie.oneLine)}</p>
            <div class="card-meta">
              <span>${escapeHtml(movie.region)}</span>
              <span>${escapeHtml(movie.type)}</span>
            </div>
            <div class="tag-row">${tags}</div>
          </div>
        </a>
      </article>
    `;
  }

  function setupSearchPage() {
    const data = window.MOVIE_SEARCH_DATA || [];
    const input = document.querySelector("[data-search-input]");
    const region = document.querySelector("[data-search-region]");
    const type = document.querySelector("[data-search-type]");
    const year = document.querySelector("[data-search-year]");
    const results = document.querySelector("[data-search-results]");
    const status = document.querySelector("[data-search-status]");
    if (!input || !results) {
      return;
    }
    const initialQuery = qs.get("q") || "";
    input.value = initialQuery;
    const render = () => {
      const keyword = normalize(input.value);
      const selectedRegion = region ? region.value : "";
      const selectedType = type ? type.value : "";
      const selectedYear = year ? year.value : "";
      const filtered = data.filter((movie) => {
        const haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" "));
        const keywordMatch = !keyword || haystack.includes(keyword);
        const regionMatch = !selectedRegion || movie.region === selectedRegion;
        const typeMatch = !selectedType || movie.type === selectedType;
        const yearMatch = !selectedYear || movie.year === selectedYear;
        return keywordMatch && regionMatch && typeMatch && yearMatch;
      }).slice(0, 96);
      results.innerHTML = filtered.map(movieCard).join("");
      status.textContent = filtered.length ? "搜索结果已更新" : "未找到相关影片";
      fallbackImages();
    };
    [input, region, type, year].filter(Boolean).forEach((control) => {
      control.addEventListener("input", render);
      control.addEventListener("change", render);
    });
    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
    fallbackImages();
  });
})();
