(function () {
  function start(video, source, overlay) {
    if (!video) return;

    function showOverlay() {
      if (overlay) overlay.classList.remove('hidden');
    }

    function playNow() {
      const ready = video.play();
      if (ready && ready.catch) {
        ready.catch(showOverlay);
      }
    }

    if (overlay) overlay.classList.add('hidden');

    if (video.getAttribute('data-ready') === '1') {
      playNow();
      return;
    }

    video.setAttribute('data-ready', '1');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      playNow();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, playNow);
      video.__hls = hls;
      return;
    }

    video.src = source;
    playNow();
  }

  window.initMoviePlayer = function (videoId, source, overlayId) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);

    if (overlay) {
      overlay.addEventListener('click', function () {
        start(video, source, overlay);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start(video, source, overlay);
        }
      });
    }
  };
})();
