let currentSightingPet = null;

document.addEventListener("DOMContentLoaded", function () {
  setupSightingModal();
  loadPetDetails();
});

const PUBLIC_REPORT_FIELDS = [
  "id","report_type","pet_name","pet_type","breed","color","gender","age",
  "city","state","area","report_date","report_time","reward","details",
  "additional_info","image_url","created_at"
].join(",");

async function loadPetDetails() {
  const loadingBox = document.getElementById("petDetailsLoading");
  const errorBox = document.getElementById("petDetailsError");
  const errorMessage = document.getElementById("petDetailsErrorMessage");
  const detailsCard = document.getElementById("petDetailsCard");
  const petId = new URLSearchParams(window.location.search).get("id");

  if (!petId || !/^\d+$/.test(petId)) {
    showDetailsError("Pet report ID missing ya invalid hai.");
    return;
  }

  try {
    const { data: pet, error } = await supabaseClient
      .from("pet_reports")
      .select(PUBLIC_REPORT_FIELDS)
      .eq("id", petId)
      .single();

    if (error) throw error;
    if (!pet) throw new Error("Pet report nahi mili.");

    displayPetDetails(pet);
    updatePetSeo(pet);
    loadingBox.hidden = true;
    errorBox.hidden = true;
    detailsCard.hidden = false;
  } catch (error) {
    console.error("Pet details load error:", error);
    showDetailsError("Pet report load nahi ho paayi. Please try again.");
  }

  function showDetailsError(message) {
    loadingBox.hidden = true;
    detailsCard.hidden = true;
    errorBox.hidden = false;
    errorMessage.textContent = message;
  }
}

function updatePetSeo(pet) {
  const reportType = pet.report_type === "found" ? "Found" : "Lost";
  const petName = cleanText(pet.pet_name, cleanText(pet.pet_type, "Pet"));
  const city = cleanText(pet.city);
  const breed = cleanText(pet.breed, cleanText(pet.pet_type, "pet"));
  const locationText = city ? " in " + city : "";
  const title = reportType + " " + petName + locationText + " | FindMyPet India";
  const description = reportType + " " + breed + locationText + ". View this pet report on FindMyPet India and help reunite the pet safely with its family.";
  const canonicalUrl = window.location.origin + window.location.pathname + "?id=" + encodeURIComponent(pet.id);

  document.title = title;
  setMeta("description", description);
  setMetaProperty("og:title", title);
  setMetaProperty("og:description", description);
  setMetaProperty("og:url", canonicalUrl);
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  if (pet.image_url) {
    setMetaProperty("og:image", pet.image_url);
    setMeta("twitter:image", pet.image_url);
  }

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  const listing = document.getElementById("petBreadcrumbListing");
  const current = document.getElementById("petBreadcrumbCurrent");
  if (listing) {
    listing.href = pet.report_type === "found" ? "found.html" : "lost.html";
    listing.textContent = pet.report_type === "found" ? "Found Pets" : "Lost Pets";
  }
  if (current) current.textContent = petName;

  const oldSchema = document.getElementById("petSeoSchema");
  if (oldSchema) oldSchema.remove();
  const schema = document.createElement("script");
  schema.type = "application/ld+json";
  schema.id = "petSeoSchema";
  schema.textContent = JSON.stringify({
    "@context":"https://schema.org",
    "@graph":[
      {
        "@type":"WebPage","@id":canonicalUrl,"url":canonicalUrl,"name":title,
        "description":description,"isPartOf":{"@id":"https://findmypetindia.com/#website"},
        ...(pet.image_url ? {"primaryImageOfPage":{"@type":"ImageObject","url":pet.image_url}} : {})
      },
      {
        "@type":"BreadcrumbList",
        "itemListElement":[
          {"@type":"ListItem","position":1,"name":"Home","item":"https://findmypetindia.com/"},
          {"@type":"ListItem","position":2,"name":pet.report_type === "found" ? "Found Pets" : "Lost Pets","item":"https://findmypetindia.com/pages/" + (pet.report_type === "found" ? "found.html" : "lost.html")},
          {"@type":"ListItem","position":3,"name":petName,"item":canonicalUrl}
        ]
      }
    ]
  });
  document.head.appendChild(schema);
}

function setMeta(name, content) {
  let el = document.querySelector('meta[name="' + name + '"]');
  if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); }
  el.content = content;
}
function setMetaProperty(property, content) {
  let el = document.querySelector('meta[property="' + property + '"]');
  if (!el) { el = document.createElement("meta"); el.setAttribute("property", property); document.head.appendChild(el); }
  el.content = content;
}

function displayPetDetails(pet) {
  const reportType = pet.report_type === "found" ? "found" : "lost";
  const petName = pet.pet_name || pet.pet_type || "Unknown Pet";
  const imageUrl = pet.image_url || "https://placehold.co/900x700?text=Pet+Photo";
  const image = document.getElementById("detailsImage");
  image.src = imageUrl;
  image.alt = reportType + " " + petName + " pet report";
  image.onerror = function () { this.onerror = null; this.src = "https://placehold.co/900x700?text=Pet+Photo"; };

  const status = document.getElementById("detailsStatus");
  status.textContent = reportType.toUpperCase();
  status.className = "details-status " + reportType;

  setText("detailsPetName", petName);
  setText("detailsPetType", pet.pet_type || "Pet");
  setText("detailsBreed", pet.breed || "Breed not provided");
  setText("detailsTypeValue", pet.pet_type || "Not provided");
  setText("detailsColor", pet.color || "Not provided");
  setText("detailsGender", pet.gender || "Not provided");
  setText("detailsAge", pet.age || "Not provided");
  setText("detailsDate", formatPetDate(pet.report_date || pet.created_at));
  setText("detailsTime", pet.report_time || "Not provided");

  const location = [pet.area, pet.city, pet.state].filter(Boolean).join(", ");
  setText("detailsLocation", location || "Location not provided");
  setText("detailsDescription", pet.details || pet.additional_info || "No additional identification details provided.");

  const contactSection = document.querySelector(".contact-section");
  if (contactSection) contactSection.hidden = true;

  const rewardSection = document.getElementById("rewardSection");
  const rewardValue = String(pet.reward || "").trim();
  if (reportType === "lost" && rewardValue) {
    rewardSection.hidden = false;
    setText("detailsReward", "₹" + rewardValue);
  } else {
    rewardSection.hidden = true;
  }

  setupSightingSection(pet, reportType, petName);
}

