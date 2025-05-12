<?php

require_once( __DIR__ . '/timber-model.php' );

// does all the wordpress hooks and filters for a custom post type
class UcdlibIntranetGroupsCtl {

  public $groups;

  public function __construct( $groups ){
    $this->groups = $groups;

    // timber
    add_filter( 'timber/post/classmap', [$this, 'registerModel'] );

    // wp init hooks
    add_action( 'init', [$this, 'register'] );
    add_action( 'init', [$this, 'registerPostMeta'] );
    add_action( 'widgets_init', [$this, 'registerSidebar'] );

    // ucd-theme hooks
    add_filter( 'ucd-theme/templates/single', [$this, 'setTemplate'], 10, 2 );
    add_filter( 'ucd-theme/context/single', [$this, 'setContext'] );

    // admin hooks
    add_filter( 'manage_' . $this->groups->slugs['postType'] . '_posts_columns', [$this, 'addAdminColumns'] );
    add_action( 'manage_' . $this->groups->slugs['postType'] . '_posts_custom_column', [$this, 'addAdminColumnContent'], 10, 2 );
  }

  public function register(){
    $args = [
      'labels' => $this->getLabels(),
      'description' => 'Library groups - e.g. departments, units, committees, etc',
      'public' => true,
      'show_in_rest' => true,
      'hierarchical' => true,
      'menu_position' => 20,
      'menu_icon' => 'dashicons-groups',
      'rewrite' => [
        'with_front' => false,
        'slug' => 'group',
      ],
      'supports' => array(
        'title',
        'editor',
        'thumbnail',
        'excerpt',
        'revisions',
        'page-attributes',
        'custom-fields'
      )
    ];

    register_post_type($this->groups->slugs['postType'], $args);
  }

  // register custom post meta
  public function registerPostMeta(){
    $slug = $this->groups->slugs['postType'];
    $metaSlugs = $this->groups->slugs['meta'];

    register_post_meta( $slug, $metaSlugs['type'] , [
      'show_in_rest' => true,
      'single' => true,
      'type' => 'string',
      'default' => 'committee'
    ] );

    register_post_meta( $slug, $metaSlugs['parent'] , [
      'show_in_rest' => true,
      'single' => true,
      'type' => 'integer',
      'default' => 0
    ] );
    register_post_meta( $slug, $metaSlugs['endedYear'] , [
      'show_in_rest' => true,
      'single' => true,
      'type' => 'integer',
      'default' => 0
    ] );
    register_post_meta( $slug, $metaSlugs['hideOnLandingPage'] , [
      'show_in_rest' => true,
      'single' => true,
      'type' => 'boolean',
      'default' => false
    ] );
    register_post_meta( $slug, $metaSlugs['subnavPattern'] , [
      'show_in_rest' => true,
      'single' => true,
      'type' => 'integer'
    ] );
    register_post_meta( $slug, $metaSlugs['hideInSubnav'] , [
      'show_in_rest' => true,
      'single' => true,
      'type' => 'boolean',
      'default' => false
    ] );
  }

  // tell Timber about our post model
  public function registerModel($classmap){
    $classmap[$this->groups->slugs['postType']] = UcdlibIntranetGroupsTimberModel::class;
    return $classmap;
  }

  public function getLabels(){
    return [
      'name' => 'Library Groups',
      'singular_name' => 'Library Group',
      'add_new' => 'Add New Library Group Page',
      'add_new_item' => 'Add New Library Group Page',
      'edit_item' => 'Edit Library Group Page',
      'new_item' => 'New Library Group Page',
      'all_items' => 'All Library Groups Pages',
      'view_item' => 'View Library Group Pages',
      'search_items' => 'Search Library Group Pages',
      'not_found' => 'No library group pagesfound',
      'not_found_in_trash' => 'No library group pages found in Trash',
      'parent_item_colon' => '',
      'menu_name' => 'Library Groups'
    ];
  }

  public function registerSidebar(){
    register_sidebar( array(
      'id' => 'single-' . $this->groups->slugs['postType'],
      'name' => 'Sidebar for a library group post',
      'description' => 'Sidebar for Library Groups',
      'before_widget' => '',
      'after_widget' => ''
    ) );
  }

  public function setTemplate($templates, $context){
    if ( $context['post']->post_type == $this->groups->slugs['postType'] ){
      $template = '@' . $this->groups->plugin->timber->nameSpace . '/pages/single-' . $this->groups->slugs['postType'] . '.twig';
      array_unshift($templates, $template);
    }
    return $templates;
  }

  public function setContext($context){
    if ( $context['post']->post_type != $this->groups->slugs['postType'] ) return $context;
    $p = $context['post'];

    $context['wpNonce'] = wp_create_nonce( 'wp_rest' );
    $context['sidebar'] = trim(Timber::get_widgets( 'single-' . $this->groups->slugs['postType'] ));
    return $context;
  }

  public function addAdminColumns($columns){
    $columns['group'] = 'Group';
    return $columns;
  }

  public function addAdminColumnContent($column, $post_id){
    if ( $column == 'group' ){
      $p = Timber::get_post($post_id);
      if ( empty($p) ) {
        return;
      }
      $groupType = ucfirst($p->groupType() ?? '');
      $groupTitle = $p->landingPage()->title() ?? '';
      echo '<div class="ucdlib-group-title"><strong>' . $groupTitle . '</strong></div>';
      echo '<div class="ucdlib-group-type">' . $groupType . '</div>';

    }
  }

}
