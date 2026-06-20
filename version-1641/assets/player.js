(function () {
    function bindSource(video, source) {
        var canUseNative = video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');

        if (canUseNative) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            return;
        }

        video.src = source;
    }

    window.initMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var attached = false;

        if (!video || !button || !options.source) {
            return;
        }

        function startPlayback() {
            if (!attached) {
                bindSource(video, options.source);
                attached = true;
            }

            button.classList.add('is-hidden');
            video.controls = true;

            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (!attached) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
    };
})();
