document.addEventListener('DOMContentLoaded', () => {
    // URL Parameters: ?source=content/stream1&type=video
    const params = new URLSearchParams(window.location.search);
    const sourcePath = params.get('source');
    const type = params.get('type') || 'video'; // 'video' or 'image'

    if (!sourcePath) {
        console.log("No source specified. Idle mode.");
        return;
    }

    const container = document.getElementById('content-container');
    const MAX_FILES = 100;
    const extensions = type === 'video' ? ['mp4', 'webm'] : ['png', 'jpg', 'jpeg', 'gif'];

    let playlist = [];
    let currentIndex = 0;

    // Scan for files 1...N with supported extensions
    checkFile(1);

    function checkFile(index) {
        if (index > MAX_FILES) {
            startPlayer();
            return;
        }

        // We need to check all extensions for this index: 1.png, 1.jpg, etc.
        // This is a bit tricky with HEAD requests because we have to try them one by one.
        // We'll prioritize the first extension found.
        checkExtensions(index, 0);
    }

    function checkExtensions(index, extIndex) {
        if (extIndex >= extensions.length) {
            // Checked all extensions for this index, none found. Stop scanning?
            // Or skip to next index? sequential usually implies no gaps, 
            // but strict 1..N allows us to stop.
            startPlayer();
            return;
        }

        const ext = extensions[extIndex];
        const filename = `${index}.${ext}`;
        const filePath = `${sourcePath}/${filename}`;

        fetch(filePath, { method: 'HEAD' })
            .then(res => {
                if (res.ok) {
                    playlist.push({ path: filePath, type: type });
                    // Found one for this index, move to next index (don't support 1.jpg AND 1.png)
                    checkFile(index + 1);
                } else {
                    checkExtensions(index, extIndex + 1);
                }
            })
            .catch(() => {
                checkExtensions(index, extIndex + 1);
            });
    }

    function startPlayer() {
        if (playlist.length === 0) {
            container.innerHTML = `<p style="color:white; text-align:center;">No content found in ${sourcePath}</p>`;
            return;
        }

        console.log(`Loaded ${playlist.length} items from ${sourcePath}`);
        playContent(0);
    }

    function playContent(index) {
        if (index >= playlist.length) index = 0; // Loop
        currentIndex = index;
        const item = playlist[index];

        const currentEl = container.firstElementChild;
        if (currentEl) {
            // Fade out current
            currentEl.classList.remove('media-visible');
            setTimeout(() => {
                loadItem(item);
            }, 500); // Wait for transition
        } else {
            loadItem(item);
        }
    }

    function loadItem(item) {
        container.innerHTML = ''; // Clear previous

        let el;
        if (type === 'video') {
            const video = document.createElement('video');
            video.src = item.path;
            video.autoplay = true;
            // video.muted = false; // Allow sound in viewer
            video.controls = true;
            // Removed inline styles to use CSS

            video.addEventListener('ended', () => {
                playContent(currentIndex + 1);
            });

            video.addEventListener('error', (e) => {
                console.error("Video play error", e);
                // Skip to next on error
                setTimeout(() => playContent(currentIndex + 1), 2000);
            });
            el = video;
        } else {
            const img = document.createElement('img');
            img.src = item.path;
            // Removed inline styles to use CSS

            // Slideshow timer
            setTimeout(() => {
                playContent(currentIndex + 1);
            }, 5000); // 5 seconds per image
            el = img;
        }

        container.appendChild(el);

        // Trigger fade in (small delay to ensure DOM render)
        requestAnimationFrame(() => {
            el.classList.add('media-visible');
        });
    }
});
