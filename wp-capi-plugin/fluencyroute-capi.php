<?php
/**
 * Plugin Name: Fluency Route — Meta CAPI Server-Side
 * Description: Sends PageView and ViewContent events to Meta Conversions API server-side for deduplication with browser pixel.
 * Version: 1.0
 * Author: Fluency Route
 */

if (!defined('ABSPATH')) exit;

// ── Config ──
define('FR_PIXEL_ID', '690970750622464');
define('FR_CAPI_TOKEN', 'EAAE7kNZCsFUoBRAZBVZCBwCQoSVtUhHgo9wLZCC34RpCGFA50AFpqlG4ZCmOknMH1mFasHdpjGjRXZBwCafUZBS9GLo53doHmaLqIUtUzeNUwl9VTBaCIplWmlZCxj0W8GZBemBcM5olck6tz0ScMESlRFlUm18UMLpKo9GWvjKje4R1r87zBeW1ZBM0I7RJ3c3rGxLQZDZD');

// ── Fire on every page load ──
add_action('wp_footer', 'fr_capi_fire_events');

function fr_capi_fire_events() {
    // Generate event ID for dedup (browser pixel will use the same ID)
    $event_id = uniqid('fr_', true);
    $page_url = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    $page_title = wp_title('', false);

    // Get user data from cookies/IP for matching
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
    $ip = explode(',', $ip)[0];
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $fbc = $_COOKIE['_fbc'] ?? '';
    $fbp = $_COOKIE['_fbp'] ?? '';

    // ── Inject event_id into browser pixel for dedup ──
    ?>
    <script>
    if (typeof fbq !== 'undefined') {
        // Override PageView with event_id for dedup
        fbq('track', 'PageView', {}, {eventID: '<?php echo $event_id; ?>'});
        fbq('track', 'ViewContent', {
            content_name: document.title,
            content_category: 'website'
        }, {eventID: '<?php echo $event_id; ?>_vc'});
    }
    </script>
    <?php

    // ── Send server-side (non-blocking) ──
    $events = [
        [
            'event_name' => 'PageView',
            'event_time' => time(),
            'event_id' => $event_id,
            'action_source' => 'website',
            'event_source_url' => $page_url,
            'user_data' => array_filter([
                'client_ip_address' => $ip,
                'client_user_agent' => $ua,
                'fbc' => $fbc ?: null,
                'fbp' => $fbp ?: null,
                'country' => [hash('sha256', 'us')],
            ]),
        ],
        [
            'event_name' => 'ViewContent',
            'event_time' => time(),
            'event_id' => $event_id . '_vc',
            'action_source' => 'website',
            'event_source_url' => $page_url,
            'user_data' => array_filter([
                'client_ip_address' => $ip,
                'client_user_agent' => $ua,
                'fbc' => $fbc ?: null,
                'fbp' => $fbp ?: null,
                'country' => [hash('sha256', 'us')],
            ]),
            'custom_data' => [
                'content_name' => $page_title ?: 'Fluency Route',
                'content_category' => 'website',
            ],
        ],
    ];

    $payload = json_encode(['data' => $events]);
    $url = 'https://graph.facebook.com/v21.0/' . FR_PIXEL_ID . '/events?access_token=' . FR_CAPI_TOKEN;

    // Non-blocking HTTP request
    $args = [
        'body' => $payload,
        'headers' => ['Content-Type' => 'application/json'],
        'timeout' => 5,
        'blocking' => false, // Don't wait for response — page loads fast
    ];
    wp_remote_post($url, $args);
}
