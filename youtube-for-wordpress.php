<?php
/**
 * Plugin Name: YouTube for WordPress
 * Plugin URI: https://jameswelbes.com/youtube-for-wordpress
 * Description: A toolkit for integrating YouTube functionalities into WordPress.
 * Version: 1.1.0
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Author: James Welbes
 * Author URI: https://jameswelbes.com
 * Text Domain: yt-for-wp
 * Domain Path: /languages
 * License: GPL v2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

namespace YouTubeForWP;

use WP_REST_Request;
use YouTubeForWP\Admin\Settings\API_Key_Handler;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants.
define('YOUTUBE_FOR_WP_VERSION', '1.1.0');
define('YT_FOR_WP_PATH', plugin_dir_path(__FILE__));
define('YT_FOR_WP_URL', plugin_dir_url(__FILE__));
define('YT_FOR_WP_MIN_WP_VERSION', '5.8');
define('YT_FOR_WP_MIN_PHP_VERSION', '7.4');

/**
 * Check PHP and WordPress versions before activation
 */
function activation_check() {
    if (version_compare(PHP_VERSION, YT_FOR_WP_MIN_PHP_VERSION, '<')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die(sprintf(
            esc_html__('YouTube for WordPress requires PHP version %s or higher.', 'yt-for-wp'),
            YT_FOR_WP_MIN_PHP_VERSION
        ));
    }

    if (version_compare($GLOBALS['wp_version'], YT_FOR_WP_MIN_WP_VERSION, '<')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die(sprintf(
            esc_html__('YouTube for WordPress requires WordPress version %s or higher.', 'yt-for-wp'),
            YT_FOR_WP_MIN_WP_VERSION
        ));
    }
}
register_activation_hook(__FILE__, __NAMESPACE__ . '\\activation_check');

/**
 * Load text domain for internationalization
 */
function load_textdomain() {
    load_plugin_textdomain('yt-for-wp', false, dirname(plugin_basename(__FILE__)) . '/languages');
}
add_action('init', __NAMESPACE__ . '\\load_textdomain');

// Include required files
require_once YT_FOR_WP_PATH . 'includes/admin-settings.php';
require_once YT_FOR_WP_PATH . 'blocks/simple-youtube-feed/simple-youtube-feed.php';
require_once YT_FOR_WP_PATH . 'blocks/youtube-live/youtube-live.php';

// Register settings page.
function add_admin_menu() {
    add_menu_page(
        __('YT for WP', 'yt-for-wp'),
        __('YT for WP', 'yt-for-wp'),
        'manage_options',
        'yt-for-wp-settings',
        __NAMESPACE__ . '\\Admin\\Settings\\render_settings_page',
        'dashicons-video-alt3',
        20
    );
}
add_action('admin_menu', __NAMESPACE__ . '\\add_admin_menu');

function yt_for_wp_enqueue_scripts() {
    // Only load if we're on a singular page with our block
    if (!is_singular() || (!has_block('yt-for-wp/simple-youtube-feed') && 
        !has_block('yt-for-wp/youtube-live'))) {
        return;
    }

    // Swiper JS and CSS
    wp_enqueue_style(
        'swiper-css',
        'https://unpkg.com/swiper@10/swiper-bundle.min.css',
        [],
        YOUTUBE_FOR_WP_VERSION
    );
    
    wp_enqueue_script(
        'swiper-js',
        'https://unpkg.com/swiper@10/swiper-bundle.min.js',
        [],
        YOUTUBE_FOR_WP_VERSION,
        true
    );
    
    $api_key = \YouTubeForWP\Admin\Settings\get_api_key();
    $channel_id = get_option('yt_for_wp_channel_id');

    if (has_block('yt-for-wp/simple-youtube-feed')) {
        wp_enqueue_script(
            'yt-for-wp-simple-youtube-feed-view',
            plugins_url('build/simple-youtube-feed/view.js', __FILE__),
            ['swiper-js'],
            YOUTUBE_FOR_WP_VERSION,
            true
        );

        wp_localize_script(
            'yt-for-wp-simple-youtube-feed-view',
            'YT_FOR_WP',
            [
                'channelId' => $channel_id,
                'apiKey'    => $api_key,
                'restUrl'   => rest_url('yt-for-wp/v1/'),
                'nonce'     => wp_create_nonce('wp_rest')
            ]
        );
    }

    if (has_block('yt-for-wp/youtube-live')) {
        wp_enqueue_script(
            'yt-for-wp-youtube-live-view',
            plugins_url('build/youtube-live/view.js', __FILE__),
            ['swiper-js'],
            YOUTUBE_FOR_WP_VERSION,
            true
        );

        wp_localize_script(
            'yt-for-wp-youtube-live-view',
            'YT_FOR_WP',
            [
                'channelId' => $channel_id,
                'apiKey'    => $api_key,
                'restUrl'   => rest_url('yt-for-wp/v1/'),
                'nonce'     => wp_create_nonce('wp_rest')
            ]
        );
    }
}
add_action('wp_enqueue_scripts', __NAMESPACE__ . '\\yt_for_wp_enqueue_scripts');

