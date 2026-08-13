let currentSightingPet = null;

document.addEventListener(
  "DOMContentLoaded",
  function () {
    setupSightingModal();
    loadPetDetails();
  }
);

async function loadPetDetails() {
  const loadingBox =
    document.getElementById("petDetailsLoading");

  const errorBox =
    document.getElementById("petDetailsError");

  const errorMessage =
    document.getElementById(
      "petDetailsErrorMessage"
    );

  const detailsCard =
    document.getElementById("petDetailsCard");

  const urlParameters =
    new URLSearchParams(window.location.search);

  const petId =
    urlParameters.get("id");

  if (!petId || !/^\d+$/.test(petId)) {
    showDetailsError(
      "Pet report ID missing ya invalid hai."
    );

    return;
  }

  try {
    const { data: pet, error } =
      await supabaseClient
        .from("pet_reports")
        .select("*")
        .eq("id", petId)
        .single();

    if (error) {
      throw error;
    }

    if (!pet) {
      throw new Error(
        "Pet report nahi mili."
      );
    }

    displayPetDetails(pet);

    loadingBox.hidden = true;
    errorBox.hidden = true;
    detailsCard.hidden = false;

  } catch (error) {
    console.error(
      "Pet details load error:",
      error
    );

    showDetailsError(
      error.message ||
      "Pet details load nahi ho paayi."
    );
  }

  function showDetailsError(message) {
    loadingBox.hidden = true;
    detailsCard.hidden = true;
    errorBox.hidden = false;

    errorMessage.textContent = message;
  }
}

function displayPetDetails(pet) {
  const reportType =
    pet.report_type === "found"
      ? "found"
      : "lost";

  const petName =
    pet.pet_name ||
    pet.pet_type ||
    "Unknown Pet";

  const imageUrl =
    pet.image_url ||
    "https://placehold.co/900x700?text=Pet+Photo";

  const image =
    document.getElementById("detailsImage");

  image.src = imageUrl;
  image.alt = petName + " pet report";

  image.onerror = function () {
    this.onerror = null;

    this.src =
      "https://placehold.co/900x700?text=Pet+Photo";
  };

  const status =
    document.getElementById("detailsStatus");

  status.textContent =
    reportType.toUpperCase();

  status.className =
    "details-status " + reportType;

  setText(
    "detailsPetName",
    petName
  );

  setText(
    "detailsPetType",
    pet.pet_type || "Pet"
  );

  setText(
    "detailsBreed",
    pet.breed ||
    "Breed not provided"
  );

  setText(
    "detailsTypeValue",
    pet.pet_type ||
    "Not provided"
  );

  setText(
    "detailsColor",
    pet.color ||
    "Not provided"
  );

  setText(
    "detailsGender",
    pet.gender ||
    "Not provided"
  );

  setText(
    "detailsAge",
    pet.age ||
    "Not provided"
  );

  setText(
    "detailsDate",
    formatPetDate(
      pet.report_date ||
      pet.created_at
    )
  );

  setText(
    "detailsTime",
    pet.report_time ||
    "Not provided"
  );

  const location = [
    pet.area,
    pet.city,
    pet.state
  ]
    .filter(Boolean)
    .join(", ");

  setText(
    "detailsLocation",
    location ||
    "Location not provided"
  );

  setText(
    "detailsDescription",
    pet.details ||
    "No additional identification details provided."
  );

  setText(
    "detailsOwnerName",
    pet.owner_name ||
    "Not provided"
  );

  setText(
    "detailsEmail",
    pet.email ||
    "Not provided"
  );

  const contactHeading =
    document.getElementById("contactHeading");

  contactHeading.textContent =
    reportType === "found"
      ? "👤 Finder Contact Information"
      : "👤 Owner Contact Information";

  const rewardSection =
    document.getElementById("rewardSection");

  const rewardValue =
    String(pet.reward || "").trim();

  if (
    reportType === "lost" &&
    rewardValue
  ) {
    rewardSection.hidden = false;

    setText(
      "detailsReward",
      "₹" + rewardValue
    );

  } else {
    rewardSection.hidden = true;
  }

  setupContactButtons(pet);
  setupSightingSection(
    pet,
    reportType,
    petName
  );
}

function setupContactButtons(pet) {
  const callButton =
    document.getElementById(
      "detailsCallButton"
    );

  const whatsappButton =
    document.getElementById(
      "detailsWhatsappButton"
    );

  const mobile =
    cleanNumber(pet.mobile);

  const whatsapp =
    cleanNumber(
      pet.whatsapp ||
      pet.mobile
    );

  if (mobile) {
    callButton.hidden = false;
    callButton.href = "tel:" + mobile;

  } else {
    callButton.hidden = true;
  }

  if (whatsapp) {
    const whatsappNumber =
      whatsapp.length === 10
        ? "91" + whatsapp
        : whatsapp;

    whatsappButton.hidden = false;

    whatsappButton.href =
      "https://wa.me/" + whatsappNumber;

  } else {
    whatsappButton.hidden = true;
  }
}

