<?php

require_once( __DIR__ . '/ctl.php' );
require_once(__DIR__ . '/rest.php');

class UcdlibIntranetGroups {

  public $plugin;
  public $slugs = [
    'postType' => 'ucdlib-group',
    'meta' => [
      'type' => 'ucdlibGroupType',
      'parent' => 'ucdlibGroupParent',
      'directoryUrl' => 'ucdlibGroupDirectoryUrl',
      'endedYear' => 'ucdlibGroupEndedYear',
      'hideOnLandingPage' => 'ucdlibHideOnLandingPage',
      'subnavPattern' => 'ucdlibSubnavPattern',
      'hideInSubnav' => 'ucdlibHideInSubnav',
      'committeePermanence' => 'ucdlibCommitteePermanence',
      'committeeLeaders' => 'ucdlibCommitteeLeaders',
      'committeeLeaderName' => 'ucdlibCommitteeLeaderName',
      'committeeLeaderEmail' => 'ucdlibCommitteeLeaderEmail',
      'committeeSponsorName' => 'ucdlibCommitteeSponsorName',
      'committeeStartDate' => 'ucdlibCommitteeStartDate',
      'committeeReviewDate' => 'ucdlibCommitteeReviewDate',
      'committeeReviewedAnnually' => 'ucdlibCommitteeReviewedAnnually'
    ]
  ];

  // Landing page ids for the group types
  // probably shouldnt be hardcoded, forgiveness please
  public $pageIds = [
    'committee' => 25,
    'department' => 23
  ];

  public $ctl;
  public $rest;

  public function __construct( $plugin, $init = true ){
    $this->plugin = $plugin;

    if ( $init ){
      $this->init();
    }
  }

  public function init(){
    $this->ctl = new UcdlibIntranetGroupsCtl( $this );
    $this->rest = new UcdlibIntranetGroupsRest( $this );
  }
}
