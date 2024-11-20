<?php
/**
 * Plugin Name: YouTube for WordPress
 * Plugin URI: https://youtubeforwp.com
 * Description: A toolkit for integrating YouTube functionalities into WordPress.
 * Version: 1.0.1
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Author: James Welbes
 * Author URI: https://jameswelbes.com
 * Text Domain: youtube-for-wordpress
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
define('YOUTUBE_FOR_WP_VERSION', '1.0.1');
define('YT_FOR_WP_PATH', plugin_dir_path(__FILE__));
define('YT_FOR_WP_URL', plugin_dir_url(__FILE__));
define('YT_FOR_WP_MIN_WP_VERSION', '5.8');
define('YT_FOR_WP_MIN_PHP_VERSION', '7.4');

// Define a constant to indicate the free version is active.
if (!defined('YOUTUBE_FOR_WP_ACTIVE')) {
    define('YOUTUBE_FOR_WP_ACTIVE', true);
}

/**
 * Check PHP and WordPress versions before activation
 */
function activation_check() {
    if (version_compare(PHP_VERSION, YT_FOR_WP_MIN_PHP_VERSION, '<')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die(sprintf(
            // Translators: %s is the required PHP version (e.g., "7.4").
            esc_html__('YouTube for WordPress requires PHP version %s or higher.', 'youtube-for-wordpress'),
            esc_html(YT_FOR_WP_MIN_PHP_VERSION)
        ));
    }

    if (version_compare($GLOBALS['wp_version'], YT_FOR_WP_MIN_WP_VERSION, '<')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die(sprintf(
            // Translators: %s is the required WordPress version (e.g., "5.8").
            esc_html__('YouTube for WordPress requires WordPress version %s or higher.', 'youtube-for-wordpress'),
            esc_html(YT_FOR_WP_MIN_WP_VERSION)
        ));
    }
}

register_activation_hook(__FILE__, __NAMESPACE__ . '\\activation_check');

/**
 * Load text domain for internationalization
 */
function load_textdomain() {
    load_plugin_textdomain('youtube-for-wordpress', false, dirname(plugin_basename(__FILE__)) . '/languages');
}
add_action('init', __NAMESPACE__ . '\\load_textdomain');

// Include required files
require_once YT_FOR_WP_PATH . 'includes/admin-settings.php';
require_once YT_FOR_WP_PATH . 'blocks/simple-youtube-feed/simple-youtube-feed.php';
require_once YT_FOR_WP_PATH . 'blocks/youtube-live/youtube-live.php';

// Register settings page.
function add_admin_menu() {
    add_menu_page(
        __('YT for WP', 'youtube-for-wordpress'),
        __('YT for WP', 'youtube-for-wordpress'),
        'manage_options',
        'youtube-for-wordpress-settings',
        __NAMESPACE__ . '\\Admin\\Settings\\render_settings_page',
        'dashicons-video-alt3',
        20
    );
}
add_action('admin_menu', __NAMESPACE__ . '\\add_admin_menu');

function yt_for_wp_enqueue_assets() {
    // Shared data for both front-end and editor
    $api_key = \YouTubeForWP\Admin\Settings\get_api_key();
    $channel_id = get_option('yt_for_wp_channel_id');
    $localize_data = [
        'channelId' => $channel_id,
        'apiKey'    => $api_key,
        'restUrl'   => rest_url('youtube-for-wordpress/v1/'),
        'nonce'     => wp_create_nonce('wp_rest'),
    ];

    // Enqueue front-end assets
    if (!is_admin()) {
        wp_enqueue_style(
            'swiper-css',
            plugins_url('build/css/swiper-bundle.min.css', __FILE__),
            [],
            YOUTUBE_FOR_WP_VERSION
        );

        wp_enqueue_script(
            'youtube-for-wordpress-simple-youtube-feed-view',
            plugins_url('build/simple-youtube-feed/view.js', __FILE__),
            [],
            YOUTUBE_FOR_WP_VERSION,
            true
        );

        wp_localize_script('youtube-for-wordpress-simple-youtube-feed-view', 'YT_FOR_WP', $localize_data);
    }

    // Enqueue editor-specific assets
    if (is_admin()) {
        wp_enqueue_script(
            'youtube-for-wordpress-simple-youtube-feed-editor',
            plugins_url('build/simple-youtube-feed/index.js', __FILE__), // Adjust if needed
            ['wp-blocks', 'wp-element', 'wp-editor'],
            YOUTUBE_FOR_WP_VERSION,
            true
        );

        wp_localize_script('youtube-for-wordpress-simple-youtube-feed-editor', 'YT_FOR_WP', $localize_data);
    }
}
add_action('enqueue_block_assets', __NAMESPACE__ . '\\yt_for_wp_enqueue_assets');

