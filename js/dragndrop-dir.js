/* ─────────────────────────────────────────────────────────────── */
/* DRAG & DROP                                                     */
/* ─────────────────────────────────────────────────────────────── */
const dz = document.getElementById("dropZone");

/**
 * Visual Feedback: Drag Enter / Over
 * Highlights the drop zone when a user drags a file over it.
 */
["dragenter", "dragover"].forEach(ev =>
    dz.addEventListener(ev, e => {
        e.preventDefault();
        dz.classList.add("dragover");
    })
);

/**
 * Visual Feedback: Drag Leave / Drop
 * Removes the highlight from the drop zone when the file is dropped or leaves the area.
 */
["dragleave", "drop"].forEach(ev =>
    dz.addEventListener(ev, e => {
        e.preventDefault();
        dz.classList.remove("dragover");
    })
);

/**
 * Drop Handler
 * Processes the dropped file. It prioritizes the modern File System Access API
 * to obtain a live file handle (enabling Live Preview polling). If unsupported,
 * it gracefully falls back to extracting a static File object.
 */
dz.addEventListener("drop", async e => {
    e.preventDefault();
    dz.classList.remove("dragover");

    // Attempt to get a live file handle for Live Preview
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        const item = e.dataTransfer.items[0];
        if (item.getAsFileSystemHandle) {
            try {
                const handle = await item.getAsFileSystemHandle();
                if (handle && handle.kind === 'file') {
                    if (window.setActiveFile) {
                        window.setActiveFile(handle);
                    }
                    return; // Exit early if we successfully got a live handle
                }
            } catch (err) {
                console.error("Failed to get file handle:", err);
            }
        }
    }

    // Fallback to static File object for older browser implementations
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    // Send to live preview or render directly if preview module is missing
    if (window.setActiveFile) {
        window.setActiveFile(file);
    } else {
        renderMarkdown(await file.text());
    }
});