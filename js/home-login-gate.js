// ==========================================
// FindMyPet India - Homepage Login Gate
// Signed-out visitors use the real login page,
// so the design stays identical everywhere.
// ==========================================

(function () {
  async function checkHomepageSession() {
    const loginUrl = "/pages/login.html?next=%2Findex.html";

    if (typeof supabaseClient === "undefined") {
      window.location.replace(loginUrl);
      return;
    }

    try {
      const { data, error } = await supabaseClient.auth.getSession();

      if (error) {
        throw error;
      }

      if (!data?.session) {
        window.location.replace(loginUrl);
      }
    } catch (error) {
      console.warn("Homepage session check error:", error);
      window.location.replace(loginUrl);
    }
  }

  checkHomepageSession();
})();
