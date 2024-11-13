<?php

namespace YouTubeForWP\Blocks\SimpleYouTubeFeed;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Fetches YouTube videos for the feed.
 *
 * @return array Video data or an empty array on failure.
 */
function fetch_youtube_feed_videos() {
    $api_key = get_option('yt_for_wp_api_key');
    $channel_id = get_option('yt_for_wp_channel_id');
    $max_results = 5;

    // Ensure API key and Channel ID are available.
    if (empty($api_key) || empty($channel_id)) {
        return [];
    }

    $api_url = "https://www.googleapis.com/youtube/v3/search?key={$api_key}&channelId={$channel_id}&part=snippet&type=video&order=date&maxResults={$max_results}";
    $response = wp_remote_get($api_url);

    if (is_wp_error($response)) {
        return [];
    }

    $data = json_decode(wp_remote_retrieve_body($response), true);
    return $data['items'] ?? [];
}

/**
 * Registers the block using metadata from `block.json`.
 */
function register_simple_youtube_feed_block() {
    register_block_type_from_metadata( plugin_dir_path( __FILE__ ) . '../../build/simple-youtube-feed' );
}
add_action('init', __NAMESPACE__ . '\\register_simple_youtube_feed_block');

/**
 * Enqueues the block's frontend assets and passes video data to JavaScript.
 */
function enqueue_youtube_feed_script() {
    // Enqueue the front-end script for displaying the YouTube feed.
    wp_enqueue_script(
        'simple-youtube-feed-view-script',
        plugin_dir_url( __FILE__ ) . '../../build/simple-youtube-feed/view.js',
        array(),
        YOUTUBE_FOR_WP_VERSION,
        true
    );

    // Fetch video data and pass it to the script.
    $video_data = fetch_youtube_feed_videos();
    wp_localize_script('simple-youtube-feed-view-script', 'youtubeFeedData', $video_data);
}
add_action('wp_enqueue_scripts', __NAMESPACE__ . '\\enqueue_youtube_feed_script');
