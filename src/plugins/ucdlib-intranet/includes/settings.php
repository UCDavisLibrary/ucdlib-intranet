<?php

class UcdlibIntranetSettings {

  public $plugin;

  public function __construct( $plugin ){
    $this->plugin = $plugin;

    add_action( 'init', [$this, 'registerPostMeta'] );
  }

  public function registerPostMeta(){
    $postTypes = ['page', 'ucdlib-group'];
    foreach ( $postTypes as $postType ){
      register_post_meta( $postType, 'hideModifiedDate' , [
        'show_in_rest' => true,
        'single' => true,
        'type' => 'boolean'
      ]);

    }
  }
}
