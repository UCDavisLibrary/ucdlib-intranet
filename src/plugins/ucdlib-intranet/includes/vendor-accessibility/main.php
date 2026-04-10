<?php

require_once( __DIR__ . '/google.php' );
require_once( __DIR__ . '/rest.php' );

class UcdlibIntranetVendorAccessibility {
  public $plugin;
  public $google;
  public $rest;
  public $cronSlug;

  public function __construct( $plugin ){
    $this->plugin = $plugin;
    
    $this->google = new UcdlibIntranetVendorAccessibilityGoogle( $this );
    $this->rest = new UcdlibIntranetVendorAccessibilityRest( $this );

    $this->cronSlug = $this->plugin->config->slug . '_va_cron';

    $this->init();
  }

  public function init( ){
    add_action( $this->cronSlug, [$this, 'doCron'] );
    add_action( 'init', [$this, 'scheduleCron'] );
  }

  public function scheduleCron( ){
    if ( !wp_next_scheduled( $this->cronSlug ) ) {
      wp_schedule_event( time(), 'hourly', $this->cronSlug );
    }
  }

  public function doCron( ){
    $this->google->run();
  }
}