<?php

class UcdlibIntranetGroupsRest {
  public $groups;

  public function __construct( $groups ){
    $this->groups = $groups;

    // register rest routes
    add_action( 'rest_api_init', [$this, 'registerRoutes'] );

    // register custom rest fields
    add_action( 'rest_api_init', [$this, 'registerRestFields'] );
  }

  public function registerRestFields(){
    $postType = $this->groups->slugs['postType'];

    register_rest_field( $postType, 'libraryGroup', [
      'get_callback' => [$this, 'getLibraryGroup'],
      'schema' => [
        'description' => 'Library group this page belongs to',
        'type' => 'object',
        'context' => ['view', 'edit']
      ]
    ]);
  }

  public function getLibraryGroup( $post_arr ){
    $post = Timber::get_post($post_arr['id']);
    $landingPage = $post->landingPage();
    return [
      'id' => $landingPage->id,
      'name' => $landingPage->title(),
      'icon' => $post->groupIcon(),
      'type' => $post->groupType(),
      'isLandingPage' => $post->isLandingPage()
    ];
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

    register_rest_route($pluginNs, $ns . '/patterns', [
      'methods' => 'GET',
      'callback' => [$this, 'getAllPatterns'],
      'permission_callback' => function() {
        return is_user_logged_in();
      }
    ]);
  }

  public function getAllPatterns(){
    global $wpdb;
    $blocks = [];
    $blockQuery = $wpdb->get_results(
      "SELECT id, post_title FROM {$wpdb->prefix}posts WHERE post_type = 'wp_block' AND post_status = 'publish' ORDER BY post_title ASC"
    );
    return rest_ensure_response($blockQuery);
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
