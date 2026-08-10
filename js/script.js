// =====================================================
// FindMyPet India - Main JavaScript
// Homepage Search + Lost/Found Reports + Image Upload
// =====================================================


// -----------------------------------------------------
// 1. HOMEPAGE SEARCH
// -----------------------------------------------------

const searchBtn = document.querySelector(".search-card button");
const searchInput = document.querySelector(".search-card input");

if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", searchHomepageReports);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchBtn.click();
    }
  });
}

async function searchHomepageReports() {
  const searchValue = searchInput.value.trim();

  if (!searchValue) {
    alert("Please enter pet name, breed, color or city.");
    searchInput.focus();
    return;
  }

  const reportsGrid = document.getElementById("homepageReportsGrid");
  const resultsSection = document.querySelector(".community-reports");
  const resultsHeading = document.getElementById("communityReportsHeading");

  if (!reportsGrid || !window.supabaseClient) {
    alert("Search is loading. Please try again in a moment.");
    return;
  }

  const originalButtonText = searchBtn.textContent;
  const safeSearchValue = searchValue.replace(/[,%().]/g, " ").trim();

  if (!safeSearchValue) {
    alert("Please enter a valid search term.");
    return;
  }

  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";
  reportsGrid.innerHTML = `
    <div class="homepage-loading">
      <div class="homepage-spinner"></div>
      <p>Matching pet reports search ho rahi hain...</p>
    </div>
  `;
  resultsSection?.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const filter = [
      "pet_name",
      "pet_type",
      "breed",
      "color",
      "city",
      "area",
      "state"
    ]
      .map((field) => `${field}.ilike.%${safeSearchValue}%`)
      .join(",");

    const { data, error } = await supabaseClient
      .from("pet_reports")
      .select("id, report_type, pet_name, pet_type, breed, color, city, state, report_date, mobile, image_url, created_at")
      .or(filter)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    if (resultsHeading) {
      resultsHeading.textContent = `🔎 Search Results for “${searchValue}”`;
    }

    reportsGrid.innerHTML = "";

    if (!data?.length) {
      reportsGrid.innerHTML = `
        <div class="homepage-empty">
          <h3>Koi matching pet report nahi mili</h3>
          <p>Pet name, breed, colour ya city ka doosra keyword try karein.</p>
        </div>
      `;
      return;
    }

    data.forEach((pet) => {
      reportsGrid.appendChild(createHomepagePetCard(pet));
    });
  } catch (error) {
    console.error("Homepage search error:", error);
    reportsGrid.innerHTML = `
      <div class="homepage-error">
        <h3>Search complete nahi ho paayi</h3>
        <p>Please refresh karke dobara try karein.</p>
      </div>
    `;
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = originalButtonText;
  }
}


// -----------------------------------------------------
// 2. IMAGE UPLOAD TO SUPABASE STORAGE
// -----------------------------------------------------

