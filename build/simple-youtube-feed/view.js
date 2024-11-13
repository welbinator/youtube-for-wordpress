/******/ (() => { // webpackBootstrap
/*!*****************************************!*\
  !*** ./src/simple-youtube-feed/view.js ***!
  \*****************************************/
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("youtube-feed-container");

  // Ensure container is available
  if (!container) {
    return;
  }

  // Retrieve layout, max videos, and selected playlist from data attributes
  const layout = container.getAttribute('data-layout') || 'grid';
  const maxVideos = parseInt(container.getAttribute('data-max-videos'), 10) || 5;
  const selectedPlaylist = container.getAttribute('data-selected-playlist');
  console.log('Channel ID:', YT_FOR_WP.channelId);
  console.log('API Key:', YT_FOR_WP.apiKey);

  // Construct the API URL based on selected playlist
  let apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxVideos}&key=${YT_FOR_WP.apiKey}`;
  if (selectedPlaylist) {
    apiUrl += `&playlistId=${selectedPlaylist}`;
  } else {
    apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${YT_FOR_WP.channelId}&maxResults=${maxVideos}&key=${YT_FOR_WP.apiKey}`;
  }

  // Fetch videos
  const response = await fetch(apiUrl);
  const data = await response.json();
  const videos = data.items || [];

  // Render based on the selected layout
  if (layout === 'grid') {
    renderGridLayout(container, videos);
  } else {
    renderListLayout(container, videos);
  }
});
function renderGridLayout(container, videos) {
  container.innerHTML = ""; // Clear previous content
  const gridContainer = document.createElement("div");
  gridContainer.classList.add("youtube-feed-grid");
  container.appendChild(gridContainer);
  videos.forEach(video => {
    const videoElement = document.createElement("div");
    videoElement.classList.add("youtube-video-card");
    const title = video.snippet.title;
    const description = video.snippet.description;
    const videoUrl = `https://www.youtube.com/embed/${video.snippet.resourceId?.videoId || video.id.videoId}`;
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
    gridContainer.appendChild(videoElement);
  });
}
function renderListLayout(container, videos) {
  container.innerHTML = ""; // Clear previous content
  const listContainer = document.createElement("div");
  listContainer.classList.add("youtube-feed-list");
  container.appendChild(listContainer);
  videos.forEach(video => {
    const videoElement = document.createElement("div");
    videoElement.classList.add("youtube-video-list-item");
    const title = video.snippet.title;
    const description = video.snippet.description;
    const videoUrl = `https://www.youtube.com/embed/${video.snippet.resourceId?.videoId || video.id.videoId}`;
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
    listContainer.appendChild(videoElement);
  });
}
/******/ })()
;
//# sourceMappingURL=view.js.map