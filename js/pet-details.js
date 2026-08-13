document.addEventListener(
  "DOMContentLoaded",
  loadPetDetails
);


const PUBLIC_REPORT_FIELDS = [
  "id",
  "report_type",
  "pet_name",
  "pet_type",
  "breed",
  "color",
  "gender",
  "age",
  "city",
  "state",
  "area",
  "report_date",
  "report_time",
  "reward",
  "details",
  "image_url",
  "created_at"
].join(",");


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
        .select(PUBLIC_REPORT_FIELDS)
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
      "Pet report load nahi ho paayi. Please try again."
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
    pet.breed || "Breed not provided"
  );

  setText(
    "detailsTypeValue",
    pet.pet_type || "Not provided"
  );

  setText(
    "detailsColor",
    pet.color || "Not provided"
  );

  setText(
    "detailsGender",
    pet.gender || "Not provided"
  );

  setText(
    "detailsAge",
    pet.age || "Not provided"
  );

  setText(
    "detailsDate",
    formatPetDate(
      pet.report_date || pet.created_at
    )
  );

  setText(
    "detailsTime",
    pet.report_time || "Not provided"
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
    location || "Location not provided"
  );

  setText(
    "detailsDescription",
    pet.details ||
    "No additional identification details provided."
  );

  const contactHeading =
    document.getElementById("contactHeading");

  contactHeading.textContent =
    reportType === "found"
      ? "👤 Contact the Finder"
      : "👤 Contact the Owner";

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

  setupContactReveal(
    pet.id,
    reportType
  );
}


function setupContactReveal(
  reportId,
  reportType
) {
  const callButton =
    document.getElementById("detailsCallButton");

  const whatsappButton =
    document.getElementById(
      "detailsWhatsappButton"
    );

  const revealButton =
    document.getElementById(
      "detailsRevealContactButton"
    );

  const contactStatus =
    document.getElementById(
      "detailsContactStatus"
    );

  if (
    !callButton ||
    !whatsappButton ||
    !revealButton ||
    !contactStatus
  ) {
    return;
  }

  const personLabel =
    reportType === "found"
      ? "finder"
      : "owner";

  callButton.hidden = true;
  whatsappButton.hidden = true;
  revealButton.hidden = false;
  contactStatus.textContent =
    `Contact options are hidden by default to protect the ${personLabel}.`;

  revealButton.addEventListener(
    "click",
    async function () {
      revealButton.disabled = true;
      revealButton.textContent = "Loading contact options...";
      contactStatus.textContent =
        "Please use these options only to help with this pet report.";

      try {
        const { data, error } =
          await supabaseClient
            .from("pet_reports")
            .select("mobile,whatsapp")
            .eq("id", reportId)
            .single();

        if (error) {
          throw error;
        }

        const mobile =
          cleanNumber(data?.mobile);

        const whatsapp =
          cleanNumber(
            data?.whatsapp ||
            data?.mobile
          );

        if (mobile) {
          callButton.hidden = false;
          callButton.href = `tel:${mobile}`;
        }

        if (whatsapp) {
          const whatsappNumber =
            whatsapp.length === 10
              ? `91${whatsapp}`
              : whatsapp;

          whatsappButton.hidden = false;
          whatsappButton.href =
            `https://wa.me/${whatsappNumber}`;
        }

        if (mobile || whatsapp) {
          revealButton.hidden = true;
          contactStatus.textContent =
            "Use contact details only to help reunite this pet. Never ask for passwords, OTPs or money details.";
        } else {
          revealButton.hidden = true;
          contactStatus.textContent =
            "Contact options are not available for this report.";
        }

      } catch (error) {
        console.error(
          "Contact options load error:",
          error
        );

        contactStatus.textContent =
          "Contact options could not be loaded. Please try again.";
        revealButton.disabled = false;
        revealButton.textContent =
          "Show contact options";
      }
    }
  );
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