async function uploadPetImage(file) {
  if (!file) {
    return "";
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Only JPG, PNG and WebP images are allowed."
    );
  }

  const maximumSize = 10 * 1024 * 1024;

  if (file.size > maximumSize) {
    throw new Error(
      "Image size must be less than 10 MB."
    );
  }

  const originalExtension =
    file.name.split(".").pop()?.toLowerCase() || "jpg";

  const safeExtension =
    originalExtension === "jpeg"
      ? "jpeg"
      : originalExtension;

  const uniqueName =
    `${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;

  const filePath = `reports/${uniqueName}`;

  const { error: uploadError } =
    await supabaseClient.storage
      .from("pet-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });

  if (uploadError) {
    console.error(
      "Supabase image upload error:",
      uploadError
    );

    throw new Error(uploadError.message);
  }

  const { data: publicURLData } =
    supabaseClient.storage
      .from("pet-images")
      .getPublicUrl(filePath);

  if (!publicURLData?.publicUrl) {
    throw new Error(
      "Image URL could not be generated."
    );
  }

  return {
  imageUrl: publicURLData.publicUrl,
  imagePath: filePath
};
}


// -----------------------------------------------------
// 3. SAVE REPORT TO DATABASE
// -----------------------------------------------------

async function savePetReport(reportData) {
  const { data, error } = await supabaseClient
    .from("pet_reports")
    .insert([reportData])
    .select()
    .single();

  if (error) {
    console.error(
      "Supabase database error:",
      error
    );

    throw new Error(error.message);
  }

  return data;
}


// -----------------------------------------------------
// 4. BUTTON LOADING STATE
// -----------------------------------------------------

function setSubmitButtonLoading(
  button,
  isLoading,
  normalText
) {
  if (!button) return;

  button.disabled = isLoading;

  button.textContent = isLoading
    ? "Submitting..."
    : normalText;
}


// -----------------------------------------------------
// 5. LOST PET FORM
// -----------------------------------------------------

const lostForm =
  document.querySelector(
    ".lost-form:not(.found-form)"
  );

if (lostForm) {
  lostForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const submitButton =
        lostForm.querySelector(
          'button[type="submit"]'
        );

      const formFields =
        lostForm.querySelectorAll(
          "input, select, textarea"
        );

      const imageInput =
        lostForm.querySelector(
          'input[type="file"]'
        );

      const imageFile =
        imageInput?.files?.[0] || null;

      setSubmitButtonLoading(
        submitButton,
        true,
        "Submit Lost Pet Report"
      );

      try {
        const imageURL =
          await uploadPetImage(imageFile);

        const reportData = {
          report_type: "lost",

          owner_name:
            formFields[0]?.value.trim() || "",

          mobile:
            formFields[1]?.value.trim() || "",

          email:
            formFields[2]?.value.trim() || "",

          whatsapp:
            formFields[3]?.value.trim() || "",

          pet_name:
            formFields[4]?.value.trim() || "",

          pet_type:
            formFields[5]?.value || "",

          breed:
            formFields[6]?.value.trim() || "",

          color:
            formFields[7]?.value.trim() || "",

          gender:
            formFields[8]?.value || "",

          age:
            formFields[9]?.value.trim() || "",

          city:
            formFields[10]?.value.trim() || "",

          state:
            formFields[11]?.value.trim() || "",

          area:
            formFields[12]?.value.trim() || "",

          report_date:
            formFields[13]?.value || "",

          report_time:
            formFields[14]?.value || "",

          reward:
            formFields[15]?.value.trim() || "",

          details:
            formFields[16]?.value.trim() || "",

        image_url: imageUrl,
image_path: imagePath,
        };

        await savePetReport(reportData);

        lostForm.reset();
      } catch (error) {
        console.error(
          "Lost report submission error:",
          error
        );

        alert(
          "Report submit nahi hui: " +
          error.message
        );
      } finally {
        setSubmitButtonLoading(
          submitButton,
          false,
          "Submit Lost Pet Report"
        );
      }
    }
  );
}


// -----------------------------------------------------
// 6. FOUND PET FORM
// -----------------------------------------------------

const foundForm =
  document.querySelector(".found-form");

if (foundForm) {
  foundForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const submitButton =
        foundForm.querySelector(
          'button[type="submit"]'
        );

      const formFields =
        foundForm.querySelectorAll(
          "input, select, textarea"
        );

      const imageInput =
        foundForm.querySelector(
          'input[type="file"]'
        );

      const imageFile =
        imageInput?.files?.[0] || null;

      setSubmitButtonLoading(
        submitButton,
        true,
        "Submit Found Report"
      );

      try {
        const imageURL =
          await uploadPetImage(imageFile);

        const reportData = {
          report_type: "found",

          owner_name:
            formFields[0]?.value.trim() || "",

          mobile:
            formFields[1]?.value.trim() || "",

          email:
            formFields[2]?.value.trim() || "",

          whatsapp:
            formFields[3]?.value.trim() || "",

          pet_name: "",

          pet_type:
            formFields[4]?.value || "",

          breed:
            formFields[5]?.value.trim() || "",

          color:
            formFields[6]?.value.trim() || "",

          gender:
            formFields[7]?.value || "",

          age:
            formFields[8]?.value.trim() || "",

          city:
            formFields[10]?.value.trim() || "",

          state:
            formFields[11]?.value.trim() || "",

          area:
            formFields[12]?.value.trim() || "",

          report_date:
            formFields[13]?.value || "",

          report_time:
            formFields[14]?.value || "",

          reward: "",

          details:
            formFields[16]?.value.trim() || "",

          image_url: imageURL
        };

        await savePetReport(reportData);

        alert(
          "Found pet report saved successfully! 🐾"
        );

        foundForm.reset();
      } catch (error) {
        console.error(
          "Found report submission error:",
          error
        );

        alert(
          "Report submit nahi hui: " +
          error.message
        );
      } finally {
        setSubmitButtonLoading(
          submitButton,
          false,
          "Submit Found Report"
        );
      }
    }
  );
}
