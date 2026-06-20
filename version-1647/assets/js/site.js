(function () {
  function queryAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = queryAll('[data-hero-slide]', hero);
    var dots = queryAll('[data-hero-dot]', hero);
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function show(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(activeIndex + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(activeIndex + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    show(0);
    startTimer();
  }

  function normalise(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilters() {
    queryAll('[data-filter-panel]').forEach(function (panel) {
      var form = panel.querySelector('[data-filter-form]');
      var cardList = panel.parentElement.querySelector('[data-card-list]') || document;
      var cards = queryAll('[data-movie-card]', cardList);
      var input = panel.querySelector('[data-filter-input]');
      var region = panel.querySelector('[data-filter-region]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var count = panel.querySelector('[data-filter-count]');

      function update() {
        var keyword = normalise(input && input.value);
        var regionValue = normalise(region && region.value);
        var typeValue = normalise(type && type.value);
        var yearValue = normalise(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var searchable = normalise([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));

          var matchesKeyword = !keyword || searchable.indexOf(keyword) !== -1;
          var matchesRegion = !regionValue || normalise(card.dataset.region) === regionValue;
          var matchesType = !typeValue || normalise(card.dataset.type) === typeValue;
          var matchesYear = !yearValue || normalise(card.dataset.year) === yearValue;
          var matches = matchesKeyword && matchesRegion && matchesType && matchesYear;

          card.classList.toggle('is-hidden', !matches);

          if (matches) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      if (form) {
        form.addEventListener('input', update);
        form.addEventListener('change', update);
        form.addEventListener('submit', function (event) {
          event.preventDefault();
        });
      }

      update();
    });
  }

  function setupImageFallbacks() {
    queryAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        image.removeAttribute('src');
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupImageFallbacks();
  });
})();
