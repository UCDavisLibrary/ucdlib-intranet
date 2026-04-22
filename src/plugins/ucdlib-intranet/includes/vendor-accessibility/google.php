<?php

use Google\Client;
use Google\Service\Drive;
use PhpOffice\PhpSpreadsheet\IOFactory;

class UcdlibIntranetVendorAccessibilityGoogle {

  public $main;

  public function __construct( $main ){
    $this->main = $main;
  }

  /**
   * @description Main function to run the process of downloading the vendor accessibility spreadsheet from Google Drive and saving as JSON file. 
   */
  public function run(){
    $filePath = $this->downloadFile();
    if ( $filePath ) {
      $this->writeAsJsonFile();
    }
  }

  public function getDriveService(){
    $credentialsPath = $this->main->plugin->config->getEnv('UCDLIB_INTRANET_GC_KEY_FILENAME');
    $client = new Client();
    $client->setAuthConfig($credentialsPath);
    $client->addScope(Drive::DRIVE_READONLY);
    return new Drive($client);
  }

  /**
   * @description Write the contents of the downloaded vendor accessibility spreadsheet to a JSON file in the uploads directory. 
   */
  public function writeAsJsonFile(){
    $contents = $this->getFileContents();
    if ( empty($contents) ) {
      error_log('No data to write to JSON file');
      return null;
    }
    $filePathInfo = $this->getFilePathInfo();
    $json = json_encode(
      $contents,
      JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );

    if ($json === false) {
      error_log('JSON encode error: ' . json_last_error_msg());
      return false;
    }

    $result = file_put_contents($filePathInfo['fullPath'] . '.json', $json);

    if ($result === false) {
      error_log('Failed to write JSON file: ' . $filePathInfo['fullPath'] . '.json');
      return false;
    }

    return true;
  }

  public function getJson(){
    $filePathInfo = $this->getFilePathInfo();
    $jsonPath = $filePathInfo['fullPath'] . '.json';
    if ( !file_exists($jsonPath) ) {
      error_log('JSON file not found: ' . $jsonPath);
      return null;
    }
    $json = file_get_contents($jsonPath);
    if ( $json === false ) {
      error_log('Failed to read JSON file: ' . $jsonPath);
      return null;
    }
    $data = json_decode($json, true);
    if ( $data === null ) {
      error_log('JSON decode error: ' . json_last_error_msg());
      return null;
    }
    return $data;
  }

  /**
   * @description Read the contents of the vendor accessibility spreadsheet file and return as an array. 
   * Returns null if file doesn't exist or error occurs.
   */
  public function getFileContents(){
    $filePathInfo = $this->getFilePathInfo();
    if ( empty($filePathInfo) || !file_exists($filePathInfo['fullPath']) ) {
      return null;
    }
    try {
      $spreadsheet = IOFactory::load($filePathInfo['fullPath']);
      $sheet = $spreadsheet->getActiveSheet();

      // Get all rows as a simple array
      $rows = $sheet->toArray(null, true, true, true);
      if (empty($rows)) {
        return [];
      }

      // First row = headers
      $headers = array_shift($rows);

      $data = [];

      foreach ($rows as $row) {
          $item = [];

          foreach ($headers as $col => $header) {
              if (!$header) continue;

              $key = $header;
              $item[$key] = $row[$col] ?? null;
          }

          $data[] = $item;
      }

      return $data;
    } catch (Exception $e) {
      error_log('Error reading spreadsheet: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * @description Get file path info for the vendor accessibility spreadsheet based on folder ID and file name from environment variables.
   */
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

  /**
   * @description Download the vendor accessibility spreadsheet from Google Drive and save to uploads directory. 
   * Returns full file path if successful, null if error occurs.
   */
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
