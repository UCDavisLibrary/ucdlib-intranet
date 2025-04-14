<?php

/**
 * Class for setting up the REST API for favorites
 */
class UcdlibIntranetFavoritesRest {
  public $favorites;

  public function __construct( $favorites ){
    $this->favorites = $favorites;

    add_action( 'rest_api_init', [$this, 'registerRoutes'] );
  }

  public function registerRoutes(){
    $pluginNs = $this->favorites->plugin->config->slug;
    $ns = '/favorites';

    register_rest_route( $pluginNs, $ns, [
      'methods' => 'GET',
      'callback' => [$this, 'get'],
      'args' => [
        'post_id' => [
          'required' => false,
          'validate_callback' => function($param, $request, $key){
            return is_numeric($param);
          }
        ],
        'default_favorites' => [
          'required' => false,
          'validate_callback' => function($param, $request, $key){
            return is_bool($param);
          }
        ]
        ],
      'permission_callback' => function() {
        return is_user_logged_in();
      }
    ]);

    register_rest_route( $pluginNs, $ns, [
      'methods' => 'POST',
      'callback' => [$this, 'create'],
      'permission_callback' => function() {
        return is_user_logged_in();
      }
    ]);

    register_rest_route( $pluginNs, $ns, [
      'methods' => 'PUT',
      'callback' => [$this, 'update'],
      'args' => [
        'action' => [
          'required' => false,
          'validate_callback' => function($param, $request, $key){
            return in_array($param, ['move-up', 'move-down']);
          }
        ],
      ],
      'permission_callback' => function() {
        return is_user_logged_in();
      }
    ]);

    register_rest_route( $pluginNs, $ns, [
      'methods' => 'DELETE',
      'callback' => [$this, 'delete'],
      'permission_callback' => function() {
        return is_user_logged_in();
      }
    ]);
  }

  public function get( $request ){
    $userId = $request->get_param('default_favorites') ? null : get_current_user_id();
    $favorites = $this->favorites->model->getUserFavorites($userId, [
      'postId' => $request->get_param('post_id')
    ]);
    return [
      'favorites' => $favorites,
      'userId' => $userId,
      'postId' => $request->get_param('post_id')
    ];
  }

  public function create( $request ){
    $data = $request->get_json_params();
    if ( !$data ) {
      return new WP_Error( 'no-data', 'No data provided', ['status' => 400] );
    }
    if ( !empty($data['default_favorites']) ){
      if ( !current_user_can('administrator') ){
        return new WP_Error( 'not-admin', 'Only admins can create default favorites', ['status' => 403] );
      }
      $data['userId'] = null;
    } else {
      $data['userId'] = get_current_user_id();
    }

    $r = $this->favorites->model->create($data);
    if ( !$r ){
      return new WP_Error( 'create-favorite', 'Failed to create favorite', ['status' => 400] );
    }
    return [
      'favoriteId' => $r
    ];
  }

  public function update( $request ){
    $data = $request->get_json_params();
    if ( !$data ) {
      return new WP_Error( 'no-data', 'No data provided', ['status' => 400] );
    }
    if ( empty($data['favoriteId']) ){
      return new WP_Error( 'no-favorite-id', 'No favorite ID provided', ['status' => 400] );
    }
    $favorite = $this->favorites->model->get($data['favoriteId']);
    if ( !$favorite ){
      return new WP_Error( 'no-favorite', 'Favorite not found', ['status' => 404] );
    }
    if ( $favorite['userId'] != get_current_user_id() && !current_user_can('administrator') ){
      return new WP_Error( 'not-admin', 'Only admins can update default favorites', ['status' => 403] );
    }
    $action = $request->get_param('action');
    if ( $action ){
      $r = $this->favorites->model->move($data['favoriteId'], $action);
      if ( !$r ){
        return new WP_Error( 'move-favorite', 'Failed to move favorite', ['status' => 400] );
      }
      return [
        'favoriteId' => $data['favoriteId'],
        'action' => $action
      ];
    }

    // todo: modify
  }

  public function delete ( $request ){
    $data = $request->get_json_params();
    if ( !$data ) {
      return new WP_Error( 'no-data', 'No data provided', ['status' => 400] );
    }
    if ( !empty($data['favoriteId']) ){
      $favorite = $this->favorites->model->get($data['favoriteId']);
      if ( !$favorite ){
        return new WP_Error( 'no-favorite', 'Favorite not found', ['status' => 404] );
      }
      if ( $favorite['userId'] != get_current_user_id() && !current_user_can('administrator') ){
        return new WP_Error( 'not-admin', 'Only admins can delete default favorites', ['status' => 403] );
      }
      $r = $this->favorites->model->delete($data['favoriteId']);
      if ( !$r ){
        return new WP_Error( 'delete-favorite', 'Failed to delete favorite', ['status' => 400] );
      }
      return [
        'favoriteId' => $data['favoriteId']
      ];
    } else {
      // maybe allow deleting by postId or userId?
      return new WP_Error( 'no-favorite-id', 'No favorite ID provided', ['status' => 400] );
    }
  }

}
