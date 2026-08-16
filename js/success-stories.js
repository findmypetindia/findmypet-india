document.addEventListener("DOMContentLoaded", function () {
  applySuccessStoriesSeo();
  loadSuccessStories();
});

function applySuccessStoriesSeo() {
  document.documentElement.lang = "en-IN";
  document.title = "Pet Reunion Success Stories in India | FindMyPet India";

  upsertMeta("description", "Read pet reunion success stories from FindMyPet India and see how lost and found pet reports can help families and rescuers reconnect pets with their homes.");
  upsertMeta("robots", "index, follow");
  upsertProperty("og:title", "Pet Reunion Success Stories | FindMyPet India");
  upsertProperty("og:description", "Discover reunion stories from the FindMyPet India lost and found pet community.");
  upsertProperty("og:url", "https://findmypetindia.com/pages/success-stories.html");
  upsertProperty("og:type", "website");

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = "https://findmypetindia.com/pages/success-stories.html";
}

function upsertMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function upsertProperty(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

async function loadSuccessStories() {
  const storiesGrid =
    document.getElementById("successStoriesGrid");

  if (!storiesGrid) return;

  storiesGrid.innerHTML = `
    <div class="success-state">
      Loading success stories...
    </div>
  `;

  try {
    const { data, error } =
      await supabaseClient
        .from("pet_reports")
        .select("*")
        .eq("status", "reunited")
        .order("updated_at", {
          ascending: false
        });
console.log("DATA =", data);
console.log("ERROR =", error);
    if (error) {
      throw error;
    }

    const reports =
      Array.isArray(data) ? data : [];

    if (reports.length === 0) {
      storiesGrid.innerHTML = `
        <div class="success-state">
          <h3>No Success Stories Yet</h3>
          <p>
            Reunited pets yahan automatically dikhengi.
          </p>
        </div>
      `;

      return;
    }

    storiesGrid.innerHTML = "";

    reports.forEach(function (report) {
      const card =
        document.createElement("article");

      card.className =
        "success-story-card";

      const petName =
        report.pet_name ||
        report.pet_type ||
        "Pet";

      const location =
        [report.city, report.state]
          .filter(Boolean)
          .join(", ");

      const imageUrl =
        report.image_url ||
        "https://placehold.co/600x420?text=Pet+Photo";

      const reportLabel =
        report.report_type === "found"
          ? "FOUND & REUNITED"
          : "LOST & REUNITED";

      card.innerHTML = `
        <div class="success-story-image">

          <span class="success-story-badge">
            ❤️ REUNITED
          </span>

          <img
            src="${imageUrl}"
            alt="${petName} reunited pet story"
            onerror="
              this.onerror=null;
              this.src='https://placehold.co/600x420?text=Pet+Photo';
            "
          >

        </div>

        <div class="success-story-content">

          <span class="success-story-type">
            ${reportLabel}
          </span>

          <h2>${petName}</h2>

          <p>
            ${report.breed || report.pet_type || "Pet details not provided"}
          </p>

          <small>
            📍 ${location || "Location not provided"}
          </small>

          <small>
            📅 ${formatSuccessDate(
              report.updated_at ||
              report.created_at
            )}
          </small>

          <a
            href="pet.html?id=${report.id}"
            class="btn btn-primary"
          >
            View Story
          </a>

        </div>
      `;

      storiesGrid.appendChild(card);
    });

  } catch (error) {
    console.error(
      "Success stories load error:",
      error
    );

    storiesGrid.innerHTML = `
      <div class="success-state success-error">
        <h3>Success stories load nahi ho paayi</h3>

        <p>
          ${error.message || "Please try again."}
        </p>
      </div>
    `;
  }
}

function formatSuccessDate(value) {
  if (!value) {
    return "Date not available";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );
}