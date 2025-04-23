<?php

// Contains methods that transform the attributes of a block (mostly fetching additional data)
// See 'transform' property in $registry array in UCDThemeBlocks class.
class UcdlibIntranetBlockTransformations {

  /**
   * Retrieves current post object and saves in "post" attribute
   */
  public static function getCurrentPost($attrs=array()){
    $attrs['post'] = Timber::get_post();
    return $attrs;
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
