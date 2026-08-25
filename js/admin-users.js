document.addEventListener("DOMContentLoaded", async function () {
  const message = document.getElementById("usersMessage");
  const table = document.getElementById("usersTable");
  const body = document.getElementById("usersTableBody");
  const search = document.getElementById("userSearch");
  const total = document.getElementById("totalUsers");
  const signedIn = document.getElementById("signedInUsers");
  let users = [];

  function formatDate(value) {
    if (!value) return "Never";
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata"
    }).format(new Date(value));
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char];
    });
  }

  function render(list) {
    body.innerHTML = "";
    if (!list.length) {
      message.textContent = "No matching users found.";
      message.hidden = false;
      table.hidden = true;
      return;
    }

    list.forEach(function (user) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td data-label="Name">${escapeHtml(user.name || "Not provided")}</td>
        <td data-label="Email">${escapeHtml(user.email)}</td>
        <td data-label="Signup date">${escapeHtml(formatDate(user.created_at))}</td>
        <td data-label="Last login">${escapeHtml(formatDate(user.last_sign_in_at))}</td>
        <td data-label="Status"><span class="status-badge ${user.email_confirmed ? "confirmed" : "pending"}">${user.email_confirmed ? "Verified" : "Pending"}</span></td>
      `;
      body.appendChild(row);
    });

    message.hidden = true;
    table.hidden = false;
  }

  try {
    const { data: sessionData, error: sessionError } =
      await supabaseClient.auth.getSession();
    if (sessionError) throw sessionError;

    const session = sessionData && sessionData.session;
    if (!session) {
      window.location.replace("login.html?next=" + encodeURIComponent(window.location.pathname));
      return;
    }

    const response = await fetch(
      "https://vrhaagzkeyzlblgjgidg.supabase.co/functions/v1/admin-users",
      {
        method: "GET",
        headers: {
          "apikey": "sb_publishable_6qEYBNFz3SddtxvOxiCLGg__NAMfQS1",
          "Authorization": "Bearer " + session.access_token
        }
      }
    );

    const payload = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(payload.error || "Users could not be loaded.");

    users = Array.isArray(payload.users) ? payload.users : [];
    total.textContent = String(payload.total ?? users.length);
    signedIn.textContent = String(payload.signed_in ?? users.filter(function (u) { return u.last_sign_in_at; }).length);
    render(users);
  } catch (error) {
    console.error("Admin users load error:", error);
    message.textContent = error.message || "Users could not be loaded.";
    message.classList.add("error");
    table.hidden = true;
  }

  search.addEventListener("input", function () {
    const query = search.value.trim().toLowerCase();
    render(users.filter(function (user) {
      return String(user.name || "").toLowerCase().includes(query) ||
        String(user.email || "").toLowerCase().includes(query);
    }));
  });
});