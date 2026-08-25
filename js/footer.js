(function () {
    const path = window.location.pathname.toLowerCase();
    const seoByPath = {
        "/pages/lost.html": {
            title: "Report a Lost Pet in India | FindMyPet India",
            description: "Report a lost dog, cat or other pet in India with photo, location and identifying details so the community can help bring them home."
        },
        "/pages/found.html": {
            title: "Report a Found Pet in India | FindMyPet India",
            description: "Found a dog, cat or other pet? Submit a found pet report with photo and location to help reunite the pet with its family in India."
        },
        "/pages/ai-search.html": {
            title: "AI Pet Search India | FindMyPet India",
            description: "Upload a pet photo and compare it with lost and found pet reports across India using FindMyPet India's AI-assisted search."
        },
        "/pages/success-stories.html": {
            title: "Pet Reunion Success Stories | FindMyPet India",
            description: "See lost and found pet reunion stories from the FindMyPet India community and celebrate pets returning safely to their families."
        },
        "/pages/ngos.html": {
            title: "Animal NGOs & Pet Rescue Help in India | FindMyPet India",
            description: "Find animal NGOs, rescue organisations and pet-help resources in India for lost, found, injured and rescued animals."
        },
        "/pages/about.html": {
            title: "About FindMyPet India | Lost & Found Pet Platform",
            description: "Learn about FindMyPet India's mission to connect pet parents, rescuers, volunteers and animal NGOs to help lost pets return home."
        },
        "/pages/contact.html": {
            title: "Contact FindMyPet India | Support & NGO Partnerships",
            description: "Contact FindMyPet India for platform support, feedback, animal NGO collaboration, partnerships and lost or found pet assistance."
        },
        "/pages/help-center.html": {
            title: "Help Center | FindMyPet India",
            description: "Get help with reporting a lost or found pet, AI pet search, editing reports and using FindMyPet India safely."
        },
        "/pages/privacy-policy.html": {
            title: "Privacy Policy | FindMyPet India",
            description: "Read the FindMyPet India privacy policy and learn how pet report, account, contact and photo information is handled."
        },
        "/pages/terms-and-conditions.html": {
            title: "Terms & Conditions | FindMyPet India",
            description: "Read the terms for using FindMyPet India, including report accuracy, community matching, safety and content rules."
        },
        "/pages/report-issue.html": {
            title: "Report a Website Issue | FindMyPet India",
            description: "Report a technical issue, broken page or website problem to the FindMyPet India support team."
        }
    };

    const privatePages = [
        "/pages/login.html",
        "/pages/signup.html",
        "/pages/dashboard.html",
        "/pages/edit-report.html",
        "/pages/verify-email.html",
        "/pages/reset-password.html",
        "/pages/admin-users.html"
    ];

    function setMeta(selector, attribute, value) {
        let element = document.head.querySelector(selector);
        if (!element) {
            element = document.createElement("meta");
            const match = selector.match(/\[(name|property)="([^"]+)"\]/);
            if (match) element.setAttribute(match[1], match[2]);
            document.head.appendChild(element);
        }
        element.setAttribute(attribute, value);
    }

    if (privatePages.includes(path)) {
        setMeta('meta[name="robots"]', "content", "noindex, nofollow");
        return;
    }

    const seo = seoByPath[path];
    if (!seo) return;

    document.title = seo.title;
    setMeta('meta[name="description"]', "content", seo.description);
    setMeta('meta[name="robots"]', "content", "index, follow");
    setMeta('meta[property="og:title"]', "content", seo.title);
    setMeta('meta[property="og:description"]', "content", seo.description);
    setMeta('meta[property="og:type"]', "content", "website");
    setMeta('meta[property="og:url"]', "content", window.location.href.split("?")[0]);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
    }
    canonical.href = "https://findmypetindia.com" + path;
})();

document.addEventListener("DOMContentLoaded", async () => {

    const footerContainer = document.getElementById("footer-container");

    if (!footerContainer) return;

    try {

        const isHome =
            window.location.pathname === "/" ||
            window.location.pathname.endsWith("/index.html") ||
            window.location.pathname.endsWith("index.html");

        const footerPath = isHome
            ? "./html/footer.html"
            : "../html/footer.html";

        const response = await fetch(footerPath);

        if (!response.ok) {
            throw new Error("Footer not found");
        }

        footerContainer.innerHTML = await response.text();

if (
    window.location.pathname.includes("login.html") ||
    window.location.pathname.includes("signup.html")
) {
    document.querySelectorAll(".footer-column").forEach(el => {
        el.remove();
    });
}

    } catch (err) {
        console.error("Footer Error:", err);
    }

});