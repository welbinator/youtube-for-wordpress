document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("youtube-feed-container");

    // Ensure container is available and not already initialized
    if (!container) {
        console.warn("YouTube feed container not found.");
        return;
    }

    if (container.hasAttribute('data-initialized')) {
        return;
    }

    container.setAttribute('data-initialized', 'true');

    const enableSearch = container.getAttribute('data-enable-search') === 'true';
    const layout = container.getAttribute('data-layout') || 'grid';
    const maxVideos = parseInt(container.getAttribute('data-max-videos'), 10) || 10;
    const selectedPlaylist = container.getAttribute('data-selected-playlist');
    const apiUrlBase = `https://www.googleapis.com/youtube/v3`;

    // Async function to fetch videos, with persistent caching using WordPress transients
    async function fetchVideos(searchQuery = '') {
        try {
            // Create a unique cache key based on search query, playlist, and max videos
            const cacheKey = `youtube_videos_${searchQuery}_${selectedPlaylist}_${maxVideos}`;
            
            // Check if cached videos exist
            let cachedVideos = await fetch(`/wp-json/yt-for-wp/v1/get_cached_videos?key=${encodeURIComponent(cacheKey)}`)
                .then(res => res.json());

            if (cachedVideos && cachedVideos.length > 0) {
                return cachedVideos;
            }

            // Construct API URL if no cached data found
            let apiUrl = `${apiUrlBase}/search?part=snippet&type=video&channelId=${YT_FOR_WP.channelId}&maxResults=${maxVideos}&key=${YT_FOR_WP.apiKey}`;
            if (selectedPlaylist) {
                apiUrl = `${apiUrlBase}/playlistItems?part=snippet&maxResults=${maxVideos}&playlistId=${selectedPlaylist}&key=${YT_FOR_WP.apiKey}`;
            }
            if (searchQuery) {
                apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
            }

            const response = await fetch(apiUrl);
            const data = await response.json();

            // Cache the response using a custom REST endpoint
            await fetch('/wp-json/yt-for-wp/v1/cache_videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: cacheKey, videos: data.items || [] })
            });

            return data.items || [];
        } catch (error) {
            console.error("Error fetching videos:", error);
            return [];
        }
    }

    // Render the search bar if enabled
    if (enableSearch) {
        const searchContainer = document.createElement("div");
        searchContainer.classList.add("youtube-search-container");

        const searchBar = document.createElement("input");
        searchBar.type = "text";
        searchBar.placeholder = "Search videos";
        searchBar.classList.add("youtube-search-bar");

        const searchButton = document.createElement("button");
        searchButton.textContent = "Search";
        searchButton.classList.add("youtube-search-button");

        searchBar.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent form submission if inside a form
                searchButton.click(); // Trigger search button click
            }
        });

        searchButton.addEventListener("click", async () => {
            const keyword = searchBar.value.trim();
            if (keyword) {
                const videos = await fetchVideos(keyword);
                renderVideos(container, videos, layout);
            }
        });

        searchContainer.appendChild(searchBar);
        searchContainer.appendChild(searchButton);
        container.appendChild(searchContainer);
    }

    // Initial video load, check if cached before calling API
    const initialVideos = await fetchVideos();
    renderVideos(container, initialVideos, layout);
});

function renderVideos(container, videos, layout) {
    // Clear out any existing videos without affecting the search bar
    const existingVideoContainer = container.querySelector(".video-container");
    if (existingVideoContainer) {
        existingVideoContainer.remove();
    }

    const videoContainer = document.createElement("div");
    videoContainer.classList.add("video-container", layout === "grid" ? "youtube-feed-grid" : "youtube-feed-list");
    container.appendChild(videoContainer);

    videos.forEach(video => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(layout === "grid" ? "youtube-video-grid-item" : "youtube-video-list-item");

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

function renderCarouselLayout(container, videos) {
    container.innerHTML = `
        <div class="swiper-container">
            <div class="swiper-wrapper">
                ${videos.map(video => `
                    <div class="swiper-slide">
                        <iframe
                            src="https://www.youtube.com/embed/${video.id.videoId || video.snippet.resourceId?.videoId}?vq=hd720"
                            title="${video.snippet.title}"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                        ></iframe>
                        <div class="video-info">
                            <h2 class="video-title">${video.snippet.title}</h2>
                            <p class="video-description">${video.snippet.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="swiper-pagination"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
        </div>
    `;

    new Swiper('.swiper-container', {
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
        }
    });
}
