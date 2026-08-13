// FindMyPet India - protected page gate
(async function () {
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

    const { data, error } =
      await client.auth.getSession();

    if (error || !data.session) {
      redirectToLogin();
      return;
    }

    document.documentElement.classList.remove("auth-checking");
  } catch (error) {
    console.warn("Protected page access check failed:", error);
    redirectToLogin();
  }
})();