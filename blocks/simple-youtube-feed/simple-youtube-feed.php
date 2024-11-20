<?php
namespace YouTubeForWP\Blocks\SimpleYouTubeFeed;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Registers the block using metadata from `block.json`.
 */
function register_simple_youtube_feed_block() {
    // Register the block
    register_block_type_from_metadata(
        plugin_dir_path(__FILE__) . '../../build/simple-youtube-feed',
        [
            'render_callback' => __NAMESPACE__ . '\\render_youtube_feed_block'
        ]
    );
}
add_action('init', __NAMESPACE__ . '\\register_simple_youtube_feed_block');

/**
 * Renders the block on the frontend.
 *
 * @param array    $attributes The block attributes.
 * @param string   $content    The block content.
 * @return string The block HTML.
 */
function render_youtube_feed_block($attributes, $content) {
    // Get the API key and channel ID
    $api_key = \YouTubeForWP\Admin\Settings\get_api_key();
    $default_channel_id = get_option('yt_for_wp_channel_id');
    
    // Use block channel ID if set, otherwise use default
    $channel_id = !empty($attributes['channelId']) ? $attributes['channelId'] : $default_channel_id;

    // Append custom class
    $attributes['className'] = trim(($attributes['className'] ?? '') . ' youtube-feed-container');
    
    // Localize the script with required data
    wp_localize_script(
        'yt-for-wp-simple-youtube-feed-view',
        'YT_FOR_WP',
        [
            'channelId' => $channel_id,
            'apiKey'    => $api_key,
            'restUrl'   => rest_url('yt-for-wp/v1/'),
            'nonce'     => wp_create_nonce('wp_rest'),
            'siteUrl'   => get_site_url() // Add this line
        ]
    );
    $unique_id = uniqid('youtube-feed-');
    // Start output buffering
    ob_start();
    ?>
    <div 
        <?php echo esc_attr(get_block_wrapper_attributes()); ?>
         id="<?php echo esc_attr($unique_id); ?>"
        data-layout="<?php echo esc_attr($attributes['layout'] ?? 'grid'); ?>"
        data-max-videos="<?php echo esc_attr($attributes['maxVideos'] ?? 5); ?>"
        data-selected-playlist="<?php echo esc_attr($attributes['selectedPlaylist'] ?? ''); ?>"
        data-enable-search="<?php echo esc_attr($attributes['enableSearch'] ? 'true' : 'false'); ?>"
        data-enable-playlist-filter="<?php echo esc_attr($attributes['enablePlaylistFilter'] ? 'true' : 'false'); ?>"
        data-channel-id="<?php echo esc_attr($channel_id); ?>"
        
    ></div>
    <?php
    return ob_get_clean();
}

/**
 * Fetches YouTube videos for the feed.
 *
 * @return array Video data or an empty array on failure.
 */
function fetch_youtube_feed_videos() {
    $api_key = \YouTubeForWP\Admin\Settings\get_api_key();
    $channel_id = get_option('yt_for_wp_channel_id');
    $max_results = 5;

    if (empty($api_key) || empty($channel_id)) {
        return [];
    }

    $api_url = add_query_arg([
        'key' => $api_key,
        'channelId' => $channel_id,
        'part' => 'snippet',
        'type' => 'video',
        'order' => 'date',
        'maxResults' => $max_results
    ], 'https://www.googleapis.com/youtube/v3/search');

    $response = wp_remote_get($api_url);

    if (is_wp_error($response)) {
        return [];
    }

    $data = json_decode(wp_remote_retrieve_body($response), true);
    return $data['items'] ?? [];
}