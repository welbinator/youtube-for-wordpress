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
