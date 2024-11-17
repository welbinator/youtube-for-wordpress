document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("youtube-live-container");

    if (!container) {
        console.warn("YouTube Live container not found.");
        return;
    }

    const channelId = container.getAttribute('data-channel-id');
    const maxVideos = container.getAttribute('data-max-videos') || 1;

    if (!channelId) {
        console.error("Channel ID is missing.");
        return;
    }

    const apiKey = YT_FOR_WP.apiKey;

    // Helper function to fetch live or completed live videos
    async function fetchVideos(eventType) {
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=${eventType}&maxResults=${maxVideos}&key=${apiKey}`;
        console.log("Fetching videos with URL:", apiUrl); // Debugging
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            console.log("API response for", eventType, ":", data); // Debugging
            return data.items || [];
        } catch (error) {
            console.error("Error fetching videos:", error);
            return [];
        }
    }

    try {
        // First, fetch currently live videos
        let videos = await fetchVideos('live');

        if (videos.length === 0) {
            // If no live videos are available, fetch completed live videos
            videos = await fetchVideos('completed');
        }

        if (videos.length > 0) {
            renderVideos(container, videos);
        } else {
            container.innerHTML = '<p>No live or previous live videos available.</p>';
        }
    } catch (error) {
        console.error("Error fetching videos:", error);
        container.innerHTML = '<p>Error loading videos. Check console for details.</p>';
    }
});

// Render the videos
function renderVideos(container, videos) {
    container.innerHTML = videos
        .map((video) => {
            const videoId = video.id.videoId;
            const videoTitle = video.snippet.title;

            return `
                <div class="youtube-live-wrapper">
                    <iframe
                        src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                        title="${videoTitle}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                    <h2>${videoTitle}</h2>
                </div>
            `;
        })
        .join('');
}
