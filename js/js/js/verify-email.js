const SUPABASE_URL =
  "https://vrhaagzkeyzlblgjgidg.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_6qEYBNFz3SddtxvOxiCLGg__NAMfQS1";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const verificationEmail =
  document.getElementById("verificationEmail");

const resendButton =
  document.getElementById("resendButton");

const verifyMessage =
  document.getElementById("verifyMessage");

const savedEmail =
  localStorage.getItem("signupEmail");

if (savedEmail && verificationEmail) {
  verificationEmail.textContent = savedEmail;
}

function showVerifyMessage(message, type = "error") {
  if (!verifyMessage) return;

  verifyMessage.textContent = message;
  verifyMessage.className = `message ${type}`;
}

if (resendButton) {
  resendButton.addEventListener(
    "click",
    async function () {

      if (!savedEmail) {
        showVerifyMessage(
          "Email address not found. Please sign up again."
        );

        return;
      }

      try {
        resendButton.disabled = true;
        resendButton.textContent = "Sending...";

        const { error } =
          await supabaseClient.auth.resend({
            type: "signup",
            email: savedEmail,
            options: {
              emailRedirectTo:
                `${window.location.origin}/pages/login.html`
            }
          });

        if (error) {
          throw error;
        }

        showVerifyMessage(
          "Verification email sent again. Please check your inbox.",
          "success"
        );

      } catch (error) {
        console.error(
          "Resend verification error:",
          error
        );

        showVerifyMessage(
          error.message ||
          "Verification email could not be sent."
        );

      } finally {
        resendButton.disabled = false;
        resendButton.textContent =
          "Resend Verification Email";
      }

    }
  );
}