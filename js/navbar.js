// ==========================================
// FindMyPet India - Shared Protected Navbar
// Only logged-in users can access the website
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  async function () {
    const siteHeader =
      document.getElementById("siteHeader");

    if (!siteHeader) {
      return;
    }

    // Check whether current HTML file is inside /pages/
    const insidePagesFolder =
      window.location.pathname.includes("/pages/");

    // Homepage is at project root
    const homeLink = "/";

    // Links from root and pages folder need different paths
    const pagesLink =
      insidePagesFolder ? "" : "pages/";

    const currentPage =
      window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    // Active navbar link class
    function activeClass(pageName) {
      if (
        pageName === "home" &&
        (
          currentPage === "" ||
          currentPage === "index.html"
        )
      ) {
        return "active";
      }

      return currentPage === pageName
        ? "active"
        : "";
    }

    // Supabase must load before navbar.js
    if (
      typeof supabaseClient === "undefined"
    ) {
      console.error(
        "Supabase client is not available."
      );

      return;
    }

    // ======================================
    // CHECK LOGIN SESSION
    // ======================================

    try {
      const { data, error } =
        await supabaseClient.auth.getSession();

      if (error) {
        throw error;
      }

      // No login session: send user to login page
      if (!data.session) {
        window.location.replace(
          "/pages/login.html"
        );

        return;
      }

    } catch (error) {
      console.error(
        "Navbar session check error:",
        error
      );

      window.location.replace(
        "/pages/login.html"
      );

      return;
    }

    // ======================================
    // CREATE NAVBAR
    // ======================================

    siteHeader.className = "site-header";

    siteHeader.innerHTML = `
      <nav class="navbar">

        <a href="${homeLink}" class="logo">
          <span class="logo-icon">🐶</span>

          <span>
            FindMyPet <b>India</b>
          </span>
        </a>

        <ul class="nav-links">

          <li>
            <a
              href="${homeLink}"
              class="${activeClass("home")}"
            >
              Home
            </a>
          </li>

          <li>
            <a
              href="${pagesLink}lost.html"
              class="${activeClass("lost.html")}"
            >
              Lost Pets
            </a>
          </li>

          <li>
            <a
              href="${pagesLink}found.html"
              class="${activeClass("found.html")}"
            >
              Found Pets
            </a>
          </li>

          <li>
            <a
              href="${pagesLink}ai-search.html"
              class="${activeClass("ai-search.html")}"
            >
              AI Search
            </a>
          </li>

          <li>
           <a
  href="${pagesLink}success-stories.html"
  class="${activeClass("success-stories.html")}"
>
  Success Stories
</a>
          </li>

          <li>
        <a href="/pages/ngos.html">NGOs</a>
          </li>

          <li>
            <a
  href="${pagesLink}about.html"
  class="${activeClass("about.html")}"
>
  About
</a>
          </li>

        </ul>

        <div class="nav-actions">

          <a
            href="${pagesLink}dashboard.html"
            class="btn btn-dashboard ${activeClass("dashboard.html")}"
          >
            My Dashboard
          </a>

          <button
            type="button"
            class="btn btn-light"
            id="navbarLogoutButton"
          >
            Logout
          </button>

        </div>

      </nav>
    `;

    // ======================================
    // LOGOUT
    // ======================================

    const logoutButton =
      document.getElementById(
        "navbarLogoutButton"
      );

    if (!logoutButton) {
      return;
    }

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

          alert(
            error.message ||
            "Logout nahi ho saka."
          );

          logoutButton.disabled = false;

          logoutButton.textContent =
            "Logout";
        }
      }
    );
  }
);