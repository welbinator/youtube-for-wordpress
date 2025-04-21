=== Toolkit Integration for Youtube ===

Contributors: highprrrr  
Tags: youtube, video feed, video player, youtube integration, youtube channel  
Requires at least: 5.8  
Stable tag: 1.1.4  
Tested up to: 6.7  
License: GPLv2 or later  
License URI: http://www.gnu.org/licenses/gpl-2.0.html  

Toolkit Integration for Youtube brings the power of YouTube to your WordPress site. Display customizable video feeds and playlists directly on your website with ease.

== Description ==

Transform your WordPress site with [Toolkit Integration for Youtube](https://ytforwp.com), the perfect plugin for embedding dynamic YouTube content. Whether you’re a creator, a business, or a blogger, Toolkit Integration for Youtube makes it easy to display engaging video feeds and playlists tailored to your audience.

Simple shortcodes and intuitive Gutenberg blocks make adding YouTube content effortless. Set up a responsive video feed, customize layouts, and showcase your favorite playlists in just minutes!

Key features:
- Display videos from a YouTube channel or playlist.  
- Choose from grid, list, or carousel layouts.  
- Add dynamic filtering options for playlists and keywords (Pro version).    

Toolkit Integration for Youtube is ideal for anyone looking to keep their audience engaged with high-quality video content directly on their WordPress site.

= ✨ Unlock Pro Features =

Ready to take it to the next level? [Toolkit Integration for Youtube Pro](https://ytforwp.com/#pricing) includes advanced features like keyword filtering, playlist filtering, and premium support to give your videos even more visibility.

== 📃 Documentation ==

Visit our website for more information on how to get started: [Getting Started Guide](https://ytforwp.com/kb_article/getting-started/)

== 🔗 Source Code ==

The source code for this plugin, including build tools and development instructions, is publicly available on GitHub:  
[GitHub Repository](https://github.com/welbinator/youtube-for-wordpress)  

To rebuild the plugin from source, follow the instructions in the repository's README file.

== 🌐 External Services ==

This plugin uses the YouTube Data API to fetch video information, including playlists and channel uploads, to display them on your WordPress site.

1. **What the service is and what it is used for**  
   The plugin connects to the YouTube Data API to fetch video data such as titles, descriptions, thumbnails, and URLs. This data is used to display YouTube video feeds, playlists, or live videos in the plugin’s blocks and shortcodes.

2. **What data is sent and when**  
   - The plugin sends the following data to the YouTube API:
     - The YouTube Channel ID or Playlist ID entered by the user.
     - The API key provided in the plugin settings.
     - Search queries or filters (if applicable, based on plugin features).
   - These requests are sent when:
     - A user visits a page where the plugin is active.
     - The admin configures settings in the WordPress dashboard.

3. **Links to terms of service and privacy policy**  
   - [YouTube API Terms of Service](https://developers.google.com/youtube/terms/api-services-terms-of-service)  
   - [YouTube Privacy Policy](https://policies.google.com/privacy)

Users must obtain their own YouTube API key and agree to YouTube’s terms of service to use the plugin.

== Screenshots ==
1. Grid layout of a YouTube channel feed.  
2. List layout of recent uploads.  
3. Carousel layout with playlist filtering.

== Changelog ==

= 1.1.2 =
*New Fetaure: Added Gallery View to the Simple Feed block

= 1.1.1 =
*Improved: fixed a few things for the dot org review team

= 1.1.0.1 =
*Improved: Fixed double quotes in block class caused by escaping

= 1.1.0 =
*Improved: Tweaked styles of feed block

= 1.0.9 =
*Improved: Changed slidesPerView to 3 in carousel view

= 1.0.8 =
*Fixed: Filtering was broken

= 1.0.7 =
* Improved: Using the publishedAt date for the order of the videos so the order matches what you see in the channel on youtube.com

= 1.0.6 =
* Fixed: Resolved unexpected output during plugin activation caused by incorrect file handling and output.
* Fixed: Addressed an issue where enabling the plugin interfered with updating other plugins.
* Improved: Enhanced compatibility checks for PHP and WordPress versions during activation, ensuring proper error reporting without unintended output.
* Improved: Consolidated and streamlined asset enqueuing for both front-end and editor environments.
* Improved: Updated GitHub updater logic to prevent interference with other plugin updates.
* Debugging: Added error logging for missing files and unexpected outputs during plugin execution.

= 1.0.5 =
* Add GitHub Updater

= 1.0.4 =
* Minor style tweaks

= 1.0.3 =
* Fix console error with carousel layout

= 1.0.2 =
* Fix conflict with Pro

= 1.0.1 =
* Get plugin ready to submit to wordpress.org

= 1.0.0 =  
* Initial release: Grid, list, and carousel layouts.  
* Shortcode and Gutenberg block support.  
* Dynamic video feed from YouTube channel or playlist.  
