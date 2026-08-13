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

  const rememberMe =
    document.getElementById("rememberMe");

  const REMEMBERED_EMAIL_KEY =
    "findmypet_remembered_email";


  // =====================================
  // REMEMBERED EMAIL
  // Password kabhi save nahi hota
  // =====================================

  function restoreRememberedEmail() {
    if (!loginEmail || !rememberMe) return;

    try {
      const rememberedEmail =
        localStorage.getItem(REMEMBERED_EMAIL_KEY);

      if (rememberedEmail) {
        loginEmail.value = rememberedEmail;
        rememberMe.checked = true;
      }
    } catch (error) {
      console.warn("Could not restore remembered email:", error);
    }
  }


  function updateRememberedEmail(email) {
    try {
      if (rememberMe && rememberMe.checked) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    } catch (error) {
      console.warn("Could not update remembered email:", error);
    }
  }


  restoreRememberedEmail();


  // Save immediately when the checkbox is selected.
  // This also works before submitting the form.
  if (rememberMe) {
    rememberMe.addEventListener("change", function () {
      const email = loginEmail ? loginEmail.value.trim() : "";

      if (rememberMe.checked && email) {
        updateRememberedEmail(email);
      }

      if (!rememberMe.checked) {
        updateRememberedEmail("");
      }
    });
  }


  if (loginEmail) {
    loginEmail.addEventListener("input", function () {
      if (rememberMe && rememberMe.checked) {
        updateRememberedEmail(loginEmail.value.trim());
      }
    });
  }


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


  function getPostLoginDestination() {
    const requestedPath =
      new URLSearchParams(
        window.location.search
      ).get("next");

    if (!requestedPath) {
      return window.location.origin + "/index.html";
    }

    try {
      const destination = new URL(
        requestedPath,
        window.location.origin
      );

      const blockedPaths = [
        "/pages/login.html",
        "/pages/signup.html",
        "/pages/verify-email.html"
      ];

      if (
        destination.origin === window.location.origin &&
        !blockedPaths.includes(destination.pathname)
      ) {
        return destination.toString();
      }
    } catch (error) {
      console.warn(
        "Invalid post-login destination:",
        error
      );
    }

    return window.location.origin + "/index.html";
  }


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


        // Remember only the email when requested.
        // Password is never stored in the browser.
        updateRememberedEmail(email);


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
              getPostLoginDestination()
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

});