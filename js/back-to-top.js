/* ─────────────────────────────────────────────────────────────── */
/* BACK TO TOP BUTTON LOGIC                                        */
/* ─────────────────────────────────────────────────────────────── */
const backToTopBtn = document.getElementById("backToTopBtn");
const viewer = document.getElementById("viewer");

/**
 * Scroll Event Listener
 * Monitors the vertical scroll position of the Markdown viewer pane.
 * Shows the "Back to Top" button only when the user has scrolled down
 * past a threshold (300px) to prevent UI clutter at the top of the page.
 */
viewer.addEventListener("scroll", () => {
    if (viewer.scrollTop > 300) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
});

/**
 * Click Event Listener
 * Smoothly scrolls the viewer container back to the absolute top (Y: 0)
 * when the back-to-top button is clicked.
 */
backToTopBtn.addEventListener("click", () => {
    viewer.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});
