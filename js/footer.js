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

    } catch (err) {
        console.error("Footer Error:", err);
    }

});