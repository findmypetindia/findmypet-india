// ==========================================
// FindMyPet India - Homepage Login Gate
// Signed-out visitors use the real login page,
// so the design stays identical everywhere.
// ==========================================

(function () {
  const loginUrl = "/pages/login.html?next=%2Findex.html";

  function revealHomepage() {
    const prepaintStyle = document.getElementById("homepageAuthPrepaint");

    if (prepaintStyle) {
      prepaintStyle.remove();
    }

    if (document.body) {
      document.body.style.visibility = "visible";
    }
  }

  function goToLogin() {
    window.location.replace(loginUrl);
  }

  async function checkHomepageSession() {
    if (typeof supabaseClient === "undefined") {
      goToLogin();
      return;
    }

    try {
      const { data, error } = await supabaseClient.auth.getSession();

      if (error) {
        throw error;
      }

      if (!data?.session) {
        goToLogin();
        return;
      }

      revealHomepage();
    } catch (error) {
      console.warn("Homepage session check error:", error);
      goToLogin();
    }
  }

  checkHomepageSession();
})();
