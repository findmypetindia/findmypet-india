// =====================================
// FINDMYPET INDIA - LOGIN AUTH
// =====================================

document.addEventListener("DOMContentLoaded", function () {

  // =====================================
  // HTML ELEMENTS
  // =====================================

  const loginForm = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginButton = document.getElementById("loginButton");
  const loginMessage = document.getElementById("loginMessage");

  const showPasswordButton =
    document.getElementById("showPasswordButton");

  const forgotPasswordButton =
    document.getElementById("forgotPasswordButton");


  // =====================================
  // MESSAGE FUNCTION
  // =====================================

  function showMessage(message, type = "error") {
    if (!loginMessage) return;

    loginMessage.textContent = message;
    loginMessage.className = `message ${type}`;
  }


  function clearMessage() {
    if (!loginMessage) return;

    loginMessage.textContent = "";
    loginMessage.className = "message";
  }


  // =====================================
  // SHOW / HIDE PASSWORD
  // Supabase fail hone par bhi chalega
  // =====================================

  if (showPasswordButton && loginPassword) {

    showPasswordButton.addEventListener(
      "click",
      function () {

        const passwordIsHidden =
          loginPassword.type === "password";

        if (passwordIsHidden) {
          loginPassword.type = "text";
          showPasswordButton.textContent = "Hide";
        } else {
          loginPassword.type = "password";
          showPasswordButton.textContent = "Show";
        }

      }
    );

  }


  // =====================================
  // SUPABASE CONFIGURATION
  // =====================================

  const SUPABASE_URL =
    "https://vrhaagzkeyzlblgjgidg.supabase.co";

  const SUPABASE_ANON_KEY =
    "sb_publishable_6qEYBNFz3SddtxvOxiCLGg__NAMfQS1";


  let supabaseClient = null;


  function initializeSupabase() {

    if (
      !window.supabase ||
      typeof window.supabase.createClient !== "function"
    ) {
      console.error(
        "Supabase library could not be loaded."
      );

      return false;
    }

    try {

      supabaseClient =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_ANON_KEY
        );

      console.log(
        "Supabase login service initialized."
      );

      return true;

    } catch (error) {

      console.error(
        "Supabase initialization error:",
        error
      );

      return false;

    }

  }


  // Supabase ko initialize karo

  initializeSupabase();


  // =====================================
  // LOGIN
  // =====================================

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        clearMessage();


        // Supabase dobara check karo

        if (!supabaseClient) {

          const initialized =
            initializeSupabase();

          if (!initialized) {

            showMessage(
              "Login service load nahi hui. Internet check karke page refresh karein.",
              "error"
            );

            return;

          }

        }


        const email =
          loginEmail
            ? loginEmail.value.trim()
            : "";

        const password =
          loginPassword
            ? loginPassword.value
            : "";


        // Empty field validation

        if (!email || !password) {

          showMessage(
            "Please enter your email and password.",
            "error"
          );

          return;

        }


        // Button loading state

        if (loginButton) {
          loginButton.disabled = true;
          loginButton.textContent = "Logging in...";
        }


        try {

          const loginPromise =
            supabaseClient.auth.signInWithPassword({
              email: email,
              password: password
            });


          // 25 second timeout

          const timeoutPromise =
            new Promise(function (_, reject) {

              setTimeout(function () {

                reject(
                  new Error(
                    "Login request timed out. Please try again."
                  )
                );

              }, 25000);

            });


          const result =
            await Promise.race([
              loginPromise,
              timeoutPromise
            ]);


          const data = result.data;
          const error = result.error;


          if (error) {
            throw error;
          }


          if (
            !data ||
            !data.session ||
            !data.user
          ) {

            throw new Error(
              "Login session could not be created."
            );

          }


          showMessage(
            "Login successful! Opening website...",
            "success"
          );


          // Localhost aur Vercel dono par kaam karega

          setTimeout(function () {

            window.location.replace(
              `${window.location.origin}/index.html`
            );

          }, 800);


        } catch (error) {

          console.error(
            "Login error:",
            error
          );


          let message =
            error && error.message
              ? error.message
              : "Login failed. Please try again.";


          const lowerMessage =
            message.toLowerCase();


          if (
            lowerMessage.includes(
              "invalid login credentials"
            )
          ) {

            message =
              "Email or password is incorrect.";

          } else if (
            lowerMessage.includes(
              "email not confirmed"
            )
          ) {

            message =
              "Please confirm your email before logging in.";

          } else if (
            lowerMessage.includes(
              "failed to fetch"
            )
          ) {

            message =
              "Login server se connection nahi ho pa raha. Internet check karke dobara try karein.";

          } else if (
            lowerMessage.includes(
              "timed out"
            )
          ) {

            message =
              "Login request mein zyada time lag raha hai. Dobara try karein.";

          }


          showMessage(
            message,
            "error"
          );


          if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = "Log In";
          }

        }

      }
    );

  }


  // =====================================
  // FORGOT PASSWORD
  // =====================================

  if (forgotPasswordButton) {

    forgotPasswordButton.addEventListener(
      "click",
      async function () {

        clearMessage();


        const email =
          loginEmail
            ? loginEmail.value.trim()
            : "";


        if (!email) {

          showMessage(
            "Pehle apna email address enter karo.",
            "error"
          );

          if (loginEmail) {
            loginEmail.focus();
          }

          return;

        }


        if (!supabaseClient) {

          const initialized =
            initializeSupabase();

          if (!initialized) {

            showMessage(
              "Password reset service load nahi hui. Page refresh karein.",
              "error"
            );

            return;

          }

        }


        try {

          forgotPasswordButton.disabled = true;
          forgotPasswordButton.textContent =
            "Sending...";


          const resetRedirectURL =
            `${window.location.origin}/pages/reset-password.html`;


          const { error } =
            await supabaseClient.auth
              .resetPasswordForEmail(
                email,
                {
                  redirectTo:
                    resetRedirectURL
                }
              );


          if (error) {
            throw error;
          }


          showMessage(
            "Password reset link aapke email par bhej diya gaya hai.",
            "success"
          );


        } catch (error) {

          console.error(
            "Password reset error:",
            error
          );


          let message =
            error && error.message
              ? error.message
              : "Password reset link send nahi ho saka.";


          if (
            message
              .toLowerCase()
              .includes("failed to fetch")
          ) {

            message =
              "Server se connection nahi ho pa raha. Internet check karke dobara try karein.";

          }


          showMessage(
            message,
            "error"
          );


        } finally {

          forgotPasswordButton.disabled = false;
          forgotPasswordButton.textContent =
            "Forgot Password?";

        }

      }
    );

  }

});ssss