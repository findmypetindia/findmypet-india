document.addEventListener(
  "DOMContentLoaded",
  loadNgoDirectory
);

async function loadNgoDirectory() {
  const ngoGrid =
    document.getElementById("ngoGrid");

  const searchInput =
    document.getElementById("ngoSearchInput");

  const cityFilter =
    document.getElementById("ngoCityFilter");

  const resultCount =
    document.getElementById("ngoResultCount");

  if (
    !ngoGrid ||
    !searchInput ||
    !cityFilter ||
    !resultCount
  ) {
    return;
  }

  let allNgos = [];

  ngoGrid.innerHTML = `
    <div class="ngo-loading">
      Loading organisations...
    </div>
  `;

  try {
    const { data, error } =
      await supabaseClient
        .from("ngos")
        .select("*")
        .eq("verified", true)
        .order("emergency_available", {
          ascending: false
        })
        .order("name", {
          ascending: true
        });

    if (error) {
      throw error;
    }

    allNgos =
      Array.isArray(data) ? data : [];

    updateCityOptions(allNgos);
    renderNgos(allNgos);

  } catch (error) {
    console.error(
      "NGO directory load error:",
      error
    );

    ngoGrid.innerHTML = `
      <div class="ngo-empty ngo-error">
        <h3>NGOs load nahi ho paayi</h3>

        <p>
          ${escapeText(
            error.message ||
            "Please try again."
          )}
        </p>
      </div>
    `;

    resultCount.textContent =
      "0 organisations";
  }

  searchInput.addEventListener(
    "input",
    applyFilters
  );

  cityFilter.addEventListener(
    "change",
    applyFilters
  );

  function applyFilters() {
    const searchTerm =
      searchInput.value
        .trim()
        .toLowerCase();

    const selectedCity =
      cityFilter.value
        .trim()
        .toLowerCase();

    const filteredNgos =
      allNgos.filter(function (ngo) {
        const searchableText = [
          ngo.name,
          ngo.city,
          ngo.state,
          ngo.address,
          ngo.services
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !searchTerm ||
          searchableText.includes(
            searchTerm
          );

        const matchesCity =
          !selectedCity ||
          String(ngo.city || "")
            .trim()
            .toLowerCase() ===
            selectedCity;

        return (
          matchesSearch &&
          matchesCity
        );
      });

    renderNgos(filteredNgos);
  }

  function renderNgos(ngos) {
    ngoGrid.innerHTML = "";

    resultCount.textContent =
      `${ngos.length} ${
        ngos.length === 1
          ? "organisation"
          : "organisations"
      }`;

    if (ngos.length === 0) {
      ngoGrid.innerHTML = `
        <div class="ngo-empty">
          <h3>No organisations found</h3>

          <p>
            Search ya city filter change karke dekhein.
          </p>
        </div>
      `;

      return;
    }

    ngos.forEach(function (ngo) {
      ngoGrid.appendChild(
        createNgoCard(ngo)
      );
    });
  }
}

function createNgoCard(ngo) {
  const card =
    document.createElement("article");

  card.className =
    "ngo-card";

  const ngoName =
    cleanText(
      ngo.name,
      "Animal Organisation"
    );

  const city =
    cleanText(
      ngo.city,
      "City not provided"
    );

  const state =
    cleanText(
      ngo.state
    );

  const location =
    [city, state]
      .filter(Boolean)
      .join(", ");

  const services =
    cleanText(
      ngo.services,
      "Animal rescue and support services"
    );

  const address =
    cleanText(
      ngo.address,
      location
    );

  const phone =
    cleanPhone(ngo.phone);

  const whatsapp =
    cleanPhone(
      ngo.whatsapp ||
      ngo.phone
    );

  const website =
    cleanUrl(ngo.website);

  const mapsUrl =
    cleanUrl(ngo.maps_url);

  const email =
    cleanText(ngo.email);

  const logoUrl =
    cleanUrl(ngo.logo_url);

  const header =
    document.createElement("div");

  header.className =
    "ngo-card-header";

  const logoBox =
    document.createElement("div");

  logoBox.className =
    "ngo-logo-box";

  if (logoUrl) {
    const logoImage =
      document.createElement("img");

    logoImage.src = logoUrl;
    logoImage.alt = `${ngoName} logo`;

    logoImage.addEventListener(
      "error",
      function () {
        logoBox.textContent = "🐾";
      }
    );

    logoBox.appendChild(logoImage);
  } else {
    logoBox.textContent = "🐾";
  }

  const heading =
    document.createElement("div");

  heading.className =
    "ngo-card-heading";

  const name =
    document.createElement("h3");

  name.textContent = ngoName;

  const locationText =
    document.createElement("p");

  locationText.textContent =
    `📍 ${location}`;

  heading.append(
    name,
    locationText
  );

  header.append(
    logoBox,
    heading
  );

  if (ngo.verified) {
    const verifiedBadge =
      document.createElement("span");

    verifiedBadge.className =
      "ngo-badge verified";

    verifiedBadge.textContent =
      "✓ Verified";

    header.appendChild(
      verifiedBadge
    );
  }

  if (ngo.emergency_available) {
    const emergencyBadge =
      document.createElement("span");

    emergencyBadge.className =
      "ngo-badge emergency";

    emergencyBadge.textContent =
      "🚑 Emergency";

    header.appendChild(
      emergencyBadge
    );
  }

  const content =
    document.createElement("div");

  content.className =
    "ngo-card-content";

  const servicesTitle =
    document.createElement("strong");

  servicesTitle.textContent =
    "Services";

  const servicesText =
    document.createElement("p");

  servicesText.textContent =
    services;

  const addressText =
    document.createElement("p");

  addressText.className =
    "ngo-address";

  addressText.textContent =
    `🏥 ${address}`;

  content.append(
    servicesTitle,
    servicesText,
    addressText
  );

  if (email) {
    const emailText =
      document.createElement("p");

    emailText.className =
      "ngo-email";

    emailText.textContent =
      `✉️ ${email}`;

    content.appendChild(
      emailText
    );
  }

  const actions =
    document.createElement("div");

  actions.className =
    "ngo-card-actions";

  if (phone) {
    actions.appendChild(
      createActionLink({
        href: `tel:+${phone}`,
        label: "📞 Call",
        className: "ngo-action-call"
      })
    );
  }

  if (whatsapp) {
    const whatsappNumber =
      whatsapp.length === 10
        ? `91${whatsapp}`
        : whatsapp;

    actions.appendChild(
      createActionLink({
        href:
          `https://wa.me/${whatsappNumber}`,
        label: "💬 WhatsApp",
        className:
          "ngo-action-whatsapp",
        newTab: true
      })
    );
  }

  if (website) {
    actions.appendChild(
      createActionLink({
        href: website,
        label: "🌐 Website",
        className:
          "ngo-action-website",
        newTab: true
      })
    );
  }

  if (mapsUrl) {
    actions.appendChild(
      createActionLink({
        href: mapsUrl,
        label: "🗺️ Map",
        className:
          "ngo-action-map",
        newTab: true
      })
    );
  }

  if (!actions.children.length) {
    const unavailable =
      document.createElement("span");

    unavailable.className =
      "ngo-contact-unavailable";

    unavailable.textContent =
      "Contact information unavailable";

    actions.appendChild(
      unavailable
    );
  }

  card.append(
    header,
    content,
    actions
  );

  return card;
}

function createActionLink({
  href,
  label,
  className,
  newTab = false
}) {
  const link =
    document.createElement("a");

  link.href = href;

  link.className =
    `ngo-action-button ${className}`;

  link.textContent =
    label;

  if (newTab) {
    link.target = "_blank";
    link.rel =
      "noopener noreferrer";
  }

  return link;
}

function updateCityOptions(ngos) {
  const cityFilter =
    document.getElementById(
      "ngoCityFilter"
    );

  if (!cityFilter) return;

  const currentValue =
    cityFilter.value;

  const cities = [
    ...new Set(
      ngos
        .map(function (ngo) {
          return cleanText(ngo.city);
        })
        .filter(Boolean)
    )
  ].sort(function (firstCity, secondCity) {
    return firstCity.localeCompare(
      secondCity,
      "en"
    );
  });

  cityFilter.innerHTML =
    '<option value="">All Cities</option>';

  cities.forEach(function (city) {
    const option =
      document.createElement("option");

    option.value = city;
    option.textContent = city;

    cityFilter.appendChild(option);
  });

  if (cities.includes(currentValue)) {
    cityFilter.value =
      currentValue;
  }
}

function cleanPhone(value) {
  return String(value || "")
    .replace(/\D/g, "");
}

function cleanText(
  value,
  fallback = ""
) {
  const text =
    String(value ?? "").trim();

  return text || fallback;
}

function cleanUrl(value) {
  const url =
    cleanText(value);

  if (!url) {
    return "";
  }

  if (
    url.startsWith("https://") ||
    url.startsWith("http://")
  ) {
    return url;
  }

  return `https://${url}`;
}

function escapeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}