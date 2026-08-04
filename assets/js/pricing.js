/*
 * Single source of truth for San Rafael Sites pricing.
 *
 * - `rates` are the four shared per-item prices, used everywhere
 *   (the homepage pricing list and every industry package's math).
 * - `packages` holds a discount PERCENTAGE per industry package,
 *   keyed by the slug used in each page's data-pkg-id attribute.
 *   It's applied to that package's itemized total.
 *
 * Change a number here and it updates the homepage pricing list and
 * every industry package card + itemized breakdown at page load.
 */
window.SRS_PRICING = {
  rates: {
    homepage: 999,
    page: 300,
    cms: 250,
    integration: 250,
  },
  packages: {
    "dental-medical": { discountPercent: 10 },
    "contractors": { discountPercent: 10 },
    "salons": { discountPercent: 10 },
    "restaurants": { discountPercent: 10 },
    "community-education": { discountPercent: 15 },
  },
};

(function () {
  const { rates, packages } = window.SRS_PRICING;
  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

  // Homepage pricing list: <span data-rate="page">
  document.querySelectorAll("[data-rate]").forEach((el) => {
    const key = el.getAttribute("data-rate");
    if (rates[key] !== undefined) el.textContent = money(rates[key]);
  });

  // Industry package cards:
  // <div data-pkg data-pkg-id="dental-medical" data-pages="5" data-cms="1"
  //      data-integrations="1" data-integration-label="Online booking">
  document.querySelectorAll("[data-pkg]").forEach((pkg) => {
    const pkgId = pkg.getAttribute("data-pkg-id");
    const discountPercent = (packages[pkgId] && packages[pkgId].discountPercent) || 0;

    const pages = parseInt(pkg.getAttribute("data-pages"), 10) || 1;
    const hasCms = pkg.getAttribute("data-cms") === "1";
    const integrations = parseInt(pkg.getAttribute("data-integrations"), 10) || 0;
    const integrationLabel = pkg.getAttribute("data-integration-label") || "Integration";

    const additionalPages = pages - 1;
    const pagesCost = additionalPages * rates.page;
    const cmsCost = hasCms ? rates.cms : 0;
    const integrationsCost = integrations * rates.integration;

    const itemized = rates.homepage + pagesCost + cmsCost + integrationsCost;
    const discountAmount = itemized * (discountPercent / 100);
    const total = itemized - discountAmount;

    const priceEl = pkg.querySelector("[data-pkg-price]");
    if (priceEl) priceEl.textContent = money(total);

    // Itemized breakdown list, expected as the next sibling: <ul data-pkg-breakdown>
    const breakdown = pkg.nextElementSibling && pkg.nextElementSibling.matches("[data-pkg-breakdown]")
      ? pkg.nextElementSibling
      : null;

    if (breakdown) {
      const rows = [
        ["Homepage", rates.homepage],
        [`${additionalPages} additional page${additionalPages === 1 ? "" : "s"}`, pagesCost],
      ];
      if (hasCms) rows.push(["CMS setup", cmsCost]);
      if (integrations > 0) {
        rows.push([`${integrations} ${integrationLabel.toLowerCase()}${integrations === 1 ? "" : "s"}`, integrationsCost]);
      }

      breakdown.innerHTML =
        rows.map(([label, cost]) =>
          `<li><span class="pricing__addon-name">${label}</span><span class="pricing__addon-price">${money(cost)}</span></li>`
        ).join("") +
        `<li class="pricing__breakdown-subtotal"><span class="pricing__addon-name">Itemized total</span><span class="pricing__addon-price">${money(itemized)}</span></li>` +
        (discountPercent > 0
          ? `<li class="pricing__breakdown-discount"><span class="pricing__addon-name">Package discount (${discountPercent}%)</span><span class="pricing__addon-price">&minus;${money(discountAmount)}</span></li>`
          : "");
    }

    // Inline copy placeholders scoped to this package's section, e.g.:
    // <span data-pkg-itemized></span>, <span data-pkg-discount></span>,
    // <span data-pkg-discount-percent></span>
    const scope = pkg.closest("section") || document;
    scope.querySelectorAll("[data-pkg-itemized]").forEach((el) => (el.textContent = money(itemized)));
    scope.querySelectorAll("[data-pkg-discount]").forEach((el) => (el.textContent = money(discountAmount)));
    scope.querySelectorAll("[data-pkg-discount-percent]").forEach((el) => (el.textContent = discountPercent + "%"));
  });
})();
