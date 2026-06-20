document.addEventListener('DOMContentLoaded', function () {
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  function setHeaderState() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('form[role="search"]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  initHero();
  initSearchPage();
  initPlayers();
});

function initHero() {
  var root = document.querySelector('[data-hero]');
  if (!root) {
    return;
  }

  var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
  var prev = root.querySelector('[data-hero-prev]');
  var next = root.querySelector('[data-hero-next]');
  var index = 0;
  var timer;

  function show(nextIndex) {
    if (!slides.length) {
      return;
    }
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
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
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
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

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  show(0);
  start();
}

function initSearchPage() {
  var grid = document.getElementById('searchGrid');
  var input = document.getElementById('searchInput');
  if (!grid || !input) {
    return;
  }

  var label = document.getElementById('searchLabel');
  var empty = document.getElementById('emptyState');
  var regionFilter = document.getElementById('regionFilter');
  var typeFilter = document.getElementById('typeFilter');
  var items = Array.prototype.slice.call(grid.querySelectorAll('.search-item'));
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  input.value = initial;

  function includesAny(text, terms) {
    if (!terms) {
      return true;
    }
    var list = terms.toLowerCase().split(/\s+/).filter(Boolean);
    if (!list.length) {
      return true;
    }
    return list.some(function (term) {
      return text.indexOf(term) !== -1;
    });
  }

  function runFilter() {
    var keyword = input.value.trim().toLowerCase();
    var region = regionFilter ? regionFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    var shown = 0;

    items.forEach(function (item) {
      var text = [
        item.getAttribute('data-title'),
        item.getAttribute('data-region'),
        item.getAttribute('data-type'),
        item.getAttribute('data-genre'),
        item.getAttribute('data-tags'),
        item.getAttribute('data-year')
      ].join(' ').toLowerCase();
      var visible = (!keyword || text.indexOf(keyword) !== -1) && includesAny(text, region) && includesAny(text, type);
      item.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });

    if (label) {
      label.textContent = keyword ? '搜索结果：' + input.value.trim() : '精选结果';
    }
    if (empty) {
      empty.classList.toggle('is-visible', shown === 0);
    }
  }

  input.addEventListener('input', runFilter);
  if (regionFilter) {
    regionFilter.addEventListener('change', runFilter);
  }
  if (typeFilter) {
    typeFilter.addEventListener('change', runFilter);
  }
  runFilter();
}

function initPlayers() {
  document.querySelectorAll('.site-player').forEach(function (player) {
    var button = player.querySelector('.player-trigger');
    var video = player.querySelector('video');
    if (!button || !video) {
      return;
    }

    function play() {
      var stream = player.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      if (!player.dataset.bound) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          player._hls = hls;
        } else {
          video.src = stream;
        }
        player.dataset.bound = '1';
      }
      player.classList.add('is-ready');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    button.addEventListener('click', play);
    player.addEventListener('click', function (event) {
      if (event.target === video && !player.classList.contains('is-ready')) {
        play();
      }
    });
  });
}
