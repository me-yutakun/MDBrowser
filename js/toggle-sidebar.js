/* ─────────────────────────────────────────────────────────────── */
/* SIDEBAR TOGGLE                                                  */
/* ─────────────────────────────────────────────────────────────── */
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleSidebar");

/**
 * Sidebar Toggle Event
 * Collapses or expands the left-hand navigation pane to maximize viewing space.
 * Updates the button icon dynamically to indicate the current state (▶ for collapsed, ◀ for open).
 */
toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    if (sidebar.classList.contains("collapsed")) {
        toggleBtn.textContent = "▶";
    } else {
        toggleBtn.textContent = "◀";
    }
});
