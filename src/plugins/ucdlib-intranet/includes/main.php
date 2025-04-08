<?php

require_once( __DIR__ . '/assets.php' );
require_once( __DIR__ . '/blocks.php' );
require_once( __DIR__ . '/config.php' );
require_once( __DIR__ . '/google.php' );
require_once( __DIR__ . '/hummingbird.php' );
require_once( __DIR__ . '/log.php' );
require_once( __DIR__ . '/robots.php' );
require_once( __DIR__ . '/timber.php' );
require_once( __DIR__ . '/utils.php' );

class UcdlibIntranet {

  public $config;
  public $utils;
  public $assets;
  public $blocks;
  public $google;
  public $hummingbird;
  public $log;
  public $robots;
  public $timber;

  public function __construct(){

    // load these first
    $this->config = new UcdlibIntranetConfig( $this );
    $this->utils = new UcdlibIntranetUtils( $this );

    $this->assets = new UcdlibIntranetAssets( $this );
    $this->blocks = new UcdlibIntranetBlocks( $this );
    //$this->google = new UcdlibIntranetGoogle( $this );
    $this->hackathons = new UcdlibIntranetHackathons( $this );
    $this->hummingbird = new UcdlibIntranetHummingbird( $this );
    $this->log = new UcdlibIntranetLog( $this );
    $this->jobsBoard = new UcdlibIntranetJobsBoard( $this );
    $this->projects = new UcdlibIntranetProjects( $this );
    $this->robots = new UcdlibIntranetRobots( $this );
    $this->timber = new UcdlibIntranetTimber( $this );
  }
}
