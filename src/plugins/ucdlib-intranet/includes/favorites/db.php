<?php

/**
 * Utility class for managing db operations
 */
class UcdlibIntranetFavoritesDb {
  public $favorites;
  public $columns;
  public $tablePrefix;
  public $tableName;

  public function __construct( $favorites ){
    global $wpdb;

    $this->favorites = $favorites;

    $this->tablePrefix = 'ucdlib-';
    $this->tableName = $wpdb->prefix . $this->tablePrefix . 'favorites';
    $this->columns = [
      [
        'dbName' => 'favorite_id',
        'definition' => 'mediumint(9) NOT NULL AUTO_INCREMENT',
        'jsonName' => 'favoriteId',
        'notEditable' => true
      ],
      [
        'dbName' => 'user_id',
        'definition' => 'mediumint(9)',
        'jsonName' => 'userId'
      ],
      [
        'dbName' => 'post_id',
        'definition' => 'mediumint(9)',
        'jsonName' => 'postId'
      ],
      [
        'dbName' => 'external_url',
        'definition' => 'varchar(500)',
        'jsonName' => 'externalUrl'
      ],
      [
        'dbName' => 'icon',
        'definition' => 'varchar(100)',
        'jsonName' => 'icon'
      ],
      [
        'dbName' => 'label',
        'definition' => 'varchar(100)',
        'jsonName' => 'label'
      ],
      [
        'dbName' => 'brand_color',
        'definition' => 'varchar(100)',
        'jsonName' => 'brandColor'
      ],
      [
        'dbName' => 'sort_order',
        'definition' => 'int(11)',
        'jsonName' => 'sortOrder'
      ],
      [
        'dbName' => 'created_at',
        'definition' => 'datetime DEFAULT CURRENT_TIMESTAMP NOT NULL',
        'jsonName' => 'createdAt',
        'notEditable' => true
      ]
    ];
  }

  /**
   * @description Creates the table for storing favorite user pages.
   * Runs on plugin activation.
   */
  public function makeTable(){
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    $sql = "CREATE TABLE IF NOT EXISTS `{$this->tableName}` (";
    foreach ( $this->columns as $column ){
      $sql .= "`{$column['dbName']}` {$column['definition']},";
    }
    $sql = rtrim( $sql, ',' );
    $sql .= ", PRIMARY KEY (`favorite_id`) ) $charset_collate;";
    dbDelta( $sql );
  }

  /**
   * @description Converts the payload from json keys (camelcase) to db keys(snakecase)
   */
  public function payloadToDb( $payload, $dropNonEditable ){
    $data = [];
    foreach ( $this->columns as $column ){
      if ( array_key_exists($column['jsonName'], $payload) ){
        if ( $dropNonEditable && !empty($column['notEditable']) ){
          continue;
        }
        $data[$column['dbName']] = $payload[$column['jsonName']];
      }
    }
    return $data;
  }

  public function payloadToJson( $payload ){
    $data = [];
    foreach ( $this->columns as $column ){
      if ( array_key_exists($column['dbName'], $payload) ){
        $data[$column['jsonName']] = $payload[$column['dbName']];
      }
    }
    return $data;
  }

}
