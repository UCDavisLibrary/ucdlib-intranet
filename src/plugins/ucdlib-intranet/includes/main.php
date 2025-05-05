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
  public $timber;

  public function __construct(){

    // load these first
    $this->config = new UcdlibIntranetConfig( $this );
    $this->utils = new UcdlibIntranetUtils( $this );

    $this->assets = new UcdlibIntranetAssets( $this );
    $this->blocks = new UcdlibIntranetBlocks( $this );
    //$this->google = new UcdlibIntranetGoogle( $this );
    $this->indexer = new UcdlibIntranetIndexer( $this );
    $this->groups = new UcdlibIntranetGroups( $this );
    $this->log = new UcdlibIntranetLog( $this );
    $this->favorites = new UcdlibIntranetFavorites( $this );
    $this->robots = new UcdlibIntranetRobots( $this );
    $this->timber = new UcdlibIntranetTimber( $this );
  }
}
