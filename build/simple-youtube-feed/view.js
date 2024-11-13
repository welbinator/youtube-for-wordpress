/******/ (() => { // webpackBootstrap
/*!*****************************************!*\
  !*** ./src/simple-youtube-feed/view.js ***!
  \*****************************************/
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("youtube-feed-container");

  // Ensure container and YouTube feed data are available
  if (!container || typeof youtubeFeedData === 'undefined' || youtubeFeedData.length === 0) {
    container.innerHTML = "<p>No videos available.</p>";
    return;
  }

  // Retrieve the layout and max videos from the data attributes
  const layout = container.getAttribute('data-layout') || 'grid';
  const maxVideos = parseInt(container.getAttribute('data-max-videos'), 10) || 5;

  // Render based on the selected layout and limit the number of videos
  const videosToDisplay = youtubeFeedData.slice(0, maxVideos);
  if (layout === 'grid') {
    renderGridLayout(container, videosToDisplay);
  } else {
    renderListLayout(container, videosToDisplay);
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
    const videoUrl = `https://www.youtube.com/embed/${video.id.videoId}`;
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
    const videoUrl = `https://www.youtube.com/embed/${video.id.videoId}`;
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