function setupSightingSection(pet, reportType, petName) {
  const section = document.getElementById("sightingSection");
  if (!section) return;
  if (reportType !== "lost") {
    currentSightingPet = null;
    section.hidden = true;
    return;
  }
  currentSightingPet = pet;
  section.hidden = false;
  setText("sightingPetSummary", "Share where and when you saw " + petName + ". The owner will receive your sighting message directly.");
  if (new URLSearchParams(window.location.search).get("spotted") === "1") {
    window.requestAnimationFrame(openSightingModal);
  }
}

function setupSightingModal() {
  document.getElementById("openSightingFormButton")?.addEventListener("click", openSightingModal);
  document.querySelectorAll("[data-close-sighting]").forEach((button) => button.addEventListener("click", closeSightingModal));
  document.getElementById("sightingForm")?.addEventListener("submit", sendSightingToOwner);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeSightingModal(); });
}

function openSightingModal() {
  if (!currentSightingPet) return;
  const modal = document.getElementById("sightingModal");
  const dateTimeInput = document.getElementById("sightingDateTime");
  const message = document.getElementById("sightingFormMessage");
  if (!modal) return;
  if (dateTimeInput && !dateTimeInput.value) dateTimeInput.value = getLocalDateTimeValue();
  if (message) { message.textContent = ""; message.className = "sighting-form-message"; }
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("sighting-modal-open");
  window.setTimeout(() => document.getElementById("sightingLocation")?.focus(), 0);
}

function closeSightingModal() {
  const modal = document.getElementById("sightingModal");
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("sighting-modal-open");
}

async function sendSightingToOwner(event) {
  event.preventDefault();
  const pet = currentSightingPet;
  if (!pet) { showSightingMessage("Pet report load nahi hui. Please try again.", "error"); return; }

  const location = cleanText(document.getElementById("sightingLocation")?.value);
  const seenAtValue = cleanText(document.getElementById("sightingDateTime")?.value);
  const note = cleanText(document.getElementById("sightingNote")?.value);
  if (!location || !seenAtValue) { showSightingMessage("Location aur time fill karke bhejein.", "error"); return; }

  try {
    const { data: contact, error } = await supabaseClient
      .from("pet_reports")
      .select("mobile,whatsapp,email")
      .eq("id", pet.id)
      .single();
    if (error) throw error;

    const petName = cleanText(pet.pet_name, pet.pet_type || "this pet");
    const seenAt = formatSightingDateTime(seenAtValue);
    const reportLink = window.location.href.replace(/[?&]spotted=1/, "").replace(/[?&]$/, "");
    const msg = [
      "Hi, I spotted a pet listed as LOST on FindMyPet India.",
      "Pet: " + petName,
      "Location: " + location,
      "Seen: " + seenAt,
      note ? "Details: " + note : "",
      "Report: " + reportLink,
      "",
      "Please verify the pet's ownership before arranging a handover."
    ].filter(Boolean).join("\n");

    const whatsapp = cleanNumber(contact?.whatsapp || contact?.mobile);
    const email = cleanText(contact?.email);
    if (whatsapp) {
      const number = whatsapp.length === 10 ? "91" + whatsapp : whatsapp;
      window.location.href = "https://wa.me/" + number + "?text=" + encodeURIComponent(msg);
      return;
    }
    if (email) {
      window.location.href = "mailto:" + encodeURIComponent(email) + "?subject=" + encodeURIComponent("Sighting for " + petName + " on FindMyPet India") + "&body=" + encodeURIComponent(msg);
      return;
    }
    showSightingMessage("Owner ka contact option available nahi hai.", "error");
  } catch (error) {
    console.error("Sighting contact load error:", error);
    showSightingMessage("Contact option load nahi ho paaya. Please try again.", "error");
  }
}

function showSightingMessage(message, type) {
  const box = document.getElementById("sightingFormMessage");
  if (!box) return;
  box.textContent = message;
  box.className = "sighting-form-message " + type;
}
function getLocalDateTimeValue() { const now = new Date(), offset = now.getTimezoneOffset() * 60000; return new Date(now.getTime() - offset).toISOString().slice(0, 16); }
function formatSightingDateTime(value) { const date = new Date(value); if (Number.isNaN(date.getTime())) return value; return date.toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }); }
function cleanNumber(value) { return String(value || "").replace(/\D/g, ""); }
function cleanText(value, fallback = "") { const text = String(value ?? "").trim(); return text || fallback; }
function setText(elementId, value) { const element = document.getElementById(elementId); if (element) element.textContent = value; }
function formatPetDate(value) { if (!value) return "Not provided"; const date = new Date(value); if (Number.isNaN(date.getTime())) return String(value); return date.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }); }
