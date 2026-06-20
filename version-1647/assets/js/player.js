import { H as Hls } from './hls.js';

function setupPlayer(player) {
  var video = player.querySelector('video');
  var button = player.querySelector('[data-play-button]');
  var message = player.querySelector('[data-player-message]');
  var source = player.getAttribute('data-video-src');
  var hlsInstance = null;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function startPlayback() {
    if (!video || !source) {
      setMessage('播放源暂不可用');
      return;
    }

    player.classList.add('is-loading');
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().then(function () {
        player.classList.add('is-playing');
        setMessage('');
      }).catch(function () {
        setMessage('请再次点击播放按钮启动视频');
        player.classList.remove('is-playing');
      });
      return;
    }

    if (Hls && Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setMessage('播放器加载失败，请刷新页面后重试');
          }
        });
      }

      video.play().then(function () {
        player.classList.add('is-playing');
        setMessage('');
      }).catch(function () {
        setMessage('请再次点击播放按钮启动视频');
        player.classList.remove('is-playing');
      });
      return;
    }

    setMessage('当前浏览器不支持 HLS 播放');
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
  }
}

document.querySelectorAll('[data-hls-player]').forEach(setupPlayer);
