<?php

use Google\Client;
use Google\Service\Drive;

class UcdlibIntranetVendorAccessibilityGoogle {

  public $main;

  public function __construct( $main ){
    $this->main = $main;

  }

  public function getDriveService(){
    $credentialsPath = $this->main->plugin->config->getEnv('UCDLIB_INTRANET_GC_KEY_FILENAME');
    $client = new Client();
    $client->setAuthConfig($credentialsPath);
    $client->addScope(Drive::DRIVE_READONLY);
    return new Drive($client);
  }

  public function getFileId(){
    error_log((new ReflectionClass(\Monolog\Logger::class))->getFileName());
    error_log((new ReflectionClass(\Psr\Log\LoggerInterface::class))->getFileName());

    try {
      $drive = $this->getDriveService();

      // todo: replace with env var
      $folderId = '1XDs063r_-IpP545L5kaVl5fVy1KApjCA';
      $fileName = 'vendor-accessibility.xlsx';

      $query = sprintf(
          "'%s' in parents and name = '%s' and trashed = false",
          $folderId,
          addslashes($fileName)
      );

      $results = $drive->files->listFiles([
          'q' => $query,
          'fields' => 'files(id, name, modifiedTime)',
          'pageSize' => 1,
          'supportsAllDrives' => true,
          'includeItemsFromAllDrives' => true,
          'orderBy' => 'modifiedTime desc'
      ]);

      return 'foo';

      $files = $results->getFiles();

      return $files;

    } catch (Exception $e) {
      error_log('Error fetching file ID: ' . $e->getMessage());
      return null;
    }

  }
}
