<?php

require_once( __DIR__ . '/assets.php' );
require_once( __DIR__ . '/blocks.php' );
require_once( __DIR__ . '/config.php' );
require_once( __DIR__ . '/google.php' );
require_once( __DIR__ . '/indexer.php' );
require_once( __DIR__ . '/log.php' );
require_once( __DIR__ . '/favorites/main.php' );
require_once( __DIR__ . '/groups/main.php' );
require_once( __DIR__ . '/robots.php' );
require_once( __DIR__ . '/rt.php' );
require_once( __DIR__ . '/settings.php' );
require_once( __DIR__ . '/timber.php' );
require_once( __DIR__ . '/utils.php' );

class UcdlibIntranet {

  public $config;
  public $utils;
  public $assets;
  public $blocks;
  public $google;
  public $indexer;
  public $groups;
  public $log;
  public $favorites;
  public $robots;
  public $rt;
  public $settings;
  public $timber;

  public function __construct(){

    // load these first
    $this->config = new UcdlibIntranetConfig( $this );
    $this->utils = new UcdlibIntranetUtils( $this );

    $this->assets = new UcdlibIntranetAssets( $this );
    $this->blocks = new UcdlibIntranetBlocks( $this );
    $this->google = new UcdlibIntranetGoogle( $this );
    $this->indexer = new UcdlibIntranetIndexer( $this );
    $this->groups = new UcdlibIntranetGroups( $this );
    $this->log = new UcdlibIntranetLog( $this );
    $this->favorites = new UcdlibIntranetFavorites( $this );
    $this->robots = new UcdlibIntranetRobots( $this );
    $this->rt = new UcdlibIntranetRt( $this );
    $this->settings = new UcdlibIntranetSettings( $this );
    $this->timber = new UcdlibIntranetTimber( $this );

    // hooks
    add_filter( 'ucd-theme/context/category', [$this, 'setCategoryBreadcrumbs'], 10, 1 );
  }

  /**
   * @description Insert news homepage into categegory breadcrumbs
   */
  public function setCategoryBreadcrumbs( $context ){
    $page_for_posts_id = get_option('page_for_posts');
    $page_for_posts = Timber::get_post( $page_for_posts_id );
    if ( !$page_for_posts ) {
      return $context;
    }
    $context['breadcrumbs'] = [
      ['title' => 'Home', 'link' => '/'],
      ['title' => $page_for_posts->title, 'link' => $page_for_posts->link()],
      ['title' => $context]['title']
    ];
    return $context;
  }
}