function yt_for_wp_enqueue_block_editor_assets() {
    $api_key = \YouTubeForWP\Admin\Settings\get_api_key();
    $channel_id = get_option('yt_for_wp_channel_id');
    
    // Simple YouTube Feed block
    wp_enqueue_script(
        'yt-for-wp-simple-youtube-feed-editor',
        plugins_url('build/simple-youtube-feed/index.js', __FILE__),
        ['wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor'],
        YOUTUBE_FOR_WP_VERSION,
        true
    );
    
    wp_script_add_data('yt-for-wp-simple-youtube-feed-editor', 'type', 'module');

    wp_localize_script(
        'yt-for-wp-simple-youtube-feed-editor',
        'YT_FOR_WP',
        [
            'channelId' => $channel_id,
            'apiKey'    => $api_key,
            'restUrl'   => rest_url('yt-for-wp/v1/'),
            'nonce'     => wp_create_nonce('wp_rest')
        ]
    );

    // YouTube Live block
    wp_enqueue_script(
        'yt-for-wp-youtube-live-editor',
        plugins_url('build/youtube-live/index.js', __FILE__),
        ['wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor'],
        YOUTUBE_FOR_WP_VERSION,
        true
    );
    
    wp_script_add_data('yt-for-wp-youtube-live-editor', 'type', 'module');
}
add_action('enqueue_block_editor_assets', __NAMESPACE__ . '\\yt_for_wp_enqueue_block_editor_assets');

add_action('rest_api_init', function() {
    register_rest_route('yt-for-wp/v1', '/get_cached_videos', [
        'methods' => 'GET',
        'callback' => __NAMESPACE__ . '\\get_cached_videos',
        'permission_callback' => function() {
            return wp_verify_nonce($_REQUEST['nonce'] ?? '', 'wp_rest');
        },
    ]);

    register_rest_route('yt-for-wp/v1', '/cache_videos', [
        'methods' => 'POST',
        'callback' => __NAMESPACE__ . '\\cache_videos',
        'permission_callback' => function() {
            return wp_verify_nonce($_REQUEST['nonce'] ?? '', 'wp_rest');
        },
    ]);
});

function get_cached_videos(WP_REST_Request $request) {
    $key = sanitize_text_field($request->get_param('key'));
    $cached_data = get_transient($key);
    return rest_ensure_response($cached_data ?: []);
}

function cache_videos(WP_REST_Request $request) {
    $key = sanitize_text_field($request->get_param('key'));
    $videos = $request->get_json_params()['videos'] ?? [];
    
    if (empty($videos) || !is_array($videos)) {
        return new \WP_Error(
            'invalid_videos',
            __('Invalid videos data provided.', 'yt-for-wp'),
            ['status' => 400]
        );
    }
    
    set_transient($key, $videos, DAY_IN_SECONDS);
    return rest_ensure_response(['status' => 'cached']);
}

function upgrade_routine() {
    $current_version = get_option('yt_for_wp_version', '0.0.0');
    
    if (version_compare($current_version, '1.1.0', '<')) {
        $old_api_key = get_option('yt_for_wp_api_key');
        if (!empty($old_api_key)) {
            $api_key_handler = new \YouTubeForWP\Admin\Settings\API_Key_Handler();
            $api_key_handler->save_api_key($old_api_key);
            delete_option('yt_for_wp_api_key');
        }
        update_option('yt_for_wp_version', '1.1.0');
    }
}

register_activation_hook(__FILE__, __NAMESPACE__ . '\\upgrade_routine');
add_action('plugins_loaded', __NAMESPACE__ . '\\upgrade_routine');