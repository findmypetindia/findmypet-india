// Load the shared responsive navbar stylesheet on every page.
if (!document.querySelector('link[data-navbar-styles]')) {
  const navbarStyles = document.createElement("link");
  navbarStyles.rel = "stylesheet";
  navbarStyles.href = "/css/navbar.css?v=4";
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

  // Render navigation immediately; network checks run after the menu is ready.
  const accountAction = `
          <a href="${pagesLink}login.html"
             class="btn btn-dashboard ${activeClass("login.html")}">Log In</a>
      `;

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
        ☰
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

          <li id="lostPetsNavItem">
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
              href="${pagesLink}animal-rescue.html"
              class="${activeClass("animal-rescue.html")}"
            >
              Animal Rescue <span class="nav-status nav-status-new">NEW</span>
            </a>
          </li>

          <li>
            <a
              href="${pagesLink}rescue-partners.html"
              class="${activeClass("rescue-partners.html")}"
            >
              Rescue Partners <span class="nav-status nav-status-soon">COMING SOON</span>
            </a>
          </li>

          <li>
            <a
              href="${pagesLink}rescue-partner.html"
              class="${activeClass("rescue-partner.html")}"
            >
              Become a Partner <span class="nav-status nav-status-open">APPLY NOW</span>
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
          ${accountAction}
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

  function setMobileMenuButtonVisibility() {
    if (!mobileMenuButton) return;
    if (window.innerWidth <= 767) {
      mobileMenuButton.style.setProperty("display", "inline-flex", "important");
      mobileMenuButton.style.setProperty("visibility", "visible", "important");
      mobileMenuButton.style.setProperty("opacity", "1", "important");
      mobileMenuButton.style.setProperty("align-items", "center", "important");
      mobileMenuButton.style.setProperty("justify-content", "center", "important");
      mobileMenuButton.style.setProperty("flex", "0 0 46px", "important");
      mobileMenuButton.style.setProperty("width", "46px", "important");
      mobileMenuButton.style.setProperty("height", "46px", "important");
      mobileMenuButton.style.setProperty("margin-left", "auto", "important");
      mobileMenuButton.style.setProperty("font-size", "27px", "important");
      mobileMenuButton.style.setProperty("line-height", "1", "important");
      mobileMenuButton.style.setProperty("color", "#172033", "important");
      mobileMenuButton.style.setProperty("background", "#ffffff", "important");
      mobileMenuButton.style.setProperty("border", "1px solid #dbe3f0", "important");
      mobileMenuButton.textContent = navbarContent.classList.contains("mobile-menu-open") ? "×" : "☰";
    } else {
      mobileMenuButton.style.removeProperty("display");
      mobileMenuButton.textContent = "";
    }
  }

  setMobileMenuButtonVisibility();

  function openMobileMenu() {
    navbarContent.classList.add("mobile-menu-open");
    mobileMenuButton.textContent = "×";
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
    mobileMenuButton.textContent = "☰";
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
      if (window.innerWidth > 767) {
        closeMobileMenu();
      }
      setMobileMenuButtonVisibility();
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

  // Refresh account controls in the background after the navbar is visible.
  async function refreshAccountNavigation() {
    if (typeof supabaseClient === "undefined") {
      console.error("Supabase client is not available.");
      return;
    }

    let currentSession = null;
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) throw error;
      currentSession = data.session || null;
    } catch (error) {
      console.warn("Navbar session check error:", error);
    }
    if (!currentSession) return;

    const navActions = document.querySelector("#navbarContent .nav-actions");
    if (navActions) {
      navActions.innerHTML = `
        <a href="${pagesLink}dashboard.html"
           class="btn btn-dashboard ${activeClass("dashboard.html")}">My Dashboard</a>
        <button type="button" class="btn btn-light" id="navbarLogoutButton">Logout</button>
      `;
    }

    // Admin permission check is independent and cannot delay the menu.
    try {
      const { data: adminCheck, error: adminCheckError } =
        await supabaseClient.functions.invoke("animal-rescue-admin", {
          body: { action: "list" }
        });
      if (!adminCheckError && adminCheck && adminCheck.ok === true) {
        const navLinks = document.querySelector("#navbarContent .nav-links");
        if (navLinks && !document.getElementById("navbarAdminLink")) {
          const item = document.createElement("li");
          item.id = "navbarAdminLink";
          item.innerHTML = `<a href="${pagesLink}rescue-admin.html"
            class="${activeClass("rescue-admin.html")}">🔒 Admin Panel</a>`;
          const about = Array.from(navLinks.querySelectorAll("a"))
            .find(link => link.getAttribute("href") === `${pagesLink}about.html`);
          navLinks.insertBefore(item, about ? about.parentElement : null);
          item.querySelector("a").addEventListener("click", closeMobileMenu);
        }
      }
    } catch (error) {
      console.warn("Admin navbar access check:", error);
    }
  }

  // Delegated listener handles Logout even though it is added asynchronously.
  const navActionsContainer = document.querySelector("#navbarContent .nav-actions");
  if (navActionsContainer) {
    navActionsContainer.addEventListener("click", async function (event) {
      const button = event.target.closest("#navbarLogoutButton");
      if (!button) return;
      button.disabled = true;
      button.textContent = "Logging out...";
      try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        window.location.replace("/pages/login.html");
      } catch (error) {
        console.error("Logout error:", error);
        alert(error.message || "Logout nahi ho saka.");
        button.disabled = false;
        button.textContent = "Logout";
      }
    });
  }

  refreshAccountNavigation();
});
