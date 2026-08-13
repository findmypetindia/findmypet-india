/*
 * Adds the "I Spotted This Pet" action to LOST report cards.
 * This script deliberately runs only once after cards finish rendering.
 */
(function () {
  "use strict";

  const LABEL = "I Spotted This Pet";

  function isLostCard(card) {
    return Boolean(
      card.querySelector(".tag.lost, .status-badge.lost")
    );
  }

  function addSightingAction(card) {
    if (!isLostCard(card)) return;

    const actions = card.querySelector(
      ".pet-card-actions, .ai-result-actions"
    );

    if (!actions || actions.querySelector(".sighting-btn")) return;

    const detailsLink = actions.querySelector(
      "a.details-btn, a[href*='pet.html?id=']"
    );

    if (!detailsLink) return;

    const button = document.createElement("a");
    const href = detailsLink.getAttribute("href") || "";

    button.className =
      "pet-action-btn sighting-btn visible-sighting-action";
    button.textContent = LABEL;
    button.setAttribute("aria-label", LABEL);
    button.href =
      href + (href.includes("?") ? "&" : "?") + "spotted=1";

    const contactAction = actions.querySelector(
      ".call-btn, .whatsapp-btn"
    );

    if (contactAction) {
      actions.insertBefore(button, contactAction);
    } else {
      actions.appendChild(button);
    }
  }

  function enhanceCards() {
    document
      .querySelectorAll(".pet-card, .match-card")
      .forEach(addSightingAction);
  }

  document.addEventListener("DOMContentLoaded", function () {
    window.setTimeout(enhanceCards, 400);
    window.setTimeout(enhanceCards, 1200);
  });
})();
