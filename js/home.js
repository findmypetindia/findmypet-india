// ==========================================
// FindMyPet India - Homepage Login Gate
// ==========================================

(function initHomepageLoginGate() {
  if (!document.body || document.getElementById("homepageLoginGate")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "homepageLoginGateStyles";
  style.textContent = `
    body.home-login-gate-open {
      overflow: hidden !important;
    }

    #homepageLoginGate {
      position: fixed;
      inset: 0;
      z-index: 2147483000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background:
        radial-gradient(circle at 12% 18%, rgba(37, 99, 235, .16), transparent 34%),
        radial-gradient(circle at 88% 78%, rgba(34, 197, 94, .12), transparent 32%),
        #f7f9ff;
      font-family: Inter, Arial, sans-serif;
      box-sizing: border-box;
    }

    #homepageLoginGate[hidden] {
      display: none !important;
    }

    .home-gate-shell {
      width: min(980px, 100%);
      min-height: 570px;
      display: grid;
      grid-template-columns: 1.05fr .95fr;
      overflow: hidden;
      border-radius: 28px;
      background: #ffffff;
      box-shadow: 0 28px 80px rgba(15, 23, 42, .18);
      border: 1px solid rgba(37, 99, 235, .12);
    }

    .home-gate-brand {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 42px;
      color: #ffffff;
      background: linear-gradient(145deg, #2457f5 0%, #1739ad 100%);
      overflow: hidden;
    }

    .home-gate-brand::after {
      content: "";
      position: absolute;
      width: 330px;
      height: 330px;
      right: -115px;
      bottom: -120px;
      border-radius: 50%;
      background: rgba(255, 255, 255, .11);
    }

    .home-gate-logo {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
      font-weight: 800;
    }

    .home-gate-logo span:first-child {
      display: grid;
      place-items: center;
      width: 50px;
      height: 50px;
      border-radius: 16px;
      background: #ffffff;
      color: #111827;
      font-size: 28px;
    }

    .home-gate-copy {
      position: relative;
      z-index: 1;
      margin: auto 0;
    }

    .home-gate-copy h1 {
      margin: 0 0 18px;
      font-size: clamp(40px, 5vw, 62px);
      line-height: 1.03;
      letter-spacing: -2px;
    }

    .home-gate-copy h1 span {
      color: #b9d0ff;
    }

    .home-gate-copy p {
      max-width: 430px;
      margin: 0;
      font-size: 17px;
      line-height: 1.7;
      color: rgba(255, 255, 255, .88);
    }

    .home-gate-form-side {
      display: flex;
      align-items: center;
      padding: 48px;
      background: #ffffff;
    }

    .home-gate-form-wrap {
      width: 100%;
      max-width: 390px;
      margin: 0 auto;
    }

    .home-gate-mobile-logo {
      display: none;
      margin-bottom: 22px;
      font-size: 22px;
      font-weight: 850;
      color: #111827;
    }

    .home-gate-form-wrap h2 {
      margin: 0 0 10px;
      font-size: 30px;
      color: #111827;
      letter-spacing: -.7px;
    }

    .home-gate-subtitle {
      margin: 0 0 28px;
      color: #64748b;
      line-height: 1.6;
      font-size: 15px;
    }

    .home-gate-field {
      margin-bottom: 18px;
    }

    .home-gate-field label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 750;
      color: #334155;
    }

    .home-gate-field input {
      width: 100%;
      min-height: 50px;
      padding: 0 14px;
      border: 1.5px solid #d8dfeb;
      border-radius: 12px;
      outline: none;
      font: inherit;
      color: #111827;
      background: #ffffff;
      box-sizing: border-box;
    }

    .home-gate-field input:focus {
      border-color: #2457f5;
      box-shadow: 0 0 0 4px rgba(36, 87, 245, .10);
    }

    .home-gate-password {
      position: relative;
    }

    .home-gate-password input {
      padding-right: 72px;
    }

    .home-gate-show-password {
      position: absolute;
      top: 50%;
      right: 12px;
      transform: translateY(-50%);
      border: 0;
      background: transparent;
      color: #2457f5;
      font-weight: 800;
      cursor: pointer;
    }

    .home-gate-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin: 2px 0 22px;
      font-size: 13px;
      color: #475569;
    }

    .home-gate-remember {
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }

    .home-gate-forgot {
      padding: 0;
      border: 0;
      background: none;
      color: #2457f5;
      font: inherit;
      font-weight: 750;
      cursor: pointer;
    }

    .home-gate-login-btn,
    .home-gate-signup-btn {
      width: 100%;
      min-height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 850;
      text-decoration: none;
      box-sizing: border-box;
    }

    .home-gate-login-btn {
      border: 0;
      color: #ffffff;
      background: #2457f5;
      cursor: pointer;
    }

    .home-gate-login-btn:disabled {
      opacity: .7;
      cursor: wait;
    }

    .home-gate-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 750;
    }

    .home-gate-divider::before,
    .home-gate-divider::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }

    .home-gate-signup-btn {
      border: 1.5px solid #2457f5;
      color: #2457f5;
      background: #ffffff;
    }

    .home-gate-message {
      min-height: 20px;
      margin: 12px 0 0;
      font-size: 13px;
      line-height: 1.45;
      text-align: center;
    }

    .home-gate-message.error {
      color: #dc2626;
    }

    .home-gate-message.success {
      color: #15803d;
    }

    @media (max-width: 760px) {
      #homepageLoginGate {
        align-items: stretch;
        padding: 0;
        overflow-y: auto;
        background: #ffffff;
      }

      .home-gate-shell {
        min-height: 100%;
        grid-template-columns: 1fr;
        border: 0;
        border-radius: 0;
        box-shadow: none;
      }

      .home-gate-brand {
        display: none;
      }

      .home-gate-form-side {
        align-items: flex-start;
        padding: 34px 24px 40px;
      }

      .home-gate-form-wrap {
        max-width: 460px;
      }

      .home-gate-mobile-logo {
        display: block;
      }

      .home-gate-form-wrap h2 {
        font-size: 28px;
      }
    }
  `;
  document.head.appendChild(style);

  const gate = document.createElement("div");
  gate.id = "homepageLoginGate";
  gate.setAttribute("role", "dialog");
  gate.setAttribute("aria-modal", "true");
  gate.setAttribute("aria-label", "Log in to FindMyPet India");
  gate.innerHTML = `
    <div class="home-gate-shell">
      <section class="home-gate-brand" aria-hidden="true">
        <div class="home-gate-logo"><span>🐾</span><span>FindMyPet India</span></div>
        <div class="home-gate-copy">
          <h1>Lost Pets.<br>Found Pets.<br><span>Powered by AI.</span></h1>
          <p>Sign in to report lost or found pets, use AI Pet Search, manage your dashboard, and help reunite pets with their families across India.</p>
        </div>
      </section>

      <section class="home-gate-form-side">
        <div class="home-gate-form-wrap">
          <div class="home-gate-mobile-logo">🐾 FindMyPet India</div>
          <h2>Log in to FindMyPet India</h2>
          <p class="home-gate-subtitle">Please sign in first to continue to the website.</p>

          <form id="homepageGateLoginForm" autocomplete="on">
            <div class="home-gate-field">
              <label for="homepageGateEmail">Email Address</label>
              <input id="homepageGateEmail" name="email" type="email" autocomplete="email" placeholder="Enter your email" required>
            </div>

            <div class="home-gate-field">
              <label for="homepageGatePassword">Password</label>
              <div class="home-gate-password">
                <input id="homepageGatePassword" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required>
                <button type="button" id="homepageGateShowPassword" class="home-gate-show-password">Show</button>
              </div>
            </div>

            <div class="home-gate-options">
              <label class="home-gate-remember"><input type="checkbox" id="homepageGateRemember"> Remember me</label>
              <button type="button" id="homepageGateForgot" class="home-gate-forgot">Forgot Password?</button>
            </div>

            <button type="submit" id="homepageGateLoginButton" class="home-gate-login-btn">Log In</button>
            <p id="homepageGateMessage" class="home-gate-message" aria-live="polite"></p>
          </form>

          <div class="home-gate-divider">OR</div>
          <a class="home-gate-signup-btn" href="/pages/signup.html">Create New Account</a>
        </div>
      </section>
    </div>
  `;

  document.body.prepend(gate);
  document.body.classList.add("home-login-gate-open");

  const form = document.getElementById("homepageGateLoginForm");
  const emailInput = document.getElementById("homepageGateEmail");
  const passwordInput = document.getElementById("homepageGatePassword");
  const loginButton = document.getElementById("homepageGateLoginButton");
  const message = document.getElementById("homepageGateMessage");
  const showPassword = document.getElementById("homepageGateShowPassword");
  const remember = document.getElementById("homepageGateRemember");
  const forgot = document.getElementById("homepageGateForgot");
  const rememberedEmailKey = "findmypet_remembered_email";

  function showGateMessage(text, type = "error") {
    message.textContent = text;
    message.className = `home-gate-message ${type}`;
  }

  function unlockHomepage() {
    gate.hidden = true;
    document.body.classList.remove("home-login-gate-open");
  }

  function restoreRememberedEmail() {
    try {
      const savedEmail = localStorage.getItem(rememberedEmailKey);
      if (savedEmail) {
        emailInput.value = savedEmail;
        remember.checked = true;
      }
    } catch (error) {
      console.warn("Could not restore remembered email:", error);
    }
  }

  function saveRememberedEmail() {
    try {
      if (remember.checked && emailInput.value.trim()) {
        localStorage.setItem(rememberedEmailKey, emailInput.value.trim());
      } else {
        localStorage.removeItem(rememberedEmailKey);
      }
    } catch (error) {
      console.warn("Could not save remembered email:", error);
    }
  }

  restoreRememberedEmail();

  showPassword.addEventListener("click", () => {
    const hidden = passwordInput.type === "password";
    passwordInput.type = hidden ? "text" : "password";
    showPassword.textContent = hidden ? "Hide" : "Show";
  });

  remember.addEventListener("change", saveRememberedEmail);
  emailInput.addEventListener("input", () => {
    if (remember.checked) {
      saveRememberedEmail();
    }
  });

  forgot.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) {
      showGateMessage("Pehle apna email address enter karo.");
      emailInput.focus();
      return;
    }

    if (typeof supabaseClient === "undefined" || !supabaseClient?.auth) {
      showGateMessage("Login service load nahi hui. Page refresh karein.");
      return;
    }

    try {
      forgot.disabled = true;
      forgot.textContent = "Sending...";
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/pages/reset-password.html`
      });
      if (error) throw error;
      showGateMessage("Password reset link aapke email par bhej diya gaya hai.", "success");
    } catch (error) {
      showGateMessage(error?.message || "Password reset link send nahi ho saka.");
    } finally {
      forgot.disabled = false;
      forgot.textContent = "Forgot Password?";
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showGateMessage("", "");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showGateMessage("Please enter your email and password.");
      return;
    }

    if (typeof supabaseClient === "undefined" || !supabaseClient?.auth) {
      showGateMessage("Login service load nahi hui. Page refresh karein.");
      return;
    }

    saveRememberedEmail();
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data?.session) throw new Error("Login session could not be created.");

      showGateMessage("Login successful! Opening website...", "success");
      unlockHomepage();
      window.location.reload();
    } catch (error) {
      let text = error?.message || "Login failed. Please try again.";
      if (text.toLowerCase().includes("invalid login credentials")) {
        text = "Email or password is incorrect.";
      } else if (text.toLowerCase().includes("email not confirmed")) {
        text = "Please confirm your email before logging in.";
      }
      showGateMessage(text);
      loginButton.disabled = false;
      loginButton.textContent = "Log In";
    }
  });

  async function verifyExistingSession() {
    if (typeof supabaseClient === "undefined" || !supabaseClient?.auth) {
      return;
    }

    try {
      const { data, error } = await supabaseClient.auth.getSession();
      if (!error && data?.session) {
        unlockHomepage();
      }
    } catch (error) {
      console.warn("Homepage session check failed:", error);
    }
  }

  verifyExistingSession();

  if (typeof supabaseClient !== "undefined" && supabaseClient?.auth) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")) {
        unlockHomepage();
      }
    });
  }
})();

// ==========================================
// FindMyPet India - Dynamic Homepage Reports
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  loadHomepageReports();
});

/**
 * Public data ko HTML me safely display karne ke liye.
 */
function safeText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

/**
 * Mobile number ko Call/WhatsApp links ke liye clean karta hai.
 */
function cleanPhoneNumber(value) {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

/**
 * Latest Lost aur Found reports Supabase se load karta hai.
 */
async function loadHomepageReports() {
  const petGrid =
  document.getElementById("homepageReportsGrid");
  if (!petGrid) {
    return;
  }

  petGrid.innerHTML = `
    <div class="homepage-loading">
      <div class="homepage-spinner"></div>
      <p>Latest pet reports load ho rahi hain...</p>
    </div>
  `;

  try {
    const { data, error } = await supabaseClient
      .from("pet_reports")
      .select(
        `
          id,
          report_type,
          pet_name,
          pet_type,
          breed,
          color,
          city,
          state,
          report_date,
          mobile,
          image_url,
          created_at
        `
      )
      .or("status.eq.active,status.is.null")
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      throw error;
    }

    petGrid.innerHTML = "";

    if (!data || data.length === 0) {
      petGrid.innerHTML = `
        <div class="homepage-empty">
          <h3>Abhi koi report available nahi hai</h3>
          <p>Lost ya Found Pet report submit karke pehli entry add karein.</p>
        </div>
      `;
      return;
    }

    data.forEach((pet) => {
      petGrid.appendChild(createHomepagePetCard(pet));
    });

    updateHomepageStatistics();
  } catch (error) {
    console.error("Homepage reports error:", error);

    petGrid.innerHTML = `
      <div class="homepage-error">
        <h3>Reports load nahi ho paayi</h3>
        <p>${safeText(error.message, "Please refresh the page.")}</p>
        <button type="button" id="retryReportsBtn">
          Try Again
        </button>
      </div>
    `;

    document
      .getElementById("retryReportsBtn")
      ?.addEventListener("click", loadHomepageReports);
  }
}

/**
 * Ek safe pet card create karta hai.
 */
function createHomepagePetCard(pet) {
  const card = document.createElement("article");
  card.className = "pet-card";

  const reportType =
    pet.report_type === "found" ? "found" : "lost";

  const statusLabel =
    reportType === "found" ? "FOUND" : "LOST";

  const petName = safeText(
    pet.pet_name,
    safeText(pet.pet_type, "Unknown Pet")
  );

  const breed = safeText(
    pet.breed,
    safeText(pet.pet_type, "Breed not provided")
  );

  const location = [pet.city, pet.state]
    .map((item) => safeText(item))
    .filter(Boolean)
    .join(", ");

  const date = formatReportDate(
    pet.report_date || pet.created_at
  );

  const phone = cleanPhoneNumber(pet.mobile);

  const photo = document.createElement("div");
  photo.className = "pet-photo";

  const status = document.createElement("span");
  status.className = `tag ${reportType}`;
  status.textContent = statusLabel;

  const image = document.createElement("img");
  image.src =
    safeText(pet.image_url) ||
    "https://placehold.co/600x400?text=Pet+Photo";
  image.alt = `${petName} pet report`;
  image.loading = "lazy";

  image.addEventListener("error", () => {
    image.src =
      "https://placehold.co/600x400?text=Pet+Photo";
  });

  photo.append(status, image);

  const content = document.createElement("div");
  content.className = "pet-content";

  const title = document.createElement("h3");
  title.textContent = petName;

  const breedText = document.createElement("p");
  breedText.textContent = breed;

  const locationText = document.createElement("small");
  locationText.textContent = `📍 ${
    location || "Location not provided"
  }`;

  const dateText = document.createElement("small");
  dateText.textContent = `📅 ${date}`;

  const actionRow = document.createElement("div");
  actionRow.className = "pet-card-actions";

  const detailsLink = document.createElement("a");

  detailsLink.className =
  "pet-action-btn details-btn";

  detailsLink.href =
  `pages/pet.html?id=${pet.id}`;

  detailsLink.textContent =
  "View Details";

  actionRow.appendChild(detailsLink);

  if (reportType === "lost") {
    const sightingLink = document.createElement("a");

    sightingLink.className =
      "pet-action-btn sighting-btn visible-sighting-action";

    sightingLink.href =
      "pages/pet.html?id=" +
      encodeURIComponent(String(pet.id)) +
      "&spotted=1";

    sightingLink.textContent =
      "I Spotted This Pet";

    sightingLink.setAttribute(
      "style",
      "display:flex!important;width:100%!important;min-height:52px!important;margin:8px 0!important;padding:14px 16px!important;align-items:center!important;justify-content:center!important;flex:0 0 100%!important;background:#f97316!important;color:#ffffff!important;border:0!important;border-radius:12px!important;font-size:16px!important;font-weight:800!important;line-height:1.2!important;text-align:center!important;text-decoration:none!important;visibility:visible!important;opacity:1!important;box-sizing:border-box!important;"
    );

    actionRow.appendChild(sightingLink);
  }

  if (phone) {
    const callLink = document.createElement("a");
    callLink.className = "pet-action-btn call-btn";
    callLink.href = `tel:+${phone}`;
    callLink.textContent = "Call";

    const whatsappLink = document.createElement("a");
    whatsappLink.className =
      "pet-action-btn whatsapp-btn";
    whatsappLink.href = `https://wa.me/${phone}`;
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener noreferrer";
    whatsappLink.textContent = "WhatsApp";

    actionRow.append(callLink, whatsappLink);
  } else {
    const unavailable = document.createElement("span");
    unavailable.className = "contact-unavailable";
    unavailable.textContent = "Contact unavailable";
    actionRow.appendChild(unavailable);
  }

  content.append(
    title,
    breedText,
    locationText,
    dateText,
    actionRow
  );

  card.append(photo, content);

  return card;
}

/**
 * Report date readable format me dikhata hai.
 */
function formatReportDate(value) {
  if (!value) {
    return "Date not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return safeText(value, "Date not provided");
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

/**
 * Homepage statistics ko database values se update karta hai.
 */
async function updateHomepageStatistics() {
  try {
    const { data, error } = await supabaseClient
      .from("pet_reports")
      .select("report_type");

    if (error) {
      throw error;
    }

    const reports = data || [];

    const lostCount = reports.filter(
      (report) => report.report_type === "lost"
    ).length;

    const foundCount = reports.filter(
      (report) => report.report_type === "found"
    ).length;

    const statNumbers =
      document.querySelectorAll(".stat-card h3");

    if (statNumbers[0]) {
      statNumbers[0].textContent =
        lostCount.toLocaleString("en-IN");
    }

    if (statNumbers[1]) {
      statNumbers[1].textContent =
        foundCount.toLocaleString("en-IN");
    }

    /*
     * Reunited aur Active Members ke liye abhi database
     * columns nahi hain. Isliye temporary 0 rakha gaya hai.
     */
    if (statNumbers[2]) {
      statNumbers[2].textContent = "0";
    }

    if (statNumbers[3]) {
      statNumbers[3].textContent = "0";
    }
  } catch (error) {
    console.error("Homepage statistics error:", error);
  }
}