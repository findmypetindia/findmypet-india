// =====================================
// LOST PET FORM + SUPABASE
// =====================================

document.addEventListener("DOMContentLoaded", async function () {
  const lostPetForm = document.getElementById("lostPetForm");

  // Agar current page par lost pet form nahi hai,
  // to code yahin ruk jayega.
  if (!lostPetForm) return;


  // =====================================
  // HTML ELEMENTS
  // =====================================

  const ownerNameInput =
    document.getElementById("ownerName");

  const mobileInput =
    document.getElementById("mobile");

  const emailInput =
    document.getElementById("email");

  const whatsappInput =
    document.getElementById("whatsapp");

  const petNameInput =
    document.getElementById("petName");

  const petTypeInput =
    document.getElementById("petType");

  const breedInput =
    document.getElementById("breed");

  const colorInput =
    document.getElementById("color");

  const genderInput =
    document.getElementById("gender");

  const ageInput =
    document.getElementById("age");

  const cityInput =
    document.getElementById("city");

  const stateInput =
    document.getElementById("state");

  const areaInput =
    document.getElementById("area");

  const reportDateInput =
    document.getElementById("reportDate");

  const reportTimeInput =
    document.getElementById("reportTime");

  const rewardInput =
    document.getElementById("reward");

  const detailsInput =
    document.getElementById("details");

  const petImageInput =
    document.getElementById("petImage");

  const imagePreview =
    document.getElementById("imagePreview");

  const formMessage =
    document.getElementById("formMessage");

  const submitReportButton =
    document.getElementById("submitReportButton");

  const progressSteps =
    document.querySelectorAll(".progress-step");


  // =====================================
  // MESSAGE FUNCTION
  // =====================================

  function showFormMessage(message, type = "error") {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.className = `message ${type}`;

    formMessage.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }


  // =====================================
  // FORM STEP NAVIGATION
  // =====================================

  progressSteps.forEach(function (step) {
    step.style.cursor = "pointer";

    step.addEventListener("click", function () {
      const targetId = step.dataset.target;
      const targetSection =
        document.getElementById(targetId);

      if (!targetSection) return;

      progressSteps.forEach(function (item) {
        item.classList.remove("active");
      });

      step.classList.add("active");

      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });


  // =====================================
  // IMAGE PREVIEW
  // =====================================

  petImageInput.addEventListener("change", function () {
    const selectedFile = petImageInput.files[0];

    if (!selectedFile) {
      imagePreview.src = "";
      imagePreview.style.display = "none";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      showFormMessage(
        "Please select a JPG, PNG or WEBP image.",
        "error"
      );

      petImageInput.value = "";
      imagePreview.src = "";
      imagePreview.style.display = "none";
      return;
    }

    const maximumFileSize =
      10 * 1024 * 1024;

    if (selectedFile.size > maximumFileSize) {
      showFormMessage(
        "Image size 10 MB se kam honi chahiye.",
        "error"
      );

      petImageInput.value = "";
      imagePreview.src = "";
      imagePreview.style.display = "none";
      return;
    }

    const previewUrl =
      URL.createObjectURL(selectedFile);

    imagePreview.src = previewUrl;
    imagePreview.style.display = "block";
  });


  // =====================================
  // CHECK LOGGED-IN USER
  // =====================================

  async function getLoggedInUser() {
    const { data, error } =
      await supabaseClient.auth.getUser();

    if (error) {
      throw error;
    }

    return data.user;
  }


  // Logged-in email automatically fill karna
  try {
    const currentUser =
      await getLoggedInUser();

    if (
      currentUser &&
      currentUser.email &&
      !emailInput.value
    ) {
      emailInput.value = currentUser.email;
    }
  } catch (error) {
    console.warn(
      "User information could not be loaded:",
      error
    );
  }


  // =====================================
  // UPLOAD IMAGE TO STORAGE
  // =====================================

  async function uploadPetImage(
    imageFile,
    userId
  ) {
    const fileExtension =
      imageFile.name
        .split(".")
        .pop()
        .toLowerCase();

    const uniqueFileName =
      `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

    const filePath =
      `${userId}/lost/${uniqueFileName}`;

    const { error: uploadError } =
      await supabaseClient.storage
        .from("pet-images")
        .upload(
          filePath,
          imageFile,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type
          }
        );

    if (uploadError) {
      throw new Error(
        `Photo upload failed: ${uploadError.message}`
      );
    }

    const { data: publicUrlData } =
      supabaseClient.storage
        .from("pet-images")
        .getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
      throw new Error(
        "Photo URL could not be created."
      );
    }

    return {
  imageUrl: publicUrlData.publicUrl,
  imagePath: filePath
};
  }


  // =====================================
  // SUBMIT LOST PET REPORT
  // =====================================

  lostPetForm.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      showFormMessage("", "success");

      const imageFile =
        petImageInput.files[0];

      if (!imageFile) {
        showFormMessage(
          "Please upload your pet photo.",
          "error"
        );

        petImageInput.focus();
        return;
      }

      const mobileNumber =
        mobileInput.value.trim();

      if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
        showFormMessage(
          "Please enter a valid 10-digit Indian mobile number.",
          "error"
        );

        mobileInput.focus();
        return;
      }

      const whatsappNumber =
        whatsappInput.value.trim();

      if (
        whatsappNumber &&
        !/^[6-9]\d{9}$/.test(whatsappNumber)
      ) {
        showFormMessage(
          "Please enter a valid 10-digit WhatsApp number.",
          "error"
        );

        whatsappInput.focus();
        return;
      }

      submitReportButton.disabled = true;
      submitReportButton.textContent =
        "Submitting Report...";

            try {
        const currentUser =
          await getLoggedInUser();

        if (!currentUser) {
          showFormMessage(
            "Lost pet report submit karne ke liye pehle login karein.",
            "error"
          );

          setTimeout(function () {
            window.location.href =
              "login.html";
          }, 1800);

          return;
        }

        showFormMessage(
          "Pet photo upload ho rahi hai...",
          "success"
        );
const uploadedImage =
  await uploadPetImage(
    imageFile,
    currentUser.id
  );

const imageUrl =
  uploadedImage.imageUrl;

const imagePath =
  uploadedImage.imagePath;

        showFormMessage(
          "Report database me save ho rahi hai...",
          "success"
        );

        const reportData = {
          report_type: "lost",

          owner_name:
            ownerNameInput.value.trim(),

          mobile:
            mobileNumber,

          email:
            emailInput.value.trim() ||
            currentUser.email ||
            null,

          whatsapp:
            whatsappNumber || null,

          pet_name:
            petNameInput.value.trim() ||
            null,

          pet_type:
            petTypeInput.value,

          breed:
            breedInput.value.trim() ||
            null,

          color:
            colorInput.value.trim(),

          gender:
            genderInput.value ||
            null,

          age:
            ageInput.value.trim() ||
            null,

          city:
            cityInput.value.trim(),

          state:
            stateInput.value.trim(),

          area:
            areaInput.value.trim(),

          report_date:
            reportDateInput.value,

          report_time:
            reportTimeInput.value ||
            null,

          reward:
            rewardInput.value
              ? rewardInput.value
              : null,

          details:
            detailsInput.value.trim() ||
            null,

          image_url:
  imageUrl,

image_path:
  imagePath,

user_id:
  currentUser.id
        };

        const { error: insertError } =
          await supabaseClient
            .from("pet_reports")
            .insert(reportData);

        if (insertError) {
          throw new Error(
            `Report save failed: ${insertError.message}`
          );
        }

        showFormMessage(
          "Lost pet report successfully submitted! 🐾",
          "success"
        );

        lostPetForm.reset();

        imagePreview.src = "";
        imagePreview.style.display = "none";

        if (currentUser.email) {
          emailInput.value =
            currentUser.email;
        }

        progressSteps.forEach(
          function (step, index) {
            step.classList.toggle(
              "active",
              index === 0
            );
          }
        );

        setTimeout(function () {
          window.location.reload();
        }, 3000);

      } catch (error) {
        console.error(
          "Lost pet report error:",
          error
        );

        showFormMessage(
          error.message ||
            "Report submit nahi ho saki. Please try again.",
          "error"
        );

      } finally {
        submitReportButton.disabled = false;
        submitReportButton.textContent =
          "Submit Lost Pet Report";
      }
    }
  );
});