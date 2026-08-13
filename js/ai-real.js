// ==========================================================
// FindMyPet India - AI Visual Similarity Search
// TensorFlow.js + MobileNet + Supabase
// ==========================================================

document.addEventListener("DOMContentLoaded", initializeAISearch);

async function initializeAISearch() {
  const imageInput = document.getElementById("petImage");
  const previewArea = document.getElementById("previewArea");
  const previewImage = document.getElementById("previewImage");
  const oldScanButton = document.getElementById("scanButton");
  const scanSection = document.querySelector(".scan-section");
  const resultsSection = document.querySelector(".results-section");
  const resultsGrid = document.querySelector(".results-grid");

  if (
    !imageInput ||
    !oldScanButton ||
    !scanSection ||
    !resultsSection ||
    !resultsGrid
  ) {
    console.warn("AI Search HTML elements nahi mile.");
    return;
  }

  /*
   * Purana click listener laga ho to usse remove karne ke liye
   * button ko clone kiya ja raha hai.
   */
  const scanButton = oldScanButton.cloneNode(true);
  oldScanButton.replaceWith(scanButton);

  let model = null;
  let previewObjectURL = "";

  // --------------------------------------------------------
  // IMAGE PREVIEW
  // --------------------------------------------------------

  imageInput.addEventListener("change", () => {
    const file = imageInput.files?.[0];

    if (previewObjectURL) {
      URL.revokeObjectURL(previewObjectURL);
      previewObjectURL = "";
    }

    if (!file) {
      if (previewArea) {
        previewArea.style.display = "none";
      }

      if (previewImage) {
        previewImage.removeAttribute("src");
      }

      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid pet image.");

      imageInput.value = "";

      if (previewArea) {
        previewArea.style.display = "none";
      }

      return;
    }

    previewObjectURL = URL.createObjectURL(file);

    if (previewImage) {
      previewImage.src = previewObjectURL;
    }

    if (previewArea) {
      previewArea.style.display = "block";
    }
  });

  // --------------------------------------------------------
  // START AI SEARCH
  // --------------------------------------------------------

  scanButton.addEventListener("click", async () => {
    const uploadedFile = imageInput.files?.[0];

    if (!uploadedFile) {
      alert("Please upload a pet photo first.");
      imageInput.focus();
      return;
    }

    if (!uploadedFile.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    setScanningState(scanButton, true);

    scanSection.style.display = "block";
    resultsSection.style.display = "none";
    resultsGrid.innerHTML = "";

    updateScanMessage("AI model load ho raha hai...");

    scanSection.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    let uploadedEmbedding = null;

    try {
      // TensorFlow libraries check
      if (typeof tf === "undefined") {
        throw new Error(
          "TensorFlow.js load nahi hua. AI Search scripts check karein."
        );
      }

      if (typeof mobilenet === "undefined") {
        throw new Error(
          "MobileNet model load nahi hua. Script order check karein."
        );
      }

      // Model ek baar load hoga
      if (!model) {
        model = await mobilenet.load({
          version: 2,
          alpha: 1.0
        });

        console.log("MobileNet model loaded.");
      }

      updateScanMessage("Uploaded pet photo analyze ho rahi hai...");

      const uploadedImage = await fileToImage(uploadedFile);

      uploadedEmbedding = createEmbedding(
        model,
        uploadedImage
      );

      updateScanMessage(
        "Supabase se pet reports load ho rahi hain..."
      );

      const selectedMode = document.querySelector(
  'input[name="searchMode"]:checked'
)?.value;

if (!selectedMode) {
  throw new Error("Please select Lost or Found search mode.");
}

const requiredReportType =
  selectedMode === "lost"
    ? "found"
    : "lost";

const reports = await fetchPetReports(requiredReportType);

      console.log("AI Search reports:", reports);

      if (reports.length === 0) {
        showNoDatabasePhotos(
          scanSection,
          resultsSection,
          resultsGrid
        );
        return;
      }

      const matches = [];
      const failedReports = [];

      // ----------------------------------------------------
      // EACH DATABASE IMAGE COMPARE
      // ----------------------------------------------------

      for (
        let index = 0;
        index < reports.length;
        index += 1
      ) {
        const pet = reports[index];

        updateScanMessage(
          `Photo ${index + 1} of ${reports.length} compare ho rahi hai...`
        );

        let databaseEmbedding = null;

        try {
          const databaseImage =
            await downloadRemoteImage(pet.image_url);

          databaseEmbedding = createEmbedding(
            model,
            databaseImage
          );

          const similarity = cosineSimilarity(
            uploadedEmbedding,
            databaseEmbedding
          );

          matches.push({
            ...pet,
            similarity
          });
        } catch (imageError) {
          console.warn(
            `Report ID ${pet.id} ki photo compare nahi ho saki:`,
            imageError
          );

          failedReports.push({
            id: pet.id,
            image_url: pet.image_url,
            error: imageError.message
          });
        } finally {
          if (databaseEmbedding) {
            databaseEmbedding.dispose();
          }
        }
      }

      console.log("Successful AI matches:", matches);
      console.log("Failed image reports:", failedReports);

      matches.sort(
        (first, second) =>
          second.similarity - first.similarity
      );

      scanSection.style.display = "none";
      resultsSection.style.display = "block";

      if (matches.length === 0) {
        showComparisonFailure(
          resultsGrid,
          reports.length,
          failedReports.length
        );
      } else {
        renderMatches(matches, resultsGrid);
      }

      resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } catch (error) {
      console.error("AI Search Error:", error);

      scanSection.style.display = "none";
      resultsSection.style.display = "block";

      resultsGrid.innerHTML = `
        <div class="homepage-error">
          <h3>AI Search complete nahi ho saki</h3>
          <p>${escapeHTML(error.message)}</p>
          <p>
            Browser Console kholne ke liye F12 dabayein.
          </p>
        </div>
      `;

      resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    } finally {
      if (uploadedEmbedding) {
        uploadedEmbedding.dispose();
      }

      setScanningState(scanButton, false);
    }
  });
}


// ==========================================================
// SUPABASE REPORTS
// ==========================================================

async function fetchPetReports(requiredReportType) {
  const { data, error } = await supabaseClient
    .from("pet_reports")
    .select("*")
    .eq("report_type", requiredReportType)
    .not("image_url", "is", null)
    .neq("image_url", "")
    .order("created_at", { ascending: false });

  console.log("SUPABASE DATA:", data);
  console.log("SUPABASE ERROR:", error);

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter((report) => {
    const imageURL = String(report.image_url || "").trim();

    return (
      imageURL.length > 0 &&
      imageURL !== "EMPTY" &&
      imageURL !== "NULL"
    );
  });
  return data.filter((report) => {
    const imageURL = String(report.image_url ?? "").trim();

    console.log(
      "REPORT:",
      report.id,
      "IMAGE URL:",
      imageURL
    );

    return (
      imageURL.length > 0 &&
      imageURL !== "EMPTY" &&
      imageURL !== "NULL"
    );
  });
  console.log(
    "Reports containing valid image URLs:",
    reportsWithImages
  );

  return reportsWithImages;
}


// ==========================================================
// IMAGE LOADING
// ==========================================================

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const objectURL = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectURL);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectURL);

      reject(
        new Error("Uploaded image load nahi ho saki.")
      );
    };

    image.src = objectURL;
  });
}

