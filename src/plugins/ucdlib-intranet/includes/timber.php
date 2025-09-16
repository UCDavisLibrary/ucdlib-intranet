<?php

class UcdlibIntranetTimber {

  public $plugin;
  public $nameSpace;

  public function __construct( $plugin ){
    $this->plugin = $plugin;
    $this->nameSpace = $this->plugin->config->slug;

    $this->init();
  }

  public function init(){
    add_filter( 'timber/locations', [$this, 'registerNamespace'] );
  }

  /**
   * Register twig namespace for this plugin
   */
  public function registerNamespace( $paths ){
    $paths[$this->nameSpace] = [$this->plugin->config->pluginPath() . 'views'];
    return $paths;
  }

  /**
   * Renders an admin template
   */
  public function renderAdminTemplate( $template, $context ){
    $template = '@' . $this->nameSpace . '/admin/' . $template . '.twig';
    if ( !$this->timberExists() ) {
      return;
    }
    Timber::render( $template, $context );
  }

  public function timberExists(){
    return class_exists('Timber');
  }

  /**
   * @description Get a normal array of posts from a Timber\​PostQuery object
   */
  public function extractPosts( $postQuery ){
    $posts = [];
    foreach ($postQuery as $post) {
      $posts[] = $post;
    }
    return $posts;
  }
}
