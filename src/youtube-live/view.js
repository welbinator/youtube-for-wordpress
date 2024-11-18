document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("youtube-live-container");

    if (!container) {
        console.warn("YouTube Live container not found.");
        return;
    }

    const maxVideos = container.getAttribute('data-max-videos') || 1;
    const channelId = container.getAttribute('data-channel-id') || YT_FOR_WP.channelId; // Check for custom channel ID

    if (!channelId) {
        console.error("Channel ID is missing.");
        return;
    }

    const apiKey = YT_FOR_WP.apiKey;

    async function fetchVideos(eventType) {
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=${eventType}&maxResults=${maxVideos}&key=${apiKey}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error("Error fetching videos:", error);
            return [];
        }
    }

    try {
        let liveVideos = await fetchVideos('live');

        if (liveVideos.length > 0) {
            renderVideos(container, liveVideos, true);
            return;
        }

        let previousLiveVideos = await fetchVideos('completed');

        if (previousLiveVideos.length > 0) {
            renderVideos(container, previousLiveVideos, false);
            return;
        }

        container.innerHTML = '<p>No live or previous live videos available.</p>';
    } catch (error) {
        console.error("Error fetching videos:", error);
        container.innerHTML = '<p>Error loading videos. Check console for details.</p>';
    }
});

function renderVideos(container, videos, autoplay) {
    container.innerHTML = videos
        .map((video) => {
            const videoId = video.id.videoId;
            const videoTitle = video.snippet.title;

            return `
                <div class="youtube-live-wrapper">
                    <iframe
                        src="https://www.youtube.com/embed/${videoId}?autoplay=0"
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
