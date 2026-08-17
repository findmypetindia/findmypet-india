// ==========================================
// FindMyPet India - Homepage Search
// ==========================================

const searchBtn = document.querySelector(".search-card button");
const searchInput = document.querySelector(".search-card input");

if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", searchHomepageReports);

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      searchHomepageReports();
    }
  });
}

async function searchHomepageReports() {
  if (!searchBtn || !searchInput) return;

  const searchValue = searchInput.value.trim();

  if (!searchValue) {
    alert("Please enter pet name, breed, color or city.");
    searchInput.focus();
    return;
  }

  const reportsGrid = document.getElementById("homepageReportsGrid");
  const resultsSection = document.querySelector(".community-reports");
  const resultsHeading = document.querySelector(
    ".community-reports .section-heading h2"
  );

  if (!reportsGrid || typeof supabaseClient === "undefined") {
    alert("Search is loading. Please try again in a moment.");
    return;
  }

  // Keep only characters that are safe inside a PostgREST .or() filter.
  const safeSearchValue = searchValue
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!safeSearchValue) {
    alert("Please enter a valid search term.");
    searchInput.focus();
    return;
  }

  const originalButtonText = searchBtn.textContent;

  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";

  reportsGrid.innerHTML = `
    <div class="homepage-loading">
      <div class="homepage-spinner"></div>
      <p>Matching pet reports search ho rahi hain...</p>
    </div>
  `;

  resultsSection?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  try {
    const filter = [
      "pet_name",
      "pet_type",
      "breed",
      "color",
      "city",
      "area",
      "state"
    ]
      .map(function (field) {
        return `${field}.ilike.%${safeSearchValue}%`;
      })
      .join(",");

    const { data, error } = await supabaseClient
      .from("pet_reports")
      .select(
        "id, report_type, pet_name, pet_type, breed, color, city, state, report_date, mobile, image_url, created_at, status"
      )
      .or(filter)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Closed/reunited/archived reports should not reappear in search results.
    const visibleReports = (Array.isArray(data) ? data : []).filter(
      function (report) {
        return !report.status || report.status === "active";
      }
    );

    if (resultsHeading) {
      resultsHeading.textContent = `🔎 Search Results for “${searchValue}”`;
    }

    reportsGrid.innerHTML = "";

    if (visibleReports.length === 0) {
      reportsGrid.innerHTML = `
        <div class="homepage-empty">
          <h3>Koi matching active pet report nahi mili</h3>
          <p>Pet name, breed, colour ya city ka doosra keyword try karein.</p>
        </div>
      `;
      return;
    }

    if (typeof createHomepagePetCard !== "function") {
      throw new Error("Pet cards are still loading. Please try again.");
    }

    visibleReports.forEach(function (pet) {
      reportsGrid.appendChild(createHomepagePetCard(pet));
    });
  } catch (error) {
    console.error("Homepage search error:", error);

    reportsGrid.innerHTML = `
      <div class="homepage-error">
        <h3>Search complete nahi ho paayi</h3>
        <p>Please refresh karke dobara try karein.</p>
      </div>
    `;
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = originalButtonText;
  }
}
