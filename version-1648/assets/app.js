(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function filterCards(input) {
    var section = input.closest(".filter-section");
    var grid = section ? section.querySelector(".filterable-grid") : document.querySelector(".filterable-grid");
    if (!grid) {
      grid = document.querySelector(".filterable-grid");
    }
    if (!grid) {
      return;
    }
    var query = normalize(input.value);
    var cards = selectAll(".movie-card", grid);
    cards.forEach(function (card) {
      var wrapper = card.closest(".ranking-card-wrap");
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-category"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));
      var matched = !query || text.indexOf(query) !== -1;
      card.classList.toggle("is-hidden", !matched);
      if (wrapper) {
        wrapper.classList.toggle("is-hidden", !matched);
      }
    });
  }

  var pageFilters = selectAll("[data-page-filter]");
  pageFilters.forEach(function (input) {
    input.addEventListener("input", function () {
      filterCards(input);
    });
  });
  if (pageFilters.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      pageFilters[0].value = query;
      filterCards(pageFilters[0]);
    }
  }

  var carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    var slides = selectAll("[data-hero-slide]", carousel);
    var dots = selectAll("[data-hero-dot]", carousel);
    var current = 0;
    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  function fillSuggestions(form, query) {
    var panel = form.querySelector("[data-search-suggestions]");
    if (!panel) {
      return;
    }
    panel.textContent = "";
    var word = normalize(query);
    if (!word || !window.searchMovies) {
      panel.classList.remove("is-open");
      return;
    }
    var matched = window.searchMovies.filter(function (movie) {
      return normalize([movie.title, movie.year, movie.category, movie.region, movie.type, movie.tags].join(" ")).indexOf(word) !== -1;
    }).slice(0, 6);
    matched.forEach(function (movie) {
      var link = document.createElement("a");
      link.href = movie.url;
      link.textContent = movie.title;
      var sub = document.createElement("span");
      sub.textContent = [movie.year, movie.category, movie.region].filter(Boolean).join(" · ");
      link.appendChild(sub);
      panel.appendChild(link);
    });
    panel.classList.toggle("is-open", matched.length > 0);
  }

  selectAll("[data-site-search]").forEach(function (form) {
    var input = form.querySelector("input[name='q']");
    if (!input) {
      return;
    }
    input.addEventListener("input", function () {
      fillSuggestions(form, input.value);
    });
    input.addEventListener("blur", function () {
      window.setTimeout(function () {
        var panel = form.querySelector("[data-search-suggestions]");
        if (panel) {
          panel.classList.remove("is-open");
        }
      }, 180);
    });
    form.addEventListener("submit", function (event) {
      var word = input.value.trim();
      if (!word) {
        event.preventDefault();
        window.location.href = "./search.html";
      }
    });
  });

  var video = document.getElementById("moviePlayer");
  var trigger = document.getElementById("playTrigger");
  if (video && trigger) {
    var attached = false;
    var hlsInstance = null;
    function videoUrl() {
      if (typeof currentVideoUrl !== "undefined") {
        return currentVideoUrl;
      }
      return "";
    }
    function attachVideo() {
      if (attached) {
        return;
      }
      var url = videoUrl();
      if (!url) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
      attached = true;
    }
    function startPlayback(event) {
      if (event) {
        event.preventDefault();
      }
      attachVideo();
      trigger.classList.add("is-hidden");
      video.controls = true;
      var playTask = video.play();
      if (playTask && playTask.catch) {
        playTask.catch(function () {
          trigger.classList.remove("is-hidden");
        });
      }
    }
    trigger.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        startPlayback();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
