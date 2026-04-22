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
      'args' => [
        'refresh' => [
          'required' => false,
          'validate_callback' => function($param, $request, $key){
            if ( $param === 'true' ){
              return true;
            }
            return is_bool($param);
          }
        ]
      ],
      'permission_callback' => function() {
        return is_user_logged_in();
      }
    ]);
  }

  public function getDataCallback( $request ){
    if ( $request->get_param('refresh') && current_user_can('manage_options') ) {
      $this->main->google->run();
    }
    $results = $this->main->google->getJson();

    if ( !$results ) {
      return rest_ensure_response( [
        'success' => false,
        'message' => 'No data available'
      ] );
    }

    return rest_ensure_response( [
      'success' => true,
      'data' => $results
    ] );
  }
}
