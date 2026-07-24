document.addEventListener("DOMContentLoaded", async function () {
  const reportsContainer =
    document.getElementById("dashboardReports");

  const lostCount =
    document.getElementById("lostCount");

  const foundCount =
    document.getElementById("foundCount");

  if (
    !reportsContainer ||
    !lostCount ||
    !foundCount
  ) {
    return;
  }

  reportsContainer.innerHTML =
    "Loading your reports...";

  try {
    const {
      data: { user },
      error: userError
    } =
      await supabaseClient.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const { data, error } =
      await supabaseClient
        .from("pet_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false
        });

    if (error) {
      throw error;
    }

    const reports =
      Array.isArray(data) ? data : [];

    const lostReports =
      reports.filter(function (report) {
        return report.report_type === "lost";
      });

    const foundReports =
      reports.filter(function (report) {
        return report.report_type === "found";
      });

    lostCount.textContent =
      `${lostReports.length} Reports`;

    foundCount.textContent =
      `${foundReports.length} Reports`;

    if (reports.length === 0) {
      reportsContainer.innerHTML = `
        <div class="empty-dashboard">
          <h3>No Reports Yet</h3>
          <p>
            You have not submitted any lost or found pet reports.
          </p>
        </div>
      `;

      return;
    }

    reportsContainer.innerHTML = "";

    reports.forEach(function (report) {
      const card =
        document.createElement("article");

      card.className =
        "dashboard-report-card";

      const petName =
        report.pet_name ||
        report.pet_type ||
        "Unnamed Pet";

      const location =
        [report.city, report.state]
          .filter(Boolean)
          .join(", ");

      const imageUrl =
        report.image_url ||
        "https://placehold.co/500x350?text=Pet+Photo";

      const reportType =
        report.report_type === "found"
          ? "FOUND"
          : "LOST";

      const currentStatus =
        report.status || "active";

      const statusButtonText =
        currentStatus === "reunited"
          ? "Mark as Active"
          : "Mark as Reunited";

      card.innerHTML = `
        <img
          src="${imageUrl}"
          alt="${petName}"
          onerror="
            this.onerror=null;
            this.src='https://placehold.co/500x350?text=Pet+Photo';
          "
        >

        <div class="dashboard-report-info">

          <span class="dashboard-tag ${report.report_type}">
            ${reportType}
          </span>

          <h3>${petName}</h3>

          <p>
            🐾 ${report.pet_type || "Pet type not provided"}
          </p>

          <p>
            📍 ${location || "Location not provided"}
          </p>

          <p>
            📅 ${report.report_date || "Date not provided"}
          </p>

          <a
            href="pet.html?id=${report.id}"
            class="btn btn-primary"
          >
            View Details
          </a>

          <a
            href="edit-report.html?id=${report.id}"
            class="btn btn-warning"
          >
            Edit Report
          </a>

          <button
            type="button"
            class="btn reunited-report-button"
            data-report-id="${report.id}"
            data-current-status="${currentStatus}"
          >
            ${statusButtonText}
          </button>

          <button
            type="button"
            class="btn delete-report-button"
            data-report-id="${report.id}"
          >
            Delete Report
          </button>

        </div>
      `;

      reportsContainer.appendChild(card);
    });

  } catch (error) {
    console.error(
      "Dashboard load error:",
      error
    );

    reportsContainer.innerHTML = `
      <div class="empty-dashboard">
        <h3>Unable to load reports</h3>
        <p>
          ${error.message || "Please try again."}
        </p>
      </div>
    `;
  }
});


// =====================================
// DELETE REPORT
// =====================================

document.addEventListener(
  "click",
  async function (event) {
    const deleteButton =
      event.target.closest(
        ".delete-report-button"
      );

    if (!deleteButton) return;

    const reportId =
      deleteButton.dataset.reportId;

    const confirmed =
      window.confirm(
        "Kya aap is report ko permanently delete karna chahte hain?"
      );

    if (!confirmed) return;

    deleteButton.disabled = true;
    deleteButton.textContent =
      "Deleting...";

    try {
      const { error } =
        await supabaseClient
          .from("pet_reports")
          .delete()
          .eq("id", reportId);

      if (error) {
        throw error;
      }

      alert(
        "Report successfully delete ho gayi."
      );

      window.location.reload();

    } catch (error) {
      console.error(
        "Delete report error:",
        error
      );

      alert(
        error.message ||
        "Report delete nahi ho saki."
      );

      deleteButton.disabled = false;
      deleteButton.textContent =
        "Delete Report";
    }
  }
);


// =====================================
// MARK AS REUNITED / ACTIVE
// =====================================

document.addEventListener(
  "click",
  async function (event) {
    const reunitedButton =
      event.target.closest(
        ".reunited-report-button"
      );

    if (!reunitedButton) return;

    const reportId =
      reunitedButton.dataset.reportId;

    const currentStatus =
      reunitedButton.dataset.currentStatus;

    const newStatus =
      currentStatus === "reunited"
        ? "active"
        : "reunited";

    const confirmMessage =
      newStatus === "reunited"
        ? "Kya pet mil gaya hai? Is report ko Reunited mark karna hai?"
        : "Kya is report ko dobara Active karna hai?";

    const confirmed =
      window.confirm(confirmMessage);

    if (!confirmed) return;

    reunitedButton.disabled = true;
    reunitedButton.textContent =
      "Updating...";

    try {
      const {
        data: { user },
        error: userError
      } =
        await supabaseClient.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        window.location.replace(
          "login.html"
        );
        return;
      }

      const { error } =
        await supabaseClient
          .from("pet_reports")
          .update({
            status: newStatus,
            updated_at:
              new Date().toISOString()
          })
          .eq("id", reportId)
          .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      alert(
        newStatus === "reunited"
          ? "🎉 Pet successfully marked as Reunited!"
          : "✅ Report successfully marked as Active."
      );

      window.location.reload();

    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      alert(
        error.message ||
        "Status update nahi ho saka."
      );

      reunitedButton.disabled = false;

      reunitedButton.textContent =
        currentStatus === "reunited"
          ? "Mark as Active"
          : "Mark as Reunited";
    }
  }
);