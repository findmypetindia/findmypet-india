// ==========================================
// FindMyPet India - Public Homepage Gate
// The homepage must stay crawlable for Google/SEO.
// Protected pages and report actions still enforce login
// through auth-guard.js and Supabase RLS policies.
// ==========================================

(function () {
  function revealHomepage() {
    const prepaintStyle = document.getElementById("homepageAuthPrepaint");

    if (prepaintStyle) {
      prepaintStyle.remove();
    }

    if (document.body) {
      document.body.style.visibility = "visible";
    }
  }

  // Never redirect the public homepage to the login page.
  // This lets Google crawl the canonical homepage and favicon.
  revealHomepage();
})();
