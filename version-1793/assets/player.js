(function () {
  function setupPlayer(player) {
    const video = player.querySelector("video[data-src]");
    const button = player.querySelector("[data-play-button]");
    if (!video || !button) {
      return;
    }
    const source = video.getAttribute("data-src");
    let ready = false;
    let hlsInstance = null;

    function initialize() {
      if (ready || !source) {
        return;
      }
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      initialize();
      const promise = video.play();
      if (promise && typeof promise.then === "function") {
        promise.then(() => {
          player.classList.add("is-playing");
        }).catch(() => {
          player.classList.remove("is-playing");
        });
      } else {
        player.classList.add("is-playing");
      }
    }

    button.addEventListener("click", play);
    player.addEventListener("click", (event) => {
      if (event.target === video || event.target.closest("[data-play-button]")) {
        return;
      }
      play();
    });
    video.addEventListener("play", () => player.classList.add("is-playing"));
    video.addEventListener("pause", () => player.classList.remove("is-playing"));
    window.addEventListener("beforeunload", () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });
})();
