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
        const maxVideos = parseInt(container.getAttribute('data-max-videos'), 10) || 10;
        const cacheKey = `${container.id}-${channelId}-${maxVideos}-${searchQuery}-${playlistId}`;
    
        // Check if the data is already cached
        if (cache[cacheKey]) {
            
            return cache[cacheKey];
        }
    
        let apiUrl;
    
        // Construct the API URL based on whether a playlistId is provided
        if (playlistId) {
            apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxVideos}&playlistId=${playlistId}&key=${YT_FOR_WP.apiKey}`;
        } else {
            apiUrl = `${YT_FOR_WP.restUrl}videos?channelId=${channelId}&maxResults=${maxVideos}`;
            if (searchQuery) {
                apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
            }
        }
    
            
        try {
            const response = await fetch(apiUrl, {
                headers: {
                    'X-WP-Nonce': YT_FOR_WP.nonce, // Include nonce for REST API
                },
            });
    
            const data = await response.json();
    
            if (data.error || data.code) {
                console.error('YouTube API or REST API Error:', data.error || data.message);
                return [];
            }
    
            // Map API response to the expected structure for rendering
            const videos = (data || []).map((video) => ({
                id: video.id,
                title: video.title || video.snippet?.title || 'Untitled Video',
                description: video.description || video.snippet?.description || 'No description available.',
                thumbnail: video.thumbnail || video.snippet?.thumbnails?.high?.url,
                publishedAt: video.publishedAt || video.snippet?.publishedAt,
            }));
        
            // Cache the processed videos for subsequent calls
            cache[cacheKey] = videos;
    
            return videos;
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
    
        
    
        if (!videos || videos.length === 0) {
            console.warn('No videos to render.');
            container.innerHTML = '<p>No videos available to display.</p>';
            return;
        }
    
        // Clear any existing swiper initialization flag
        container.removeAttribute('data-swiper-initialized');
    
        // Remove existing video container if it exists
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
                                    src="https://www.youtube.com/embed/${video.id}?vq=hd720"
                                    title="${video.title}"
                                    class="video-iframe"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen
                                ></iframe>
                                <div class="video-info">
                                    <h2 class="video-title">${video.title}</h2>
                                    <p class="video-description">${video.description}</p>
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
                    init: function () {
                        console.log(`Swiper initialized for container: #${container.id}`);
                    },
                },
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
    
            const videoUrl = `https://www.youtube.com/embed/${video.id}`;
            videoElement.innerHTML = `
                <div class="video-iframe-wrapper">
                    <iframe
                        src="${videoUrl}"
                        title="${video.title}"
                        class="video-iframe"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
                <div class="video-info">
                    <h2 class="video-title">${video.title}</h2>
                    <p class="video-description">${video.description}</p>
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