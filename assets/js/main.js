// main.js - interactions: transparent -> solid header, smooth scroll, reveal using IntersectionObserver + fallback
(function () {
  "use strict";

  // small helpers
  var $ = window.jQuery || null;

  // DOM elements
  var header = document.getElementById("site-header");
  var hero = document.getElementById("hero");
  var navList = document.querySelector(".nav-list");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.querySelectorAll('.nav-list a[data-scroll]');
  var reveals = document.querySelectorAll(".reveal");

  // 1) Header: transparent on top, becomes solid after scrolling past hero threshold
  function updateHeaderOnScroll() {
    var scrollY = window.scrollY || window.pageYOffset;
    var heroBottom = (hero && hero.offsetTop + hero.offsetHeight) || 400;
    // when scrolled beyond 70% of hero height -> solid header
    if (scrollY > hero.offsetTop + (hero.offsetHeight * 0.65)) {
      header.classList.remove("header--transparent");
      header.classList.add("header--solid");
    } else {
      header.classList.add("header--transparent");
      header.classList.remove("header--solid");
    }
  }

  // 2) Smooth scroll for anchor links
  function smoothScrollHandler(e) {
    var href = this.getAttribute("href");
    if (!href || href.indexOf("#") !== 0) return;
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    var headerHeight = header.offsetHeight || 64;
    var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.scrollTo({ top: top, behavior: "smooth" });
    // hide mobile nav if open
    if (navList.classList.contains("show")) navList.classList.remove("show");
  }

  // 3) Mobile nav toggle
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      navList.classList.toggle("show");
    });
  }

  // bind smooth scroll (all matching anchors)
  navLinks.forEach(function (a) {
    a.addEventListener("click", smoothScrollHandler);
  });
  // also hero CTA and hints
  var scrollAnchors = document.querySelectorAll('a[data-scroll]');
  scrollAnchors.forEach(function (a) {
    a.addEventListener("click", function (e) {
      // avoid double-binding anchors already in nav
      if (this.closest(".nav-list")) return;
      smoothScrollHandler.call(this, e);
    });
  });

  // 4) Reveal elements on scroll using IntersectionObserver (fast & efficient)
  function initReveal() {
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

      reveals.forEach(function (el) {
        obs.observe(el);
      });
    } else {
      // fallback: simple throttled scroll check
      var throttleTimeout = null;
      function revealOnScrollFallback() {
        if (throttleTimeout) return;
        throttleTimeout = setTimeout(function () {
          throttleTimeout = null;
          var windowBottom = window.scrollY + window.innerHeight;
          reveals.forEach(function (el) {
            var rect = el.getBoundingClientRect();
            var elTop = rect.top + window.scrollY;
            if (windowBottom > elTop + 60) {
              el.classList.add("is-visible");
            }
          });
        }, 150);
      }
      revealOnScrollFallback();
      window.addEventListener("scroll", revealOnScrollFallback);
      window.addEventListener("resize", revealOnScrollFallback);
    }
  }

  // 5) Active nav link on scroll
  function updateActiveNav() {
    var fromTop = window.scrollY + (header.offsetHeight || 70) + 20;
    var navItems = document.querySelectorAll(".nav-list .nav-item");
    var found = false;

    document.querySelectorAll("main section[id]").forEach(function (section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;
      if (fromTop >= top && fromTop < bottom) {
        var id = section.getAttribute("id");
        // remove current active
        navItems.forEach(function (li) { li.classList.remove("active"); });
        var link = document.querySelector('.nav-list a[href="#' + id + '"]');
        if (link && link.parentElement) {
          link.parentElement.classList.add("active");
          found = true;
        }
      }
    });
    if (!found) {
      // fallback: highlight home if near top
      if (window.scrollY < 220) {
        document.querySelectorAll(".nav-list .nav-item").forEach(function (li) { li.classList.remove("active"); });
        var first = document.querySelector(".nav-list .nav-item");
        if (first) first.classList.add("active");
      }
    }
  }

  // 6) Throttle helper
  function throttle(fn, wait) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  // Initialization
  function init() {
    // run initial header state
    updateHeaderOnScroll();
    // event listeners
    window.addEventListener("scroll", throttle(function () {
      updateHeaderOnScroll();
      updateActiveNav();
    }, 120));
    window.addEventListener("resize", throttle(updateHeaderOnScroll, 180));
    // reveals
    initReveal();

    // set up initial small stagger for hero & first reveals
    setTimeout(function () {
      document.querySelectorAll(".hero-inner, .hero-cta").forEach(function (el, i) {
        el.style.transition = "opacity .6s ease, transform .6s ease";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
    }, 120);
  }

  // Wait for DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
