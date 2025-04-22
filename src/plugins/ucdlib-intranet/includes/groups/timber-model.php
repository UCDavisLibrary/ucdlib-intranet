<?php

require_once( get_template_directory() . "/includes/classes/post.php");

// any time a timber post query returns a group post, it will be this class
class UcdlibIntranetGroupsTimberModel extends UcdThemePost {

  // override children method to only return group pages
  // otherwise we get images in our nav
  protected $children;
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

  public function groupMeta(){
    return [
      'groupId' => $this->landingPage()->id,
      'groupTitle' => $this->landingPage()->title(),
      'groupType' => $this->groupType(),
      'groupParent' => $this->groupParent(),
      'groupEndedYear' => $this->groupEndedYear(),
      'groupHideOnLandingPage' => $this->groupHideOnLandingPage()
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
      'meta_query' => []
    ];

    if ( !empty($query['groupType']) ){
      $q['meta_query'][] = [
        'key' => $mainClass->slugs['meta']['type'],
        'value' => $query['groupType'],
        'compare' => '='
      ];
    }

    if ( !empty($query['groupParent']) ){
      $q['meta_query'][] = [
        'key' => $mainClass->slugs['meta']['parent'],
        'value' => $query['groupParent'],
        'compare' => '='
      ];
    }
    return Timber::get_posts($q);
  }
}
