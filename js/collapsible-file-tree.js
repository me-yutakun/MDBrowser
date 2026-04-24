/* ─────────────────────────────────────────────────────────────── */
/* FILE TREE (MD‑ONLY) + COLLAPSIBLE FOLDERS                       */
/* ─────────────────────────────────────────────────────────────── */
const openBtn = document.getElementById("openFolderBtn");
const folderInput = document.getElementById("folderInput");
const fileTree = document.getElementById("fileTree");

// Maps full file paths to their respective File or FileSystemFileHandle objects
let fileMap = {};

/**
 * Initializes the folder selection logic.
 * Uses the modern File System Access API if supported for live-polling capabilities,
 * otherwise gracefully falls back to a standard `<input type="file" webkitdirectory>`.
 */
if (window.showDirectoryPicker) {
    openBtn.onclick = async () => {
        try {
            const dirHandle = await window.showDirectoryPicker();
            fileTree.innerHTML = "";
            fileMap = {};
            await processDirectory(dirHandle, dirHandle.name);
            buildTree(Object.keys(fileMap));
        } catch (err) {
            console.error("User cancelled or error:", err);
        }
    };
} else {
    // Fallback for older browsers (e.g., Firefox)
    openBtn.onclick = () => folderInput.click();
}

/**
 * Recursively scans a FileSystemDirectoryHandle and extracts all `.md` files.
 * @param {FileSystemDirectoryHandle} dirHandle - The folder handle to scan.
 * @param {string} path - The current string path of the folder.
 */
async function processDirectory(dirHandle, path) {
    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.md')) {
            fileMap[`${path}/${entry.name}`] = entry; // Save the live FileSystemFileHandle
        } else if (entry.kind === 'directory') {
            await processDirectory(entry, `${path}/${entry.name}`);
        }
    }
}

/**
 * Fallback handler for the standard file input.
 * Extracts the file paths and maps them to static File objects.
 */
folderInput.onchange = (e) => {
    fileTree.innerHTML = "";
    fileMap = {};

    [...e.target.files].forEach(file => {
        if (file.name.toLowerCase().endsWith(".md")) {
            fileMap[file.webkitRelativePath] = file;
        }
    });

    buildTree(Object.keys(fileMap));
};

/**
 * Parses a flat list of file paths into a nested folder tree structure.
 * @param {string[]} paths - An array of full file paths.
 */
function buildTree(paths) {
    const tree = {};

    paths.forEach(path => {
        const parts = path.split("/");
        let current = tree;

        parts.forEach((part, idx) => {
            if (!current[part]) {
                current[part] = (idx === parts.length - 1) ? null : {};
            }
            current = current[part];
        });
    });

    fileTree.appendChild(renderTree(tree, ""));
}

/**
 * Recursively generates DOM elements for the file tree.
 * @param {Object} node - The current folder object containing nested files/folders.
 * @param {string} prefix - The path prefix used to identify the file when clicked.
 * @returns {HTMLElement} A div container with the generated tree elements.
 */
function renderTree(node, prefix) {
    const container = document.createElement("div");

    for (const key in node) {
        if (node[key] === null) {
            // It's a file
            const fileEl = document.createElement("div");
            fileEl.className = "file";
            fileEl.textContent = key;
            fileEl.onclick = () => loadFile(prefix + key);
            container.appendChild(fileEl);
        } else {
            // It's a folder
            const folderEl = document.createElement("div");
            folderEl.className = "folder";
            folderEl.textContent = key;

            const child = document.createElement("div");
            child.className = "children";

            const subtree = renderTree(node[key], prefix + key + "/");
            child.appendChild(subtree);

            // Toggle folder visibility on click
            folderEl.onclick = () => {
                folderEl.classList.toggle("open");
                child.classList.toggle("open");
            };

            container.appendChild(folderEl);
            container.appendChild(child);
        }
    }

    return container;
}

/**
 * Loads a selected file and triggers the Markdown rendering sequence.
 * Leverages the live preview hook if available.
 * @param {string} path - The full path key of the file in the fileMap.
 */
async function loadFile(path) {
    const file = fileMap[path];
    if (!file) return;
    
    // Use the live preview hook if it exists
    if (window.setActiveFile) {
        window.setActiveFile(file);
    } else {
        // Direct render fallback
        renderMarkdown(await file.text());
    }
}