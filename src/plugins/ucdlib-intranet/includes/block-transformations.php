<?php

// Contains methods that transform the attributes of a block (mostly fetching additional data)
// See 'transform' property in $registry array in UCDThemeBlocks class.
class UcdlibIntranetBlockTransformations {

  public static function vendorAccessibility( $attrs=[] ){

    $attrs['eleProps'] = [];

    if ( !empty($attrs['contentProviderColumn']) ){
      $attrs['eleProps']['contentProviderColumn'] = $attrs['contentProviderColumn'];
    }

    if ( !empty($attrs['interfaceNameColumn']) ){
      $attrs['eleProps']['interfaceNameColumn'] = $attrs['interfaceNameColumn'];
    }

    if ( !empty($attrs['collectionPublicNameColumn']) ){
      $attrs['eleProps']['collectionPublicNameColumn'] = $attrs['collectionPublicNameColumn'];
    }

    if ( !empty($attrs['displayFields']) ) {
      $attrs['eleProps']['displayFields'] = preg_split('/\s*\n\s*/', trim($attrs['displayFields']), -1, PREG_SPLIT_NO_EMPTY);
    }

    return $attrs;
  }

  /**
   * Fetches the most recent RT ticket entry for the current user.
   *
   * @param array $attrs Block attributes.
   * @returns array Block attributes with 'ticketId' key containing the RT ticket ID if found.
   */
  public static function mostRecentTicketId( $attrs=[] ){

    $attrs['rtBaseUrl'] = $GLOBALS['ucdlibIntranet']->rt->publicUrl;

    $current_user = wp_get_current_user();
    if ( ! ( $current_user instanceof WP_User ) ) {
      return $attrs;
    }
    if ( empty($current_user->user_login) ) {
      return $attrs;
    }
    $tickets = $GLOBALS['ucdlibIntranet']->rt->getRecentTicketsByUser( $current_user->user_login, 1 );
    if ( empty($tickets) || !is_array($tickets) ){
      return $attrs;
    }
    $attrs['ticketId'] = $tickets[0]['id'];

    return $attrs;
  }

  /**
   * Fetches the most recent RT tickets submitted by a user and adds to attributes under "tickets" key.
   */
  public static function recentTickets( $attrs=[] ){
    $attrs['rtBaseUrl'] = $GLOBALS['ucdlibIntranet']->rt->publicUrl;
    $attrs['icon'] = 'ucd-public:fa-ticket';
    $attrs['icons'] = ['ucd-public:fa-ticket', 'ucd-public:fa-circle-chevron-right'];
    $current_user = wp_get_current_user();
    if ( ! ( $current_user instanceof WP_User ) ) {
      return $attrs;
    }
    if ( empty($current_user->user_login) ) {
      return $attrs;
    }

    $limit = !empty($attrs['limit']) ? intval($attrs['limit']) : 5;
    $attrs['tickets'] = $GLOBALS['ucdlibIntranet']->rt->getRecentTicketsByUser( $current_user->user_login, $limit );
    return $attrs;
  }

  public static function getRestNonce($attrs=[]){
    if ( empty($attrs['wpNonce']) ){
      $attrs['wpNonce'] = wp_create_nonce( 'wp_rest' );
    }
    return $attrs;
  }

  /**
   * Retrieves current post object and saves in "post" attribute
   */
  public static function getCurrentPost($attrs=array()){
    $attrs['post'] = Timber::get_post();
    return $attrs;
  }

  /**
   * Constructs data attribute for focal link in group directory URL block.
   */
  public static function addGroupDirectoryUrl($attrs=[]){
    $post = Timber::get_post();
    if ( empty($post) || $post->post_type !== 'ucdlib-group' ){
      return $attrs;
    }
    if ( empty($post->groupDirectoryUrl()) ){
      return $attrs;
    }

    $icon = 'ucd-public:fa-users';
    $attrs['icon'] = $icon;
    $attrs['focalLink'] = [
      'href' => $post->groupDirectoryUrl(),
      'text' => 'Team Directory',
      'icon' => $icon,
      'brandColor' => 'secondary',
    ];

    return $attrs;
  }

