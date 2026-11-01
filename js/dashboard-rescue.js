document.addEventListener("DOMContentLoaded", async function () {
  const list = document.getElementById("dashboardRescueCases");
  const count = document.getElementById("rescueCount");
  const claimForm = document.getElementById("dashboardRescueClaimForm");
  if (!list || !count || !claimForm || typeof supabaseClient === "undefined") return;

  const claimMessage = document.getElementById("dashboardRescueClaimMessage");
  const claimButton = document.getElementById("dashboardRescueClaimButton");
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
  const titleCase = (value) => escapeHtml(String(value || "Not specified").replace(/_/g, " ").replace(/\b\w/g, ch => ch.toUpperCase()));

  async function loadRescueCases() {
    list.textContent = "Loading your rescue complaints...";
    const { data: auth, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !auth?.user) {
      count.textContent = "Login required";
      list.textContent = "Please log in to view your rescue complaints.";
      return;
    }

    const { data, error } = await supabaseClient
      .from("animal_rescue_reports")
      .select("id,complaint_id,status,animal_type,incident_type,severity,city,state,area,created_at")
      .eq("reporter_user_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Rescue dashboard load error:", error);
      count.textContent = "Unable to load";
      list.textContent = "Rescue complaints could not be loaded. Please refresh the page.";
      return;
    }

    const reports = Array.isArray(data) ? data : [];
    count.textContent = reports.length + (reports.length === 1 ? " Complaint" : " Complaints");

    if (!reports.length) {
      const empty = document.createElement("div");
      empty.className = "empty-dashboard";
      const h = document.createElement("h3");
      h.textContent = "No Rescue Complaints Yet";
      const p = document.createElement("p");
      p.textContent = "Rescue complaints submitted while logged in will appear here.";
      const a = document.createElement("a");
      a.href = "animal-rescue.html#emergency-report";
      a.className = "btn btn-primary";
      a.textContent = "Report an Animal Emergency";
      empty.append(h, p, a);
      list.replaceChildren(empty);
      return;
    }

    list.replaceChildren();
    reports.forEach(report => {
      const card = document.createElement("article");
      card.className = "dashboard-report-card dashboard-rescue-case";
      const info = document.createElement("div");
      info.className = "dashboard-report-info";
      const tag = document.createElement("span");
      tag.className = "dashboard-tag found";
      tag.textContent = "ANIMAL RESCUE";
      const h = document.createElement("h3");
      h.textContent = report.complaint_id;
      const details = document.createElement("p");
      details.textContent = (report.animal_type || "Animal") + " · " + (report.incident_type || "Rescue request");
      const place = document.createElement("p");
      place.textContent = "📍 " + [report.area, report.city, report.state].filter(Boolean).join(", ");
      const status = document.createElement("p");
      status.textContent = "Status: " + String(report.status || "submitted").replace(/_/g, " ");
      const date = document.createElement("p");
      date.textContent = "📅 " + (report.created_at ? new Date(report.created_at).toLocaleDateString("en-IN") : "Date unavailable");
      const actions = document.createElement("div");
      actions.className = "dashboard-rescue-actions";
      const chat = document.createElement("a");
      chat.href = "client-chat.html?complaint_id=" + encodeURIComponent(report.complaint_id);
      chat.className = "btn btn-primary";
      chat.textContent = "View complaint & chat";
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn dashboard-rescue-delete";
      del.dataset.complaintId = report.complaint_id;
      del.textContent = "Delete Case";
      actions.append(chat, del);
      info.append(tag, h, details, place, status, date, actions);
      card.append(info);
      list.append(card);
    });
  }

  list.addEventListener("click", async event => {
    const button = event.target.closest(".dashboard-rescue-delete");
    if (!button) return;
    const complaintId = button.dataset.complaintId;
    if (!window.confirm("Permanently delete complaint " + complaintId + "? Its chat history and uploaded media will also be removed. This cannot be undone.")) return;
    button.disabled = true;
    button.textContent = "Deleting...";
    try {
      const { data, error } = await supabaseClient.functions.invoke("animal-rescue-client-chat", {
        body: { action: "delete_case", complaint_id: complaintId }
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Could not delete this case.");
      await loadRescueCases();
    } catch (error) {
      alert(error.message || "Could not delete this case.");
      button.disabled = false;
      button.textContent = "Delete Case";
    }
  });

  claimForm.addEventListener("submit", async event => {
    event.preventDefault();
    claimMessage.textContent = "";
    claimButton.disabled = true;
    claimButton.textContent = "Linking...";
    try {
      const { data, error } = await supabaseClient.functions.invoke("animal-rescue-client-chat", {
        body: {
          action: "claim",
          complaint_id: document.getElementById("dashboardRescueClaimId").value.trim().toUpperCase(),
          chat_key: document.getElementById("dashboardRescueClaimKey").value.trim()
        }
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Could not link complaint.");
      claimMessage.textContent = "Complaint linked successfully. It will now appear in this dashboard.";
      claimForm.reset();
      await loadRescueCases();
    } catch (error) {
      claimMessage.textContent = error.message || "Could not link complaint.";
    } finally {
      claimButton.disabled = false;
      claimButton.textContent = "Link complaint to my account";
    }
  });

  await loadRescueCases();
});
