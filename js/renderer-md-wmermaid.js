/* ─────────────────────────────────────────────────────────────── */
/* MARKED RENDERING & CUSTOM EXTENSIONS                            */
/* ─────────────────────────────────────────────────────────────── */
const renderer = new marked.Renderer();
const origCode = renderer.code.bind(renderer);

/**
 * Custom Code Block Renderer
 * Intercepts code blocks tagged with "mermaid" and wraps them in a specific div.
 * This prevents Marked from escaping them as standard code, allowing Mermaid.js to parse them later.
 */
renderer.code = (token, lang) => {
    // Handle Marked v12+ (token object) or older versions (string code, string lang)
    const language = typeof token === 'object' ? token.lang : lang;
    const text = typeof token === 'object' ? token.text : token;

    if (language === "mermaid") {
        return `<div class="mermaid">${text}</div>`;
    }
    return origCode(token, lang);
};

const origBlockquote = renderer.blockquote.bind(renderer);

/**
 * Custom Blockquote Renderer (GitHub Alerts)
 * Parses blockquotes starting with `[!NOTE]`, `[!WARNING]`, etc.
 * Converts them into beautifully styled HTML divs mimicking GitHub's markdown alert system.
 */
renderer.blockquote = (token) => {
    let html = origBlockquote(token);
    const alertRegex = /^<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:<br>|\s*?\n)?/i;
    const match = html.match(alertRegex);
    if (match) {
        const type = match[1].toLowerCase();
        html = html.replace(alertRegex, `<blockquote class="markdown-alert markdown-alert-${type}"><p class="markdown-alert-title">${type.toUpperCase()}</p><p>`);
    }
    return html;
};

const origHeading = renderer.heading.bind(renderer);

/**
 * Custom Heading Renderer (TOC Anchors)
 * Automatically assigns `id` attributes to every heading based on its text content.
 * Applies a strict slugification algorithm (stripping emojis, formatting spaces) 
 * to ensure Table of Contents anchor links function correctly.
 */
renderer.heading = (token) => {
    let text = typeof token === 'object' ? token.text : arguments[0];
    let depth = typeof token === 'object' ? token.depth : arguments[1];

    let rawText = text.replace(/<[^>]+>/g, '');
    let slug = rawText.toLowerCase()
        .replace(/[^\w\s\-]/g, '')
        .replace(/\s+/g, '-');

    return `<h${depth} id="${slug}">${text}</h${depth}>`;
};

/**
 * Smooth Scrolling Interceptor
 * Intercepts clicks on internal hash links (e.g. from the Table of Contents)
 * and uses `scrollIntoView` to smoothly jump the viewer pane to the targeted heading.
 */
document.addEventListener("DOMContentLoaded", () => {
    const viewer = document.getElementById("viewer");
    const output = document.getElementById("output");

    output.addEventListener("click", (e) => {
        const target = e.target.closest("a");
        if (!target) return;

        const href = target.getAttribute("href");
        if (href && href.startsWith("#")) {
            e.preventDefault();
            const id = href.substring(1);
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, href);
            }
        }
    });
});

marked.setOptions({
    renderer,
    breaks: true,
    gfm: true
});

mermaid.initialize({ startOnLoad: false });

/* ─────────────────────────────────────────────────────────────── */
/* RENDER MARKDOWN                                                 */
/* ─────────────────────────────────────────────────────────────── */

/**
 * Main Rendering Pipeline
 * Executes the three-stage parsing process:
 * 1. Markdown to HTML via `marked`
 * 2. Math processing via `KaTeX`
 * 3. Diagram generation via `mermaid.js`
 * 
 * @param {string} text - The raw markdown text to render.
 */
function renderMarkdown(text) {
    const out = document.getElementById("output");
    
    // Step 1: Parse Markdown
    out.innerHTML = marked.parse(text);

    // Step 2: Render Math Equations
    renderMathInElement(out, {
        delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
        ],
        throwOnError: false
    });

    // Step 3: Render Mermaid Diagrams
    const blocks = out.querySelectorAll(".mermaid");
    if (blocks.length > 0) mermaid.run({ nodes: blocks });
}