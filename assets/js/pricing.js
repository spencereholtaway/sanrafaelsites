/*
 * Single source of truth for San Rafael Sites pricing.
 *
 * - `rates` are the four shared per-item prices, used everywhere
 *   (the homepage pricing list and every industry package's math).
 * - `descriptions` are the shared captions for the Home and CMS rows
 *   in every package breakdown (the integration caption is
 *   industry-specific and set per page via data-integration-caption).
 * - `packages` holds a discount PERCENTAGE per industry package,
 *   keyed by the slug used in each page's data-pkg-id attribute.
 *   It's applied to that package's itemized total.
 *
 * Change a number here and it updates the homepage pricing list and
 * every industry package's combined contents + pricing breakdown.
 */
window.SRS_PRICING = {
  rates: {
    homepage: 999,
    page: 300,
    cms: 250,
    integration: 250,
  },
  descriptions: {
    homepage: "Where new visitors decide whether to keep looking or reach out.",
    cms: "Update your own content — no developer required.",
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
  const { rates, descriptions, packages } = window.SRS_PRICING;
  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

  // Homepage pricing list: <span data-rate="page">
  document.querySelectorAll("[data-rate]").forEach((el) => {
    const key = el.getAttribute("data-rate");
    if (rates[key] !== undefined) el.textContent = money(rates[key]);
  });

  const row = (label, cost, caption) =>
    `<li><div><span class="pricing__addon-name">${label}</span>` +
    (caption ? `<span class="pricing__breakdown-caption">${caption}</span>` : "") +
    `</div><span class="pricing__addon-price">${money(cost)}</span></li>`;

  // Industry package breakdowns:
  // <ul data-pkg data-pkg-id="dental-medical"
  //     data-pages-list="Home, Services, Meet the Doctor, New Patients, Contact"
  //     data-cms="1" data-integrations="1" data-integration-label="Online booking"
  //     data-integration-caption="Patients can book an appointment directly from your site.">
  document.querySelectorAll("[data-pkg]").forEach((pkg) => {
    const pkgId = pkg.getAttribute("data-pkg-id");
    const discountPercent = (packages[pkgId] && packages[pkgId].discountPercent) || 0;

    const pageNames = (pkg.getAttribute("data-pages-list") || "Home")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const hasCms = pkg.getAttribute("data-cms") === "1";
    const integrations = parseInt(pkg.getAttribute("data-integrations"), 10) || 0;
    const integrationLabel = pkg.getAttribute("data-integration-label") || "Integration";
    const integrationCaption = pkg.getAttribute("data-integration-caption") || "";

    const additionalPages = pageNames.length - 1;
    const pagesCost = additionalPages * rates.page;
    const cmsCost = hasCms ? rates.cms : 0;
    const integrationsCost = integrations * rates.integration;

    const itemized = rates.homepage + pagesCost + cmsCost + integrationsCost;
    const discountAmount = itemized * (discountPercent / 100);
    const total = itemized - discountAmount;

    const scope = pkg.closest("section") || document;
    scope.querySelectorAll("[data-pkg-price]").forEach((el) => (el.textContent = money(total)));

    let rows = row(pageNames[0], rates.homepage, descriptions.homepage);
    pageNames.slice(1).forEach((name) => (rows += row(name, rates.page)));
    if (hasCms) rows += row("CMS setup", cmsCost, descriptions.cms);
    if (integrations > 0) {
      rows += row(
        `${integrations} ${integrationLabel.toLowerCase()}${integrations === 1 ? "" : "s"}`,
        integrationsCost,
        integrationCaption
      );
    }
    rows += `<li class="pricing__breakdown-subtotal"><span class="pricing__addon-name">Itemized total</span><span class="pricing__addon-price">${money(itemized)}</span></li>`;
    if (discountPercent > 0) {
      rows += `<li class="pricing__breakdown-discount"><span class="pricing__addon-name">Package discount (${discountPercent}%)</span><span class="pricing__addon-price">&minus;${money(discountAmount)}</span></li>`;
    }
    pkg.innerHTML = rows;

    // Inline copy placeholders scoped to this package's section, e.g.:
    // <span data-pkg-itemized></span>, <span data-pkg-discount></span>,
    // <span data-pkg-discount-percent></span>
    scope.querySelectorAll("[data-pkg-itemized]").forEach((el) => (el.textContent = money(itemized)));
    scope.querySelectorAll("[data-pkg-discount]").forEach((el) => (el.textContent = money(discountAmount)));
    scope.querySelectorAll("[data-pkg-discount-percent]").forEach((el) => (el.textContent = discountPercent + "%"));
  });
})();
