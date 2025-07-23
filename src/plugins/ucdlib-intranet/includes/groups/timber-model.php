<?php

require_once( get_template_directory() . "/includes/classes/post.php");

// any time a timber post query returns a group post, it will be this class
class UcdlibIntranetGroupsTimberModel extends UcdThemePost {

  // override children method to only return group pages
  // otherwise we get images in our nav
  public $children;
  public function children($post_type = 'any'){
    if ( ! empty( $this->children ) ) {
      return $this->children;
    }
    $mainClass = new UcdlibIntranetGroups(null, false);
    $this->children = parent::children($mainClass->slugs['postType']);
    return $this->children;
  }

  // returns top-level parent page for this group
  // this has the primary metadata for the group
  protected $landingPage;
  public function landingPage(){
    if ( ! empty( $this->landingPage ) ) {
      return $this->landingPage;
    }
    $ancestors = $this->ancestors();
    if (count( $ancestors )) {
      $this->landingPage = end($ancestors);
    } else {
      $this->landingPage = $this;
    }
    return $this->landingPage;
  }

  protected $isLandingPage;
  public function isLandingPage(){
    if ( ! empty( $this->isLandingPage ) ) {
      return $this->isLandingPage;
    }
    $this->isLandingPage = $this->landingPage()->id == $this->id ? true : false;
    return $this->isLandingPage;
  }

  protected $groupType;
  public function groupType(){
    if ( ! empty( $this->groupType ) ) {
      return $this->groupType;
    }
    $this->groupType = $this->landingPage()->meta($this->getMetaSlug('type'));
    return $this->groupType;
  }

  protected $groupParent;
  public function groupParent(){
    if ( ! empty( $this->groupParent ) ) {
      return $this->groupParent;
    }
    $this->groupParent = $this->landingPage()->meta($this->getMetaSlug('parent'));
    return $this->groupParent;
  }

  protected $groupParentPost;
  public function groupParentPost(){
    if ( ! empty( $this->groupParentPost ) ) {
      return $this->groupParentPost;
    }
    $parentId = $this->groupParent();
    if ( empty($parentId) ) {
      return null;
    }
    $this->groupParentPost = Timber::get_post($parentId);
    return $this->groupParentPost;
  }

  protected $groupChildren;
  public function groupChildren(){
    if ( ! empty( $this->groupChildren ) ) {
      return $this->groupChildren;
    }
    $this->groupChildren = self::queryGroups([
      'groupParent' => $this->landingPage()->id
    ]);
    return $this->groupChildren;
  }

  public function hasChildrenOrParent(){
    if ( ! empty( $this->groupChildren()->found_posts ) ) {
      return true;
    }
    if ( ! empty( $this->groupParentPost() ) ) {
      return true;
    }
    return false;
  }

  protected $groupEndedYear;
  public function groupEndedYear(){
    if ( ! empty( $this->groupEndedYear ) ) {
      return $this->groupEndedYear;
    }
    $this->groupEndedYear = $this->landingPage()->meta($this->getMetaSlug('endedYear'));
    return $this->groupEndedYear;
  }

  protected $groupHideOnLandingPage;
  public function groupHideOnLandingPage(){
    if ( ! empty( $this->groupHideOnLandingPage ) ) {
      return $this->groupHideOnLandingPage;
    }
    $this->groupHideOnLandingPage = $this->landingPage()->meta($this->getMetaSlug('hideOnLandingPage'));
    return $this->groupHideOnLandingPage;
  }

  protected $groupTypeLandingPage;
  public function groupTypeLandingPage(){
    if ( ! empty( $this->groupTypeLandingPage ) ) {
      return $this->groupTypeLandingPage;
    }
    $mainClass = new UcdlibIntranetGroups(null, false);
    if ( empty($mainClass->pageIds[$this->groupType()])){
      return null;
    }
    $this->groupTypeLandingPage = Timber::get_post($mainClass->pageIds[$this->groupType()]);
    return $this->groupTypeLandingPage;
  }

  protected $groupIcon;
  public function groupIcon(){
    if ( ! empty( $this->groupIcon ) ) {
      return $this->groupIcon;
    }
    $this->groupIcon = $this->landingPage()->meta('favoriteDefaultIcon');
    return $this->groupIcon;
  }

  protected $groupSubnavPattern;
  public function groupSubnavPattern(){
    if ( ! empty( $this->groupSubnavPattern ) ) {
      return $this->groupSubnavPattern;
    }
    $this->groupSubnavPattern = $this->landingPage()->meta($this->getMetaSlug('subnavPattern'));
    return $this->groupSubnavPattern;
  }

  protected $groupSubnavPatternPost;
  public function groupSubnavPatternPost(){
    if ( ! empty( $this->groupSubnavPatternPost ) ) {
      return $this->groupSubnavPatternPost;
    }
    $patternId = $this->groupSubnavPattern();
    if ( empty($patternId) ) {
      return null;
    }
    $this->groupSubnavPatternPost = Timber::get_post($patternId);
    return $this->groupSubnavPatternPost;
  }

