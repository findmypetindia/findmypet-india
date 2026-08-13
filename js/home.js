// ==========================================
// FindMyPet India - Dynamic Homepage Reports
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  loadHomepageReports();
});

/**
 * Public data ko HTML me safely display karne ke liye.
 */
function safeText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

/**
 * Mobile number ko Call/WhatsApp links ke liye clean karta hai.
 */
function cleanPhoneNumber(value) {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

/**
 * Latest Lost aur Found reports Supabase se load karta hai.
 */
async function loadHomepageReports() {
  const petGrid =
  document.getElementById("homepageReportsGrid");
  if (!petGrid) {
    return;
  }

  petGrid.innerHTML = `
    <div class="homepage-loading">
      <div class="homepage-spinner"></div>
      <p>Latest pet reports load ho rahi hain...</p>
    </div>
  `;

  try {
    const { data, error } = await supabaseClient
      .from("pet_reports")
      .select(
        `
          id,
          report_type,
          pet_name,
          pet_type,
          breed,
          color,
          city,
          state,
          report_date,
          image_url,
          created_at
        `
      )
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      throw error;
    }

    petGrid.innerHTML = "";

    if (!data || data.length === 0) {
      petGrid.innerHTML = `
        <div class="homepage-empty">
          <h3>Abhi koi report available nahi hai</h3>
          <p>Lost ya Found Pet report submit karke pehli entry add karein.</p>
        </div>
      `;
      return;
    }

    data.forEach((pet) => {
      petGrid.appendChild(createHomepagePetCard(pet));
    });

    updateHomepageStatistics();
  } catch (error) {
    console.error("Homepage reports error:", error);

    petGrid.innerHTML = `
      <div class="homepage-error">
        <h3>Reports load nahi ho paayi</h3>
        <p>${safeText(error.message, "Please refresh the page.")}</p>
        <button type="button" id="retryReportsBtn">
          Try Again
        </button>
      </div>
    `;

    document
      .getElementById("retryReportsBtn")
      ?.addEventListener("click", loadHomepageReports);
  }
}

/**
 * Ek safe pet card create karta hai.
 */
function createHomepagePetCard(pet) {
  const card = document.createElement("article");
  card.className = "pet-card";

  const reportType =
    pet.report_type === "found" ? "found" : "lost";

  const statusLabel =
    reportType === "found" ? "FOUND" : "LOST";

  const petName = safeText(
    pet.pet_name,
    safeText(pet.pet_type, "Unknown Pet")
  );

  const breed = safeText(
    pet.breed,
    safeText(pet.pet_type, "Breed not provided")
  );

  const location = [pet.city, pet.state]
    .map((item) => safeText(item))
    .filter(Boolean)
    .join(", ");

  const date = formatReportDate(
    pet.report_date || pet.created_at
  );

  const photo = document.createElement("div");
  photo.className = "pet-photo";

  const status = document.createElement("span");
  status.className = `tag ${reportType}`;
  status.textContent = statusLabel;

  const image = document.createElement("img");
  image.src =
    safeText(pet.image_url) ||
    "https://placehold.co/600x400?text=Pet+Photo";
  image.alt = `${petName} pet report`;
  image.loading = "lazy";

  image.addEventListener("error", () => {
    image.src =
      "https://placehold.co/600x400?text=Pet+Photo";
  });

  photo.append(status, image);

  const content = document.createElement("div");
  content.className = "pet-content";

  const title = document.createElement("h3");
  title.textContent = petName;

  const breedText = document.createElement("p");
  breedText.textContent = breed;

  const locationText = document.createElement("small");
  locationText.textContent = `📍 ${
    location || "Location not provided"
  }`;

  const dateText = document.createElement("small");
  dateText.textContent = `📅 ${date}`;

  const actionRow = document.createElement("div");
actionRow.className = "pet-card-actions";

const detailsLink =
document.createElement("a");

detailsLink.className =
"pet-action-btn details-btn";

detailsLink.href =
`pages/pet.html?id=${pet.id}`;

detailsLink.textContent =
"View Details";

actionRow.appendChild(detailsLink);

  content.append(
    title,
    breedText,
    locationText,
    dateText,
    actionRow
  );

  card.append(photo, content);

  return card;
}

/**
 * Report date readable format me dikhata hai.
 */
function formatReportDate(value) {
  if (!value) {
    return "Date not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return safeText(value, "Date not provided");
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

/**
 * Homepage statistics ko database values se update karta hai.
 */
async function updateHomepageStatistics() {
  try {
    const { data, error } = await supabaseClient
      .from("pet_reports")
      .select("report_type");

    if (error) {
      throw error;
    }

    const reports = data || [];

    const lostCount = reports.filter(
      (report) => report.report_type === "lost"
    ).length;

    const foundCount = reports.filter(
      (report) => report.report_type === "found"
    ).length;

    const statNumbers =
      document.querySelectorAll(".stat-card h3");

    if (statNumbers[0]) {
      statNumbers[0].textContent =
        lostCount.toLocaleString("en-IN");
    }

    if (statNumbers[1]) {
      statNumbers[1].textContent =
        foundCount.toLocaleString("en-IN");
    }

    /*
     * Reunited aur Active Members ke liye abhi database
     * columns nahi hain. Isliye temporary 0 rakha gaya hai.
     */
    if (statNumbers[2]) {
      statNumbers[2].textContent = "0";
    }

    if (statNumbers[3]) {
      statNumbers[3].textContent = "0";
    }
  } catch (error) {
    console.error("Homepage statistics error:", error);
  }
}
