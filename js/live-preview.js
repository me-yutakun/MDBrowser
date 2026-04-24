/* ─────────────────────────────────────────────────────────────── */
/* LIVE PREVIEW POLLING                                            */
/* ─────────────────────────────────────────────────────────────── */
window.currentActiveHandle = null;
window.currentActiveFile = null;
window.currentActiveText = "";

/**
 * Sets the active file for rendering and live polling.
 * Supports both modern FileSystemFileHandles (for live editing) and legacy File objects.
 * 
 * @param {File|FileSystemFileHandle} fileOrHandle - The file reference to display.
 */
window.setActiveFile = async function(fileOrHandle) {
    window.currentActiveHandle = null;
    window.currentActiveFile = null;

    if (fileOrHandle.kind === 'file' && fileOrHandle.getFile) {
        // It's a FileSystemFileHandle
        window.currentActiveHandle = fileOrHandle;
        const file = await fileOrHandle.getFile();
        window.currentActiveText = await file.text();
    } else {
        // It's a normal File object (fallback)
        window.currentActiveFile = fileOrHandle;
        window.currentActiveText = await fileOrHandle.text();
    }
    
    // Trigger initial render
    renderMarkdown(window.currentActiveText);
};

/**
 * Live Polling Interval
 * Checks the currently active file every 1 second (1000ms) for changes.
 * If the file content on disk has changed, it automatically re-renders the markdown
 * while preserving the user's current scroll position.
 */
setInterval(async () => {
    try {
        let file;
        
        if (window.currentActiveHandle) {
            // Re-fetch the live file blob from the handle
            file = await window.currentActiveHandle.getFile();
        } else if (window.currentActiveFile) {
            // Browsers like Chrome sometimes update File objects dynamically,
            // though it usually throws NotReadableError if modified externally.
            file = window.currentActiveFile;
        } else {
            return; // No file is currently active
        }

        const text = await file.text();
        
        // If content changed since last poll, trigger a re-render
        if (text !== window.currentActiveText) {
            window.currentActiveText = text;
            
            // Save scroll position to prevent jumping
            const viewer = document.getElementById("viewer");
            const scrollPos = viewer.scrollTop;
            
            // Re-render
            renderMarkdown(text);
            
            // Restore scroll position
            viewer.scrollTop = scrollPos;
        }
    } catch (err) {
        // File modified externally might throw NotReadableError for regular File objects, 
        // silently ignore it to prevent console spam.
    }
}, 1000);
