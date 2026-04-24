/* ─────────────────────────────────────────────────────────────── */
/* DARK MODE TOGGLE (default = light)                              */
/* ─────────────────────────────────────────────────────────────── */
const root = document.documentElement;

/**
 * Dark Mode Toggle Event
 * Flips the theme between light and dark modes.
 * 
 * It performs two actions:
 * 1. Toggles the `.dark` class on the root HTML element (for global UI CSS variables).
 * 2. Swaps the specific GitHub markdown theme classes (`markdown-body-dark` / `-light`) 
 *    on the viewer output div.
 */
document.getElementById("darkToggle").onclick = () => {
    root.classList.toggle("dark");

    const out = document.getElementById("output");
    out.className = root.classList.contains("dark")
        ? "markdown-body markdown-body-dark"
        : "markdown-body markdown-body-light";
};