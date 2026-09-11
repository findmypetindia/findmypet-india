document.addEventListener("DOMContentLoaded", async function () {
  const reportsContainer = document.getElementById("dashboardReports");
  const lostCount = document.getElementById("lostCount");
  const foundCount = document.getElementById("foundCount");

  if (!reportsContainer || !lostCount || !foundCount) return;

  reportsContainer.textContent = "Loading your reports...";

  try {
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError) throw userError;

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const adminUsersCard = document.getElementById("adminUsersCard");
    if (adminUsersCard && user.app_metadata?.role === "admin") {
      adminUsersCard.hidden = false;
    }

    const { data, error } = await supabaseClient
      .from("pet_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const reports = Array.isArray(data) ? data : [];
    const lostReports = reports.filter((report) => report.report_type === "lost");
    const foundReports = reports.filter((report) => report.report_type === "found");

    lostCount.textContent = `${lostReports.length} Reports`;
    foundCount.textContent = `${foundReports.length} Reports`;

    if (reports.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-dashboard";

      const heading = document.createElement("h3");
      heading.textContent = "No Reports Yet";

      const text = document.createElement("p");
      text.textContent = "You have not submitted any lost or found pet reports.";

      empty.append(heading, text);
      reportsContainer.replaceChildren(empty);
      return;
    }

    reportsContainer.replaceChildren();

    reports.forEach((report) => {
      const card = document.createElement("article");
      card.className = "dashboard-report-card";

      const petName = report.pet_name || report.pet_type || "Unnamed Pet";
      const location = [report.city, report.state].filter(Boolean).join(", ");
      const imageUrl = report.image_url || "https://placehold.co/500x350?text=Pet+Photo";
      const reportType = report.report_type === "found" ? "FOUND" : "LOST";
      const currentStatus = report.status || "active";
      const statusButtonText = currentStatus === "reunited" ? "Mark as Active" : "Mark as Reunited";

      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = petName;
      image.addEventListener("error", function () {
        image.onerror = null;
        image.src = "https://placehold.co/500x350?text=Pet+Photo";
      });

      const info = document.createElement("div");
      info.className = "dashboard-report-info";

      const tag = document.createElement("span");
      tag.className = `dashboard-tag ${report.report_type === "found" ? "found" : "lost"}`;
      tag.textContent = reportType;

      const heading = document.createElement("h3");
      heading.textContent = petName;

      const type = document.createElement("p");
      type.textContent = `🐾 ${report.pet_type || "Pet type not provided"}`;

      const place = document.createElement("p");
      place.textContent = `📍 ${location || "Location not provided"}`;

      const date = document.createElement("p");
      date.textContent = `📅 ${report.report_date || "Date not provided"}`;

      const detailsLink = document.createElement("a");
      detailsLink.href = `pet.html?id=${encodeURIComponent(report.id)}`;
      detailsLink.className = "btn btn-primary";
      detailsLink.textContent = "View Details";

      const editLink = document.createElement("a");
      editLink.href = `edit-report.html?id=${encodeURIComponent(report.id)}`;
      editLink.className = "btn btn-warning";
      editLink.textContent = "Edit Report";

      const reunitedButton = document.createElement("button");
      reunitedButton.type = "button";
      reunitedButton.className = "btn reunited-report-button";
      reunitedButton.dataset.reportId = report.id;
      reunitedButton.dataset.currentStatus = currentStatus;
      reunitedButton.textContent = statusButtonText;

      const archiveButton = document.createElement("button");
      archiveButton.type = "button";
      archiveButton.className = "btn delete-report-button";
      archiveButton.dataset.reportId = report.id;
      archiveButton.textContent = "Archive Report";

      info.append(tag, heading, type, place, date, detailsLink, editLink, reunitedButton, archiveButton);
      card.append(image, info);
      reportsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Dashboard load error:", error);

    const empty = document.createElement("div");
    empty.className = "empty-dashboard";

    const heading = document.createElement("h3");
    heading.textContent = "Unable to load reports";

    const text = document.createElement("p");
    text.textContent = "Please try again.";

    empty.append(heading, text);
    reportsContainer.replaceChildren(empty);
  }
});

// =====================================
// ARCHIVE REPORT
// =====================================

document.addEventListener("click", async function (event) {
  const archiveButton = event.target.closest(".delete-report-button");
  if (!archiveButton) return;

  const reportId = archiveButton.dataset.reportId;
  const confirmed = window.confirm(
    "Kya aap is report ko archive karna chahte hain? Report aur photo recovery ke liye safe rahenge."
  );

  if (!confirmed) return;

  archiveButton.disabled = true;
  archiveButton.textContent = "Archiving...";

  try {
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError) throw userError;
    if (!user) {
      window.location.replace("login.html");
      return;
    }

    const { error } = await supabaseClient
      .from("pet_reports")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", reportId)
      .eq("user_id", user.id);

    if (error) throw error;

    alert("Report archived ho gayi. Data recovery ke liye safe hai.");
    window.location.reload();
  } catch (error) {
    console.error("Archive report error:", error);
    alert("Report archive nahi ho saki. Please try again.");
    archiveButton.disabled = false;
    archiveButton.textContent = "Archive Report";
  }
});

// =====================================
// MARK AS REUNITED / ACTIVE
// =====================================

document.addEventListener("click", async function (event) {
  const reunitedButton = event.target.closest(".reunited-report-button");
  if (!reunitedButton) return;

  const reportId = reunitedButton.dataset.reportId;
  const currentStatus = reunitedButton.dataset.currentStatus;
  const newStatus = currentStatus === "reunited" ? "active" : "reunited";
  const confirmMessage = newStatus === "reunited"
    ? "Kya pet mil gaya hai? Is report ko Reunited mark karna hai?"
    : "Kya is report ko dobara Active karna hai?";

  if (!window.confirm(confirmMessage)) return;

  reunitedButton.disabled = true;
  reunitedButton.textContent = "Updating...";

  try {
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError) throw userError;
    if (!user) {
      window.location.replace("login.html");
      return;
    }

    const { error } = await supabaseClient
      .from("pet_reports")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", reportId)
      .eq("user_id", user.id);

    if (error) throw error;

    alert(
      newStatus === "reunited"
        ? "🎉 Pet successfully marked as Reunited!"
        : "✅ Report successfully marked as Active."
    );
    window.location.reload();
  } catch (error) {
    console.error("Status update error:", error);
    alert("Status update nahi ho saka. Please try again.");
    reunitedButton.disabled = false;
    reunitedButton.textContent = currentStatus === "reunited"
      ? "Mark as Active"
      : "Mark as Reunited";
  }
});