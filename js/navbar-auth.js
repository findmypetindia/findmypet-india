document.addEventListener(
  "DOMContentLoaded",
  async function () {
    const guestActions =
      document.getElementById("guestActions");

    const userActions =
      document.getElementById("userActions");

    const logoutButton =
      document.getElementById("logoutButton");

    if (!guestActions || !userActions) {
      console.error(
        "Navbar guestActions ya userActions nahi mile."
      );
      return;
    }

    try {
      const { data, error } =
        await supabaseClient.auth.getSession();

      if (error) {
        throw error;
      }

      const isLoggedIn =
        Boolean(data.session);

      if (isLoggedIn) {
        guestActions.style.display = "none";
        userActions.style.display = "flex";
      } else {
        guestActions.style.display = "flex";
        userActions.style.display = "none";
      }

    } catch (error) {
      console.error(
        "Navbar session error:",
        error
      );

      guestActions.style.display = "flex";
      userActions.style.display = "none";
    }

    if (logoutButton) {
      logoutButton.addEventListener(
        "click",
        async function () {
          logoutButton.disabled = true;
          logoutButton.textContent =
            "Logging out...";

          try {
            const { error } =
              await supabaseClient.auth.signOut();

            if (error) {
              throw error;
            }

            window.location.replace(
              "/pages/login.html"
            );

          } catch (error) {
            console.error(
              "Logout error:",
              error
            );

            logoutButton.disabled = false;
            logoutButton.textContent =
              "Logout";
          }
        }
      );
    }
  }
);