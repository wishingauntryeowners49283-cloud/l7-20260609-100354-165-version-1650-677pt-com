(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.getElementById("siteMenu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var list = scope.querySelector("[data-movie-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var searchInput = panel.querySelector("[data-search-input]");
      var regionFilter = panel.querySelector("[data-region-filter]");
      var genreFilter = panel.querySelector("[data-genre-filter]");
      var yearFilter = panel.querySelector("[data-year-filter]");
      var resetButton = panel.querySelector("[data-reset-filters]");
      var emptyState = scope.querySelector("[data-empty-state]");

      function apply() {
        var keyword = normalize(searchInput && searchInput.value);
        var region = normalize(regionFilter && regionFilter.value);
        var genre = normalize(genreFilter && genreFilter.value);
        var year = normalize(yearFilter && yearFilter.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-text"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardGenre = normalize(card.getAttribute("data-genre"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (region && cardRegion !== region) {
            matched = false;
          }
          if (genre && cardGenre.indexOf(genre) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      [searchInput, regionFilter, genreFilter, yearFilter].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });

      if (resetButton) {
        resetButton.addEventListener("click", function () {
          if (searchInput) {
            searchInput.value = "";
          }
          if (regionFilter) {
            regionFilter.value = "";
          }
          if (genreFilter) {
            genreFilter.value = "";
          }
          if (yearFilter) {
            yearFilter.value = "";
          }
          apply();
        });
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
