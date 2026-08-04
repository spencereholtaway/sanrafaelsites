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
 * Change a number here and it updates the homepage pricing list, every
 * industry package's contents + pricing breakdown, the strikethrough
 * "usual" price, and the pre-filled "get in touch" email — all at once.
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
  contactEmail: "sanrafaelsites@holtawaydesign.com",
};

(function () {
  const { rates, descriptions, packages, contactEmail } = window.SRS_PRICING;
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

  // Industry package breakdowns. Only one package per page is assumed
  // throughout this file, so placeholders are matched document-wide.
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

    // Build a plain list of {label, cost} line items once, then derive
    // both the on-page breakdown and the emailed breakdown from it —
    // so the two can never drift apart.
    const items = [{ label: pageNames[0], cost: rates.homepage, caption: descriptions.homepage }];
    const additionalPageNames = pageNames.slice(1);
    if (additionalPageNames.length > 0) {
      items.push({
        label: `${additionalPageNames.length} Additional Page${additionalPageNames.length === 1 ? "" : "s"}`,
        cost: additionalPageNames.length * rates.page,
        caption: `${money(rates.page)}/ea — ${additionalPageNames.join(", ")}`,
      });
    }
    if (hasCms) items.push({ label: "CMS setup", cost: rates.cms, caption: descriptions.cms });
    if (integrations > 0) {
      items.push({
        label: `${integrations} ${integrationLabel.toLowerCase()}${integrations === 1 ? "" : "s"}`,
        cost: integrations * rates.integration,
        caption: integrationCaption,
      });
    }

    const itemized = items.reduce((sum, item) => sum + item.cost, 0);
    const discountAmount = itemized * (discountPercent / 100);
    const total = itemized - discountAmount;

    document.querySelectorAll("[data-pkg-price]").forEach((el) => (el.textContent = money(total)));

    let rows = items.map((item) => row(item.label, item.cost, item.caption)).join("");
    rows += `<li class="pricing__breakdown-subtotal"><span class="pricing__addon-name">Itemized total</span><span class="pricing__addon-price">${money(itemized)}</span></li>`;
    if (discountPercent > 0) {
      rows += `<li class="pricing__breakdown-discount"><span class="pricing__addon-name">Package discount (${discountPercent}%)</span><span class="pricing__addon-price">&minus;${money(discountAmount)}</span></li>`;
    }
    rows += `<li class="pricing__breakdown-final"><span class="pricing__addon-name">Package price</span><span class="pricing__addon-price">${money(total)}</span></li>`;
    pkg.innerHTML = rows;

    // Inline copy placeholders, e.g.:
    // <span data-pkg-itemized></span>, <span data-pkg-discount></span>,
    // <span data-pkg-discount-percent></span>
    document.querySelectorAll("[data-pkg-itemized]").forEach((el) => (el.textContent = money(itemized)));
    document.querySelectorAll("[data-pkg-discount]").forEach((el) => (el.textContent = money(discountAmount)));
    document.querySelectorAll("[data-pkg-discount-percent]").forEach((el) => (el.textContent = discountPercent + "%"));

    // "Get in touch" mailto link, pre-filled with subject + an
    // email-friendly plain-text breakdown of the same line items.
    // <a data-pkg-mailto data-pkg-name="Dental & Medical Package">
    const mailtoEl = document.querySelector("[data-pkg-mailto]");
    if (mailtoEl) {
      const pkgName = mailtoEl.getAttribute("data-pkg-name") || "package";
      const subject = `Interested in the ${pkgName}`;
      const bodyLines = [
        `I'm interested in your ${pkgName}.`,
        "",
        "Here's the breakdown I saw on your site:",
        ...items.map((item) => `- ${item.label}: ${money(item.cost)}`),
        "",
        `Itemized total: ${money(itemized)}`,
        `Package discount (${discountPercent}%): -${money(discountAmount)}`,
        `Package price: ${money(total)}`,
        "",
        "Looking forward to hearing from you!",
      ];
      const body = bodyLines.join("\n");
      mailtoEl.href =
        `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  });
})();
