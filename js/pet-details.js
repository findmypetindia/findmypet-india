document.addEventListener(
  "DOMContentLoaded",
  loadPetDetails
);


async function loadPetDetails() {
  const loadingBox =
    document.getElementById("petDetailsLoading");

  const errorBox =
    document.getElementById("petDetailsError");

  const errorMessage =
    document.getElementById("petDetailsErrorMessage");

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
  image.alt = `${petName} pet report`;

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
    `details-status ${reportType}`;


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
      `₹${rewardValue}`
    );

  } else {
    rewardSection.hidden = true;
  }


  setupContactButtons(pet);
}


function setupContactButtons(pet) {
  const callButton =
    document.getElementById("detailsCallButton");

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
    callButton.href = `tel:${mobile}`;

  } else {
    callButton.hidden = true;
  }


  if (whatsapp) {
    const whatsappNumber =
      whatsapp.length === 10
        ? `91${whatsapp}`
        : whatsapp;

    whatsappButton.hidden = false;

    whatsappButton.href =
      `https://wa.me/${whatsappNumber}`;

  } else {
    whatsappButton.hidden = true;
  }
}


function cleanNumber(value) {
  return String(value || "")
    .replace(/\D/g, "");
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