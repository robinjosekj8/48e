document.addEventListener('DOMContentLoaded', () => {
    // Determine which gallery we are in based on a data attribute or URL
    const galleryId = document.body.getAttribute('data-gallery-id');
    // e.g., 'gallery1' or 'gallery2'

    const imageElement = document.getElementById('gallery-image');
    let images = [];
    let currentIndex = 0;

    if (!galleryId) {
        console.error("No data-gallery-id found on body");
        return;
    }

    // Fetch the list of images for this gallery
    fetch(`images/${galleryId}/playlist.json`)
        .then(response => response.json())
        .then(data => {
            images = data;
            if (images.length > 0) {
                showImage(0);
                startSideshow();
            } else {
                console.error("Gallery playlist is empty");
            }
        })
        .catch(error => console.error("Error loading gallery playlist:", error));

    function showImage(index) {
        if (index >= 0 && index < images.length) {
            currentIndex = index;
            // image path: images/gallery1/photo.jpg
            imageElement.src = `images/${galleryId}/${images[index]}`;
        }
    }

    function startSideshow() {
        setInterval(() => {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= images.length) {
                nextIndex = 0;
            }
            showImage(nextIndex);
        }, 3000); // Change image every 3 seconds
    }
});
