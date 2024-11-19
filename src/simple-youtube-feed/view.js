import Swiper from 'swiper';
import 'swiper/css';

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.querySelector("[id^='youtube-feed-']");


    // Ensure container is available and not already initialized
    if (!container) {
        console.warn("YouTube feed container not found.");
        return;
    }

    if (container.hasAttribute('data-initialized')) {
        return;
    }

    container.setAttribute('data-initialized', 'true');

    const channelId = container.getAttribute('data-channel-id') || YT_FOR_WP.channelId;
    const layout = container.getAttribute('data-layout') || 'grid';
    const maxVideos = parseInt(container.getAttribute('data-max-videos'), 10) || 10;
    const apiUrlBase = `https://www.googleapis.com/youtube/v3`;
    const apiKey = YT_FOR_WP.apiKey;

    // Cache for avoiding repeated queries
    const cache = {};

    // Function to fetch videos
    async function fetchVideos(searchQuery = '', playlistId = '') {
        const cacheKey = `${container.id}-${channelId}-${layout}-${maxVideos}-${searchQuery}-${playlistId}`;

        if (cache[cacheKey]) return cache[cacheKey];

        let apiUrl = `${apiUrlBase}/search?part=snippet&type=video&channelId=${channelId}&maxResults=${maxVideos}&key=${apiKey}`;
        if (playlistId) {
            apiUrl = `${apiUrlBase}/playlistItems?part=snippet&maxResults=${maxVideos}&playlistId=${playlistId}&key=${apiKey}`;
        }
        if (searchQuery) {
            apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
        }

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.error) {
                console.error('YouTube API Error:', data.error);
                return [];
            }

            cache[cacheKey] = data.items || [];
            return cache[cacheKey];
        } catch (error) {
            console.error('Error fetching videos:', error);
            return [];
        }
    }

    // Render videos
    function renderVideos(container, videos, layout) {
        const existingVideoContainer = container.querySelector(".video-container");
        if (existingVideoContainer) {
            existingVideoContainer.remove();
        }

        const videoContainer = document.createElement("div");
        videoContainer.classList.add("video-container");

        if (layout === "grid") {
            videoContainer.classList.add("youtube-feed-grid");
        } else if (layout === "list") {
            videoContainer.classList.add("youtube-feed-list");
        } else if (layout === "carousel") {
            videoContainer.classList.add("swiper-container");
            videoContainer.innerHTML = `
                <div class="swiper-wrapper">
                    ${videos
                        .map(
                            (video) => `
                        <div class="swiper-slide">
                            <iframe
                                src="https://www.youtube.com/embed/${video.id.videoId || video.snippet.resourceId?.videoId}?vq=hd720"
                                title="${video.snippet.title}"
                                class="video-iframe"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                            ></iframe>
                            <div class="video-info">
                                <h2 class="video-title">${video.snippet.title}</h2>
                                <p class="video-description">${video.snippet.description}</p>
                            </div>
                        </div>
                    `
                        )
                        .join('')}
                </div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
            `;
            container.appendChild(videoContainer);

            // Initialize Swiper.js for Carousel
            new Swiper(`#${uniqueId} .swiper-container`, {
                slidesPerView: 1,
                spaceBetween: 10,
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
                loop: true,
                breakpoints: {
                    640: { slidesPerView: 1, spaceBetween: 10 },
                    768: { slidesPerView: 2, spaceBetween: 20 },
                    1024: { slidesPerView: 3, spaceBetween: 30 },
                },
            });

            return; // Exit early since the carousel is fully rendered
        }

        container.appendChild(videoContainer);

        // Populate videos for "Grid" and "List" layouts
        videos.forEach((video) => {
            const videoElement = document.createElement("div");
            videoElement.classList.add(
                layout === "grid" ? "youtube-video-grid-item" : "youtube-video-list-item"
            );

            const title = video.snippet.title;
            const description = video.snippet.description;
            const videoId = video.id.videoId || video.snippet.resourceId?.videoId;
            const videoUrl = `https://www.youtube.com/embed/${videoId}?vq=hd720`;

            videoElement.innerHTML = `
                <div class="video-iframe-wrapper">
                    <iframe
                        src="${videoUrl}"
                        title="${title}"
                        class="video-iframe"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
                <div class="video-info">
                    <h2 class="video-title">${title}</h2>
                    <p class="video-description">${description}</p>
                </div>
            `;

            videoContainer.appendChild(videoElement);
        });
    }

    // Expose functions globally for Pro use
    YT_FOR_WP.fetchVideos = fetchVideos;
    YT_FOR_WP.renderVideos = renderVideos;

    // Fetch and render videos
    const videos = await fetchVideos();
    renderVideos(container, videos, layout);

    // Hook for Pro-only features
    if (window.wp && wp.hooks) {
        wp.hooks.doAction('yt_for_wp_simple_feed_view', container, { channelId, layout, maxVideos });
    }
});
