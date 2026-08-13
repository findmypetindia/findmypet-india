document.addEventListener(
  "DOMContentLoaded",
  loadFilteredReports
);

function formatReportDate(dateValue) {
  if (!dateValue) {
    return "Date not provided";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

function createStateBox(
  className,
  title,
  description
) {
  const box = document.createElement("div");
  const heading = document.createElement("h3");
  const text = document.createElement("p");

  box.className = className;
  heading.textContent = title;
  text.textContent = description;

  box.append(heading, text);

  return box;
}

function makeReportAction(
  className,
  label,
  href,
  newTab
) {
  const link = document.createElement("a");

  link.className =
    "pet-action-btn " + className;
  link.href = href;
  link.textContent = label;

  if (newTab) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  return link;
}

function createReportCard(
  pet,
  reportType
) {
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

  const location = [
    pet.area,
    pet.city,
    pet.state
  ]
    .filter(Boolean)
    .join(", ");

  const phone = String(
    pet.mobile || ""
  ).replace(/\D/g, "");

  const whatsappRaw = String(
    pet.whatsapp ||
    pet.mobile ||
    ""
  ).replace(/\D/g, "");

  const whatsappNumber =
    whatsappRaw.length === 10
      ? "91" + whatsappRaw
      : whatsappRaw;

  const photo =
    document.createElement("div");

  photo.className = "pet-photo";

  const tag =
    document.createElement("span");

  tag.className =
    "tag " + reportType;

  tag.textContent =
    reportType.toUpperCase();

  const image =
    document.createElement("img");

  image.src =
    pet.image_url ||
    "https://placehold.co/600x400?text=Pet+Photo";

  image.alt = petName;
  image.loading = "lazy";

  image.addEventListener(
    "error",
    function () {
      image.src =
        "https://placehold.co/600x400?text=Pet+Photo";
    },
    { once: true }
  );

  photo.append(tag, image);

  const content =
    document.createElement("div");

  content.className = "pet-content";

  const title =
    document.createElement("h3");

  title.textContent = petName;

  const breed =
    document.createElement("p");

  breed.textContent = breedText;

  const locationText =
    document.createElement("small");

  locationText.textContent =
    "📍 " +
    (location || "Location not provided");

  const dateText =
    document.createElement("small");

  dateText.textContent =
    "📅 " +
    formatReportDate(
      pet.report_date ||
      pet.created_at
    );

  const actions =
    document.createElement("div");

  actions.className =
    "pet-card-actions";

  const detailsUrl =
    "pet.html?id=" +
    encodeURIComponent(String(pet.id));

  actions.appendChild(
    makeReportAction(
      "details-btn",
      "View Details",
      detailsUrl,
      false
    )
  );

  if (reportType === "lost") {
    actions.appendChild(
      makeReportAction(
        "sighting-btn",
        "I Spotted This Pet",
        detailsUrl + "&spotted=1",
        false
      )
    );
  }

  if (phone) {
    actions.appendChild(
      makeReportAction(
        "call-btn",
        "Call",
        "tel:+" + phone,
        false
      )
    );
  }

  if (whatsappNumber) {
    actions.appendChild(
      makeReportAction(
        "whatsapp-btn",
        "WhatsApp",
        "https://wa.me/" + whatsappNumber,
        true
      )
    );
  }

  content.append(
    title,
    breed,
    locationText,
    dateText
  );

  if (pet.details) {
    const details =
      document.createElement("p");

    details.className = "pet-details";
    details.textContent = pet.details;

    content.appendChild(details);
  }

  content.appendChild(actions);

  if (!phone && !whatsappNumber) {
    const unavailable =
      document.createElement("span");

    unavailable.className =
      "contact-unavailable";

    unavailable.textContent =
      "Contact unavailable";

    content.appendChild(unavailable);
  }

  card.append(photo, content);

  return card;
}

async function loadFilteredReports() {
  const reportsGrid =
    document.querySelector(
      ".reports-page-grid"
    );

  if (!reportsGrid) {
    return;
  }

  const reportType =
    reportsGrid.dataset.reportType;

  if (!reportType) {
    reportsGrid.replaceChildren(
      createStateBox(
        "homepage-error",
        "Report type missing",
        "Page configuration sahi nahi hai."
      )
    );

    return;
  }

  reportsGrid.replaceChildren(
    createStateBox(
      "homepage-loading",
      "Loading reports",
      "Pet reports load ho rahi hain..."
    )
  );

  try {
    const { data, error } =
      await supabaseClient
        .from("pet_reports")
        .select("*")
        .eq("report_type", reportType)
        .or("status.eq.active,status.is.null")
        .order("created_at", {
          ascending: false
        });

    if (error) {
      throw error;
    }

    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {
      reportsGrid.replaceChildren(
        createStateBox(
          "homepage-empty",
          "No " + reportType + " reports found",
          "Abhi is category me koi report available nahi hai."
        )
      );

      return;
    }

    reportsGrid.replaceChildren();

    data.forEach(function (pet) {
      reportsGrid.appendChild(
        createReportCard(
          pet,
          reportType
        )
      );
    });

  } catch (error) {
    console.error(
      "Reports load error:",
      error
    );

    reportsGrid.replaceChildren(
      createStateBox(
        "homepage-error",
        "Reports load nahi ho paayi",
        error.message ||
          "Please try again."
      )
    );
  }
}
