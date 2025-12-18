(function () {
  "use strict";

  var header = document.getElementById("site-header");
  var hero = document.getElementById("hero");
  var navList = document.querySelector(".nav-list");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.querySelectorAll('.nav-list a[data-scroll]');
  var reveals = document.querySelectorAll(".reveal");

  function updateHeaderOnScroll() {
    var scrollY = window.scrollY || window.pageYOffset;
    if (hero && scrollY > hero.offsetTop + (hero.offsetHeight * 0.65)) {
      header.classList.remove("header--transparent");
      header.classList.add("header--solid");
    } else {
      header.classList.add("header--transparent");
      header.classList.remove("header--solid");
    }
  }

  function smoothScrollHandler(e) {
    var href = this.getAttribute("href");
    if (!href || href.indexOf("#") !== 0) return;
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    var headerHeight = header.offsetHeight || 64;
    var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.scrollTo({ top: top, behavior: "smooth" });
    if (navList.classList.contains("open")) navList.classList.remove("open");
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      navList.classList.toggle("open");
    });
  }

  navLinks.forEach(function (a) {
    a.addEventListener("click", smoothScrollHandler);
  });

  var scrollAnchors = document.querySelectorAll('a[data-scroll]');
  scrollAnchors.forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (this.closest(".nav-list")) return;
      smoothScrollHandler.call(this, e);
    });
  });

  function initReveal() {
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            obs.unobserve(entry.target);
          }
        });
      }, { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

      reveals.forEach(function (el) {
        obs.observe(el);
      });
    } else {
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
              el.classList.add("active");
            }
          });
        }, 150);
      }
      revealOnScrollFallback();
      window.addEventListener("scroll", revealOnScrollFallback);
      window.addEventListener("resize", revealOnScrollFallback);
    }
  }

  function updateActiveNav() {
    var fromTop = window.scrollY + (header.offsetHeight || 70) + 20;
    var navItems = document.querySelectorAll(".nav-list .nav-item");
    var found = false;

    document.querySelectorAll("main section[id]").forEach(function (section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;
      if (fromTop >= top && fromTop < bottom) {
        var id = section.getAttribute("id");
        navItems.forEach(function (li) { li.classList.remove("active"); });
        var link = document.querySelector('.nav-list a[href="#' + id + '"]');
        if (link && link.parentElement) {
          link.parentElement.classList.add("active");
          found = true;
        }
      }
    });
    if (!found) {
      if (window.scrollY < 220) {
        document.querySelectorAll(".nav-list .nav-item").forEach(function (li) { li.classList.remove("active"); });
        var first = document.querySelector(".nav-list .nav-item");
        if (first) first.classList.add("active");
      }
    }
  }

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

  function init() {
    updateHeaderOnScroll();
    window.addEventListener("scroll", throttle(function () {
      updateHeaderOnScroll();
      updateActiveNav();
    }, 120));
    window.addEventListener("resize", throttle(updateHeaderOnScroll, 180));
    initReveal();

    setTimeout(function () {
      document.querySelectorAll(".hero-inner, .hero-cta").forEach(function (el, i) {
        el.style.transition = "opacity .6s ease, transform .6s ease";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
    }, 120);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

    const formData = new FormData(contactForm);
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;

    submitBtn.innerText = "Sending...";
    submitBtn.disabled = true;

    fetch(contactForm.action, {
      method: "POST",
      body: formData,
        headers: {
        'Accept': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          alert("Thank you! Your message has been sent successfully.");
          contactForm.reset();
          } else {
          alert("Oops! There was a problem submitting your form.");
          }
      })
      .catch(error => {
        alert("Error: Could not send message.");
      })
      .finally(() => {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
      });
      });
    }

const heroSub = document.querySelector('.hero-sub');
if (heroSub) {
  const text = heroSub.textContent.trim();
  heroSub.textContent = '';
  let i = 0;
  const typing = setInterval(() => {
    heroSub.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(typing);
  }, 60);
}
const hero = document.querySelector(".hero");
if (hero) {
  hero.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
    hero.style.backgroundPosition = `${50 + x}% ${50 + y}%`;
  });
}
const panels = document.querySelectorAll(".panel.reveal");
panels.forEach(panel => {
  const children = panel.querySelectorAll("h2, p, li, img, a");
  children.forEach((el, i) => {
    el.style.transitionDelay = `${i * 100}ms`;
  });
});
// Scroll reveal: move main content upward when user scrolls past hero
const mainEl = document.querySelector('main#main');
let revealed = false;

window.addEventListener('scroll', () => {
  const triggerPoint = window.innerHeight * 0.2; // how far to scroll before revealing
  if (!revealed && window.scrollY > triggerPoint) {
    revealed = true;
    mainEl.style.transform = 'translateY(0)';
  }
});
window.addEventListener('scroll', () => {
  document.body.classList.toggle('scrolled', window.scrollY > 20);
});
