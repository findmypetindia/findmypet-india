document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("resetPasswordForm");
  const passwordInput = document.getElementById("newPassword");
  const confirmInput = document.getElementById("confirmNewPassword");
  const button = document.getElementById("resetPasswordButton");
  const message = document.getElementById("resetPasswordMessage");

  if (!form || !passwordInput || !confirmInput || !button || !message) return;

  function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + (type || "error");
  }

  // Supabase JS exchanges a valid recovery code from the URL for a session
  // when the shared client is initialized on this page.
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;

    if (!data || !data.session) {
      showMessage("This password reset link is invalid or has expired. Please request a new link.", "error");
      button.disabled = true;
      return;
    }
  } catch (error) {
    console.error("Password recovery session error:", error);
    showMessage("The reset link could not be verified. Please request a new link.", "error");
    button.disabled = true;
    return;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const password = passwordInput.value;
    const confirmation = confirmInput.value;

    if (password.length < 6) {
      showMessage("Password must contain at least 6 characters.", "error");
      passwordInput.focus();
      return;
    }

    if (password !== confirmation) {
      showMessage("The passwords do not match.", "error");
      confirmInput.focus();
      return;
    }

    button.disabled = true;
    button.textContent = "Updating...";
    showMessage("", "success");

    try {
      const { error } = await supabaseClient.auth.updateUser({ password: password });
      if (error) throw error;

      form.reset();
      showMessage("Your password has been updated. You can now log in with your new password.", "success");

      // End the recovery session after a successful password change.
      await supabaseClient.auth.signOut();
      button.textContent = "Password Updated";
    } catch (error) {
      console.error("Password update error:", error);
      showMessage(error && error.message ? error.message : "Password could not be updated. Please request a new reset link.", "error");
      button.disabled = false;
      button.textContent = "Update Password";
    }
  });
});
