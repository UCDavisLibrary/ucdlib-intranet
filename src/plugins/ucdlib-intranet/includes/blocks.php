<?php
require_once( __DIR__ . '/block-transformations.php' );
require_once( get_template_directory() . '/includes/classes/block-renderer.php' );

// Set up server-side rendering for custom blocks
class UcdlibIntranetBlocks extends UCDThemeBlockRenderer {

  public $plugin;

  public function __construct($plugin){
    parent::__construct();
    $this->plugin = $plugin;

    add_action('block_categories_all', array($this, 'addCategories'), 10,2);
    add_action( 'init', array( $this, 'register_blocks'));

  }
  public static $transformationClass = 'UcdlibIntranetBlockTransformations';

  public static $registry = [
    'ucdlib-intranet/favorites-list' => [
      'twig' => '@ucdlib-intranet/blocks/favorites-list.twig',
      'transform' => ['getFavoritesList']
    ]
  ];

  /**
   * Custom block categories
   */
  public function addCategories($block_categories, $editor_context){
    $customCategories = array(
      [
        'slug'  => $this->plugin->config->slug,
        'title' => 'UC Davis Library Intranet',
        'icon'  => null,
      ]
    );

    return array_merge($block_categories, $customCategories);
  }


}
