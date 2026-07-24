// =====================================
// SUPABASE CONFIGURATION
// =====================================

const SUPABASE_URL =
  "https://vrhaagzkeyzlblgjgidg.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_6qEYBNFz3SddtxvOxiCLGg__NAMfQS1";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// =====================================
// HTML ELEMENTS
// =====================================

const signupForm =
  document.getElementById("signupForm");

const signupName =
  document.getElementById("signupName");

const signupEmail =
  document.getElementById("signupEmail");

const signupPassword =
  document.getElementById("signupPassword");

const confirmPassword =
  document.getElementById("confirmPassword");

const showSignupPassword =
  document.getElementById("showSignupPassword");

const showConfirmPassword =
  document.getElementById("showConfirmPassword");

const signupButton =
  document.getElementById("signupButton");

const signupMessage =
  document.getElementById("signupMessage");


// =====================================
// SHOW MESSAGE
// =====================================

function showSignupMessage(message, type = "error") {
  if (!signupMessage) return;

  signupMessage.textContent = message;
  signupMessage.className = `message ${type}`;
}


// =====================================
// SHOW / HIDE PASSWORD
// =====================================

if (showSignupPassword && signupPassword) {
  showSignupPassword.addEventListener(
    "click",
    function () {

      const isHidden =
        signupPassword.type === "password";

      signupPassword.type =
        isHidden ? "text" : "password";

      showSignupPassword.textContent =
        isHidden ? "Hide" : "Show";

    }
  );
}


// =====================================
// SHOW / HIDE CONFIRM PASSWORD
// =====================================

if (showConfirmPassword && confirmPassword) {
  showConfirmPassword.addEventListener(
    "click",
    function () {

      const isHidden =
        confirmPassword.type === "password";

      confirmPassword.type =
        isHidden ? "text" : "password";

      showConfirmPassword.textContent =
        isHidden ? "Hide" : "Show";

    }
  );
}


// =====================================
// SIGNUP FORM
// =====================================

if (signupForm) {

  signupForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      const fullName =
        signupName.value.trim();

      const email =
        signupEmail.value.trim();

      const password =
        signupPassword.value;

      const confirmedPassword =
        confirmPassword.value;


      // EMPTY FIELDS CHECK

      if (
        !fullName ||
        !email ||
        !password ||
        !confirmedPassword
      ) {

        showSignupMessage(
          "Please fill in all the details."
        );

        return;
      }


      // PASSWORD LENGTH CHECK

      if (password.length < 6) {

        showSignupMessage(
          "Password must contain at least 6 characters."
        );

        return;
      }


      // PASSWORD MATCH CHECK

      if (password !== confirmedPassword) {

        showSignupMessage(
          "Password and Confirm Password do not match."
        );

        return;
      }


      try {

        signupButton.disabled = true;

        signupButton.textContent =
          "Creating Account...";

        showSignupMessage("", "success");


        const { data, error } =
          await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

              data: {
                full_name: fullName
              },

              emailRedirectTo:
                `${window.location.origin}/pages/login.html`

            }

          });


        if (error) {
          throw error;
        }


        // EMAIL CONFIRMATION ON

        if (!data.session) {
            localStorage.setItem(
  "signupEmail",
  email
);

          showSignupMessage(
            "Account created! Please check your email and confirm your account.",
            "success"
          );

          signupForm.reset();
setTimeout(function () {

  window.location.href =
    "verify-email.html";

}, 1500);

          return;
        }


        // EMAIL CONFIRMATION OFF

        showSignupMessage(
          "Account created successfully! Opening FindMyPet India...",
          "success"
        );

        signupForm.reset();

        setTimeout(function () {

          window.location.href = "../index.html";

        }, 1500);

      } catch (error) {

        console.error(
          "Signup error:",
          error
        );

        let message =
          error.message ||
          "Account could not be created.";

        const lowerMessage =
          message.toLowerCase();


        if (
          lowerMessage.includes("already registered") ||
          lowerMessage.includes("already exists")
        ) {

          message =
            "This email is already registered. Please log in.";

        }


        if (
          lowerMessage.includes("invalid email")
        ) {

          message =
            "Please enter a valid email address.";

        }


        if (
          lowerMessage.includes("password")
        ) {

          message =
            "Please create a password with at least 6 characters.";

        }


        showSignupMessage(
          message,
          "error"
        );

      } finally {

        signupButton.disabled = false;

        signupButton.textContent =
          "Create Account";

      }

    }
  );

}