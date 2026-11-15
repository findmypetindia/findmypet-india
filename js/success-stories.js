document.addEventListener("DOMContentLoaded", function () {
  applySuccessStoriesSeo();
  loadSuccessStories();
});

function applySuccessStoriesSeo() {
  document.documentElement.lang = "en-IN";
  document.title = "Pet Reunion Stories | FindMyPet India";

  upsertMeta("description", "Browse user-submitted pet reunion updates on FindMyPet India. Learn how reunion reports appear, what details are shared and why every possible match should be verified.");
  upsertMeta("robots", "index, follow");
  upsertProperty("og:title", "Pet Reunion Stories | FindMyPet India");
  upsertProperty("og:description", "Browse user-submitted pet reunion updates and learn how to share a reunion safely.");
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
        .select("id,report_type,pet_name,pet_type,breed,city,state,image_url,updated_at,created_at")
        .eq("status", "reunited")
        .order("updated_at", {
          ascending: false
        });
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
            When a report is marked as reunited by its submitter, it may appear here. Stories are based on user-submitted updates and are not independently verified.
          </p>
        </div>
      `;

      return;
    }

    storiesGrid.innerHTML = "";

    reports.forEach(function (report) {
      const card = document.createElement("article");
      card.className = "success-story-card";

      const petName = String(report.pet_name || report.pet_type || "Pet");
      const petDetails = String(report.breed || report.pet_type || "Pet details not provided");
      const location = [report.city, report.state].filter(Boolean).join(", ");
      const reportLabel = report.report_type === "found" ? "FOUND & REUNITED" : "LOST & REUNITED";

      const imageWrap = document.createElement("div");
      imageWrap.className = "success-story-image";

      const badge = document.createElement("span");
      badge.className = "success-story-badge";
      badge.textContent = "❤️ REUNITED";

      const image = document.createElement("img");
      const fallbackImage = "https://placehold.co/600x420?text=Pet+Photo";
      let safeImageUrl = fallbackImage;
      const rawImageUrl = String(report.image_url || "").trim();
      if (rawImageUrl) {
        try {
          const candidate = new URL(rawImageUrl, window.location.origin);
          if (candidate.protocol === "https:" || candidate.protocol === "http:") safeImageUrl = candidate.href;
        } catch (_) {
          safeImageUrl = fallbackImage;
        }
      }
      image.src = safeImageUrl;
      image.alt = petName + " reunited pet story";
      image.loading = "lazy";
      image.addEventListener("error", function () { image.src = fallbackImage; }, { once: true });
      imageWrap.append(badge, image);

      const content = document.createElement("div");
      content.className = "success-story-content";

      const type = document.createElement("span");
      type.className = "success-story-type";
      type.textContent = reportLabel;

      const heading = document.createElement("h2");
      heading.textContent = petName;

      const details = document.createElement("p");
      details.textContent = petDetails;

      const locationText = document.createElement("small");
      locationText.textContent = "📍 " + (location || "Location not provided");

      const dateText = document.createElement("small");
      dateText.textContent = "📅 " + formatSuccessDate(report.updated_at || report.created_at);

      const storyLink = document.createElement("a");
      storyLink.className = "btn btn-primary";
      storyLink.href = "pet.html?id=" + encodeURIComponent(String(report.id || ""));
      storyLink.textContent = "View Story";

      content.append(type, heading, details, locationText, dateText, storyLink);
      card.append(imageWrap, content);
      storiesGrid.appendChild(card);
    });

  } catch (error) {
    console.error(
      "Success stories load error:",
      error
    );

    const errorState = document.createElement("div");
    errorState.className = "success-state success-error";

    const errorHeading = document.createElement("h3");
    errorHeading.textContent = "Success stories load nahi ho paayi";

    const errorText = document.createElement("p");
    errorText.textContent = error.message || "Please try again.";

    errorState.append(errorHeading, errorText);
    storiesGrid.replaceChildren(errorState);
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