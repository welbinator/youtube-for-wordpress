import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

document.addEventListener("DOMContentLoaded", () => {
    // Select all YouTube feed containers
    const containers = document.querySelectorAll("[id^='youtube-feed-']");

    if (!containers.length) {
        console.warn("YouTube feed containers not found.");
        return;
    }

    // Cache for avoiding repeated queries
    const cache = {};

    // Function to fetch videos
    async function fetchVideos(container, searchQuery = '', playlistId = '') {
        if (!container) {
            console.error('Invalid container element.');
            return [];
        }
    
        const channelId = container.getAttribute('data-channel-id') || YT_FOR_WP.channelId;
        const layout = container.getAttribute('data-layout') || 'grid';
        const maxVideos = parseInt(container.getAttribute('data-max-videos'), 10) || 10;
        const cacheKey = `${container.id}-${channelId}-${layout}-${maxVideos}-${searchQuery}-${playlistId}`;
    
        if (cache[cacheKey]) return cache[cacheKey];
    
        let apiUrl;
    
        if (playlistId) {
            // Fetch videos from the playlist
            apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxVideos}&playlistId=${playlistId}&key=${YT_FOR_WP.apiKey}`;
        } else {
            // Fetch videos from the channel and order them by date
            apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${channelId}&maxResults=${maxVideos}&order=date&key=${YT_FOR_WP.apiKey}`;
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
    

    // Function to render videos
    function renderVideos(container, videos, layout) {
        if (!container) {
            console.error('Invalid container element.');
            return;
        }

        // Clear any existing swiper initialization flag
        container.removeAttribute('data-swiper-initialized');

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
            videoContainer.classList.add("swiper");
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

            // Initialize Swiper with proper configuration
            const swiperInstance = new Swiper(videoContainer, {
                modules: [Navigation, Pagination],
                slidesPerView: 1,
                spaceBetween: 10,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                loop: true,
                breakpoints: {
                    640: { slidesPerView: 1, spaceBetween: 10 },
                    768: { slidesPerView: 2, spaceBetween: 20 },
                    1024: { slidesPerView: 3, spaceBetween: 30 },
                },
                on: {
                    init: function() {
                        console.log(`Swiper initialized for container: #${container.id}`);
                    }
                }
            });

            // Set initialization flag after successful initialization
            container.setAttribute('data-swiper-initialized', 'true');

            return;
        }

        // Non-carousel layouts
        container.appendChild(videoContainer);
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

    // Export fetchVideos and renderVideos to the global YT_FOR_WP object
        if (!window.YT_FOR_WP) {
            window.YT_FOR_WP = {};
        }

        window.YT_FOR_WP.fetchVideos = fetchVideos;
        window.YT_FOR_WP.renderVideos = renderVideos;
    // Process each container only once
    const processedContainers = new Set();

    // Iterate over each container and initialize
    containers.forEach(async (container) => {
        if (processedContainers.has(container.id)) {
            return;
        }

        processedContainers.add(container.id);
        const layout = container.getAttribute('data-layout') || 'grid';
        const videos = await fetchVideos(container);
        renderVideos(container, videos, layout);

        // Hook for Pro-only features
        if (window.wp && wp.hooks) {
            wp.hooks.doAction('yt_for_wp_simple_feed_view', container, {
                channelId: container.getAttribute('data-channel-id'),
                layout,
                maxVideos: container.getAttribute('data-max-videos'),
            });
        }
    });
});