/*
 * Remote Supabase image ko pehle fetch karke Blob banaya
 * ja raha hai. Isse direct cross-origin image processing
 * ki problems kam hoti hain.
 */
async function downloadRemoteImage(imageURL) {
  const cleanURL = String(imageURL || "").trim();

  if (!cleanURL) {
    throw new Error("Image URL empty hai.");
  }

  const response = await fetch(cleanURL, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(
      `Image download failed: HTTP ${response.status}`
    );
  }

  const blob = await response.blob();

  if (!blob.type.startsWith("image/")) {
    throw new Error(
      `Invalid image MIME type: ${blob.type}`
    );
  }

  return blobToImage(blob);
}

function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const objectURL = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectURL);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectURL);

      reject(
        new Error("Database image decode nahi ho saki.")
      );
    };

    image.src = objectURL;
  });
}


// ==========================================================
// TENSORFLOW EMBEDDINGS AND SIMILARITY
// ==========================================================

function createEmbedding(model, imageElement) {
  return tf.tidy(() => {
    const embedding = model.infer(
      imageElement,
      true
    );

    return embedding.flatten().clone();
  });
}

function cosineSimilarity(
  firstEmbedding,
  secondEmbedding
) {
  return tf.tidy(() => {
    const epsilon = tf.scalar(1e-8);

    const firstNorm = tf.maximum(
      tf.norm(firstEmbedding),
      epsilon
    );

    const secondNorm = tf.maximum(
      tf.norm(secondEmbedding),
      epsilon
    );

    const normalizedFirst =
      firstEmbedding.div(firstNorm);

    const normalizedSecond =
      secondEmbedding.div(secondNorm);

    const score = normalizedFirst
      .mul(normalizedSecond)
      .sum();

    return score.dataSync()[0];
  });
}


// ==========================================================
// RESULTS RENDERING
// ==========================================================

