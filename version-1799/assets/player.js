(function () {
  var shell = document.querySelector('[data-stream]');
  if (!shell) {
    return;
  }
  var video = shell.querySelector('video');
  var button = shell.querySelector('.player-start');
  var stream = shell.getAttribute('data-stream');
  var loaded = false;
  var hls = null;

  var load = function () {
    if (!video || !stream || loaded) {
      return;
    }
    loaded = true;
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    }
  };

  var start = function () {
    load();
    if (button) {
      button.classList.add('is-hidden');
    }
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  };

  if (button) {
    button.addEventListener('click', start);
  }
  shell.addEventListener('click', function (event) {
    if (event.target === video) {
      return;
    }
    if (button && !button.classList.contains('is-hidden')) {
      start();
    }
  });
  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
