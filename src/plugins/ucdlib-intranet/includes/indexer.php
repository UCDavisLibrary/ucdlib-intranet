<?php

/**
 * @description Class for interacting with custom indexer API service on top of Elasticsearch
 */
class UcdlibIntranetIndexer {
  public $plugin;
  public $iconsUsed;

  public function __construct( $plugin ){
    $this->plugin = $plugin;
    $this->iconsUsed = [];
    $this->init();
  }

  public function init(){

    // Hooks to notify the indexer to reindex on post update
    add_action( 'save_post', [$this, '_onSavePost'], 10, 3 );
    add_action( 'wp_trash_post', [$this, '_onDeletePost'], 10, 1 );
    add_action( 'before_delete_post', [$this, '_onDeletePost'], 10, 1 );
    add_action( 'transition_post_status', [$this, '_onUnpublishPost'], 10, 3);

    // Hooks to intercept wp query, query es, and display results
    add_filter( 'posts_pre_query', [$this, 'suppressWpSearch'], 10, 2 );
    add_filter( 'ucd-theme/context/search', [$this, 'addSearchToContext'], 10, 1 );
    add_filter( 'ucd-theme/templates/search', array($this, 'setTemplate'), 10, 2 );
  }

  /**
   * @description Notify the indexer to reindex a post on save
   */
  public function _onSavePost( $postId, $post, $update ){
    if ( defined('DOING_AUTOSAVE') && DOING_AUTOSAVE ) return;
    if ( wp_is_post_revision($postId) ) return;
    if ( $post->post_status !== 'publish' ) return;

    $url = $this->plugin->config->indexerUrl() . '/reindex/' . $postId . '?postType=' . $post->post_type;
    $response = wp_remote_get($url, [
        'blocking' => false,
        'timeout'  => 2,
    ]);

    if (is_wp_error($response)) {
      error_log('Failed to notify Elasticsearch indexer: ' . $response->get_error_message());
    }
  }

  /**
   * @description Notify the indexer to remove a post from index on delete
   */
  public function _onDeletePost( $postId ){
    $post = get_post($postId);
    if ($post->post_status !== 'publish') return;

    $url = $this->plugin->config->indexerUrl() . '/reindex/' . $postId;
    $response = wp_remote_get($url, [
        'method'  => 'DELETE',
        'blocking' => false,
        'timeout'  => 2,
    ]);

    if ( is_wp_error($response) ) {
      error_log('Failed to notify Elasticsearch indexer: ' . $response->get_error_message());
    }
  }

  /**
   * @description Notify the indexer to remove post from index on unpublish
   */
  public function _onUnpublishPost($new_status, $old_status, $post){
    if ( $new_status !== 'publish' && $old_status === 'publish' ) {
      $url = $this->plugin->config->indexerUrl() . '/reindex/' . $post->ID;
      $response = wp_remote_get($url, [
          'method'  => 'DELETE',
          'blocking' => false,
          'timeout'  => 2,
      ]);

      if ( is_wp_error($response) ) {
        error_log('Failed to notify Elasticsearch indexer: ' . $response->get_error_message());
      }
    }
  }

  /**
   * @description Prevent WP from querying mysql for search results
   */
  public function suppressWpSearch( $posts, $query ){
    if (!is_admin() && $query->is_main_query() && $query->is_search()) {
      $query->is_404 = false;
      return [];
    }
    return null;
  }

  public function addSearchToContext( $context ){
    $context['title'] = 'Search the Intranet';
    $context['breadcrumbs'] = [
      ['title' => 'Home', 'link' => '/'],
      ['title' => 'Search']
    ];
    $context['typeFacets'] = [
      [
        'value' => 'form',
        'labelSingular' => 'Form',
        'labelPlural' => 'Forms',
        'icon' => 'ucd-public:fa-file-pen',
        'thumbnail' => 'search-thiebaud-icing.jpg'
      ],
      [
        'value' => 'news',
        'labelSingular' => 'Internal News',
        'labelPlural' => 'Internal News',
        'icon' => 'ucd-public:fa-newspaper',
        'thumbnail' => 'search-sage.jpg'
      ],
      [
        'value' => 'info-page',
        'labelSingular' => 'Information Page',
        'labelPlural' => 'Information Pages',
        'icon' => 'ucd-public:logo-uc-davis-library',
        'thumbnail' => 'search-default.jpg'
      ]
    ];
    $this->iconsUsed = array_map(function($facet) {
      return $facet['icon'];
    }, $context['typeFacets']);
    $query = [];
    $params = [
      's' => 'q',
      'page' => 'page',
      'type' => 'type',
      'sort' => 'sort',
      'libraryGroupIds' => 'libraryGroupIds'
    ];
    foreach ( $params as $param => $key ) {
      if ( isset($_GET[$param]) ) {
        $query[$key] = $_GET[$param];
      }
    }

    $url = $this->plugin->config->indexerUrl() . '/search?' . http_build_query($query);
    $response = wp_remote_get($url, [
        'timeout'  => 5,
    ]);
    if ( is_wp_error($response) ) {
      error_log('Failed to fetch search results: ' . $response->get_error_message());
      $context['searchError'] = true;
      return $context;
    }
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    $context['data'] = $data;

    $context['searchQuery'] = isset($query['q']) ? $query['q'] : '';
    $context['currentPage'] = $data['res']['page'];
    $context['totalPages'] = $data['res']['totalPages'];
    $context['totalResults'] = $data['res']['total'];
    $context['results'] = array_map(function($item) use ($context) {
      $item['typeFacet'] = array_filter($context['typeFacets'], function($facet) use ($item) {
        return $facet['value'] === $item['type'];
      });
      if ( count($item['typeFacet']) > 0 ) {
        $item['typeFacet'] = array_values($item['typeFacet'])[0];
      }

      $item['teaserExcerpt'] = '';
      if ( $item['excerpt'] ){
        $item['teaserExcerpt'] = $item['excerpt'];
        $item['teaserExcerpt'] = strip_tags($item['teaserExcerpt']);
        $item['teaserExcerpt'] = preg_replace('/ \[\&hellip\;\]/', '...', $item['teaserExcerpt']);
        $item['teaserExcerpt'] = preg_replace('/\s+/', ' ', $item['teaserExcerpt']);
        $item['teaserExcerpt'] = trim($item['teaserExcerpt']);
      }

      $item['teaserImage'] = $this->plugin->config->pluginUrl() . 'assets/assets/img/search-thumbnails/' . $item['typeFacet']['thumbnail'];

      if ( !empty($item['icon']) ){
        $this->iconsUsed[] = $item['icon'];
        $item['teaserIcon'] = $item['icon'];
      } else {
        $item['teaserIcon'] = $item['typeFacet']['icon'];
      }

      return $item;
    }, $data['res']['items']);

    add_filter( 'ucd-theme/loaded-icons', [$this, 'loadIcons'], 10, 1);

    $context['filterEleProps'] = [
      'filters' => $context['typeFacets']
    ];
    return $context;
  }

  /**
   * @description Override default template for search results
   */
  public function setTemplate( $templates, $context ){
    $templates = array_merge(
      ['@' . $this->plugin->timber->nameSpace . '/pages/search.twig'],
      $templates
     );
    return $templates;
  }

  public function loadIcons($icons){
    if ( isset($this->iconsUsed) ) {
      foreach ($this->iconsUsed as $icon) {
        if ( !array_key_exists($icon, $icons) ) $icons[] = $icon;
      }
    }
    return $icons;
  }
}
