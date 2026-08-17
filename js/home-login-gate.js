// ==========================================
// FindMyPet India - Homepage Login Gate
// Reuses the approved /pages/login.html design.
// ==========================================

(function () {
  const LOGIN_STYLES_ID = "homepageLoginPageStyles";
  const GATE_ID = "homepageLoginGate";
  const REMEMBERED_EMAIL_KEY = "findmypet_remembered_email";

  function addLoginStyles() {
    if (!document.getElementById(LOGIN_STYLES_ID)) {
      const link = document.createElement("link");
      link.id = LOGIN_STYLES_ID;
      link.rel = "stylesheet";
      link.href = "/css/login.css?v=606";
      document.head.appendChild(link);
    }

    if (!document.getElementById("homepageLoginGateOverlayStyles")) {
      const style = document.createElement("style");
      style.id = "homepageLoginGateOverlayStyles";
      style.textContent = `
        body.home-login-gate-open {
          overflow: hidden !important;
        }

        #${GATE_ID} {
          position: fixed;
          inset: 0;
          z-index: 2147483000;
          overflow-y: auto;
          background: #ffffff;
        }

        #${GATE_ID} .login-page {
          min-height: 100vh;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function removeLoginGate() {
    document.getElementById(GATE_ID)?.remove();
    document.getElementById(LOGIN_STYLES_ID)?.remove();
    document.getElementById("homepageLoginGateOverlayStyles")?.remove();
    document.body.classList.remove("home-login-gate-open");
  }

  function showMessage(element, text, type = "error") {
    if (!element) return;
    element.textContent = text;
    element.className = `message ${type}`;
  }

  function saveRememberedEmail(email, remember) {
    try {
      if (remember) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    } catch (error) {
      console.warn("Could not update remembered email:", error);
    }
  }

  function restoreRememberedEmail(emailInput, rememberInput) {
    try {
      const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberInput.checked = true;
      }
    } catch (error) {
      console.warn("Could not restore remembered email:", error);
    }
  }

  function renderGate() {
    if (document.getElementById(GATE_ID)) return;

    addLoginStyles();

    const gate = document.createElement("div");
    gate.id = GATE_ID;
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-label", "Log in to FindMyPet India");

    gate.innerHTML = `
      <main class="login-page">
        <section class="left-section">
          <div class="logo">
            <span class="logo-icon">🐾</span>
            <span>FindMyPet India</span>
          </div>

          <div class="left-content">
            <div class="pet-design">
              <div class="small-card card-one">
                <span>🐶</span>
                <p>Report Lost Pets</p>
              </div>

              <div class="small-card card-two">
                <span>🐱</span>
                <p>Report Found Pets</p>
              </div>

              <div class="main-pet">🐕</div>

              <div class="small-card card-three">
                <span>🏠</span>
                <p>Reunite Families</p>
              </div>
            </div>

            <h1>
              Lost Pets.<br>
              Found Pets.<br>
              <span>Powered by AI.</span>
            </h1>

            <p class="tagline">
              Report lost pets, report found pets, search with AI,
              receive instant alerts, and help reunite pets with
              their families across India.
            </p>
          </div>
        </section>

        <section class="right-section">
          <div class="mobile-hero" aria-hidden="true">
            <div class="mobile-hero-icon">🐶</div>
            <div>
              <strong>FindMyPet India</strong>
              <span>Lost Pets. Found Pets. Powered by AI.</span>
            </div>
          </div>

          <div class="login-box">
            <div class="mobile-logo">🐾 FindMyPet India</div>

            <h2>Log in to FindMyPet India</h2>

            <p class="subtitle">
              Sign in to report Lost Pets, report Found Pets,
              use AI Pet Search, manage your dashboard,
              and receive real-time pet alerts.
            </p>

            <form id="homepageGateLoginForm" autocomplete="on">
              <div class="input-group">
                <label for="homepageGateEmail">Email Address</label>
                <input
                  type="email"
                  id="homepageGateEmail"
                  name="email"
                  placeholder="Enter your email"
                  autocomplete="email"
                  required
                >
              </div>

              <div class="input-group">
                <label for="homepageGatePassword">Password</label>
                <div class="password-wrapper">
                  <input
                    type="password"
                    id="homepageGatePassword"
                    name="password"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                    required
                  >
                  <button
                    type="button"
                    class="show-password"
                    id="homepageGateShowPassword"
                  >Show</button>
                </div>
              </div>

              <div class="login-options">
                <label class="remember-me">
                  <input type="checkbox" id="homepageGateRememberMe">
                  Remember me
                </label>

                <button
                  type="button"
                  class="forgot-password"
                  id="homepageGateForgotPassword"
                >Forgot Password?</button>
              </div>

              <button
                class="login-button"
                id="homepageGateLoginButton"
                type="submit"
              >Log In</button>

              <p id="homepageGateMessage" class="message" aria-live="polite"></p>
            </form>

            <div class="divider"><span>OR</span></div>

            <a href="/pages/signup.html" class="create-account-button">
              Create New Account
            </a>
          </div>
        </section>
      </main>
    `;

    document.body.prepend(gate);
    document.body.classList.add("home-login-gate-open");

    const form = document.getElementById("homepageGateLoginForm");
    const emailInput = document.getElementById("homepageGateEmail");
    const passwordInput = document.getElementById("homepageGatePassword");
    const loginButton = document.getElementById("homepageGateLoginButton");
    const message = document.getElementById("homepageGateMessage");
    const showPasswordButton = document.getElementById("homepageGateShowPassword");
    const rememberMe = document.getElementById("homepageGateRememberMe");
    const forgotPasswordButton = document.getElementById("homepageGateForgotPassword");

    restoreRememberedEmail(emailInput, rememberMe);

    rememberMe.addEventListener("change", function () {
      saveRememberedEmail(emailInput.value.trim(), rememberMe.checked);
    });

    emailInput.addEventListener("input", function () {
      if (rememberMe.checked) {
        saveRememberedEmail(emailInput.value.trim(), true);
      }
    });

    showPasswordButton.addEventListener("click", function () {
      const hidden = passwordInput.type === "password";
      passwordInput.type = hidden ? "text" : "password";
      showPasswordButton.textContent = hidden ? "Hide" : "Show";
    });

    forgotPasswordButton.addEventListener("click", async function () {
      const email = emailInput.value.trim();

      if (!email) {
        showMessage(message, "Please enter your email address first.");
        emailInput.focus();
        return;
      }

      forgotPasswordButton.disabled = true;

      try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/pages/reset-password.html`
        });

        if (error) throw error;

        showMessage(
          message,
          "Password reset link sent. Please check your email.",
          "success"
        );
      } catch (error) {
        console.error("Homepage forgot password error:", error);
        showMessage(
          message,
          "Password reset email could not be sent right now. Please try again."
        );
      } finally {
        forgotPasswordButton.disabled = false;
      }
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showMessage(message, "Please enter your email and password.");
        return;
      }

      saveRememberedEmail(email, rememberMe.checked);
      loginButton.disabled = true;
      loginButton.textContent = "Logging in...";
      showMessage(message, "", "");

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (!data?.session) {
          throw new Error("A login session was not created.");
        }

        removeLoginGate();
      } catch (error) {
        console.error("Homepage login error:", error);

        const lowerMessage = String(error?.message || "").toLowerCase();
        const friendlyMessage =
          lowerMessage.includes("invalid login credentials") ||
          lowerMessage.includes("invalid credentials")
            ? "Email or password is incorrect."
            : "Login could not be completed. Please try again.";

        showMessage(message, friendlyMessage);
      } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Log In";
      }
    });
  }

  async function initializeGate() {
    if (typeof supabaseClient === "undefined") {
      console.error("Supabase client is not available for the homepage login gate.");
      renderGate();
      return;
    }

    try {
      const { data, error } = await supabaseClient.auth.getSession();

      if (error) throw error;

      if (data?.session) {
        removeLoginGate();
      } else {
        renderGate();
      }
    } catch (error) {
      console.warn("Homepage login gate session check error:", error);
      renderGate();
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")) {
        removeLoginGate();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeGate, { once: true });
  } else {
    initializeGate();
  }
})();
