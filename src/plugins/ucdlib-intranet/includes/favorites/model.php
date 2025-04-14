<?php

/**
 * Model class for managing db operations
 */
class UcdlibIntranetFavoritesModel {
  public $favorites;
  public $tableName;

  public function __construct( $favorites ){
    $this->favorites = $favorites;
    $this->tableName = $this->favorites->dbUtils->tableName;
  }

  public function getNextSortOrder($userId){
    global $wpdb;

    $maxSortOrder = null;
    $sql = "SELECT MAX(sort_order) as max_sort_order FROM `{$this->tableName}`";
    if ( $userId ) {
      $sql .= " WHERE user_id = %d";
      $maxSortOrder = $wpdb->get_var( $wpdb->prepare( $sql, $userId ) );
    } else {
      $sql .=  "WHERE user_id IS NULL";
      $maxSortOrder = $wpdb->get_var( $sql );
    }

    if ( !$maxSortOrder ){
      return 1;
    }
    return $maxSortOrder + 1;
  }

  public function create( $payload ){
    global $wpdb;
    $payload = $this->favorites->dbUtils->payloadToDb($payload, true);
    if ( empty($payload['post_id']) && empty($payload['external_url']) ){
      return false;
    }
    if ( empty($payload['sort_order']) ){
      $payload['sort_order'] = $this->getNextSortOrder($payload['user_id']);
    }

    $wpdb->insert(
      $this->tableName,
      $payload
    );
    return $wpdb->insert_id;
  }

  public function move( $favoriteId, $action ){
    global $wpdb;
    $favorite = $this->get($favoriteId);
    if ( !$favorite ){
      return false;
    }
    $sortOrder = $favorite['sortOrder'];
    if ( $action == 'move-up' ){
      $sortOrder = $sortOrder - 1.1;
    } else {
      $sortOrder = $sortOrder + 1.1;
    }
    if ( $sortOrder <= 0 ){
      return false;
    }
    $this->reorderUserFavorites($favorite['userId'], [$favoriteId => $sortOrder]);
    return true;
  }

  public function delete( $favoriteId ){
    global $wpdb;
    $favorite = $this->get($favoriteId);
    if ( !$favorite ){
      return false;
    }
    $sql = "DELETE FROM `{$this->tableName}` WHERE favorite_id = %d";
    $sql = $wpdb->prepare( $sql, $favoriteId );
    $result = $wpdb->query( $sql );
    if ( $result ){
      $this->reorderUserFavorites($favorite['user_id']);
    }
    return $result;

  }

  public function get( $favoriteId ){
    global $wpdb;
    $sql = "SELECT * FROM `{$this->tableName}` WHERE favorite_id = %d";
    $sql = $wpdb->prepare( $sql, $favoriteId );
    $result = $wpdb->get_row( $sql, ARRAY_A );
    if ( !$result ){
      return false;
    }
    $result = $this->favorites->dbUtils->payloadToJson($result);
    return $result;
  }

  public function getUserFavorites($userId, $kwargs=[]){
    $favorites = $this->_getUserFavorites($userId);

    if ( !empty($kwargs['postId']) ){
      $filtered = [];
      foreach ( $favorites as $favorite ){
        if ( $favorite['post_id'] == $kwargs['postId'] ){
          $filtered[] = $favorite;
        }
      }
      $favorites = $filtered;
    }

    $favorites = array_map(function($favorite){
      return $this->favorites->dbUtils->payloadToJson($favorite);
    }, $favorites);

    // add post data to favorites if it exists
    if ( empty($kwargs['disablePostQuery']) ){
      $postIds = [];
      foreach ( $favorites as $favorite ){
        if ( !empty($favorite['postId']) ){
          $postIds[] = $favorite['postId'];
        }
      }
      if ( !empty($postIds) ){
        $posts = Timber::get_posts([
          'post__in' => $postIds,
          'nopaging' => true,
          'post_type' => 'any'
        ]);
        foreach ( $favorites as &$favorite ){
          foreach ( $posts as $post ){
            if ( $favorite['postId'] == $post->ID ){
              $favorite['post'] = [
                'title' => html_entity_decode($post->title()),
                'link' => $post->link()
              ];
            }
          }
        }
      }
    }

    return $favorites;
  }

  public function _getUserFavorites( $userId ){
    global $wpdb;
    $sql = "SELECT * FROM `{$this->tableName}`";
    if ( !empty($userId) ){
      $sql .= " WHERE user_id = %d";
      $sql = $wpdb->prepare( $sql, $userId );
    } else {
      $sql .= " WHERE user_id IS NULL";
    }
    $sql .= " ORDER BY sort_order";
    $results = $wpdb->get_results( $sql, ARRAY_A );
    return $results;
  }

  /**
   * @description ensures that the sort order is sequential starting at 1
   * @param int $userId - user id
   * @param array $customSortOrder - associative array of favorite_id => sort_order.
   * will override the current sort order for that favorite item
   */
  public function reorderUserFavorites( $userId, $customSortOrder=[] ){

    global $wpdb;
    $favorites = $this->_getUserFavorites($userId);

    $updatedSortOrder = [];
    foreach ( $favorites as $favorite ){
      $f = [
        'favorite_id' => $favorite['favorite_id'],
        'sort_order' => $favorite['sort_order']
      ];
      if ( array_key_exists($favorite['favorite_id'], $customSortOrder) ){
        $f['sort_order'] = $customSortOrder[$favorite['favorite_id']];
      }


      $updatedSortOrder[] = $f;
    }
    usort($updatedSortOrder, function($a, $b) {
      if ($a['sort_order'] == $b['sort_order']) {
          return 0;
      }
      return ($a['sort_order'] < $b['sort_order']) ? -1 : 1;
    });

    $sortOrder = 1;
    foreach ( $updatedSortOrder as $favorite ){
      $wpdb->update(
        $this->tableName,
        ['sort_order' => $sortOrder],
        ['favorite_id' => $favorite['favorite_id']]
      );
      $sortOrder++;
    }
  }

}
