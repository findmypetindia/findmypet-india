document.addEventListener(
  "DOMContentLoaded",
  loadFilteredReports
);


// =====================================
// SAFE TEXT FUNCTION
// =====================================

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// =====================================
// DATE FORMAT FUNCTION
// =====================================

function formatReportDate(dateValue) {
  if (!dateValue) {
    return "Date not provided";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return escapeHtml(dateValue);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}


// =====================================
// LOAD LOST / FOUND REPORTS
// =====================================

async function loadFilteredReports() {
  const reportsGrid =
    document.querySelector(".reports-page-grid");

  if (!reportsGrid) return;

  const reportType =
    reportsGrid.dataset.reportType;

  if (!reportType) {
    reportsGrid.innerHTML = `
      <div class="homepage-error">
        <h3>Report type missing</h3>
        <p>Page configuration sahi nahi hai.</p>
      </div>
    `;

    return;
  }


  reportsGrid.innerHTML = `
    <div class="homepage-loading">
      <div class="homepage-spinner"></div>
      <p>Pet reports load ho rahi hain...</p>
    </div>
  `;


  try {
    const { data, error } =
      await supabaseClient
        .from("pet_reports")
        .select("id,report_type,pet_name,pet_type,breed,color,city,state,area,report_date,details,image_url,created_at")
        .eq("report_type", reportType)
        .order("created_at", {
          ascending: false
        });

    if (error) {
      throw error;
    }


    if (!Array.isArray(data) || data.length === 0) {
      reportsGrid.innerHTML = `
        <div class="homepage-empty">
          <h3>
            No ${escapeHtml(reportType)} reports found
          </h3>

          <p>
            Abhi is category me koi report available nahi hai.
          </p>
        </div>
      `;

      return;
    }


    reportsGrid.innerHTML = "";


    data.forEach(function (pet) {
      const card =
        document.createElement("article");

      card.className = "pet-card";


      const petName =
        pet.pet_name ||
        pet.pet_type ||
        "Unknown Pet";


      const breedText =
        pet.breed ||
        pet.pet_type ||
        "Breed not provided";


      const location =
        [pet.area, pet.city, pet.state]
          .filter(Boolean)
          .join(", ");


      const imageUrl =
        pet.image_url ||
        "https://placehold.co/600x400?text=Pet+Photo";


      const safePetName =
        escapeHtml(petName);

      const safeBreed =
        escapeHtml(breedText);

      const safeLocation =
        escapeHtml(
          location || "Location not provided"
        );

      const safeImageUrl =
        escapeHtml(imageUrl);

      const safeReportType =
        escapeHtml(reportType.toUpperCase());


      card.innerHTML = `
        <div class="pet-photo">

          <span class="tag ${escapeHtml(reportType)}">
            ${safeReportType}
          </span>

          <img
            src="${safeImageUrl}"
            alt="${safePetName}"
            loading="lazy"
            onerror="
              this.onerror=null;
              this.src='https://placehold.co/600x400?text=Pet+Photo';
            "
          >

        </div>


        <div class="pet-content">

          <h3>${safePetName}</h3>

          <p>${safeBreed}</p>

          <small>
            📍 ${safeLocation}
          </small>

          <small>
            📅 ${formatReportDate(pet.report_date)}
          </small>

          ${
            pet.details
              ? `
                <p class="pet-details">
                  ${escapeHtml(pet.details)}
                </p>
              `
              : ""
          }

          <div class="pet-card-actions">
            <a
              class="pet-action-btn details-btn"
              href="pet.html?id=${pet.id}"
            >
              View Details
            </a>
          </div>

          </div>

        </div>
      `;


      reportsGrid.appendChild(card);
    });

  } catch (error) {
    console.error(
      "Reports load error:",
      error
    );

    reportsGrid.innerHTML = `
      <div class="homepage-error">

        <h3>
          Reports load nahi ho paayi
        </h3>

        <p>
          ${escapeHtml(
            error.message ||
            "Please try again."
          )}
        </p>

      </div>
    `;
  }
}
