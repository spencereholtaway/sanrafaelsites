function bindNavInteractions(root, idSuffix) {
  const navToggle = root.querySelector(".nav__toggle");
  const navMenu = root.querySelector(".nav__links");
  const navDropdown = root.querySelector(".nav__dropdown");
  const dropdownToggle = root.querySelector(".nav__dropdown-toggle");
  const dropdownMenu = root.querySelector(".nav__dropdown-menu");

  if (idSuffix) {
    [navToggle, navMenu, navDropdown, dropdownToggle, dropdownMenu].forEach((el) => {
      if (el && el.id) el.id += idSuffix;
    });
    if (navToggle && navMenu) navToggle.setAttribute("aria-controls", navMenu.id);
    if (dropdownToggle && dropdownMenu) dropdownToggle.setAttribute("aria-controls", dropdownMenu.id);
  }

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen && navDropdown) {
      navDropdown.classList.remove("is-open");
      dropdownToggle.setAttribute("aria-expanded", "false");
    }
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  if (navDropdown && dropdownToggle) {
    dropdownToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = navDropdown.classList.toggle("is-open");
      dropdownToggle.setAttribute("aria-expanded", String(isOpen));
      if (isOpen && typeof gtag === "function") {
        gtag("event", "nav_industries_open");
      }
    });

    document.addEventListener("click", (e) => {
      if (!navDropdown.contains(e.target)) {
        navDropdown.classList.remove("is-open");
        dropdownToggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        navDropdown.classList.remove("is-open");
        dropdownToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
}

const siteHeader = document.querySelector(".nav");
bindNavInteractions(siteHeader, null);

let navPill = null;
if (siteHeader) {
  navPill = siteHeader.cloneNode(true);
  navPill.classList.remove("nav");
  navPill.classList.add("nav-pill");
  navPill.setAttribute("aria-hidden", "true");
  document.body.appendChild(navPill);
  bindNavInteractions(navPill, "-pill");

  const updatePillVisibility = () => {
    const visible = window.scrollY > 80;
    navPill.classList.toggle("is-visible", visible);
    navPill.setAttribute("aria-hidden", String(!visible));
  };

  updatePillVisibility();
  window.addEventListener("scroll", updatePillVisibility, { passive: true });
}

document.getElementById("year").textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll(".faq__item").forEach((item) => {
  const summary = item.querySelector("summary");
  const panel = item.querySelector(".faq__panel");
  if (!summary || !panel) return;

  summary.addEventListener("click", (e) => {
    e.preventDefault();

    if (prefersReducedMotion) {
      item.open = !item.open;
      return;
    }

    panel.removeEventListener("transitionend", panel._faqCleanup || (() => {}));

    if (item.open) {
      // Animate closed: details normally hides content the instant `open`
      // is removed, which skips right past the CSS transition. Freezing
      // the panel at its current height first gives the transition a
      // starting point to animate from before we drop the attribute.
      panel.style.maxHeight = panel.scrollHeight + "px";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          panel.style.maxHeight = "0px";
        });
      });
      const cleanup = (evt) => {
        if (evt.propertyName !== "max-height") return;
        item.open = false;
        panel.style.maxHeight = "";
        panel.removeEventListener("transitionend", cleanup);
      };
      panel._faqCleanup = cleanup;
      panel.addEventListener("transitionend", cleanup);
    } else {
      item.open = true;
      panel.style.maxHeight = "0px";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          panel.style.maxHeight = panel.scrollHeight + "px";
        });
      });
      const cleanup = (evt) => {
        if (evt.propertyName !== "max-height") return;
        panel.style.maxHeight = "";
        panel.removeEventListener("transitionend", cleanup);
      };
      panel._faqCleanup = cleanup;
      panel.addEventListener("transitionend", cleanup);
    }
  });
});

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  document.querySelectorAll("main > section:not(:first-of-type)").forEach((el) => {
    el.classList.add("reveal");
  });

  document
    .querySelectorAll(".process__list, .pricing__industries-grid")
    .forEach((el) => {
      el.classList.add("reveal-stagger");
    });

  document
    .querySelectorAll(".case-study__grid, .pricing__breakdown-sequence")
    .forEach((el) => {
      el.classList.add("reveal-sequence");
    });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  document.querySelectorAll(".reveal, .reveal-stagger, .reveal-sequence").forEach((el) => {
    revealObserver.observe(el);
  });
}
