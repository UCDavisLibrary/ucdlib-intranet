<?php

/**
 * @description Class for interacting with custom indexer API service on top of Elasticsearch
 */
class UcdlibIntranetIndexer {
  public $plugin;

  public function __construct( $plugin ){
    $this->plugin = $plugin;
    $this->init();
  }

  public function init(){

    // Hooks to notify the indexer to reindex on change
    add_action( 'save_post', [$this, '_onSavePost'], 10, 3 );
    add_action( 'wp_trash_post', [$this, '_onDeletePost'], 10, 1 );
    add_action( 'before_delete_post', [$this, '_onDeletePost'], 10, 1 );
    add_action( 'transition_post_status', [$this, '_onUnpublishPost'], 10, 3);

    // Hooks to intercept wp query, query es, and display results
    //add_filter( 'ucd-theme/templates/search', array($this, 'setTemplate'), 10, 2 );
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

  public function setTemplate( $templates, $context ){
    if ( array_key_exists('is404', $context) && $context['is404']){
      status_header(404);
      $views = $GLOBALS['UcdSite']->views;
      $templates = array( $views->getTemplate('404') );
    } else {
      $templates = array_merge( array("@" . $this->config->slug . "/search.twig"), $templates );
    }

    return $templates;
  }
}
