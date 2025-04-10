<?php

/**
 * Utility class for managing db operations
 */
class UcdlibIntranetFavoritesDb {
  public $plugin;
  public $tablePrefix;
  public $tableName;

  public function __construct( $plugin ){
    global $wpdb;


    $this->plugin = $plugin;

    $this->tablePrefix = 'ucdlib-';
    $this->tableName = $wpdb->prefix . $this->tablePrefix . 'favorites';
  }

  public function makeTable(){
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    $sql = "CREATE TABLE IF NOT EXISTS `{$this->tableName}` (
      `id` mediumint(9) NOT NULL AUTO_INCREMENT,
      `user_id` mediumint(9),
      `post_id` mediumint(9),
      `external_url` varchar(500),
      `icon` varchar(100),
      `label` varchar(100),
      `brand_color` varchar(100),
      `sort_order` int(11),
      `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
      PRIMARY KEY  (`id`)
    ) $charset_collate;";
    dbDelta( $sql );
  }

}
