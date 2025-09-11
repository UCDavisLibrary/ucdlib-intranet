<?php

// This script populates ucdlibCommitteeLeaders meta field (array of objects)
// from deprecated ucdlibCommitteeLeaderName and ucdlibCommitteeLeaderEmail fields (single string values)

$model = UcdlibIntranetGroupsTimberModel::class;
$groups = $model::queryGroups(['groupType' => 'committee']);
foreach ($groups as $group) {
  $groupMeta = $group->groupMeta();
  echo "Processing group: {$groupMeta['groupTitle']} (ID {$groupMeta['groupId']})\n";
  $leader = [];
  if (!empty($groupMeta['groupCommitteeMeta']['leaderName'])) {
    $leader['name'] = $groupMeta['groupCommitteeMeta']['leaderName'];
  }
  if (!empty($groupMeta['groupCommitteeMeta']['leaderEmail'])) {
    $leader['email'] = $groupMeta['groupCommitteeMeta']['leaderEmail'];
  }
  if (!empty($leader)) {
    update_post_meta($groupMeta['groupId'], 'ucdlibCommitteeLeaders', [$leader]);
    echo "Updated leaders meta with 1 leader:";
    print_r($leader);
    echo "\n";
  } else {
    delete_post_meta($groupMeta['groupId'], 'ucdlibCommitteeLeaders');
    echo "  No leader name or email found, deleting meta\n";
  }
}
