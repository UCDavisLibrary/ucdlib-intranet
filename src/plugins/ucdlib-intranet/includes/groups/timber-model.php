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
    $mainClass = new UcdlibIntranetGroups(null, false);
    $this->groupType = $this->landingPage()->meta($this->getMetaSlug('type'));
    return $this->groupType;
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
}
