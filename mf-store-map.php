<?php

/**
 * Plugin Name:       Store locator map
 * Plugin URI:        https://mario-flores.com
 * Description:       Display custom post types on a map with search
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      7.0
 * Author:            Mario Flores
 * Author URI:        https://mario-flores.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       mf_store_map
 * Domain Path:       /languages
 */

add_action( 'wp_enqueue_scripts', 'mf_store_locator_enqueue' );
function mf_store_locator_enqueue( ) {
    wp_enqueue_script(
        'store-locator-main',
        plugins_url( '/js/main.js', __FILE__ ),
        array( 'jquery' ),
        '1.0.0',
        true
    );
    $store_locator = wp_create_nonce( 'store_locator' );
    wp_localize_script(
        'store-locator-main',
        'my_ajax_obj',
        array(
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce'    => $store_locator,
        )
    );
    wp_enqueue_style('stor-locator-style', plugins_url('/css/main.css', __FILE__), '', '1.0.0', false);
}

add_action('wp_ajax_nopriv_mf_get_stores', 'mf_get_stores'); 
add_action('wp_ajax_mf_get_stores', 'mf_get_stores'); 

add_action('admin_menu', 'mf_store_locator');
function mf_store_locator()
{
    add_menu_page(
        'MFStoreLocator',
        'store_locator',
        'manage_options',
        'mfstorlocator',
        'mf_store_locator_info'
    );
}


function mf_store_locator_info()
{
    echo 'Use this short code';
}

add_shortcode('mf-stor-locator', 'mf_make_map');

function mf_make_map()
{
    ob_start();
    include(plugin_dir_path(__FILE__).'views/map.php'); 
    return  ob_get_clean(); 
   
}

function mf_get_stores()
{
    check_ajax_referer( 'store_locator' );
    global $wpdb;
    $results = $wpdb->get_results("SELECT a.post_title, b.meta_value as 'latitude', c.meta_value as 'longitude', d.meta_value as 'address' FROM {$wpdb->prefix}posts as a
    Join {$wpdb->prefix}postmeta as b ON b.post_id = a.ID and b.meta_key = 'wpcf-latitude' 
    Join {$wpdb->prefix}postmeta as c ON c.post_id = a.ID and c.meta_key = 'wpcf-longitude'
    left Join {$wpdb->prefix}postmeta as d ON d.post_id = a.ID and d.meta_key = 'wpcf-indirizzo'
    where post_type = 'store'");
    wp_send_json($results); 
}
