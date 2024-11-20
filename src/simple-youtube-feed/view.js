import Swiper from 'swiper';
import 'swiper/css';

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
        const channelId = container.getAttribute('data-channel-id') || YT_FOR_WP.channelId;
        const layout = container.getAttribute('data-layout') || 'grid';
        const maxVideos = parseInt(container.getAttribute('data-max-videos'), 10) || 10;
        const cacheKey = `${container.id}-${channelId}-${layout}-${maxVideos}-${searchQuery}-${playlistId}`;

        if (cache[cacheKey]) return cache[cacheKey];

        let apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${channelId}&maxResults=${maxVideos}&key=${YT_FOR_WP.apiKey}`;
        if (playlistId) {
            apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxVideos}&playlistId=${playlistId}&key=${YT_FOR_WP.apiKey}`;
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

    // Function to fetch playlists
    async function fetchPlaylists(container) {
        const channelId = container.getAttribute('data-channel-id') || YT_FOR_WP.channelId;
    
        if (!channelId || !YT_FOR_WP.apiKey) {
            return [{ label: 'No playlists available', value: '' }];
        }
    
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channelId}&maxResults=25&key=${YT_FOR_WP.apiKey}`
            );
            const data = await response.json();
    
            if (data.error) {
                console.error('YouTube API Error:', data.error);
                return [{ label: 'Error loading playlists', value: '' }];
            }
    
            const playlists = data.items
                ? data.items.map((playlist) => ({
                      label: playlist.snippet.title,
                      value: playlist.id,
                  }))
                : [{ label: 'No playlists found', value: '' }];
    
            // Add the "All Videos" option at the start of the array
            playlists.unshift({ label: 'All Videos', value: '' });
    
            return playlists;
        } catch (error) {
            console.error('Error fetching playlists:', error);
            return [{ label: 'Error loading playlists', value: '' }];
        }
    }
    

    // Function to render videos
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
            new Swiper(`#${container.id} .swiper-container`, {
                slidesPerView: 1,
                spaceBetween: 10,
                navigation: {
                    nextEl: `#${container.id} .swiper-button-next`,
                    prevEl: `#${container.id} .swiper-button-prev`,
                },
                pagination: {
                    el: `#${container.id} .swiper-pagination`,
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

    // Function to add search and playlist functionality
    async function addControls(container, layout, fetchVideosFn, renderVideosFn) {
        const controlsContainer = document.createElement("div");
        controlsContainer.classList.add("controls-container");

        // Create a search bar
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = "Search videos...";
        searchInput.classList.add("search-input");

        // Create a playlist dropdown
        const playlistSelect = document.createElement("select");
        playlistSelect.classList.add("playlist-select");

        // Fetch and populate playlists
        const playlists = await fetchPlaylists(container);
        playlists.forEach((playlist) => {
            const option = document.createElement("option");
            option.value = playlist.value;
            option.textContent = playlist.label;
            playlistSelect.appendChild(option);
        });

        controlsContainer.appendChild(searchInput);
        controlsContainer.appendChild(playlistSelect);

        // Add event listeners
        searchInput.addEventListener("input", async () => {
            const searchQuery = searchInput.value;
            const videos = await fetchVideosFn(container, searchQuery, playlistSelect.value);
            renderVideosFn(container, videos, layout);
        });

        playlistSelect.addEventListener("change", async () => {
            const playlistId = playlistSelect.value;
            const videos = await fetchVideosFn(container, searchInput.value, playlistId);
            renderVideosFn(container, videos, layout);
        });

        container.prepend(controlsContainer);
    }

    // Iterate over each container and initialize
    containers.forEach(async (container) => {
        if (container.hasAttribute('data-initialized')) {
            return;
        }

        container.setAttribute('data-initialized', 'true');
        const layout = container.getAttribute('data-layout') || 'grid';
        const videos = await fetchVideos(container);
        renderVideos(container, videos, layout);
        addControls(container, layout, fetchVideos, renderVideos);
    });
});
