document.addEventListener("DOMContentLoaded",(async()=>{const e=document.getElementById("youtube-feed-container");if(!e)return void console.warn("YouTube feed container not found.");if(e.hasAttribute("data-initialized"))return;e.setAttribute("data-initialized","true");const i=e.getAttribute("data-channel-id")||YT_FOR_WP.channelId,t=e.getAttribute("data-layout")||"grid",n=parseInt(e.getAttribute("data-max-videos"),10)||10,s=YT_FOR_WP.apiKey,o={};!function(e,i,t){const n=e.querySelector(".video-container");n&&n.remove();const s=document.createElement("div");if(s.classList.add("video-container"),"grid"===t)s.classList.add("youtube-feed-grid");else if("list"===t)s.classList.add("youtube-feed-list");else if("carousel"===t)return s.classList.add("swiper-container"),s.innerHTML=`\n                <div class="swiper-wrapper">\n                    ${i.map((e=>`\n                        <div class="swiper-slide">\n                            <iframe\n                                src="https://www.youtube.com/embed/${e.id.videoId||e.snippet.resourceId?.videoId}?vq=hd720"\n                                title="${e.snippet.title}"\n                                class="video-iframe"\n                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"\n                                allowfullscreen\n                            ></iframe>\n                            <div class="video-info">\n                                <h2 class="video-title">${e.snippet.title}</h2>\n                                <p class="video-description">${e.snippet.description}</p>\n                            </div>\n                        </div>\n                    `)).join("")}\n                </div>\n                <div class="swiper-pagination"></div>\n                <div class="swiper-button-next"></div>\n                <div class="swiper-button-prev"></div>\n            `,e.appendChild(s),void new Swiper(".swiper-container",{slidesPerView:1,spaceBetween:10,navigation:{nextEl:".swiper-button-next",prevEl:".swiper-button-prev"},pagination:{el:".swiper-pagination",clickable:!0},loop:!0,breakpoints:{640:{slidesPerView:1,spaceBetween:10},768:{slidesPerView:2,spaceBetween:20},1024:{slidesPerView:3,spaceBetween:30}}});e.appendChild(s),i.forEach((e=>{const i=document.createElement("div");i.classList.add("grid"===t?"youtube-video-grid-item":"youtube-video-list-item");const n=e.snippet.title,o=e.snippet.description,r=`https://www.youtube.com/embed/${e.id.videoId||e.snippet.resourceId?.videoId}?vq=hd720`;i.innerHTML=`\n                <div class="video-iframe-wrapper">\n                    <iframe\n                        src="${r}"\n                        title="${n}"\n                        class="video-iframe"\n                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"\n                        allowfullscreen\n                    ></iframe>\n                </div>\n                <div class="video-info">\n                    <h2 class="video-title">${n}</h2>\n                    <p class="video-description">${o}</p>\n                </div>\n            `,s.appendChild(i)}))}(e,await async function(){const e=`${i}-${t}-${n}`;if(o[e])return o[e];const r=`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${i}&maxResults=${n}&key=${s}`;try{const i=await fetch(r),t=await i.json();return t.error?(console.error("YouTube API Error:",t.error),[]):(o[e]=t.items||[],o[e])}catch(e){return console.error("Error fetching videos:",e),[]}}(),t),window.wp&&wp.hooks&&wp.hooks.doAction("yt_for_wp_simple_feed_view",e,{channelId:i,layout:t,maxVideos:n})}));