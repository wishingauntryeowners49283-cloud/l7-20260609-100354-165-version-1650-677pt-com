(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('open');
            button.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function initHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length === 0) {
            return;
        }

        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, currentIndex) {
                slide.classList.toggle('active', currentIndex === activeIndex);
            });
            dots.forEach(function (dot, currentIndex) {
                dot.classList.toggle('active', currentIndex === activeIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                start();
            });
        });

        var carousel = document.querySelector('[data-hero-carousel]');
        if (carousel) {
            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
        }

        showSlide(0);
        start();
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        if (!panel || cards.length === 0) {
            return;
        }

        var input = panel.querySelector('[data-filter-query]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var sortSelect = panel.querySelector('[data-filter-sort]');
        var result = document.querySelector('[data-filter-result]');
        var empty = document.querySelector('[data-empty-state]');
        var grid = document.querySelector('[data-card-grid]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && input) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function compareCards(a, b, mode) {
            var ay = Number(a.getAttribute('data-year') || 0);
            var by = Number(b.getAttribute('data-year') || 0);
            var ah = Number(a.getAttribute('data-heat') || 0);
            var bh = Number(b.getAttribute('data-heat') || 0);
            var ar = Number(a.getAttribute('data-rating') || 0);
            var br = Number(b.getAttribute('data-rating') || 0);

            if (mode === 'heat') {
                return bh - ah;
            }
            if (mode === 'rating') {
                return br - ar;
            }
            return by - ay || bh - ah;
        }

        function applyFilters() {
            var query = normalize(input ? input.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var sortMode = sortSelect ? sortSelect.value : 'year';
            var matched = 0;

            cards.sort(function (a, b) {
                return compareCards(a, b, sortMode);
            }).forEach(function (card) {
                if (grid) {
                    grid.appendChild(card);
                }
                var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags'));
                var passQuery = !query || haystack.indexOf(query) !== -1;
                var passYear = !year || card.getAttribute('data-year') === year;
                var passType = !type || card.getAttribute('data-type') === type;
                var visible = passQuery && passYear && passType;
                card.hidden = !visible;
                if (visible) {
                    matched += 1;
                }
            });

            if (result) {
                result.textContent = '当前显示 ' + matched + ' 部，共 ' + cards.length + ' 部';
            }
            if (empty) {
                empty.classList.toggle('show', matched === 0);
            }
        }

        [input, yearSelect, typeSelect, sortSelect].forEach(function (element) {
            if (!element) {
                return;
            }
            element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change', applyFilters);
        });

        applyFilters();
    }

    function initPlayers() {
        var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-hls]'));
        videos.forEach(function (video) {
            var source = video.getAttribute('data-hls');
            var status = document.querySelector('[data-player-status]');
            if (!source) {
                if (status) {
                    status.textContent = '当前影片暂未绑定播放源。';
                }
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
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
                hls.on(window.Hls.Events.ERROR, function (_, data) {
                    if (status && data && data.details) {
                        status.textContent = '播放源加载提示：' + data.details;
                    }
                });
                return;
            }

            if (status) {
                status.textContent = '当前浏览器不支持 HLS 播放，可尝试使用 Safari、Edge 或 Chrome。';
            }
        });

        Array.prototype.slice.call(document.querySelectorAll('[data-play-target]')).forEach(function (button) {
            button.addEventListener('click', function () {
                var targetId = button.getAttribute('data-play-target');
                var video = document.getElementById(targetId);
                if (!video) {
                    return;
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.then(function () {
                        button.style.display = 'none';
                    }).catch(function () {
                        button.textContent = '点击视频区域播放';
                    });
                } else {
                    button.style.display = 'none';
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroCarousel();
        initFilters();
        initPlayers();
    });
}());
