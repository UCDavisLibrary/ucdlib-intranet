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

  public function getFilePathInfo(){

    $folderId = $this->main->plugin->config->getEnv('UCDLIB_INTRANET_VA_FOLDER_ID');
    $fileName = $this->main->plugin->config->getEnv('UCDLIB_INTRANET_VA_SPREADSHEET_NAME');

    if ( empty($folderId) || empty($fileName) ) {
      return null;
    }

    $uploadDir = wp_upload_dir();
    $dir = trailingslashit($uploadDir['basedir']) . 'vendor-data';
    $filename = $folderId . '_' . $fileName;
    $fullPath = trailingslashit($dir) . $filename;

    return [
      'dir' => $dir,
      'filename' => $filename,
      'fullPath' => $fullPath
    ];

  }

  public function downloadFile(){
    $fileId = $this->getFileId();
    if ( empty($fileId) ) return null;

    $folderId = $this->main->plugin->config->getEnv('UCDLIB_INTRANET_VA_FOLDER_ID');
    $fileName = $this->main->plugin->config->getEnv('UCDLIB_INTRANET_VA_SPREADSHEET_NAME');

    try {
      $drive = $this->getDriveService();

      $response = $drive->files->get($fileId, [
        'alt' => 'media',
        'supportsAllDrives' => true
      ]);

      $content = $response->getBody()->getContents();
      $filePathInfo = $this->getFilePathInfo();

      if (!file_exists($filePathInfo['dir'])) {
        wp_mkdir_p($filePathInfo['dir']);
      }

      file_put_contents($filePathInfo['fullPath'], $content);

      return $filePathInfo['fullPath'];

    } catch (Exception $e) {
      error_log('Error downloading file: ' . $e->getMessage());
      return null;
    }

  }

  /**
   * @description Get file ID of the vendor accessibility spreadsheet in Drive based on folder ID and file name from environment variables. 
   * Returns null if not found or error occurs.
   */
  public function getFileId(){

    try {
      $drive = $this->getDriveService();

      $folderId = $this->main->plugin->config->getEnv('UCDLIB_INTRANET_VA_FOLDER_ID');
      $fileName = $this->main->plugin->config->getEnv('UCDLIB_INTRANET_VA_SPREADSHEET_NAME');
      if ( empty($folderId) || empty($fileName) ) {
        throw new Exception('Vendor accessibility folder ID or spreadsheet name not set in environment variables');
      }

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

      $files = $results->getFiles();

      if (empty($files)) {
        throw new Exception('Vendor accessibility spreadsheet not found in Drive folder');
      }

      return $files[0]->getId();

    } catch (Exception $e) {
      error_log('Error fetching file ID: ' . $e->getMessage());
      return null;
    }

  }
}
