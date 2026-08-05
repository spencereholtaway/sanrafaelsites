const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navDropdown = document.getElementById("navDropdown");
const dropdownToggle = document.getElementById("dropdownToggle");

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

document.getElementById("year").textContent = new Date().getFullYear();
