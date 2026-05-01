<?php

/**
 * @description Customizations for RT forminator integration
 */
class UcdlibIntranetRt {

  public $plugin;

  public function __construct( $plugin ){
    $this->plugin = $plugin;

    add_filter( 'forminator_addon_rt_ticket_data', [$this, 'addDepartment'], 10, 3 );
  }

  /**
   * Query the library personnel API for the user's department
   * Add department to ticket custom fields
   */
  public function addDepartment( $ticketData, $form, $submission ){

    $apiUrl = getenv('UCDLIB_PERSONNEL_API_URL');
    $apiUser = getenv('UCDLIB_PERSONNEL_API_USER');
    $apiKey = getenv('UCDLIB_PERSONNEL_API_KEY');
    $requesterEmail = $ticketData['Requestor'];
    if ( !$apiUrl || !$apiUser || !$apiKey || !$requesterEmail ) return $ticketData;

    try {
      $authHeader = 'Basic ' . base64_encode( $apiUser . ':' . $apiKey );
      $url = trailingslashit( $apiUrl ) . 'groups/member/' . $requesterEmail . '?id-type=email&part-of-org=true';
      $response = wp_remote_get( $url, [
        'headers' => [
          'Authorization' => $authHeader
        ]
      ] );
      if ( is_wp_error( $response ) ) return $ticketData;
      $body = wp_remote_retrieve_body( $response );
      $data = json_decode( $body, true );
      if ( !$data ) return $ticketData;
      if ( empty( $data[0]['rt_name'] ) ) return $ticketData;

      if ( !isset( $ticketData['CustomFields']) ) $ticketData['CustomFields'] = [];
      $ticketData['CustomFields']['1'] = $data[0]['rt_name'];

    } catch (\Throwable $th) {
      // fail silently
    }
    return $ticketData;
  }

  /**
   * Fetches the most recent RT tickets submitted (from this site) by a user
   */
  public function getRecentTicketsByUser( $user, $limit=5 ) {
    global $wpdb;

    $entryIds = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT m.entry_id
          FROM {$wpdb->prefix}frmt_form_entry_meta m
          WHERE m.meta_key = %s
          AND m.meta_value = %s
          ORDER BY m.date_created DESC
          LIMIT %d",
        'forminator_addon_rt_rt_requestor_id',
        $user,
        $limit
      ),
      ARRAY_A
    );

    if ( empty($entryIds) ) {
      return [];
    }
    $entryIds = array_map( function($row) { return $row['entry_id']; }, $entryIds );

    $ticketRows = $wpdb->get_results(
      $wpdb->prepare(
        "SELECT m.*
          FROM {$wpdb->prefix}frmt_form_entry_meta m
          WHERE m.meta_key = %s
          AND m.entry_id IN (" . implode(',', array_fill(0, count($entryIds), '%d')) . ")
          ORDER BY m.date_created DESC",
        'forminator_addon_rt_rt_ticket', ...$entryIds ),
      ARRAY_A
    );

    $tickets = [];
    foreach ( $ticketRows as $row ) {
      $tickets[] =  maybe_unserialize( $row['meta_value'] );
    }
    return $tickets;
  }


}
