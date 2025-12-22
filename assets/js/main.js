(function () {
  "use strict";

  /* ===============================
     ELEMENTS
     =============================== */
  var header = document.getElementById("site-header");
  var hero = document.getElementById("hero");
  var navList = document.querySelector(".nav-list");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.querySelectorAll('.nav-list a[data-scroll]');
  var reveals = document.querySelectorAll(".reveal");
  var mainEl = document.querySelector("main#main");

  /* ===============================
     HEADER SCROLL STATE
     =============================== */
  function updateHeaderOnScroll() {
    var scrollY = window.scrollY || window.pageYOffset;
    if (hero && scrollY > hero.offsetTop + hero.offsetHeight * 0.65) {
      header.classList.remove("header--transparent");
      header.classList.add("header--solid");
    } else {
      header.classList.add("header--transparent");
      header.classList.remove("header--solid");
    }
  }

  /* ===============================
     SMOOTH SCROLL
     =============================== */
  function smoothScrollHandler(e) {
    var href = this.getAttribute("href");
    if (!href || href.indexOf("#") !== 0) return;

    var target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    var headerHeight = header.offsetHeight || 64;
    var top =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      12;

    window.scrollTo({ top: top, behavior: "smooth" });

    if (navList.classList.contains("open")) {
      navList.classList.remove("open");
    }
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      navList.classList.toggle("open");
    });
  }

  navLinks.forEach(function (a) {
    a.addEventListener("click", smoothScrollHandler);
  });

  /* ===============================
     REVEAL ON SCROLL
     =============================== */
  function initReveal() {
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("active");
              obs.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
      );

      reveals.forEach(function (el) {
        obs.observe(el);
      });
    }
  }

  /* ===============================
     ACTIVE NAV (FIXED HOME ISSUE)
     =============================== */
  function updateActiveNav() {
    var fromTop =
      window.scrollY + (header.offsetHeight || 70) + 20;

    var navItems = document.querySelectorAll(".nav-list .nav-item");
    var found = false;

    document.querySelectorAll("main section[id]").forEach(function (section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;

      if (fromTop >= top && fromTop < bottom) {
        var id = section.getAttribute("id");

        navItems.forEach(function (li) {
          li.classList.remove("active");
        });

        var link = document.querySelector(
          '.nav-list a[href="#' + id + '"]'
        );

        if (link) {
          link.parentElement.classList.add("active");
          found = true;
        }
      }
    });

    // ✅ Home active when at top
    if (!found && hero && window.scrollY < hero.offsetHeight * 0.6) {
      navItems.forEach(function (li) {
        li.classList.remove("active");
      });

      var home = document.querySelector('.nav-list a[href="#hero"]');
      if (home) home.parentElement.classList.add("active");
    }
  }

  /* ===============================
     THROTTLE
     =============================== */
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

  /* ===============================
     HERO ENTRY ANIMATION
     =============================== */
  function initHeroIntro() {
    setTimeout(function () {
      document
        .querySelectorAll(".hero-inner, .hero-cta")
        .forEach(function (el) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        });
    }, 120);
  }

  /* ===============================
     HERO PARALLAX
     =============================== */
  var heroEl = document.querySelector(".hero");
  if (heroEl) {
    heroEl.addEventListener("mousemove", function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 10;
      var y = (e.clientY / window.innerHeight - 0.5) * 10;
      heroEl.style.backgroundPosition =
        50 + x + "% " + (50 + y) + "%";
    });
  }

  /* ===============================
     MAIN REVEAL + BODY STATE
     =============================== */
  var revealed = false;

  window.addEventListener("scroll", function () {
    document.body.classList.toggle("scrolled", window.scrollY > 20);

    var triggerPoint = window.innerHeight * 0.2;
    if (!revealed && window.scrollY > triggerPoint) {
      revealed = true;
      mainEl.style.transform = "translateY(0)";
    }
  });

  /* ===============================
     INIT
     =============================== */
  function init() {
    updateHeaderOnScroll();
    updateActiveNav();
    initReveal();
    initHeroIntro();

    window.addEventListener(
      "scroll",
      throttle(function () {
        updateHeaderOnScroll();
        updateActiveNav();
      }, 120)
    );

    window.addEventListener(
      "resize",
      throttle(updateHeaderOnScroll, 180)
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* ===============================
   CONTACT FORM
   =============================== */
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;

    submitBtn.innerText = "Sending...";
    submitBtn.disabled = true;

    fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then(res => {
        if (res.ok) {
          alert("Thank you! Your message has been sent.");
          contactForm.reset();
        } else {
          alert("Submission failed. Please try again.");
        }
      })
      .catch(() => alert("Network error."))
      .finally(() => {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
      });
  });
}

/* ===============================
   HERO TYPING EFFECT
   =============================== */
const heroSub = document.querySelector(".hero-sub");
if (heroSub) {
  const text = heroSub.textContent.trim();
  heroSub.textContent = "";
  let i = 0;

  const typing = setInterval(() => {
    heroSub.textContent += text[i++];
    if (i >= text.length) clearInterval(typing);
  }, 60);
}

/* ===============================
   THEME TOGGLE
   =============================== */
(function () {
  const THEME_KEY = "theme";
  const themeToggle = document.getElementById("themeToggle");
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  function applyTheme(theme) {
    document.body.classList.remove("theme-dark", "theme-light");
    document.body.classList.add(theme === "dark" ? "theme-dark" : "theme-light");

    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", theme === "dark");
      const icon = themeToggle.querySelector("i");
      icon.className = theme === "dark" ? "fa fa-moon" : "fa fa-sun";
      themeToggle.classList.toggle("active", theme === "dark");
    }
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved || (mq.matches ? "dark" : "light");
    applyTheme(theme);

    mq.addEventListener("change", e => {
      if (!saved) applyTheme(e.matches ? "dark" : "light");
    });

    themeToggle?.addEventListener("click", () => {
      const next = document.body.classList.contains("theme-dark")
        ? "light"
        : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", initTheme)
    : initTheme();
})();
