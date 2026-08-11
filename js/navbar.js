
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

// Load the shared responsive navbar stylesheet on every page.
if (!document.querySelector('link[data-navbar-styles]')) {
  const navbarStyles = document.createElement("link");
  navbarStyles.rel = "stylesheet";
  navbarStyles.href = "/css/navbar.css?v=1";
  navbarStyles.dataset.navbarStyles = "true";
  document.head.appendChild(navbarStyles);
}

// ==========================================
// FindMyPet India - Shared Protected Navbar
// Desktop same, mobile hamburger menu
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {
  const siteHeader = document.getElementById("siteHeader");

  if (!siteHeader) {
    return;
  }

  const insidePagesFolder =
    window.location.pathname.includes("/pages/");

  const homeLink = "/";
  const pagesLink = insidePagesFolder ? "" : "pages/";

  const currentPage =
    window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();

  function activeClass(pageName) {
    if (
      pageName === "home" &&
      (currentPage === "" || currentPage === "index.html")
    ) {
      return "active";
    }

    return currentPage === pageName ? "active" : "";
  }

  // Supabase check
  if (typeof supabaseClient === "undefined") {
    console.error("Supabase client is not available.");
    return;
  }

  // Login session check
  try {
    const { data, error } =
      await supabaseClient.auth.getSession();

    if (error) {
      throw error;
    }

    if (!data.session) {
      window.location.replace("/pages/login.html");
      return;
    }
  } catch (error) {
    console.error("Navbar session check error:", error);
    window.location.replace("/pages/login.html");
    return;
  }

  siteHeader.className = "site-header";

  siteHeader.innerHTML = `
    <nav class="navbar">

      <a href="${homeLink}" class="logo">
        <span class="logo-icon">🐶</span>

        <span>
          FindMyPet <b>India</b>
        </span>
      </a>

      <button
        type="button"
        class="mobile-menu-button"
        id="mobileMenuButton"
        aria-label="Open navigation menu"
        aria-expanded="false"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>

      <div class="navbar-content" id="navbarContent">

        <div class="mobile-menu-header">

          <a href="${homeLink}" class="mobile-menu-logo">
            <span>🐶</span>
            <strong>FindMyPet India</strong>
          </a>

          <button
            type="button"
            class="mobile-menu-close"
            id="mobileMenuClose"
            aria-label="Close navigation menu"
          >
            ×
          </button>

        </div>

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
            <a
              href="${pagesLink}ngos.html"
              class="${activeClass("ngos.html")}"
            >
              NGOs
            </a>
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

      </div>

    </nav>
  `;

  // ======================================
  // MOBILE MENU
  // ======================================

  const mobileMenuButton =
    document.getElementById("mobileMenuButton");

  const mobileMenuClose =
    document.getElementById("mobileMenuClose");

  const navbarContent =
    document.getElementById("navbarContent");

  const mobileMenuOverlay =
    document.getElementById("mobileMenuOverlay");

  function openMobileMenu() {
    navbarContent.classList.add("mobile-menu-open");
    mobileMenuOverlay.classList.add("mobile-menu-overlay-open");
    mobileMenuButton.classList.add("menu-button-active");
    mobileMenuButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("mobile-menu-body-lock");
  }

  function closeMobileMenu() {
    navbarContent.classList.remove("mobile-menu-open");
    mobileMenuOverlay.classList.remove("mobile-menu-overlay-open");
    mobileMenuButton.classList.remove("menu-button-active");
    mobileMenuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("mobile-menu-body-lock");
  }

  if (mobileMenuButton) {
    mobileMenuButton.addEventListener(
      "click",
      function () {
        const menuIsOpen =
          navbarContent.classList.contains("mobile-menu-open");

        if (menuIsOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      }
    );
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener(
      "click",
      closeMobileMenu
    );
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener(
      "click",
      closeMobileMenu
    );
  }

  navbarContent
    .querySelectorAll("a")
    .forEach(function (link) {
      link.addEventListener(
        "click",
        closeMobileMenu
      );
    });

  window.addEventListener(
    "resize",
    function () {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    }
  );

  document.addEventListener(
    "keydown",
    function (event) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    }
  );

  // ======================================
  // LOGOUT
  // ======================================

  const logoutButton =
    document.getElementById("navbarLogoutButton");

  if (!logoutButton) {
    return;
  }

  logoutButton.addEventListener(
    "click",
    async function () {
      logoutButton.disabled = true;
      logoutButton.textContent = "Logging out...";

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
        console.error("Logout error:", error);

        alert(
          error.message ||
          "Logout nahi ho saka."
        );

        logoutButton.disabled = false;
        logoutButton.textContent = "Logout";
      }
    }
  );
});