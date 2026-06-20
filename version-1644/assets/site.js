(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function escapeHtml(value) {
        return (value || '').toString().replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function setupMenu() {
        var button = one('.menu-toggle');
        var nav = one('.mobile-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slides = all('.hero-slide');
        if (!slides.length) {
            return;
        }
        var dots = all('.hero-dot');
        var prev = one('.hero-prev');
        var next = one('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        var section = one('.hero-section');
        if (section) {
            section.addEventListener('mouseenter', stop);
            section.addEventListener('mouseleave', start);
        }
        start();
    }

    function setupFilters() {
        all('.filter-panel').forEach(function (panel) {
            var input = one('.filter-search', panel);
            var scope = panel.parentElement ? one('.filter-scope', panel.parentElement) : null;
            if (!input || !scope) {
                return;
            }
            var cards = all('.movie-card', scope);
            function apply(value) {
                var keyword = normalize(value);
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region')
                    ].join(' '));
                    card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
                });
            }
            input.addEventListener('input', function () {
                apply(input.value);
            });
            all('.filter-hints span', panel).forEach(function (hint) {
                hint.addEventListener('click', function () {
                    input.value = hint.textContent || '';
                    apply(input.value);
                });
            });
        });
    }

    function createSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
            '<a href="./' + escapeHtml(movie.file) + '" class="movie-cover" aria-label="' + escapeHtml(movie.title) + '">' +
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span class="movie-play">▶</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
                '<div class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>' +
                '<h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
        '</article>';
    }

    function setupSearchPage() {
        var input = one('#site-search-input');
        var results = one('#search-results');
        var summary = one('#search-summary');
        if (!input || !results || !summary || !window.MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        input.value = initialQuery;

        function render(query) {
            var keyword = normalize(query);
            var matched = window.MOVIES.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));
                return !keyword || haystack.indexOf(keyword) !== -1;
            }).slice(0, 120);
            results.innerHTML = matched.map(createSearchCard).join('');
            summary.textContent = keyword ? '搜索结果' : '热门推荐';
        }

        input.addEventListener('input', function () {
            render(input.value);
        });
        render(initialQuery);
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
