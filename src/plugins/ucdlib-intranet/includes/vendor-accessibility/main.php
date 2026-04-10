<?php

require_once( __DIR__ . '/google.php' );
require_once( __DIR__ . '/rest.php' );

class UcdlibIntranetVendorAccessibility {
  public $plugin;
  public $google;
  public $rest;

  public function __construct( $plugin ){
    $this->plugin = $plugin;
    
    $this->google = new UcdlibIntranetVendorAccessibilityGoogle( $this );
    $this->rest = new UcdlibIntranetVendorAccessibilityRest( $this );

    $this->init();
  }

  public function init( ){}
}