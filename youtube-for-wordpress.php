<?php
/**
 * Plugin Name: YouTube for WordPress
 * Description: A toolkit for integrating YouTube functionalities into WordPress.
 * Version: 1.0.0
 * Author: James Welbes
 * Author URI: https://jameswelbes.com
 * Text Domain: yt-for-wp
 * Domain Path: /languages
 */

namespace YouTubeForWP;

 // Exit if accessed directly.
 if ( ! defined( 'ABSPATH' ) ) {
     exit;
 }

 // Define plugin constants.
 define( 'YOUTUBE_FOR_WP_VERSION', '1.0.0' );
 define( 'YT_FOR_WP_PATH', plugin_dir_path( __FILE__ ) );
 define( 'YT_FOR_WP_URL', plugin_dir_url( __FILE__ ) );

 // Include admin settings file.
 require_once YT_FOR_WP_PATH . 'includes/admin-settings.php';
 require_once YT_FOR_WP_PATH . 'blocks/simple-youtube-feed/simple-youtube-feed.php';

 // Register settings page.
 function add_admin_menu() {
     add_menu_page(
         __( 'YT for WP', 'yt-for-wp' ),
         __( 'YT for WP', 'yt-for-wp' ),
         'manage_options',
         'yt-for-wp-settings',
         __NAMESPACE__ . '\\Admin\\Settings\\render_settings_page',
         'dashicons-video-alt3',
         20
     );
 }
 add_action( 'admin_menu', __NAMESPACE__ . '\\add_admin_menu' );

 function yt_for_wp_enqueue_scripts() {
    // Swiper JS and CSS
    wp_enqueue_style(
        'swiper-css',
        'https://unpkg.com/swiper@10/swiper-bundle.min.css',
        [],
        null
    );
    
    wp_enqueue_script(
        'swiper-js',
        'https://unpkg.com/swiper@10/swiper-bundle.min.js',
        [],
        null,
        true
    );
    
    if (is_singular() && has_block('yt-for-wp/simple-youtube-feed')) {
            wp_enqueue_script(
            'yt-for-wp-view',
            plugins_url('build/simple-youtube-feed/view.js', __FILE__),
            [],
            null,
            true
        );
    }

    // Corrected option keys
    $channel_id = get_option('yt_for_wp_channel_id');
    $api_key = get_option('yt_for_wp_api_key');


    if ($channel_id && $api_key) {
        wp_localize_script('yt-for-wp-view', 'YT_FOR_WP', [
            'channelId' => $channel_id,
            'apiKey'    => $api_key,
        ]);
    } else {
        error_log('Channel ID or API key is missing. Ensure they are set in the plugin settings.');
    }
}
add_action('wp_enqueue_scripts', __NAMESPACE__ . '\\yt_for_wp_enqueue_scripts');

function yt_for_wp_enqueue_block_editor_assets() {
   
    wp_enqueue_script(
        'yt-for-wp-editor', // Handle for the editor script
        plugins_url('build/simple-youtube-feed/index.js', __FILE__), // Path to the compiled script
        ['wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor'], // Dependencies
        YOUTUBE_FOR_WP_VERSION,
        true
    );
    
    // Mark it as a module
    wp_script_add_data( 'yt-for-wp-editor', 'type', 'module' );

    
    $channel_id = get_option('yt_for_wp_channel_id');
    $api_key = get_option('yt_for_wp_api_key');

    wp_localize_script('yt-for-wp-editor', 'YT_FOR_WP', [
        'channelId' => $channel_id,
        'apiKey'    => $api_key,
    ]);
}
add_action('enqueue_block_editor_assets', __NAMESPACE__ . '\\yt_for_wp_enqueue_block_editor_assets');


add_action('rest_api_init', function() {
    register_rest_route('yt-for-wp/v1', '/get_cached_videos', [
        'methods' => 'GET',
        'callback' => 'get_cached_videos'
    ]);
    register_rest_route('yt-for-wp/v1', '/cache_videos', [
        'methods' => 'POST',
        'callback' => 'cache_videos'
    ]);
});

function get_cached_videos(WP_REST_Request $request) {
    $key = sanitize_text_field($request->get_param('key'));
    $cached_data = get_transient($key);
    return rest_ensure_response($cached_data ?: []);
}

function cache_videos(WP_REST_Request $request) {
    $key = sanitize_text_field($request->get_param('key'));
    $videos = $request->get_json_params()['videos'];
    set_transient($key, $videos, DAY_IN_SECONDS);
    return rest_ensure_response(['status' => 'cached']);
}

