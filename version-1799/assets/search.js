(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-query]');
  var results = document.querySelector('[data-search-results]');
  var note = document.querySelector('[data-search-note]');
  var root = document.body.getAttribute('data-root') || '.';

  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  if (input) {
    input.value = initial;
  }

  var normalize = function (value) {
    return String(value || '').toLowerCase().trim();
  };

  var renderCard = function (movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card compact" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-year="' + escapeHtml(movie.year) + '" data-genre="' + escapeHtml(movie.genre) + '">',
      '<a class="poster-link" href="' + root + '/movie/' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + root + '/' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-type">' + escapeHtml(movie.type) + '</span>',
      '<span class="poster-region">' + escapeHtml(movie.region) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="' + root + '/movie/' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-tags">' + tags + '</div>',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  };

  var escapeHtml = function (value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  var search = function (query) {
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    var q = normalize(query);
    var pool = q ? window.SITE_MOVIES.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' '));
      return haystack.indexOf(q) !== -1;
    }) : window.SITE_MOVIES.slice(0, 48);
    var list = pool.slice(0, 120);
    results.innerHTML = list.length ? list.map(renderCard).join('') : '<div class="empty-state">没有找到匹配影片</div>';
    if (note) {
      note.textContent = q ? '搜索结果' : '推荐影片';
    }
  };

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value.trim() : '';
      var url = query ? '?q=' + encodeURIComponent(query) : window.location.pathname;
      history.replaceState(null, '', url);
      search(query);
    });
  }
  search(initial);
})();