  /**
   * Gets children/grandchildren of the current group page. Filters out any posts that are marked as hidden in the subnav.
   */
  public static function constructSubnav($attrs=[]){
    $attrs['post'] = Timber::get_post();
    if ( empty($attrs['post']) ){
      return $attrs;
    }
    if ( $attrs['post']->post_type !== 'ucdlib-group' ){
      return $attrs;
    }

    $landingPage = $attrs['post']->landingPage();
    $isHierarchical = false;
    $attrs['children'] = [];
    $children = $GLOBALS['ucdlibIntranet']->timber->extractPosts($landingPage->children());
    $children = self::filterOutHiddenSubnavPosts($children);
    foreach ($children as $child) {
      if ( !$isHierarchical ){
        $isHierarchical = true;
      }
      $grandchildren = $GLOBALS['ucdlibIntranet']->timber->extractPosts($child->children());
      $grandchildren = self::filterOutHiddenSubnavPosts($grandchildren);
      $child->children = $grandchildren;

      $attrs['children'][] = $child;
    }

    $attrs['isHierarchical'] = $isHierarchical;

    return $attrs;
  }

  public static function filterOutHiddenSubnavPosts($posts){
    $posts = array_filter($posts, function($post){
      if ( !empty($post->meta('ucdlibHideInSubnav')) ){
        return false;
      }
      return true;
    });
    return $posts;
  }

  public static function queryGroups($attrs=[]){
    $model = UcdlibIntranetGroupsTimberModel::class;
    $q = [];
    if ( !empty($attrs['groupType']) ){
      $q['groupType'] = $attrs['groupType'];
    }
    if ( isset($attrs['activeStatus']) ){
      if ( $attrs['activeStatus'] === 'active' ){
        $q['active'] = true;
      } else if ( $attrs['activeStatus'] === 'inactive' ){
        $q['inactive'] = true;
      }
    }

    if ( empty($attrs['showHidden']) ){
      $q['notHidden'] = true;
    }

    $attrs['groupQuery'] = $q;
    $posts = $GLOBALS['ucdlibIntranet']->timber->extractPosts($model::queryGroups($q));
    $attrs['posts'] = $posts;
    $attrs['columns'] = $GLOBALS['ucdlibIntranet']->utils->newspaperChunk($posts, 3);
    $attrs['icon'] = 'ucd-public:fa-circle-chevron-right';
    return $attrs;
  }

  public static function getFavoritesList($attrs=[]){
    $model = $GLOBALS['ucdlibIntranet']->favorites->model;
    $favorites = $model->getUserFavorites(  get_current_user_id() );
    if ( empty($favorites) ){
      $favorites = $model->getUserFavorites( null );
    }
    $attrs['icons'] = [];
    $favorites = array_map(function($favorite) use (&$attrs){
      $out = [];

      if ( !empty($favorite['post']['link']) ){
        $out['href'] = $favorite['post']['link'];
      } else {
        $out['href'] = $favorite['externalUrl'];
      }

      if ( !empty($favorite['label']) ){
        $out['text'] = $favorite['label'];
      } else if ( !empty($favorite['post']['title']) ){
        $out['text'] = $favorite['post']['title'];
      } else if ( !empty($favorite['post']['link']) ){
        $out['text'] = $favorite['post']['link'];
      } else {
        $out['text'] = $favorite['externalUrl'];
      }

      if ( !empty($favorite['icon']) ){
        $out['icon'] = $favorite['icon'];
      } else if ( !empty($favorite['post']['favoriteDefaultIcon']) ){
        $out['icon'] = $favorite['post']['favoriteDefaultIcon'];
      } else {
        $out['icon'] = 'ucd-public:fa-star';
      }

      $attrs['icons'][] = $out['icon'];

      if ( !empty($favorite['brandColor']) ){
        $out['brandColor'] = $favorite['brandColor'];
      } else if ( !empty($favorite['post']['favoriteDefaultIconColor']) ){
        $out['brandColor'] = $favorite['post']['favoriteDefaultIconColor'];
      } else if ( !empty($favorite['post']['pageBrandColor']) ){
        $out['brandColor'] = $favorite['post']['pageBrandColor'];
      } else {
        $out['brandColor'] = 'secondary';
      }

      return $out;

    }, $favorites);

    $attrs['rows'] = array_chunk($favorites, 2);

    return $attrs;
  }
}
