(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function playHero() {
        if (slides.length < 2) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            setHero(current + 1);
        }, 5200);
    }

    if (prev) {
        prev.addEventListener('click', function () {
            setHero(current - 1);
            playHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            setHero(current + 1);
            playHero();
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            setHero(index);
            playHero();
        });
    });

    playHero();

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilter(scope) {
        var input = scope.querySelector('[data-filter-text]');
        var year = scope.querySelector('[data-filter-year]');
        var type = scope.querySelector('[data-filter-type]');
        var region = scope.querySelector('[data-filter-region]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-state]');

        function filterCards() {
            var keyword = normalize(input && input.value);
            var yearValue = normalize(year && year.value);
            var typeValue = normalize(type && type.value);
            var regionValue = normalize(region && region.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }
                if (typeValue && cardType !== typeValue) {
                    matched = false;
                }
                if (regionValue && cardRegion !== regionValue) {
                    matched = false;
                }

                card.classList.toggle('is-hidden-by-filter', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, year, type, region].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });

        var globalInput = scope.querySelector('[data-global-search]');
        if (globalInput) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query) {
                globalInput.value = query;
            }
        }

        filterCards();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(setupFilter);
})();
