<?php

class UcdlibIntranetGroupsRest {
  public $groups;

  public function __construct( $groups ){
    $this->groups = $groups;

    // register rest routes
    add_action( 'rest_api_init', [$this, 'registerRoutes'] );
  }

  public function registerRoutes(){
    $pluginNs = $this->groups->plugin->config->slug;
    $ns = '/groups';

    register_rest_route($pluginNs, $ns, [
      'methods' => 'GET',
      'callback' => [$this, 'searchCallback'],
      'permission_callback' => function() {
        return is_user_logged_in();
      }
    ]);

    register_rest_route($pluginNs, $ns . '/page/(?P<id>\d+)', [
      'methods' => 'GET',
      'callback' => [$this, 'getPageCallback'],
      'permission_callback' => function() {
        return is_user_logged_in();
      }
    ]);
  }

  public function searchCallback($request){
    $model = UcdlibIntranetGroupsTimberModel::class;
    $results = $model::queryGroups();
    $out = [];
    foreach ($results as $post) {
      $out[] = $post->groupMeta();
    }
    return rest_ensure_response($out);
  }

  public function getPageCallback($request){
    $id = $request['id'];
    $post = Timber::get_post([
      'p' => $id,
      'post_type' => $this->groups->slugs['postType']
    ]);

    if ( !$post ){
      return new WP_Error( 'no_page', 'Page not found', ['status' => 404] );
    }

    return rest_ensure_response( $post->groupMeta());
  }
}
