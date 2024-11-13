<?php

namespace YouTubeForWP\Admin\Settings;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Register settings and add validation.
function register_settings() {
    register_setting( 'yt_for_wp_options_group', 'yt_for_wp_api_key', __NAMESPACE__ . '\\sanitize_api_key' );
    register_setting( 'yt_for_wp_options_group', 'yt_for_wp_channel_id', __NAMESPACE__ . '\\sanitize_channel_id' );
}
add_action( 'admin_init', __NAMESPACE__ . '\\register_settings' );

// Sanitize the API key before saving.
function sanitize_api_key( $input ) {
    return sanitize_text_field( $input );
}

// Sanitize the Channel ID before saving.
function sanitize_channel_id( $input ) {
    return sanitize_text_field( $input );
}

// Render the settings page content.
function render_settings_page() {
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'YouTube for WordPress Settings', 'yt-for-wp' ); ?></h1>
        <form method="post" action="options.php">
            <?php
            settings_fields( 'yt_for_wp_options_group' );
            do_settings_sections( 'yt-for-wp-settings' );

            // Retrieve stored API key and channel ID
            $api_key = get_option( 'yt_for_wp_api_key', '' );
            $channel_id = get_option( 'yt_for_wp_channel_id', '' );
            
            // Validate API Key and display status message
            $status_message = empty( $api_key ) ? __( 'Enter your YouTube API key here.', 'yt-for-wp' ) : validate_api_key( $api_key );
            echo '<p id="api-key-status">' . esc_html( $status_message ) . '</p>';
            ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row"><?php esc_html_e( 'YouTube API Key', 'yt-for-wp' ); ?></th>
                    <td><input type="text" name="yt_for_wp_api_key" value="<?php echo esc_attr( $api_key ); ?>" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row"><?php esc_html_e( 'YouTube Channel ID', 'yt-for-wp' ); ?></th>
                    <td><input type="text" name="yt_for_wp_channel_id" value="<?php echo esc_attr( $channel_id ); ?>" /></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// Function to validate the API key using the i18nLanguages endpoint.
function validate_api_key( $api_key ) {
    $response = wp_remote_get( "https://www.googleapis.com/youtube/v3/i18nLanguages?part=snippet&key=$api_key" );

    if ( is_wp_error( $response ) ) {
        return __( 'API Key Invalid', 'yt-for-wp' );
    }

    $data = json_decode( wp_remote_retrieve_body( $response ), true );

    if ( isset( $data['error'] ) ) {
        return __( 'API Key Invalid', 'yt-for-wp' );
    }

    return __( 'API Key Valid', 'yt-for-wp' );
}
