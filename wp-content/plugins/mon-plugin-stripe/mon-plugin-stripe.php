<?php
/**
 * Plugin Name: Mon Plugin Stripe
 * Description: Endpoint REST pour créer des Stripe Checkout Sessions (utilise stripe-php dans stripe-php/).
 * Version: 0.1
 * Author: Équipe
 */

if (!defined('ABSPATH')) {
    exit;
}

/* Charger stripe-php (supporte soit vendor/autoload.php soit init.php) */
if (file_exists(__DIR__ . '/stripe-php/vendor/autoload.php')) {
    require_once __DIR__ . '/stripe-php/vendor/autoload.php';
} elseif (file_exists(__DIR__ . '/stripe-php/init.php')) {
    require_once __DIR__ . '/stripe-php/init.php';
} else {
    add_action('admin_notices', function () {
        echo '<div class="error"><p>stripe-php non trouvé dans mon-plugin-stripe/stripe-php/ — installez la librairie.</p></div>';
    });
    return;
}


if (!defined('MON_PLUGIN_STRIPE_SECRET')) {
    define('MON_PLUGIN_STRIPE_SECRET', 'sk_test_51SaCaURpucHWGHGFS6rSrWSgKM632Q0c7f6PAZn4rxCJ9eozNOyTvwEeH9MXioW1OLE2sDrGAfXyVb71pfwQcRxD00Y4B9Z2X7');
}

add_action('rest_api_init', function () {
    register_rest_route('stripe/v1', '/create-session', array(
        'methods'  => 'POST',
        'callback' => 'mps_create_stripe_checkout_session',
        'permission_callback' => '__return_true', 
    ));
});

function mps_create_stripe_checkout_session(WP_REST_Request $request)
{
    // Vérifier que la librairie Stripe est chargée
    if (!class_exists('\Stripe\Stripe')) {
        return new WP_REST_Response(['error' => 'Stripe PHP library not loaded'], 500);
    }

    $body = json_decode($request->get_body(), true);
    if (empty($body) || empty($body['items'])) {
        return new WP_REST_Response(['error' => 'No items provided'], 400);
    }

    \Stripe\Stripe::setApiKey(MON_PLUGIN_STRIPE_SECRET);

    $line_items = [];
    foreach ($body['items'] as $it) {
        // validation minimale
        $unit_amount = isset($it['unit_amount']) ? intval($it['unit_amount']) : 0;
        $qty = isset($it['quantity']) ? max(1, intval($it['quantity'])) : 1;
        $name = isset($it['name']) ? sanitize_text_field($it['name']) : 'Item';

        $line_items[] = [
            'price_data' => [
                'currency' => 'eur',
                'product_data' => ['name' => $name],
                'unit_amount' => $unit_amount,
            ],
            'quantity' => $qty,
        ];
    }

    try {
        $session = \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'line_items' => $line_items,
            'mode' => 'payment',
            'success_url' => isset($body['success_url']) ? esc_url_raw($body['success_url']) : home_url('/checkout/success'),
            'cancel_url' => isset($body['cancel_url']) ? esc_url_raw($body['cancel_url']) : home_url('/cart'),
        ]);

        return rest_ensure_response(['sessionId' => $session->id]);
    } catch (Exception $e) {
        return new WP_REST_Response(['error' => $e->getMessage()], 500);
    }
}