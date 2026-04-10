<?php

class UcdlibIntranetVendorAccessibilityRest {

  public $main;

  public function __construct( $main ){
    $this->main = $main;

    // register rest routes
    add_action( 'rest_api_init', [$this, 'registerRoutes'] );
  }

  public function registerRoutes(){
    $pluginNs = $this->main->plugin->config->slug;
    $ns = '/vendor-accessibility';

    register_rest_route($pluginNs, $ns . '/data', [
      'methods' => 'GET',
      'callback' => [$this, 'getDataCallback'],
      'permission_callback' => function() {
        return true;
        // todo: add permissions check when ready to add nonce
        // return is_user_logged_in();
      }
    ]);
  }

  public function getDataCallback( $request ){
    $results = $this->main->google->downloadFile();

    return rest_ensure_response( ['files' => $results] );
  }
}
