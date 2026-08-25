// =====================================
// FINDMYPET INDIA - SIGNUP
// =====================================

const SUPABASE_URL = "https://vrhaagzkeyzlblgjgidg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_6qEYBNFz3SddtxvOxiCLGg__NAMfQS1";
// Legacy anon JWT is public by design and is used only to pass the Edge Function gateway.
const EDGE_ANON_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyaGFhZ3prZXl6bGJsZ2pnaWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNjQ3MjMsImV4cCI6MjA5ODc0MDcyM30.LNyXb81nGsvCTyzdMWmu3wSfHJAb_KXa-ThyqAY45WU";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const signupForm = document.getElementById("signupForm");
const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const confirmPassword = document.getElementById("confirmPassword");
const showSignupPassword = document.getElementById("showSignupPassword");
const showConfirmPassword = document.getElementById("showConfirmPassword");
const signupButton = document.getElementById("signupButton");
const signupMessage = document.getElementById("signupMessage");

function showSignupMessage(message, type = "error") {
  if (!signupMessage) return;
  signupMessage.textContent = message;
  signupMessage.className = `message ${type}`;
}

function wirePasswordToggle(button, input) {
  if (!button || !input) return;
  button.addEventListener("click", function () {
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    button.textContent = hidden ? "Hide" : "Show";
  });
}

wirePasswordToggle(showSignupPassword, signupPassword);
wirePasswordToggle(showConfirmPassword, confirmPassword);

async function createAccountWithoutAuthEmail(fullName, email, password) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/public-signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": EDGE_ANON_JWT,
      "Authorization": `Bearer ${EDGE_ANON_JWT}`
    },
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
      website: ""
    })
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch (_) {}

  if (!response.ok) {
    throw new Error(payload.error || "Account could not be created. Please try again.");
  }

  return payload;
}

if (signupForm) {
  signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const fullName = signupName.value.trim();
    const email = signupEmail.value.trim().toLowerCase();
    const password = signupPassword.value;
    const confirmedPassword = confirmPassword.value;

    if (!fullName || !email || !password || !confirmedPassword) {
      showSignupMessage("Please fill in all the details.");
      return;
    }

    if (password.length < 6) {
      showSignupMessage("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmedPassword) {
      showSignupMessage("Password and Confirm Password do not match.");
      return;
    }

    signupButton.disabled = true;
    signupButton.textContent = "Creating Account...";
    showSignupMessage("", "success");

    try {
      // Production-safe fallback while Supabase's built-in email sender is rate-limited.
      // Account creation is performed server-side and protected by origin + IP rate limiting.
      await createAccountWithoutAuthEmail(fullName, email, password);

      const { data: loginData, error: loginError } =
        await supabaseClient.auth.signInWithPassword({ email, password });

      if (loginError) throw loginError;
      if (!loginData || !loginData.session) {
        throw new Error("Account created, but login session could not be started. Please log in.");
      }

      showSignupMessage(
        "Account created successfully! Opening FindMyPet India...",
        "success"
      );

      signupForm.reset();

      setTimeout(function () {
        window.location.href = "../index.html";
      }, 900);

    } catch (error) {
      console.error("Signup error:", error);

      let message = error && error.message
        ? error.message
        : "Account could not be created. Please try again.";

      const lower = message.toLowerCase();

      if (lower.includes("already registered") || lower.includes("already exists")) {
        message = "This email is already registered. Please log in.";
      } else if (lower.includes("invalid email")) {
        message = "Please enter a valid email address.";
      } else if (lower.includes("too many signup attempts")) {
        message = "Too many signup attempts. Please wait and try again later.";
      } else if (lower.includes("failed to fetch")) {
        message = "Signup service se connection nahi ho pa raha. Internet check karke dobara try karein.";
      }

      showSignupMessage(message, "error");

    } finally {
      signupButton.disabled = false;
      signupButton.textContent = "Create Account";
    }
  });
}