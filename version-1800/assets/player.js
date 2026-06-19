(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function loadHls(callback, fail) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      existing.addEventListener('error', fail, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.async = true;
    script.dataset.hlsLoader = 'true';
    script.addEventListener('load', callback, { once: true });
    script.addEventListener('error', fail, { once: true });
    document.head.appendChild(script);
  }

  function attachPlayer(container) {
    var video = container.querySelector('video');
    var button = container.querySelector('.movie-player__overlay');
    var status = container.querySelector('.movie-player__status');
    var source = container.dataset.source;
    var started = false;
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function start() {
      if (!video || !source || started) {
        return;
      }

      started = true;
      container.classList.add('is-playing');
      setStatus('正在加载播放源...');

      if (/\.mp4(\?|$)/i.test(source)) {
        video.src = source;
        video.play().catch(function () {
          setStatus('请再次点击视频开始播放');
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {
            setStatus('请再次点击视频开始播放');
          });
        }, { once: true });
        return;
      }

      loadHls(function () {
        if (!window.Hls || !window.Hls.isSupported()) {
          video.src = source;
          video.play().catch(function () {
            setStatus('当前浏览器不支持该播放源');
          });
          return;
        }

        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源加载完成');
          video.play().catch(function () {
            setStatus('请再次点击视频开始播放');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，请刷新后重试');
          }
        });
      }, function () {
        video.src = source;
        video.play().catch(function () {
          setStatus('HLS 组件加载失败，已尝试浏览器原生播放');
        });
      });
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('play', function () {
        container.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          container.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  }

  ready(function () {
    document.querySelectorAll('.movie-player').forEach(attachPlayer);
  });
})();
