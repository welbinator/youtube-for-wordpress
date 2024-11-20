<?php
namespace YouTubeForWP\Admin\Settings;

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

class API_Key_Handler {
    private const ENCRYPTED_API_KEY_OPTION = 'yt_for_wp_encrypted_api_key';
    private const ENCRYPTION_KEY_OPTION = 'yt_for_wp_encryption_key';

    /**
     * Generate a new encryption key
     */
    private function generate_encryption_key() {
        try {
            return base64_encode(random_bytes(SODIUM_CRYPTO_SECRETBOX_KEYBYTES));
        } catch (\Exception $e) {
            error_log('YouTube for WP: Failed to generate encryption key: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get or create the encryption key
     */
    private function get_encryption_key() {
        $key = get_option(self::ENCRYPTION_KEY_OPTION);
        
        if (!$key) {
            if (!current_user_can('manage_options')) {
                return false;
            }
            $key = $this->generate_encryption_key();
            if ($key === false) {
                return false;
            }
            add_option(self::ENCRYPTION_KEY_OPTION, $key, '', 'no');
        }

        return base64_decode($key);
    }

    /**
     * Encrypt the API key
     */
    public function encrypt_api_key($api_key) {
        if (empty($api_key)) {
            return false;
        }

        if (!function_exists('sodium_crypto_secretbox')) {
            error_log('YouTube for WP: Sodium encryption not available');
            return false;
        }

        try {
            $key = $this->get_encryption_key();
            if ($key === false) {
                error_log('YouTube for WP: Failed to get encryption key');
                return false;
            }

            $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
            $encrypted = sodium_crypto_secretbox($api_key, $nonce, $key);
            
            return base64_encode($nonce . $encrypted);
        } catch (\Exception $e) {
            error_log('YouTube for WP: Encryption error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Decrypt the API key
     */
    public function decrypt_api_key($encrypted_api_key) {
        if (empty($encrypted_api_key)) {
            return false;
        }

        if (!function_exists('sodium_crypto_secretbox_open')) {
            error_log('YouTube for WP: Sodium decryption not available');
            return false;
        }

        try {
            $key = $this->get_encryption_key();
            if ($key === false) {
                error_log('YouTube for WP: Failed to get decryption key');
                return false;
            }

            $decoded = base64_decode($encrypted_api_key);
            if ($decoded === false) {
                error_log('YouTube for WP: Failed to decode encrypted data');
                return false;
            }

            $nonce = substr($decoded, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
            $encrypted = substr($decoded, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);

            $decrypted = sodium_crypto_secretbox_open($encrypted, $nonce, $key);
            if ($decrypted === false) {
                error_log('YouTube for WP: Decryption failed');
                return false;
            }

            return $decrypted;
        } catch (\Exception $e) {
            error_log('YouTube for WP: Decryption error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Save the API key
     */
    public function save_api_key($api_key) {
        if (!current_user_can('manage_options')) {
            return false;
        }

        if (empty($api_key)) {
            delete_option(self::ENCRYPTED_API_KEY_OPTION);
            return true;
        }

        $encrypted = $this->encrypt_api_key($api_key);
        if ($encrypted === false) {
            return false;
        }

        return update_option(self::ENCRYPTED_API_KEY_OPTION, $encrypted, 'no');
    }

    /**
     * Get the API key
     */
    public function get_decrypted_api_key() {
        $encrypted = get_option(self::ENCRYPTED_API_KEY_OPTION);
        if (empty($encrypted)) {
            return false;
        }

        return $this->decrypt_api_key($encrypted);
    }
}

// Create a global instance
$GLOBALS['yt_for_wp_api_handler'] = new API_Key_Handler();

/**
 * Get the API key
 */
function get_api_key() {
    return $GLOBALS['yt_for_wp_api_handler']->get_decrypted_api_key();
}

/**
 * Register settings and add validation.
 */
function register_settings() {
    if (!current_user_can('manage_options')) {
        return;
    }

    // First, register the settings section
    add_settings_section(
        'yt_for_wp_main_section',
        __('Main Settings', 'youtube-for-wordpress'),
        '__return_false',
        'yt-for-wp-settings'
    );

    // Register API Key field
    add_settings_field(
        'yt_for_wp_api_key',
        __('YouTube API Key', 'youtube-for-wordpress'),
        function() {
            if (!current_user_can('manage_options')) {
                return;
            }
            $api_key = get_api_key();
            ?>
            <input 
                type="password" 
                name="yt_for_wp_api_key" 
                value="<?php echo esc_attr($api_key ?: ''); ?>" 
                class="regular-text"
            />
            <p class="description">
                <?php esc_html_e('Your YouTube API key will be stored securely using encryption.', 'youtube-for-wordpress'); ?>
            </p>
            <?php
        },
        'yt-for-wp-settings',
        'yt_for_wp_main_section'
    );

    // Register Channel ID field
    add_settings_field(
        'yt_for_wp_channel_id',
        __('YouTube Channel ID', 'youtube-for-wordpress'),
        function() {
            if (!current_user_can('manage_options')) {
                return;
            }
            $channel_id = get_option('yt_for_wp_channel_id', '');
            ?>
            <input 
                type="text" 
                name="yt_for_wp_channel_id" 
                value="<?php echo esc_attr($channel_id); ?>" 
                class="regular-text"
            />
            <?php
        },
        'yt-for-wp-settings',
        'yt_for_wp_main_section'
    );

    // Register the settings
    register_setting(
        'yt_for_wp_settings',
        'yt_for_wp_api_key',
        [
            'sanitize_callback' => function($input) {
                if (!current_user_can('manage_options')) {
                    add_settings_error(
                        'yt_for_wp_api_key',
                        'invalid_permissions',
                        __('You do not have permission to modify these settings.', 'youtube-for-wordpress'),
                        'error'
                    );
                    return get_api_key(); // Return existing value
                }

                if (empty($input)) {
                    delete_option('yt_for_wp_encrypted_api_key');
                    return '';
                }
                
                $sanitized_input = sanitize_text_field($input);
                $saved = $GLOBALS['yt_for_wp_api_handler']->save_api_key($sanitized_input);
                
                if (!$saved) {
                    add_settings_error(
                        'yt_for_wp_api_key',
                        'encryption_failed',
                        __('Failed to securely store the API key. Please try again.', 'youtube-for-wordpress'),
                        'error'
                    );
                }
                
                return $sanitized_input;
            },
            'show_in_rest' => false,
        ]
    );
    
    register_setting(
        'yt_for_wp_settings',
        'yt_for_wp_channel_id',
        [
            'sanitize_callback' => function($input) {
                if (!current_user_can('manage_options')) {
                    return get_option('yt_for_wp_channel_id'); // Return existing value
                }
                return sanitize_text_field($input);
            },
            'show_in_rest' => false,
        ]
    );
}
add_action('admin_init', __NAMESPACE__ . '\\register_settings');

function sanitize_channel_id($input) {
    return sanitize_text_field($input);
}

/**
 * Render the settings page content.
 */
function render_settings_page() {
    if (!current_user_can('manage_options')) {
        wp_die(
            esc_html__('You do not have sufficient permissions to access this page.', 'youtube-for-wordpress')
        );
    }
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('YouTube for WordPress Settings', 'youtube-for-wordpress'); ?></h1>
        
        <?php
        // Show any error messages
        settings_errors('yt_for_wp_api_key');
        
        // Get and show API key status if we have one
        $api_key = get_api_key();
        $status_message = empty($api_key) ? 
            __('Enter your YouTube API key here.', 'youtube-for-wordpress') : 
            validate_api_key($api_key);
        
        echo '<p id="api-key-status">' . esc_html($status_message) . '</p>';
        ?>

        <form method="post" action="options.php">
            <?php
            settings_fields('yt_for_wp_settings');
            do_settings_sections('yt-for-wp-settings');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

/**
 * Validate the API key by making a test request
 */
function validate_api_key($api_key) {
    if (empty($api_key)) {
        return __('API Key not set', 'youtube-for-wordpress');
    }

    $channel_id = get_option('yt_for_wp_channel_id');
    
    // Set up the request arguments with proper headers
    $args = [
        'headers' => [
            'Referer' => get_site_url(),
            'Origin' => get_site_url()
        ]
    ];
    
    // If we don't have a channel ID yet, use a simpler validation
    if (empty($channel_id)) {
        $response = wp_remote_get(add_query_arg([
            'part' => 'snippet',
            'key' => $api_key,
            'maxResults' => 1,
            'type' => 'video'
        ], 'https://www.googleapis.com/youtube/v3/search'), $args);
    } else {
        // Use the same endpoint as the blocks
        $response = wp_remote_get(add_query_arg([
            'part' => 'snippet',
            'channelId' => $channel_id,
            'maxResults' => 1,
            'type' => 'video',
            'key' => $api_key
        ], 'https://www.googleapis.com/youtube/v3/search'), $args);
    }

    if (is_wp_error($response)) {
        error_log('YouTube API validation error: ' . $response->get_error_message());
        return __('API Key validation failed', 'youtube-for-wordpress');
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    // Check for specific API errors
    if (isset($data['error'])) {
        error_log('YouTube API error: ' . wp_json_encode($data['error']));
        
        // Check for quota exceeded
        if (isset($data['error']['errors'][0]['reason']) && 
            $data['error']['errors'][0]['reason'] === 'quotaExceeded') {
            return __('API quota exceeded. Key may still be valid.', 'youtube-for-wordpress');
        }
        
        // Check for API key related errors
        if (isset($data['error']['errors'][0]['reason'])) {
            $reason = $data['error']['errors'][0]['reason'];
            if (in_array($reason, ['badRequest', 'invalid', 'authError'])) {
                return __('API Key Invalid', 'youtube-for-wordpress');
            }
            if ($reason === 'API_KEY_HTTP_REFERRER_BLOCKED') {
                return __('API Key is valid but restricted to specific domains. Please check your API key settings in Google Cloud Console.', 'youtube-for-wordpress');
            }
        }
        
        return sprintf(
            // Translators: %s is the validation error message from the API.
            __('API Error: %s', 'youtube-for-wordpress'),
            $data['error']['message'] ?? __('Unknown error', 'youtube-for-wordpress')
        );
    }

    // If we got here, the key is valid
    return __('API Key Valid', 'youtube-for-wordpress');
}