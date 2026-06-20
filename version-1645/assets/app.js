(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters(scope) {
    var searchInput = scope.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var activeRegion = '';
    var activeType = '';

    function update() {
      var query = normalize(searchInput ? searchInput.value : '');
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var region = card.getAttribute('data-region') || '';
        var type = card.getAttribute('data-type') || '';
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchRegion = !activeRegion || region === activeRegion;
        var matchType = !activeType || type === activeType;
        card.classList.toggle('hidden', !(matchQuery && matchRegion && matchType));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', update);
    }

    scope.querySelectorAll('[data-filter-region]').forEach(function (button) {
      button.addEventListener('click', function () {
        var group = button.closest('[data-filter-buttons]');
        if (group) {
          group.querySelectorAll('button').forEach(function (item) {
            item.classList.remove('active');
          });
        }
        button.classList.add('active');
        activeRegion = button.getAttribute('data-filter-region') || '';
        update();
      });
    });

    scope.querySelectorAll('[data-filter-type]').forEach(function (button) {
      button.addEventListener('click', function () {
        var group = button.closest('[data-filter-buttons]');
        if (group) {
          group.querySelectorAll('button').forEach(function (item) {
            item.classList.remove('active');
          });
        }
        button.classList.add('active');
        activeType = button.getAttribute('data-filter-type') || '';
        update();
      });
    });
  }

  document.querySelectorAll('main').forEach(applyFilters);
})();
