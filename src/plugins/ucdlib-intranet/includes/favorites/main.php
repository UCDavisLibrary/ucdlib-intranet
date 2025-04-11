<?php

require_once( __DIR__ . '/db.php' );
require_once( __DIR__ . '/model.php' );
require_once( __DIR__ . '/rest.php' );

/**
 * Controls the page favorites feature
 */
class UcdlibIntranetFavorites {
  public $plugin;
  public $dbUtils;
  public $model;
  public $rest;

  public function __construct( $plugin ){
    $this->plugin = $plugin;

    // order of instantiation matters
    $this->dbUtils = new UcdlibIntranetFavoritesDb( $this );
    $this->model = new UcdlibIntranetFavoritesModel( $this );
    $this->rest = new UcdlibIntranetFavoritesRest( $this );

    $this->init();
  }

  public function init( ){
    register_activation_hook($this->plugin->config->entryPoint, [$this->dbUtils, 'makeTable'] );
    add_filter( 'ucd-theme/templates/page', [$this, 'overridePageTemplate'], 10, 2 );
    add_filter( 'ucd-theme/context/page', [$this, 'updateContext'], 10, 2 );
  }


  // Override theme page template, so that we can add a favorites button to the page title area
  public function overridePageTemplate($templates, $context){
    if ( $context['post']->post_type == 'page' ){
      $template = '@' . $this->plugin->timber->nameSpace . '/pages/page.twig';
      array_unshift($templates, $template);
    }
    return $templates;
  }

  public function updateContext( $context ){
    $postTypes = ['page'];
    if ( !in_array($context['post']->post_type, $postTypes) ){
      return $context;
    }

    $context['favorites'] = [
      'wpNonce' => wp_create_nonce( 'wp_rest' )
    ];

    return $context;
  }
}
