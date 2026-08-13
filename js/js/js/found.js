document.addEventListener(
  "DOMContentLoaded",
  async function () {
    const foundPetForm =
      document.getElementById("foundPetForm");

    if (!foundPetForm) return;


    const finderName =
      document.getElementById("finderName");

    const finderMobile =
      document.getElementById("finderMobile");

    const finderEmail =
      document.getElementById("finderEmail");

    const finderWhatsapp =
      document.getElementById("finderWhatsapp");

    const foundPetName =
      document.getElementById("foundPetName");

    const foundPetType =
      document.getElementById("foundPetType");

    const foundBreed =
      document.getElementById("foundBreed");

    const foundColor =
      document.getElementById("foundColor");

    const foundGender =
      document.getElementById("foundGender");

    const foundAge =
      document.getElementById("foundAge");

    const foundCity =
      document.getElementById("foundCity");

    const foundState =
      document.getElementById("foundState");

    const foundArea =
      document.getElementById("foundArea");

    const foundDate =
      document.getElementById("foundDate");

    const foundTime =
      document.getElementById("foundTime");

    const foundDetails =
      document.getElementById("foundDetails");

    const foundPetImage =
      document.getElementById("foundPetImage");

    const foundImagePreview =
      document.getElementById("foundImagePreview");

    const foundFormMessage =
      document.getElementById("foundFormMessage");

    const submitFoundButton =
      document.getElementById("submitFoundButton");

    const privacyConsentInput =
      document.getElementById("foundPrivacyConsent");

    const progressSteps =
      document.querySelectorAll(".progress-step");


   function showFoundMessage(message, type = "error") {
  if (!foundFormMessage) return;

  foundFormMessage.textContent = message;
  foundFormMessage.className = `message ${type}`;
  foundFormMessage.style.display = "block";

  foundFormMessage.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}


    progressSteps.forEach(function (step) {
      step.style.cursor = "pointer";

      step.addEventListener(
        "click",
        function () {
          const targetId =
            step.dataset.target;

          const targetSection =
            document.getElementById(targetId);

          if (!targetSection) return;

          progressSteps.forEach(
            function (item) {
              item.classList.remove("active");
            }
          );

          step.classList.add("active");

          targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      );
    });


    foundPetImage.addEventListener(
      "change",
      function () {
        const file =
          foundPetImage.files[0];

        if (!file) {
          foundImagePreview.style.display =
            "none";

          return;
        }

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
          showFoundMessage(
            "Please select a JPG, PNG or WEBP image.",
            "error"
          );

          foundPetImage.value = "";

          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          showFoundMessage(
            "Image size 10 MB se kam honi chahiye.",
            "error"
          );

          foundPetImage.value = "";

          return;
        }

        foundImagePreview.src =
          URL.createObjectURL(file);

        foundImagePreview.style.display =
          "block";
      }
    );


    async function getCurrentUser() {
      const { data, error } =
        await supabaseClient.auth.getUser();

      if (error) {
        throw error;
      }

      return data.user;
    }


    try {
      const user =
        await getCurrentUser();

      if (
        user &&
        user.email &&
        !finderEmail.value
      ) {
        finderEmail.value = user.email;
      }

    } catch (error) {
      console.warn(
        "User information load nahi hui:",
        error
      );
    }


    async function uploadFoundImage(
      file,
      userId
    ) {
      const extension =
        file.name
          .split(".")
          .pop()
          .toLowerCase();

      const fileName =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const filePath =
        `${userId}/found/${fileName}`;

      const { error: uploadError } =
        await supabaseClient.storage
          .from("pet-images")
          .upload(
            filePath,
            file,
            {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type
            }
          );

      if (uploadError) {
        throw new Error(
          `Photo upload failed: ${uploadError.message}`
        );
      }

      const { data } =
        supabaseClient.storage
          .from("pet-images")
          .getPublicUrl(filePath);

      return data.publicUrl;
    }


    // Re-save photos in the browser before upload so camera metadata,
    // including common EXIF location data, is not sent to storage.
    async function prepareImageForUpload(imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);

      try {
        const image = await new Promise(function (resolve, reject) {
          const imageElement = new Image();

          imageElement.onload = function () {
            resolve(imageElement);
          };

          imageElement.onerror = function () {
            reject(
              new Error(
                "Photo could not be prepared. Please choose a valid image."
              )
            );
          };

          imageElement.src = objectUrl;
        });

        const maximumDimension = 1920;
        const largestDimension = Math.max(
          image.naturalWidth,
          image.naturalHeight
        );
        const scale =
          largestDimension > maximumDimension
            ? maximumDimension / largestDimension
            : 1;
        const width = Math.max(
          1,
          Math.round(image.naturalWidth * scale)
        );
        const height = Math.max(
          1,
          Math.round(image.naturalHeight * scale)
        );
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", {
          alpha: false
        });

        if (!context) {
          throw new Error("Photo preparation is not available in this browser.");
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);

        const imageBlob = await new Promise(function (resolve) {
          canvas.toBlob(resolve, "image/jpeg", 0.9);
        });

        if (!imageBlob) {
          throw new Error("Photo could not be prepared. Please try another image.");
        }

        return new File(
          [imageBlob],
          "pet-photo.jpg",
          {
            type: "image/jpeg"
          }
        );
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }


    function getFriendlyFoundReportError(error) {
      const rawMessage = String(error?.message || "");
      const message = rawMessage.toLowerCase();

      if (
        message.includes("jwt") ||
        message.includes("session") ||
        message.includes("not authenticated")
      ) {
        return "Your sign-in session has expired. Please log in again and submit the report.";
      }

      if (
        message.includes("row-level security") ||
        message.includes("permission") ||
        message.includes("not authorized")
      ) {
        return "We could not verify your account permission. Please log out, log in again and try once more.";
      }

      if (
        message.includes("upload") ||
        message.includes("bucket") ||
        message.includes("storage")
      ) {
        return "The photo could not be uploaded. Please use a JPG, PNG or WEBP image under 10 MB and try again.";
      }

      return "Your found pet report could not be submitted right now. Please try again or contact indiafindmypet@gmail.com.";
    }


    foundPetForm.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();

    const mobile =
      finderMobile.value.trim();

    const whatsapp =
      finderWhatsapp.value.trim();

    const imageFile =
      foundPetImage.files[0];

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      showFoundMessage(
        "Please enter a valid 10-digit mobile number.",
        "error"
      );

      finderMobile.focus();
      return;
    }

    if (
      whatsapp &&
      !/^[6-9]\d{9}$/.test(whatsapp)
    ) {
      showFoundMessage(
        "Please enter a valid 10-digit WhatsApp number.",
        "error"
      );

      finderWhatsapp.focus();
      return;
    }

    if (!imageFile) {
      showFoundMessage(
        "Please upload the found pet photo.",
        "error"
      );

      foundPetImage.focus();
      return;
    }

    if (
      !privacyConsentInput ||
      !privacyConsentInput.checked
    ) {
      showFoundMessage(
        "Please accept the Privacy & Safety notice before publishing your report.",
        "error"
      );

      privacyConsentInput?.focus();
      return;
    }

    submitFoundButton.disabled = true;
    submitFoundButton.textContent =
      "Submitting Report...";

    let reportSubmitted = false;

    try {
      const currentUser =
        await getCurrentUser();

      if (!currentUser) {
        showFoundMessage(
          "Found report submit karne ke liye pehle login karein.",
          "error"
        );

        setTimeout(function () {
          window.location.href = "login.html";
        }, 1800);

        return;
      }

      showFoundMessage(
        "Preparing your photo for a privacy-safe upload...",
        "success"
      );

      const uploadReadyImage =
        await prepareImageForUpload(imageFile);

      showFoundMessage(
        "Pet photo upload ho rahi hai...",
        "success"
      );

      const imageUrl =
        await uploadFoundImage(
          uploadReadyImage,
          currentUser.id
        );

      showFoundMessage(
        "Found pet report save ho rahi hai...",
        "success"
      );

      const reportData = {
        report_type: "found",

        owner_name:
          finderName.value.trim(),

        mobile: mobile,

        email:
          finderEmail.value.trim() ||
          currentUser.email ||
          null,

        whatsapp:
          whatsapp || null,

        pet_name:
          foundPetName.value.trim() ||
          null,

        pet_type:
          foundPetType.value,

        breed:
          foundBreed.value.trim() ||
          null,

        color:
          foundColor.value.trim(),

        gender:
          foundGender.value ||
          null,

        age:
          foundAge.value.trim() ||
          null,

        city:
          foundCity.value.trim(),

        state:
          foundState.value.trim(),

        area:
          foundArea.value.trim(),

        report_date:
          foundDate.value,

        report_time:
          foundTime.value ||
          null,

        reward: null,

        details:
          foundDetails.value.trim() ||
          null,

        image_url:
          imageUrl,

        user_id:
          currentUser.id
      };

      const { error: insertError } =
        await supabaseClient
          .from("pet_reports")
          .insert(reportData);

      if (insertError) {
        throw new Error(
          `Report submit nahi hui: ${insertError.message}`
        );
      }

      reportSubmitted = true;

      showFoundMessage(
        "Found pet report successfully submitted! 🐾",
        "success"
      );

      submitFoundButton.textContent =
        "Report Submitted ✓";

      setTimeout(function () {
        foundPetForm.reset();

        foundImagePreview.src = "";
        foundImagePreview.style.display =
          "none";

        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error(
        "Found report error:",
        error
      );

      showFoundMessage(
        getFriendlyFoundReportError(error),
        "error"
      );

        } finally {
      if (!reportSubmitted) {
        submitFoundButton.disabled = false;

        submitFoundButton.textContent =
          "Submit Found Report";
      }
    }
  }
);

  }
);
