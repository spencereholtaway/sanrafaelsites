/*
 * Custom GA4 click tracking, layered on top of the base gtag.js snippet
 * in <head>. Page views, scroll depth, and outbound-link clicks are
 * already covered by GA4's built-in Enhanced Measurement — this file
 * only adds events for on-site interactions that matter for this
 * business (which CTA, which package, which industry card) that GA4
 * wouldn't otherwise distinguish.
 */
(function () {
  function track(name, params) {
    if (typeof gtag === "function") gtag("event", name, params || {});
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a, button");
    if (!link) return;

    if (link.matches(".hero__actions .btn--primary")) {
      track("cta_start_project");
    } else if (link.matches(".hero__actions .btn--ghost")) {
      track("cta_see_work");
    } else if (link.matches(".industry-hero__actions .btn--primary")) {
      track("cta_get_in_touch_hero");
    } else if (link.matches(".industry-hero__actions .btn--ghost")) {
      track("cta_see_pricing");
    } else if (link.closest(".pricing__industry-card")) {
      const card = link.closest(".pricing__industry-card");
      const pkg = card.querySelector("[data-pkg-id]");
      track("industry_card_click", { industry: pkg ? pkg.getAttribute("data-pkg-id") : "" });
    } else if (link.matches(".promo-banner__inner")) {
      track("promo_banner_click");
    } else if (link.matches(".case-study__more .btn--ghost")) {
      track("cta_see_all_projects");
    } else if ((link.getAttribute("href") || "").indexOf("mailto:") === 0) {
      track("cta_mailto_click", { package: link.getAttribute("data-pkg-name") || "" });
    }
  });
})();
