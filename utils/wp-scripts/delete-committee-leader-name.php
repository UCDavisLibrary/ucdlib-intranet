<?php

// Deletes the deprecated ucdlibCommitteeLeaderName and ucdlibCommitteeLeaderEmail meta fields
// Should only be run after set-committee-leaders.php has been run and verified

global $wpdb;

$wpdb->query( "
  DELETE FROM $wpdb->postmeta
  WHERE meta_key IN (
    'ucdlibCommitteeLeaderName',
    'ucdlibCommitteeLeaderEmail'
  )
" );
echo "Deleted deprecated committee leader name and email meta fields\n";