function setupSightingSection(
  pet,
  reportType,
  petName
) {
  const sightingSection =
    document.getElementById(
      "sightingSection"
    );

  if (!sightingSection) {
    return;
  }

  if (reportType !== "lost") {
    currentSightingPet = null;
    sightingSection.hidden = true;
    return;
  }

  currentSightingPet = pet;
  sightingSection.hidden = false;

  setText(
    "sightingPetSummary",
    "Share where and when you saw " +
    petName +
    ". The owner will receive your sighting message directly."
  );

  const urlParameters =
    new URLSearchParams(window.location.search);

  if (urlParameters.get("spotted") === "1") {
    window.requestAnimationFrame(
      openSightingModal
    );
  }
}

function setupSightingModal() {
  const openButton =
    document.getElementById(
      "openSightingFormButton"
    );

  const form =
    document.getElementById("sightingForm");

  const closeButtons =
    document.querySelectorAll(
      "[data-close-sighting]"
    );

  openButton?.addEventListener(
    "click",
    openSightingModal
  );

  closeButtons.forEach(function (button) {
    button.addEventListener(
      "click",
      closeSightingModal
    );
  });

  form?.addEventListener(
    "submit",
    sendSightingToOwner
  );

  document.addEventListener(
    "keydown",
    function (event) {
      if (event.key === "Escape") {
        closeSightingModal();
      }
    }
  );
}

function openSightingModal() {
  if (!currentSightingPet) {
    return;
  }

  const modal =
    document.getElementById("sightingModal");

  const dateTimeInput =
    document.getElementById(
      "sightingDateTime"
    );

  const message =
    document.getElementById(
      "sightingFormMessage"
    );

  if (!modal) {
    return;
  }

  if (
    dateTimeInput &&
    !dateTimeInput.value
  ) {
    dateTimeInput.value =
      getLocalDateTimeValue();
  }

  if (message) {
    message.textContent = "";
    message.className =
      "sighting-form-message";
  }

  modal.hidden = false;
  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "sighting-modal-open"
  );

  window.setTimeout(function () {
    document
      .getElementById("sightingLocation")
      ?.focus();
  }, 0);
}

function closeSightingModal() {
  const modal =
    document.getElementById("sightingModal");

  if (!modal || modal.hidden) {
    return;
  }

  modal.hidden = true;
  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "sighting-modal-open"
  );
}

function sendSightingToOwner(event) {
  event.preventDefault();

  const pet = currentSightingPet;

  if (!pet) {
    showSightingMessage(
      "Pet report load nahi hui. Please try again.",
      "error"
    );

    return;
  }

  const location =
    cleanText(
      document
        .getElementById("sightingLocation")
        ?.value
    );

  const seenAtValue =
    cleanText(
      document
        .getElementById("sightingDateTime")
        ?.value
    );

  const note =
    cleanText(
      document
        .getElementById("sightingNote")
        ?.value
    );

  if (!location || !seenAtValue) {
    showSightingMessage(
      "Location aur time fill karke bhejein.",
      "error"
    );

    return;
  }

  const petName =
    cleanText(
      pet.pet_name,
      pet.pet_type || "this pet"
    );

  const seenAt =
    formatSightingDateTime(seenAtValue);

  const reportLink =
    window.location.href
      .replace(/[?&]spotted=1/, "")
      .replace(/[?&]$/, "");

  const sightingMessage = [
    "Hi, I spotted a pet listed as LOST on FindMyPet India.",
    "Pet: " + petName,
    "Location: " + location,
    "Seen: " + seenAt,
    note ? "Details: " + note : "",
    "Report: " + reportLink,
    "",
    "Please verify the pet's ownership before arranging a handover."
  ]
    .filter(Boolean)
    .join("\n");

  const whatsapp =
    cleanNumber(
      pet.whatsapp ||
      pet.mobile
    );

  const email =
    cleanText(pet.email);

  if (whatsapp) {
    const whatsappNumber =
      whatsapp.length === 10
        ? "91" + whatsapp
        : whatsapp;

    window.location.href =
      "https://wa.me/" +
      whatsappNumber +
      "?text=" +
      encodeURIComponent(sightingMessage);

    return;
  }

  if (email) {
    const subject =
      "Sighting for " +
      petName +
      " on FindMyPet India";

    window.location.href =
      "mailto:" +
      encodeURIComponent(email) +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(sightingMessage);

    return;
  }

  showSightingMessage(
    "Owner ka WhatsApp ya email available nahi hai.",
    "error"
  );
}

function showSightingMessage(
  message,
  type
) {
  const messageBox =
    document.getElementById(
      "sightingFormMessage"
    );

  if (!messageBox) {
    return;
  }

  messageBox.textContent = message;
  messageBox.className =
    "sighting-form-message " + type;
}

function getLocalDateTimeValue() {
  const now = new Date();
  const timezoneOffset =
    now.getTimezoneOffset() * 60000;

  return new Date(
    now.getTime() - timezoneOffset
  )
    .toISOString()
    .slice(0, 16);
}

function formatSightingDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

function cleanNumber(value) {
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

function setText(elementId, value) {
  const element =
    document.getElementById(elementId);

  if (element) {
    element.textContent = value;
  }
}

function formatPetDate(value) {
  if (!value) {
    return "Not provided";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
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
