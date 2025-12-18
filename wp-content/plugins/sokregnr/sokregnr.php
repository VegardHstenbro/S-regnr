<?php
/**
 * Plugin Name: Søk Regnr (sokregnr) - Enterprise Edition
 * Description: Advanced vehicle lookup with WooCommerce Subscriptions, Maskinporten, WP-CLI, and Rate Limiting.
 * Version: 1.6.0
 * Author: WP Developer Pro
 */

if (!defined('ABSPATH')) exit;

// Autoload components (simulated)
require_once plugin_dir_path(__FILE__) . 'includes/class-sokregnr-maskinporten.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-sokregnr-svv-owner.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-sokregnr-rate-limiter.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-sokregnr-cli.php';

class SokRegnrPlugin {
    private $premium_cap = 'sokregnr_premium';
    
    public function __construct() {
        add_shortcode('sokregnr', [$this, 'render_shortcode']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }

    public function register_rest_routes() {
        register_rest_route('sokregnr/v1', '/lookup-owner', [
            'methods' => 'GET',
            'callback' => [$this, 'handle_owner_lookup'],
            'permission_callback' => 'is_user_logged_in'
        ]);
    }

    public function handle_owner_lookup(WP_REST_Request $request) {
        $user_id = get_current_user_id();
        $is_premium = current_user_can($this->premium_cap);
        $settings = get_option('sokregnr_settings');
        
        // 1. Rate Limiting
        $limiter = new SokRegnr_RateLimiter($settings);
        $limit_check = $limiter->check_limit($user_id, $is_premium);
        if (is_wp_error($limit_check)) return $limit_check;

        $query = strtoupper(sanitize_text_field($request->get_param('q')));
        
        // 2. Authentication (Maskinporten)
        $mp = new SokRegnr_Maskinporten($settings);
        $token = $mp->get_token($settings['scope'] ?? 'svv:kjoretoy/kjoretoyopplysninger');
        if (is_wp_error($token)) return $token;

        // 3. Fetch Data
        $svv = new SokRegnr_Svv_Owner($settings);
        $owner_data = $svv->fetch_owner($query, $token);
        if (is_wp_error($owner_data)) return $owner_data;

        // 4. Finalize
        $limiter->increment_usage($user_id, $is_premium);
        return rest_ensure_response($owner_data);
    }
    
    public function render_shortcode() {
        // ... (Refer to v1.3 for UI rendering)
        return "<!-- sokregnr UI loaded -->";
    }
}
new SokRegnrPlugin();
