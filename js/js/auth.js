const SUPABASE_URL =
  "https://vrhaagzkeyzlblgjgidg.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_6qEYBNFz3SddtxvOxiCLGg__NAMfQS1";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// HTML ELEMENTS

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

const showPasswordButton =
  document.getElementById("showPasswordButton");

const forgotPasswordButton =
  document.getElementById("forgotPasswordButton");


// MESSAGE

function showMessage(message, type = "error") {
  if (!loginMessage) return;

  loginMessage.textContent = message;
  loginMessage.className = `message ${type}`;
}


// SHOW / HIDE PASSWORD

if (showPasswordButton && loginPassword) {
  showPasswordButton.addEventListener("click", function () {
    if (loginPassword.type === "password") {
      loginPassword.type = "text";
      showPasswordButton.textContent = "Hide";
    } else {
      loginPassword.type = "password";
      showPasswordButton.textContent = "Show";
    }
  });
}


// LOGIN

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
      showMessage(
        "Please enter your email and password.",
        "error"
      );
      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {
      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password
        });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error(
          "Login session could not be created."
        );
      }

      showMessage(
  "Login successful! Opening website...",
  "success"
);

setTimeout(function () {
  window.location.replace("/");
}, 700);
    } catch (error) {
      console.error("Login error:", error);

      let message =
        error.message || "Login failed.";

      if (
        message
          .toLowerCase()
          .includes("invalid login credentials")
      ) {
        message = "Email or password is incorrect.";
      }

      if (
        message
          .toLowerCase()
          .includes("email not confirmed")
      ) {
        message =
          "Please confirm your email before logging in.";
      }

      showMessage(message, "error");

      loginButton.disabled = false;
      loginButton.textContent = "Log In";
    }
  });
}


// FORGOT PASSWORD

if (forgotPasswordButton) {
  forgotPasswordButton.addEventListener(
    "click",
    async function () {
      const email = loginEmail.value.trim();

      if (!email) {
        showMessage(
          "Pehle apna email address enter karo.",
          "error"
        );

        loginEmail.focus();
        return;
      }

      try {
        forgotPasswordButton.disabled = true;
        forgotPasswordButton.textContent = "Sending...";

        const { error } =
          await supabaseClient.auth.resetPasswordForEmail(
            email,
            {
              redirectTo:
                "http://127.0.0.1:5500/pages/reset-password.html"
            }
          );

        if (error) {
          throw error;
        }

        showMessage(
          "Password reset link email par bhej diya gaya hai.",
          "success"
        );

      } catch (error) {
        showMessage(error.message, "error");

      } finally {
        forgotPasswordButton.disabled = false;
        forgotPasswordButton.textContent =
          "Forgot Password?";
      }
    }
  );
}