  protected $committeeMeta;
  public function committeeMeta(){
    if ( ! empty( $this->committeeMeta ) ) {
      return $this->committeeMeta;
    }
    if ( $this->groupType() != 'committee' ) {
      return null;
    }
    $this->committeeMeta = [
      'permanence' => $this->landingPage()->meta($this->getMetaSlug('committeePermanence')),
      'leaderName' => $this->landingPage()->meta($this->getMetaSlug('committeeLeaderName')),
      'leaderEmail' => $this->landingPage()->meta($this->getMetaSlug('committeeLeaderEmail')),
      'sponsorName' => $this->landingPage()->meta($this->getMetaSlug('committeeSponsorName')),
      'startDate' => $this->landingPage()->meta($this->getMetaSlug('committeeStartDate')),
      'reviewDate' => $this->landingPage()->meta($this->getMetaSlug('committeeReviewDate'))
    ];

    $permanenceLabels = [
      'permanent' => 'Permanent',
      'temporary' => 'Temporary',
      'ongoing' => 'Ongoing'
    ];
    if ( ! empty($this->committeeMeta['permanence']) &&
         array_key_exists($this->committeeMeta['permanence'], $permanenceLabels) ) {
      $this->committeeMeta['permanenceLabel'] = $permanenceLabels[$this->committeeMeta['permanence']];
    } else {
      $this->committeeMeta['permanenceLabel'] = $this->committeeMeta['permanence'];
    }

    return $this->committeeMeta;
  }

  public function hasCommitteeMeta(){
    $committeeMeta = $this->committeeMeta();
    if ( empty($committeeMeta) ) {
      return false;
    }
    foreach ($committeeMeta as $key => $value) {
      if ( ! empty($value) ) {
        return true;
      }
    }
    return false;
  }

  public function groupMeta(){
    return [
      'groupId' => $this->landingPage()->id,
      'groupTitle' => $this->landingPage()->title(),
      'groupType' => $this->groupType(),
      'groupParent' => $this->groupParent(),
      'groupEndedYear' => $this->groupEndedYear(),
      'groupHideOnLandingPage' => $this->groupHideOnLandingPage(),
      'groupSubnavPattern' => $this->groupSubnavPattern(),
      'groupCommitteeMeta' => $this->committeeMeta()
    ];
  }

  protected $groupIsHierarchical;
  public function groupIsHierarchical(){
    if ( ! empty( $this->groupIsHierarchical ) ) {
      return $this->groupIsHierarchical;
    }
    $landingPage = $this->landingPage();
    $this->groupIsHierarchical = count( $landingPage->children() ) ? true : false;
    return $this->groupIsHierarchical;
  }

  protected $groupPageBreadcrumbs;
  public function groupPageBreadcrumbs(){
    if ( ! empty( $this->groupPageBreadcrumbs ) ) {
      return $this->groupPageBreadcrumbs;
    }
    $crumbs = $this->breadcrumbs();
    if ( empty($this->groupTypeLandingPage()) ) {
      return $crumbs;
    }
    if ( empty($this->groupTypeLandingPage()->breadcrumbs()) ) {
      return $crumbs;
    }
    $this->groupPageBreadcrumbs = array_merge($this->groupTypeLandingPage()->breadcrumbs(), array_slice($crumbs, 1));

    return $this->groupPageBreadcrumbs;
  }

  public function getMetaSlug($slug){
    $mainClass = new UcdlibIntranetGroups(null, false);
    return $mainClass->slugs['meta'][$slug];
  }

  public static function queryGroups($query=[]){
    $mainClass = new UcdlibIntranetGroups(null, false);
    $q = [
      'post_type' => $mainClass->slugs['postType'],
      'posts_per_page' => -1,
      'post_parent' => 0,
      'orderby' => 'title',
      'order' => 'ASC',
      'meta_query' => [],
      'status' => 'publish'
    ];

    if ( !empty($query['groupType']) ){

      $groupTypeQuery = [
        'relation' => 'OR',
        [
          'key' => $mainClass->slugs['meta']['type'],
          'value' => $query['groupType'],
          'compare' => '='
        ]
      ];

      // committee is default meta value
      if ( $query['groupType'] == 'committee' ){
        $groupTypeQuery[] = [
          'key' => $mainClass->slugs['meta']['type'],
          'compare' => 'NOT EXISTS'
        ];
      }

      $q['meta_query'][] = $groupTypeQuery;
    }

    if ( !empty($query['groupParent']) ){
      $q['meta_query'][] = [
        'key' => $mainClass->slugs['meta']['parent'],
        'value' => $query['groupParent'],
        'compare' => '='
      ];
    }

    if ( !empty($query['active']) ){
      $q['meta_query'][] = [
        'relation' => 'OR',
        [
          'key' => $mainClass->slugs['meta']['endedYear'],
          'value' => 0,
          'compare' => '='
        ],
        [
          'key' => $mainClass->slugs['meta']['endedYear'],
          'compare' => 'NOT EXISTS'
        ]
        ];
    }

    if ( !empty($query['inactive']) ){
      $q['meta_query'][] = [
        'relation' => 'AND',
        [
          'key' => $mainClass->slugs['meta']['endedYear'],
          'value' => 0,
          'compare' => '!='
        ],
        [
          'key' => $mainClass->slugs['meta']['endedYear'],
          'compare' => 'EXISTS'
        ]
      ];
    }

    if ( !empty($query['notHidden']) ){
      $q['meta_query'][] = [
        'relation' => 'OR',
        [
          'key' => $mainClass->slugs['meta']['hideOnLandingPage'],
          'value' => 0,
          'compare' => '='
        ],
        [
          'key' => $mainClass->slugs['meta']['hideOnLandingPage'],
          'value' => false,
          'compare' => '='
        ],
        [
          'key' => $mainClass->slugs['meta']['hideOnLandingPage'],
          'compare' => 'NOT EXISTS'
        ]
      ];
    }
    return Timber::get_posts($q);
  }
}
