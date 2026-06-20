(function () {
  function attachPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-overlay');
    var m3u8Url = shell.getAttribute('data-src');
    var initialized = false;
    var hlsInstance = null;

    if (!video || !button || !m3u8Url) {
      return;
    }

    function prepareVideo() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = m3u8Url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(m3u8Url);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = m3u8Url;
    }

    function playVideo() {
      prepareVideo();
      shell.classList.add('is-playing');
      button.hidden = true;
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
          button.hidden = false;
        });
      }
    }

    button.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
      if (!initialized || video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.hidden = false;
        shell.classList.remove('is-playing');
      }
    });

    video.addEventListener('play', function () {
      button.hidden = true;
      shell.classList.add('is-playing');
    });

    video.addEventListener('ended', function () {
      button.hidden = false;
      shell.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(attachPlayer);
})();
