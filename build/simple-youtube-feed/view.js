/******/ (() => { // webpackBootstrap
/*!*****************************************!*\
  !*** ./src/simple-youtube-feed/view.js ***!
  \*****************************************/
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
  const enablePlaylistFilter = container.getAttribute('data-enable-playlist-filter') === 'true';
  const layout = container.getAttribute('data-layout') || 'grid';
  const maxVideos = parseInt(container.getAttribute('data-max-videos'), 10) || 10;
  const selectedPlaylist = container.getAttribute('data-selected-playlist');
  const apiUrlBase = `https://www.googleapis.com/youtube/v3`;

  // Cache for avoiding repeated queries
  const cache = {};
  let playlists = [];
  let nextPageToken = null;

  // Function to fetch playlists
  async function fetchPlaylists(loadMore = false) {
    let apiUrl = `${apiUrlBase}/playlists?part=snippet&channelId=${YT_FOR_WP.channelId}&key=${YT_FOR_WP.apiKey}&maxResults=50`;
    if (nextPageToken && loadMore) {
      apiUrl += `&pageToken=${nextPageToken}`;
    }
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.items) {
        playlists = loadMore ? [...playlists, ...data.items] : [{
          id: '',
          snippet: {
            title: 'All Videos'
          }
        }, ...data.items];
      }
      nextPageToken = data.nextPageToken || null;
      renderLoadMoreButton();
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  }

  // Render the "Load More" button only if there are more playlists to load
  function renderLoadMoreButton() {
    const filterContainer = document.querySelector(".youtube-filter-container");
    const existingButton = document.querySelector(".load-more-button");
    if (existingButton) existingButton.remove();
    if (nextPageToken && filterContainer) {
      const loadMoreButton = document.createElement("button");
      loadMoreButton.textContent = "Load More";
      loadMoreButton.classList.add("load-more-button");
      loadMoreButton.addEventListener("click", () => fetchPlaylists(true));
      filterContainer.appendChild(loadMoreButton);
    }
  }

  // Call fetchPlaylists initially to load the first set of playlists
  await fetchPlaylists();

  // Function to fetch videos
  async function fetchVideos(searchQuery = '', playlistId = '') {
    const cacheKey = `${searchQuery}-${playlistId}`;
    if (cache[cacheKey]) return cache[cacheKey];
    let apiUrl = `${apiUrlBase}/search?part=snippet&type=video&channelId=${YT_FOR_WP.channelId}&maxResults=${maxVideos}&key=${YT_FOR_WP.apiKey}`;
    if (playlistId) {
      apiUrl = `${apiUrlBase}/playlistItems?part=snippet&maxResults=${maxVideos}&playlistId=${playlistId}&key=${YT_FOR_WP.apiKey}`;
    }
    if (searchQuery) {
      apiUrl += `&q=${encodeURIComponent(searchQuery)}`;
    }
    const response = await fetch(apiUrl);
    const data = await response.json();
    cache[cacheKey] = data.items || [];
    return cache[cacheKey];
  }

  // Create filter container if needed
  if (enableSearch || enablePlaylistFilter) {
    const filterContainer = document.createElement("div");
    filterContainer.classList.add("youtube-filter-container");

    // Render playlist dropdown
    if (enablePlaylistFilter) {
      const dropdown = document.createElement("select");
      dropdown.classList.add("youtube-playlist-dropdown");
      playlists.forEach(({
        id,
        snippet
      }) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = snippet.title;
        dropdown.appendChild(option);
      });
      dropdown.addEventListener("change", async () => {
        const playlistId = dropdown.value;
        const searchQuery = document.querySelector(".youtube-search-bar")?.value.trim() || '';
        const videos = await fetchVideos(searchQuery, playlistId);
        renderVideos(container, videos, layout);
      });
      filterContainer.appendChild(dropdown);
    }

    // Render search bar
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
      searchBar.addEventListener("keypress", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          searchButton.click();
        }
      });
      searchButton.addEventListener("click", async () => {
        const keyword = searchBar.value.trim();
        const playlistId = document.querySelector(".youtube-playlist-dropdown")?.value || '';
        const videos = await fetchVideos(keyword, playlistId);
        renderVideos(container, videos, layout);
      });
      searchContainer.appendChild(searchBar);
      searchContainer.appendChild(searchButton);
      filterContainer.appendChild(searchContainer);
    }
    container.appendChild(filterContainer);
  }

  // Initial video load
  const initialVideos = await fetchVideos();
  renderVideos(container, initialVideos, layout);
});
function renderVideos(container, videos, layout) {
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
/******/ })()
;
//# sourceMappingURL=view.js.map