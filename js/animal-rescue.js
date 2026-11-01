(() => {
  const form = document.getElementById("animal-rescue-form");
  if (!form) return;

  const guidance = {
    "Road Accident": "Do not step into traffic or try to stop vehicles. From a safe place, note the road direction and landmark. Do not move a seriously injured animal unless it is in immediate danger and a trained responder advises you.",
    "Injured Animal": "Keep a safe distance and avoid touching wounds or moving the animal. Do not apply medicines or give human painkillers. Share a photo only if it is safe.",
    "Sick or Weak": "Keep the area calm and shaded if you can do so without handling the animal. Do not force food or water, especially if the animal is weak or unconscious.",
    "Trapped Animal": "Do not pull an entangled animal or enter drains, wells or confined spaces. Secure the area from a safe distance and contact trained rescuers.",
    "Stray Cattle": "Do not stand behind or attempt to restrain cattle. Keep traffic and bystanders away only if it is safe, and report the exact road/location.",
    "Bird Rescue": "Avoid handling birds with bare hands or attempting wing treatment. Keep pets and crowds away; injured wild birds should be handled by trained rescuers.",
    "Abandoned Animal": "Observe from a safe distance and check whether the animal is in immediate danger. Do not separate young animals from a nearby mother unless there is a clear emergency.",
    "Wildlife Emergency": "Do not approach, feed, capture or transport wild animals. Keep people away and contact the Forest Department or an authorised wildlife rescue service directly."
  };

  const categorySelect = document.getElementById("incident-type");
  const guidanceBox = document.getElementById("category-guidance");
  const guidanceTitle = document.getElementById("guidance-title");
  const guidanceCopy = document.getElementById("guidance-copy");
  const message = document.getElementById("rescue-form-message");
  const submit = document.getElementById("rescue-submit");
  const mediaInput = document.getElementById("rescue-media");

  function chooseCategory(category) {
    categorySelect.value = category;
    // Open the report form immediately; keep category-specific safety guidance separate.
    guidanceBox.hidden = true;
    document.getElementById("emergency-report").scrollIntoView({ behavior: "smooth", block: "start" });
    categorySelect.focus({ preventScroll: true });
  }

  document.querySelectorAll(".rescue-need-card[data-category]").forEach((button) => {
    button.addEventListener("click", () => chooseCategory(button.dataset.category));
  });
  document.getElementById("guidance-report").addEventListener("click", () => {
    document.getElementById("emergency-report").scrollIntoView({ behavior: "smooth" });
    categorySelect.focus({ preventScroll: true });
  });

  document.getElementById("get-rescue-location").addEventListener("click", () => {
    const status = document.getElementById("gps-status");
    if (!navigator.geolocation) {
      status.textContent = "GPS is not available in this browser.";
      return;
    }
    status.textContent = "Requesting location permission…";
    navigator.geolocation.getCurrentPosition((position) => {
      form.elements.latitude.value = position.coords.latitude.toFixed(7);
      form.elements.longitude.value = position.coords.longitude.toFixed(7);
      status.textContent = "Location added privately. You can remove it by clearing the page.";
    }, () => {
      status.textContent = "Location not shared. You can enter the area and landmark manually.";
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  });

  mediaInput.addEventListener("change", () => {
    const files = Array.from(mediaInput.files || []);
    const allowed = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "video/quicktime"];
    if (files.length > 4 || files.some((file) => file.size > 10 * 1024 * 1024 || !allowed.includes(file.type))) {
      mediaInput.value = "";
      message.textContent = "Please choose up to 4 supported photo/video files, each no larger than 10 MB.";
      message.className = "rescue-form-message error";
    } else {
      message.textContent = files.length ? files.length + " file(s) selected." : "";
      message.className = "rescue-form-message";
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    message.className = "rescue-form-message";
    if (!form.reportValidity()) return;
    if (typeof supabaseClient === "undefined" || !supabaseClient.functions) {
      message.textContent = "Report service is temporarily unavailable. Please contact a local rescue organisation directly.";
      message.classList.add("error");
      return;
    }

    const data = new FormData(form);
    const selectedFiles = Array.from(mediaInput.files || []);
    data.delete("media");
    selectedFiles.forEach((file) => data.append("media", file, file.name));
    submit.disabled = true;
    submit.textContent = "Submitting…";

    try {
      const { data: result, error } = await supabaseClient.functions.invoke("animal-rescue-intake", { body: data });
      if (error) throw error;
      if (!result || !result.ok || !result.complaint_id) throw new Error(result?.error || "Submission could not be confirmed.");
      message.innerHTML = "";
      const success = document.createElement("strong");
      success.textContent = "Report received. Complaint ID: " + result.complaint_id;
      const detail = document.createElement("span");
      const matched = Number(result.matched_partners || 0);
      detail.textContent = matched > 0
        ? " " + matched + " verified partner dashboard(s) received a matched request. This is not confirmation that a team has accepted or dispatched."
        : " No matching verified on-call partner was found. Please contact local rescue help directly.";
      message.append(success, detail);
      message.classList.add("success");
      form.reset();
      document.getElementById("gps-status").textContent = "";
      guidanceBox.hidden = true;
    } catch (error) {
      console.error("Animal rescue report failed:", error);
      message.textContent = error?.message && /too many|valid|choose|complete|PIN|mobile/i.test(error.message)
        ? error.message
        : "We could not submit your report. Please try again or contact a local rescue organisation directly.";
      message.classList.add("error");
    } finally {
      submit.disabled = false;
      submit.textContent = "Submit Emergency Report";
    }
  });
})();