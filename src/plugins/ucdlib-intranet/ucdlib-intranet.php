<?php
/**
 * Plugin Name: UC Davis Library Intranet
 * Plugin URI: https://github.com/UCDavisLibrary/ucdlib-intranet
 * Description: Customizations for the UC Davis Library Intranet
 * Author: UC Davis Library Online Strategy
 */

require_once(ABSPATH . 'wp-admin/includes/file.php');
$composer_autoload = get_home_path() . 'vendor/autoload.php';
if ( file_exists( $composer_autoload ) ) {
  require_once $composer_autoload;
}

require_once( __DIR__ . '/includes/main.php' );
$GLOBALS['ucdlibIntranet'] = new UcdlibIntranet();
