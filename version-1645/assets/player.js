function initMoviePlayer(url) {
  var video = document.getElementById('movie-player');
  var cover = document.getElementById('movie-play-cover');
  var button = document.getElementById('movie-play-button');
  var ready = false;
  var hlsInstance = null;

  function attach() {
    if (ready || !video) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = url;
  }

  function start(event) {
    if (event) {
      event.preventDefault();
    }
    attach();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playAction = video.play();
    if (playAction && typeof playAction.catch === 'function') {
      playAction.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }
  if (button) {
    button.addEventListener('click', start);
  }
  if (video) {
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }
}
