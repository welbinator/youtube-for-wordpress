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
    
        let apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${channelId}&maxResults=${maxVideos}&order=date&key=${YT_FOR_WP.apiKey}`;
        if (playlistId) {
            apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxVideos}&playlistId=${playlistId}&key=${YT_FOR_WP.apiKey}`;
        }
        if (searchQuery) {
            apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
        }
    
        console.log('Fetching videos from API:', apiUrl);
    
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
    
            if (data.error) {
                console.error('YouTube API Error:', data.error);
                return [];
            }
    
            const videos = (data.items || []).map((video) => ({
                id: video.id?.videoId || video.snippet?.resourceId?.videoId || '',
                title: video.snippet?.title || 'Untitled Video',
                description: video.snippet?.description || 'No description available.',
                thumbnail: video.snippet?.thumbnails?.high?.url || '',
                publishedAt: video.snippet?.publishedAt || '',
            }));
    
            // Sort videos by published date (most recent first)
            videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
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
                        .filter((video) => video.id) // Only include valid videos
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
    
            new Swiper(videoContainer, {
                modules: [Navigation, Pagination],
                slidesPerView: 1, // Default for screens wider than 640px
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
                    640: { // For devices with a width of 640px or less
                        slidesPerView: 3,
                    },
                },
            });
            
            return;
        } else if (layout === 'gallery') {
            const featuredVideo = videos[0];
            const remainingVideos = videos.slice(1);
        
            videoContainer.innerHTML = `
                <div class="gallery-featured-video">
                    <iframe
                        src="https://www.youtube.com/embed/${featuredVideo.id}?vq=hd720"
                        title="${featuredVideo.title}"
                        class="video-iframe featured-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                    <div class="video-info">
                        <h2 class="video-title">${featuredVideo.title}</h2>
                        <p class="video-description">${featuredVideo.description}</p>
                    </div>
                </div>
                <div class="gallery-carousel swiper">
                    <div class="swiper-wrapper">
                        ${remainingVideos
                            .filter((video) => video.id)
                            .map(
                                (video) => `
                                    <div class="swiper-slide">
                                        <img
                                            src="${video.thumbnail}"
                                            alt="${video.title}"
                                            class="gallery-carousel-thumbnail"
                                            data-video-id="${video.id}"
                                        />
                                    </div>
                                `
                            )
                            .join('')}
                    </div>
                    <div class="swiper-pagination"></div>
                    <div class="swiper-button-next"></div>
                    <div class="swiper-button-prev"></div>
                </div>
            `;
        
            container.appendChild(videoContainer);
        
            const swiper = new Swiper('.gallery-carousel', {
                modules: [Navigation, Pagination],
                slidesPerView: 3,
                spaceBetween: 10,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
            });
        
            // Handle thumbnail click
            
const thumbnails = videoContainer.querySelectorAll('.gallery-carousel-thumbnail');
thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener('click', (e) => {
        const videoId = e.target.getAttribute('data-video-id');
        const videoTitle = e.target.getAttribute('alt'); // Using the alt attribute for the title
        const videoDescription = videos.find(video => video.id === videoId)?.description || 'No description available.';

        // Update the featured video iframe
        const featuredIframe = videoContainer.querySelector('.featured-video');
        featuredIframe.src = `https://www.youtube.com/embed/${videoId}?vq=hd720`;

        // Update the featured video title
        const featuredTitle = videoContainer.querySelector('.video-title');
        if (featuredTitle) {
            featuredTitle.textContent = videoTitle;
        }

        // Update the featured video description
        const featuredDescription = videoContainer.querySelector('.video-description');
        if (featuredDescription) {
            featuredDescription.textContent = videoDescription;
        }
    });
});


        
            return;
        }
        
    
        // Non-carousel layouts
        container.appendChild(videoContainer);
        videos.filter((video) => video.id).forEach((video) => {
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