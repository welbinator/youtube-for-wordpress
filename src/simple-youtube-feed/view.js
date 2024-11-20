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
        if (!container) {
            console.error('Invalid container element.');
            return [];
        }

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

    // Function to render videos
    function renderVideos(container, videos, layout) {
        if (!container) {
            console.error('Invalid container element.');
            return;
        }
    
        if (container.hasAttribute('data-swiper-initialized')) {
            console.warn(`Skipping container: Already initialized for #${container.id}`);
            return;
        }
    
        const existingVideoContainer = container.querySelector(".video-container");
        if (existingVideoContainer) {
            existingVideoContainer.remove();
        }
    
        const videoContainer = document.createElement("div");
        videoContainer.classList.add("video-container");
    
        if (layout === "carousel") {
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
    
            console.log(`Initializing Swiper for container: #${container.id}`);

            const nextButton = container.querySelector('.swiper-button-next');
            const prevButton = container.querySelector('.swiper-button-prev');
    
            if (!nextButton || !prevButton) {
                console.error('Navigation buttons are missing for Swiper:', {
                    nextButton,
                    prevButton,
                });
                return;
            }
    
            console.log(`Next Button Selector:`, nextButton);
            console.log(`Prev Button Selector:`, prevButton);
    
            // Initialize Swiper
            console.log(`Initializing Swiper for container: #${container.id}`);
            const swiperInstance = new Swiper(`#${container.id} .swiper-container`, {
                slidesPerView: 1,
                spaceBetween: 10,
                navigation: {
                    nextEl: container.querySelector('.swiper-button-next'),
                    prevEl: container.querySelector('.swiper-button-prev'),
                },
                
                pagination: {
                    el: container.querySelector('.swiper-pagination'),
                    clickable: true,
                },
                loop: true,
                breakpoints: {
                    640: { slidesPerView: 1, spaceBetween: 10 },
                    768: { slidesPerView: 2, spaceBetween: 20 },
                    1024: { slidesPerView: 3, spaceBetween: 30 },
                },
            });
            
            // Debug: Log swiper instance
            console.log(`Swiper initialized for container: #${container.id}`, swiperInstance);
            swiperInstance.on('slideChange', () => {
                console.log(`Swiper slide changed to index: ${swiperInstance.activeIndex}`);
            });

            // Debugging logs
            // console.log(`Swiper initialized for container: #${container.id}`, swiperInstance);
            // console.log('Total slides:', swiperInstance.slides.length);
            // console.log('Next Button:', swiperInstance.navigation.nextEl);
            // console.log('Prev Button:', swiperInstance.navigation.prevEl);
            
            // Check slide change behavior
            swiperInstance.on('slideChange', () => {
                console.log(`Swiper slide changed to index: ${swiperInstance.activeIndex}`);
            });
            

            // Add this line to update the swiper after initialization
            swiperInstance.update();

            // Debug: Add manual listeners to navigation buttons
            nextButton.addEventListener('click', () => {
                console.log(`Next button manually clicked for container: #${container.id}`);
                swiperInstance.slideNext(); // Manually navigate to the next slide
            });
            prevButton.addEventListener('click', () => {
                console.log(`Prev button manually clicked for container: #${container.id}`);
                swiperInstance.slidePrev(); // Manually navigate to the previous slide
            });
            

            // Check if Swiper's event listeners are properly set
            if (swiperInstance.navigation) {
                console.log(`Swiper navigation initialized for container: #${container.id}`, {
                    nextEl: swiperInstance.navigation.nextEl,
                    prevEl: swiperInstance.navigation.prevEl,
                });
            } else {
                console.error(`Swiper navigation not properly initialized for container: #${container.id}`);
            }

            
    
            console.log(`Swiper initialized for container: #${container.id}`, swiperInstance);
            
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
    

    // Iterate over each container and initialize
    containers.forEach(async (container) => {
        if (container.hasAttribute('data-swiper-initialized')) {
            console.warn(`Skipping container: Already initialized for #${container.id}`);
            return;
        }

        const layout = container.getAttribute('data-layout') || 'grid';
        const videos = await fetchVideos(container);
        renderVideos(container, videos, layout);
    });
});
