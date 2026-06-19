function initMoviePlayer(streamUrl) {
    var video = document.querySelector(".movie-video");
    var layer = document.querySelector(".play-layer");
    var ready = false;
    var hlsPlayer = null;

    if (!video || !streamUrl) {
        return;
    }

    function attachStream() {
        if (ready) {
            return;
        }
        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsPlayer.loadSource(streamUrl);
            hlsPlayer.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function start() {
        attachStream();
        if (layer) {
            layer.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
            playPromise.catch(function () {});
        }
    }

    if (layer) {
        layer.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", function () {
        if (layer) {
            layer.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
    });
}
