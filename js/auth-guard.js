// FindMyPet India - protected page gate
(function () {
  document.documentElement.classList.add("auth-checking");

  function redirectToLogin() {
    const requestedPath =
      window.location.pathname +
      window.location.search +
      window.location.hash;

    const loginUrl = new URL(
      "/pages/login.html",
      window.location.origin
    );

    loginUrl.searchParams.set("next", requestedPath);
    window.location.replace(loginUrl.toString());
  }

  function verifySession() {
    try {
      if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
      ) {
        redirectToLogin();
        return;
      }

      const client = window.supabase.createClient(
        "https://vrhaagzkeyzlblgjgidg.supabase.co",
        "sb_publishable_6qEYBNFz3SddtxvOxiCLGg__NAMfQS1"
      );

      client.auth
        .getSession()
        .then(function (result) {
          const session =
            result &&
            result.data &&
            result.data.session;

          if (result.error || !session) {
            redirectToLogin();
            return;
          }

          document.documentElement.classList.remove(
            "auth-checking"
          );
        })
        .catch(function (error) {
          console.warn(
            "Protected page access check failed:",
            error
          );
          redirectToLogin();
        });
    } catch (error) {
      console.warn(
        "Protected page access check failed:",
        error
      );
      redirectToLogin();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      verifySession,
      { once: true }
    );
  } else {
    verifySession();
  }
})();