/*
 * Makes the "I Spotted This Pet" action visible on every LOST report card.
 * It also supports cards that are rendered after the page has loaded.
 */
(function () {
  "use strict";

  const LABEL = "I Spotted This Pet";

  function isLostCard(card) {
    return Boolean(
      card.querySelector(
        ".tag.lost, .status-badge.lost, [data-report-type='lost']"
      )
    );
  }

  function makeSightingHref(detailsLink) {
    const href = detailsLink?.getAttribute("href") || "";

    if (!href) {
      return "#";
    }

    if (/[?&]spotted=1(?:&|$)/.test(href)) {
      return href;
    }

    return href + (href.includes("?") ? "&" : "?") + "spotted=1";
  }

  function addSightingAction(card) {
    if (!isLostCard(card)) {
      return;
    }

    const actions = card.querySelector(
      ".pet-card-actions, .ai-result-actions"
    );

    if (!actions) {
      return;
    }

    const detailsLink = actions.querySelector(
      "a.details-btn, a[href*='pet.html?id=']"
    );

    let sightingButton = actions.querySelector(".sighting-btn");

    if (!sightingButton) {
      sightingButton = document.createElement("a");
      sightingButton.className =
        "pet-action-btn sighting-btn visible-sighting-action";

      const firstContactAction = actions.querySelector(
        ".call-btn, .whatsapp-btn"
      );

      if (firstContactAction) {
        actions.insertBefore(sightingButton, firstContactAction);
      } else {
        actions.appendChild(sightingButton);
      }
    }

    sightingButton.textContent = LABEL;
    sightingButton.setAttribute("aria-label", LABEL);
    sightingButton.href = makeSightingHref(detailsLink);
  }

  function enhanceAllCards() {
    document
      .querySelectorAll(".pet-card, .match-card")
      .forEach(addSightingAction);
  }

  document.addEventListener("DOMContentLoaded", function () {
    enhanceAllCards();

    const observer = new MutationObserver(enhanceAllCards);

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.setTimeout(enhanceAllCards, 500);
    window.setTimeout(enhanceAllCards, 1500);
  });
})();