function renderMatches(matches, resultsGrid) {
  resultsGrid.innerHTML = "";

  const topMatches = matches.slice(0, 12);

  topMatches.forEach((pet, index) => {
    const reportType =
      pet.report_type === "found"
        ? "found"
        : "lost";

    const petName =
      pet.pet_name ||
      pet.pet_type ||
      "Unknown Pet";

    const location = [
      pet.city,
      pet.state
    ]
      .filter(Boolean)
      .join(", ");

    const matchPercentage =
      convertSimilarityToPercentage(
        pet.similarity
      );

    const rawPhone =
      pet.whatsapp ||
      pet.mobile ||
      "";

    const phone = String(rawPhone)
      .replace(/\D/g, "");

    const whatsappNumber =
      phone.length === 10
        ? "91" + phone
        : phone;

    const card =
      document.createElement("article");

    card.className = "match-card";

    const imageBox =
      document.createElement("div");

    imageBox.className = "ai-result-image";

    const status =
      document.createElement("span");

    status.className =
      "status-badge " + reportType;

    status.textContent =
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

    imageBox.append(status);

    if (index === 0) {
      const bestMatch =
        document.createElement("span");

      bestMatch.className =
        "best-match-badge";

      bestMatch.textContent = "BEST MATCH";

      imageBox.appendChild(bestMatch);
    }

    imageBox.appendChild(image);

    const content =
      document.createElement("div");

    content.className = "ai-result-content";

    const title =
      document.createElement("h3");

    title.textContent = petName;

    const similarityRow =
      document.createElement("div");

    similarityRow.className =
      "similarity-row";

    const similarityText =
      document.createElement("strong");

    similarityText.textContent =
      matchPercentage +
      "% Visual Similarity";

    similarityRow.appendChild(similarityText);

    const track =
      document.createElement("div");

    track.className = "similarity-track";

    const fill =
      document.createElement("div");

    fill.className = "similarity-fill";
    fill.style.width =
      matchPercentage + "%";

    track.appendChild(fill);

    const breed =
      document.createElement("p");

    breed.textContent =
      "🐾 " +
      (pet.breed ||
        "Breed not provided");

    const color =
      document.createElement("p");

    color.textContent =
      "🎨 " +
      (pet.color ||
        "Color not provided");

    const locationText =
      document.createElement("p");

    locationText.textContent =
      "📍 " +
      (location ||
        "Location not provided");

    const actions =
      document.createElement("div");

    actions.className =
      "ai-result-actions";

    if (reportType === "lost") {
      const spotted =
        document.createElement("a");

      spotted.className =
        "pet-action-btn sighting-btn";

      spotted.href =
        "pet.html?id=" +
        encodeURIComponent(
          String(pet.id)
        ) +
        "&spotted=1";

      spotted.textContent =
        "👀 I Spotted This Pet";

      actions.appendChild(spotted);
    }

    if (phone) {
      const call =
        document.createElement("a");

      call.className =
        "pet-action-btn call-btn";

      call.href = "tel:" + phone;
      call.textContent = "Call";

      const whatsapp =
        document.createElement("a");

      whatsapp.className =
        "pet-action-btn whatsapp-btn";

      whatsapp.href =
        "https://wa.me/" +
        whatsappNumber;

      whatsapp.target = "_blank";
      whatsapp.rel =
        "noopener noreferrer";

      whatsapp.textContent =
        "WhatsApp";

      actions.append(call, whatsapp);

    } else {
      const unavailable =
        document.createElement("span");

      unavailable.className =
        "contact-unavailable";

      unavailable.textContent =
        "Contact unavailable";

      actions.appendChild(unavailable);
    }

    content.append(
      title,
      similarityRow,
      track,
      breed,
      color,
      locationText,
      actions
    );

    card.append(imageBox, content);

    resultsGrid.appendChild(card);
  });
}

function convertSimilarityToPercentage(similarity) {
  const safeSimilarity = Math.max(
    0,
    Math.min(1, Number(similarity) || 0)
  );

  return Math.round(safeSimilarity * 100);
}


// ==========================================================
// EMPTY / ERROR STATES
// ==========================================================

function showNoDatabasePhotos(
  scanSection,
  resultsSection,
  resultsGrid
) {
  scanSection.style.display = "none";
  resultsSection.style.display = "block";

  resultsGrid.innerHTML = `
    <div class="homepage-empty">
      <h3>Database me valid pet photos nahi mili</h3>
      <p>
        Supabase ke pet_reports table me image_url check karein.
      </p>
      <p>
        Photo ke saath Lost ya Found report submit karein.
      </p>
    </div>
  `;
}

function showComparisonFailure(
  resultsGrid,
  reportCount,
  failedCount
) {
  resultsGrid.innerHTML = `
    <div class="homepage-error">
      <h3>Photos mili, lekin compare nahi ho paayi</h3>
      <p>
        Database reports: ${reportCount}
      </p>
      <p>
        Failed images: ${failedCount}
      </p>
      <p>
        F12 → Console me detailed error dekhein.
      </p>
    </div>
  `;
}


// ==========================================================
// UI HELPERS
// ==========================================================

function updateScanMessage(message) {
  const scanParagraph =
    document.querySelector(".scan-box p");

  if (scanParagraph) {
    scanParagraph.textContent = message;
  }
}

function setScanningState(
  button,
  isScanning
) {
  button.disabled = isScanning;

  button.textContent = isScanning
    ? "AI Scanning..."
    : "🔍 Start AI Search";
}

function escapeHTML(value) {
  const temporaryElement =
    document.createElement("div");

  temporaryElement.textContent =
    String(value ?? "");

  return temporaryElement.innerHTML;
}