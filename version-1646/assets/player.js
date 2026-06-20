(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupPlayer(player) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var source = player.getAttribute("data-video-src") || (video && video.getAttribute("data-src"));
    var hls = null;
    var attached = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
      } else {
        video.src = source;
      }
    }

    function play() {
      attachSource();
      video.controls = true;
      var result = video.play();
      if (result && typeof result.then === "function") {
        result.then(function () {
          player.classList.add("is-playing");
        }).catch(function () {
          player.classList.remove("is-playing");
          video.controls = true;
        });
      } else {
        player.classList.add("is-playing");
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.seeking && video.currentTime === 0) {
        player.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".player")).forEach(setupPlayer);
  });
})();
