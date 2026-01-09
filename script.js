document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('main-player');
    const sourceElement = document.getElementById('video-source');

    // Determine which video folder to use
    // If body has data-video-id="videos2", use that. Default to "videos".
    const videoFolder = document.body.getAttribute('data-video-id') || 'videos';

    let playlist = [];
    let currentVideoIndex = 0;

    // Load the playlist
    fetch(`${videoFolder}/playlist.json`)
        .then(response => response.json())
        .then(data => {
            playlist = data;
            if (playlist.length > 0) {
                loadVideo(0);
            } else {
                console.error('Playlist is empty');
            }
        })
        .catch(error => console.error('Error loading playlist:', error));

    function loadVideo(index) {
        if (index >= 0 && index < playlist.length) {
            currentVideoIndex = index;
            // Path: videos/video.mp4 OR videos2/video.mp4
            const videoPath = `${videoFolder}/${playlist[index]}`;
            sourceElement.src = videoPath;
            videoPlayer.load();
            videoPlayer.play().catch(e => console.log("Autoplay prevented:", e));
        }
    }

    // When video ends, play the next one
    videoPlayer.addEventListener('ended', () => {
        let nextIndex = currentVideoIndex + 1;
        if (nextIndex >= playlist.length) {
            nextIndex = 0; // Loop back to start
        }
        loadVideo(nextIndex);
    });

    // Fallback error handling
    videoPlayer.addEventListener('error', (e) => {
        console.error('Video error:', e);
    });
});
