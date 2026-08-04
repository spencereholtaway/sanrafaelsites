/*
 * Single source of truth for San Rafael Sites pricing.
 * Change a rate or the flat package discount here and it updates
 * everywhere: the homepage pricing list and every industry package
 * card + itemized breakdown, computed at page load.
 */
window.SRS_PRICING = {
  rates: {
    homepage: 999,
    page: 300,
    cms: 250,
    integration: 250,
  },
  packageDiscount: 300,
};

(function () {
  const { rates, packageDiscount } = window.SRS_PRICING;
  const money = (n) => "$" + n.toLocaleString("en-US");

  // Homepage pricing list: <span data-rate="page">
  document.querySelectorAll("[data-rate]").forEach((el) => {
    const key = el.getAttribute("data-rate");
    if (rates[key] !== undefined) el.textContent = money(rates[key]);
  });

  // Industry package cards: <div data-pkg data-pages="5" data-cms="1" data-integrations="1" data-integration-label="Online booking">
  document.querySelectorAll("[data-pkg]").forEach((pkg) => {
    const pages = parseInt(pkg.getAttribute("data-pages"), 10) || 1;
    const hasCms = pkg.getAttribute("data-cms") === "1";
    const integrations = parseInt(pkg.getAttribute("data-integrations"), 10) || 0;
    const integrationLabel = pkg.getAttribute("data-integration-label") || "Integration";

    const additionalPages = pages - 1;
    const pagesCost = additionalPages * rates.page;
    const cmsCost = hasCms ? rates.cms : 0;
    const integrationsCost = integrations * rates.integration;

    const itemized = rates.homepage + pagesCost + cmsCost + integrationsCost;
    const total = itemized - packageDiscount;

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
        `<li class="pricing__breakdown-discount"><span class="pricing__addon-name">Package discount</span><span class="pricing__addon-price">&minus;${money(packageDiscount)}</span></li>`;
    }

    // Inline copy placeholders, e.g. <span data-pkg-itemized></span> and <span data-pkg-discount></span>
    document.querySelectorAll("[data-pkg-itemized]").forEach((el) => (el.textContent = money(itemized)));
    document.querySelectorAll("[data-pkg-discount]").forEach((el) => (el.textContent = money(packageDiscount)));
  });
})();
