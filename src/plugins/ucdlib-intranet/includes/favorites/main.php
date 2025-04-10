<?php

require_once( __DIR__ . '/db.php' );

/**
 * Controls the page favorites feature
 */
class UcdlibIntranetFavorites {
  public $plugin;
  public $dbUtils;

  public function __construct( $plugin, $init=true ){
    $this->plugin = $plugin;
    $this->dbUtils = new UcdlibIntranetFavoritesDb( $plugin );
    if ( $init ){
      $this->init();
    }
  }

  public function init( ){
    register_activation_hook($this->plugin->config->entryPoint, [$this->dbUtils, 'makeTable'] );
    add_filter( 'ucd-theme/templates/page', [$this, 'overridePageTemplate'], 10, 2 );
  }


  // Override theme page template, so that we can add a favorites button to the page title area
  public function overridePageTemplate($templates, $context){
    if ( $context['post']->post_type == 'page' ){
      $template = '@' . $this->plugin->timber->nameSpace . '/pages/page.twig';
      array_unshift($templates, $template);
    }
    return $templates;
  }
}
