
// Google Analytics (free GA4): visitor and page-view tracking.
(function loadFindMyPetAnalytics() {
  if (window.__findMyPetAnalyticsLoaded) return;
  window.__findMyPetAnalyticsLoaded = true;

  const measurementId = "G-1KW8WQV6WB";
  const analyticsScript = document.createElement("script");
  analyticsScript.async = true;
  analyticsScript.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
  document.head.appendChild(analyticsScript);

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((error) => console.error("PWA service worker registration failed:", error));
  });
}
