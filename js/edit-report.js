document.addEventListener("DOMContentLoaded", async function () {
  const loadingBox =
    document.getElementById("editReportLoading");

  const errorBox =
    document.getElementById("editReportError");

  const editForm =
    document.getElementById("editReportForm");

  const messageBox =
    document.getElementById("editReportMessage");

  const saveButton =
    document.getElementById("saveEditButton");

  const reportTypeLabel =
    document.getElementById("editReportTypeLabel");

  const ownerNameInput =
    document.getElementById("editOwnerName");

  const mobileInput =
    document.getElementById("editMobile");

  const emailInput =
    document.getElementById("editEmail");

  const whatsappInput =
    document.getElementById("editWhatsapp");

  const petNameInput =
    document.getElementById("editPetName");

  const petTypeInput =
    document.getElementById("editPetType");

  const breedInput =
    document.getElementById("editBreed");

  const colorInput =
    document.getElementById("editColor");

  const genderInput =
    document.getElementById("editGender");

  const ageInput =
    document.getElementById("editAge");

  const cityInput =
    document.getElementById("editCity");

  const stateInput =
    document.getElementById("editState");

  const areaInput =
    document.getElementById("editArea");

  const reportDateInput =
    document.getElementById("editReportDate");

  const reportTimeInput =
    document.getElementById("editReportTime");

  const rewardInput =
    document.getElementById("editReward");

  const detailsInput =
    document.getElementById("editDetails");

  const imageInput =
    document.getElementById("editImage");

  const currentImage =
    document.getElementById("editCurrentImage");

  const newImagePreview =
    document.getElementById("editNewImagePreview");

  const params =
    new URLSearchParams(window.location.search);

  const reportId =
    params.get("id");

  let currentUser = null;
  let currentReport = null;

  function showMessage(message, type = "error") {
    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
  }

  function showError(message) {
    if (loadingBox) {
      loadingBox.hidden = true;
    }

    if (editForm) {
      editForm.hidden = true;
    }

    if (errorBox) {
      errorBox.hidden = false;
      errorBox.textContent = message;
    }
  }

  if (!reportId || !/^\d+$/.test(reportId)) {
    showError("Invalid report ID.");
    return;
  }

  if (imageInput && newImagePreview) {
    imageInput.addEventListener("change", function () {
      const file =
        imageInput.files[0];

      if (!file) {
        newImagePreview.hidden = true;
        newImagePreview.src = "";
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (!allowedTypes.includes(file.type)) {
        showMessage(
          "Please select a JPG, PNG or WEBP image.",
          "error"
        );

        imageInput.value = "";
        newImagePreview.hidden = true;
        newImagePreview.src = "";
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        showMessage(
          "Image size 10 MB se kam honi chahiye.",
          "error"
        );

        imageInput.value = "";
        newImagePreview.hidden = true;
        newImagePreview.src = "";
        return;
      }

      newImagePreview.src =
        URL.createObjectURL(file);

      newImagePreview.hidden = false;
    });
  }

  async function uploadNewImage(file, userId, reportType) {
    const extension =
      file.name
        .split(".")
        .pop()
        .toLowerCase();

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const folder =
      reportType === "found"
        ? "found"
        : "lost";

    const filePath =
      `${userId}/${folder}/${fileName}`;

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

    if (!data.publicUrl) {
      throw new Error(
        "New photo URL could not be created."
      );
    }

    return {
      imageUrl: data.publicUrl,
      imagePath: filePath
    };
  }

  try {
    const {
      data: { user },
      error: userError
    } =
      await supabaseClient.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      window.location.replace("login.html");
      return;
    }

    currentUser = user;

    const {
      data: report,
      error: reportError
    } =
      await supabaseClient
        .from("pet_reports")
        .select("*")
        .eq("id", reportId)
        .eq("user_id", currentUser.id)
        .single();

    if (reportError) {
      throw reportError;
    }

    currentReport = report;

    if (reportTypeLabel) {
      reportTypeLabel.textContent =
        report.report_type === "found"
          ? "FOUND REPORT"
          : "LOST REPORT";
    }

    ownerNameInput.value =
      report.owner_name || "";

    mobileInput.value =
      report.mobile || "";

    emailInput.value =
      report.email || "";

    whatsappInput.value =
      report.whatsapp || "";

    petNameInput.value =
      report.pet_name || "";

    petTypeInput.value =
      report.pet_type || "";

    breedInput.value =
      report.breed || "";

    colorInput.value =
      report.color || "";

    genderInput.value =
      report.gender || "";

    ageInput.value =
      report.age || "";

    cityInput.value =
      report.city || "";

    stateInput.value =
      report.state || "";

    areaInput.value =
      report.area || "";

    reportDateInput.value =
      report.report_date || "";

    reportTimeInput.value =
      report.report_time || "";

    rewardInput.value =
      report.reward || "";

    detailsInput.value =
      report.details || "";

    if (currentImage) {
      currentImage.src =
        report.image_url ||
        "https://placehold.co/500x350?text=Pet+Photo";
    }

    loadingBox.hidden = true;
    errorBox.hidden = true;
    editForm.hidden = false;

  } catch (error) {
    console.error(
      "Edit report load error:",
      error
    );

    showError(
      error.message ||
      "Report load nahi ho saki."
    );

    return;
  }

  editForm.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      const mobile =
        mobileInput.value.trim();

      const whatsapp =
        whatsappInput.value.trim();

      if (!/^[6-9]\d{9}$/.test(mobile)) {
        showMessage(
          "Please enter a valid 10-digit Indian mobile number.",
          "error"
        );

        mobileInput.focus();
        return;
      }

      if (
        whatsapp &&
        !/^[6-9]\d{9}$/.test(whatsapp)
      ) {
        showMessage(
          "Please enter a valid 10-digit WhatsApp number.",
          "error"
        );

        whatsappInput.focus();
        return;
      }

      saveButton.disabled = true;
      saveButton.textContent =
        "Saving Changes...";

      showMessage(
        "Report update ho rahi hai...",
        "success"
      );

      let newImageData = null;

      try {
        const newImageFile =
          imageInput?.files?.[0] || null;

        if (newImageFile) {
          showMessage(
            "New photo upload ho rahi hai...",
            "success"
          );

          newImageData =
            await uploadNewImage(
              newImageFile,
              currentUser.id,
              currentReport.report_type
            );
        }

        const updatedData = {
          owner_name:
            ownerNameInput.value.trim(),

          mobile: mobile,

          email:
            emailInput.value.trim() ||
            currentUser.email ||
            null,

          whatsapp:
            whatsapp || null,

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

          updated_at:
            new Date().toISOString()
        };

        if (newImageData) {
          updatedData.image_url =
            newImageData.imageUrl;

          updatedData.image_path =
            newImageData.imagePath;
        }

        const { error: updateError } =
          await supabaseClient
            .from("pet_reports")
            .update(updatedData)
            .eq("id", reportId)
            .eq("user_id", currentUser.id);

        if (updateError) {
          throw updateError;
        }

        if (
          newImageData &&
          currentReport.image_path &&
          currentReport.image_path !==
            newImageData.imagePath
        ) {
          const { error: removeError } =
            await supabaseClient.storage
              .from("pet-images")
              .remove([
                currentReport.image_path
              ]);

          if (removeError) {
            console.warn(
              "Old photo delete nahi hui:",
              removeError
            );
          }
        }

        showMessage(
          "Report successfully updated! ✅",
          "success"
        );

        saveButton.textContent =
          "Saved ✓";

        setTimeout(function () {
          window.location.href =
            "dashboard.html";
        }, 1800);

      } catch (error) {
        console.error(
          "Edit report update error:",
          error
        );

        showMessage(
          error.message ||
          "Report update nahi ho saki.",
          "error"
        );

        saveButton.disabled = false;
        saveButton.textContent =
          "Save Changes";
      }
    }
  );
});