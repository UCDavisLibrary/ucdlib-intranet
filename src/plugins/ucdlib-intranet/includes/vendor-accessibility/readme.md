# Vendor Accessibility

Displays accessibility information for electronic resource vendors (collections/interfaces) sourced from an Excel spreadsheet stored in Google Drive. Staff can filter results by content provider, interface name, and collection name via a Lit web component embedded on any page through a Gutenberg block.

## Architecture

### Data pipeline

1. A WordPress cron job fires daily (`main.php` → `scheduleCron` / `doCron`).
2. `google.php` authenticates to the Google Drive API using a service account, locates the spreadsheet by folder ID and filename, and downloads the raw XLSX file to `{uploads}/vendor-data/`.
3. The XLSX is parsed by `phpoffice/phpspreadsheet` and the first row is treated as column headers. The resulting row-objects are written to a `.json` sidecar file next to the XLSX.
4. The REST endpoint (`rest.php`) reads the cached JSON and returns it to authenticated clients. Administrators may pass `?refresh=true` to force an immediate re-download before the response is returned.

### PHP backend (`includes/vendor-accessibility/`)

| File | Class | Responsibility |
|---|---|---|
| `main.php` | `UcdlibIntranetVendorAccessibility` | Wires up the cron schedule and owns references to the Google and REST sub-objects. |
| `google.php` | `UcdlibIntranetVendorAccessibilityGoogle` | Google Drive download, spreadsheet parsing, JSON cache read/write. |
| `rest.php` | `UcdlibIntranetVendorAccessibilityRest` | Registers and handles `GET ucdlib-intranet/vendor-accessibility/data`. Requires `is_user_logged_in`. |

### Frontend web component (`assets/public/src/js/elements/vendor-accessiblity/`)

A Lit element `<ucdlib-intranet-vendor-accessibility>` (`ucdlib-intranet-vendor-accessibility.js` / `.tpl.js`):

- On `connectedCallback` it fetches data from the REST endpoint.
- The `?refresh=true` query parameter on the page URL is forwarded to the REST call (useful for admin cache-busting).
- Exposes three multi-select filters powered by `ucd-theme-slim-select`:
  - **Content Provider** (level-one filter)
  - **Interface Name** (level-one filter)
  - **Collection Public Name** (level-two filter — options are narrowed based on level-one selections)
- Results only appear once at least one filter has a value selected.
- Each result card shows the collection name, vendor string (`Content Provider - Interface Name`), and any additional `displayFields` configured in the block editor.
- SSR properties are bootstrapped from a `<script type="application/json">` child element via a `MutationObserverController`.

### Block editor (`assets/editor/lib/blocks/vendor-accessibility/`)

Gutenberg block registered as `ucdlib-intranet/vendor-accessibility`. The edit view shows a placeholder; all configuration lives in the Inspector sidebar:

| Setting | Attribute | Default |
|---|---|---|
| Content Provider Column Name | `contentProviderColumn` | `Content Provider (Interface Vendor)` |
| Interface Name Column Name | `interfaceNameColumn` | `Electronic Collection Interface Name` |
| Collection Public Name Column Name | `collectionPublicNameColumn` | `Electronic Collection Public Name` |
| Display Fields | `displayFields` | *(empty)* — one column name per line |

Column name attributes are passed to the web component as SSR properties so they can be customised if the source spreadsheet structure ever changes. Display fields are stored as a newline-delimited string in the block attribute and parsed into an array before being handed off to the element.

## Environment Variables

| Variable | Description |
|---|---|
| `UCDLIB_INTRANET_GC_KEY_FILENAME` | Absolute path to the Google service account credentials JSON file. |
| `UCDLIB_INTRANET_VA_FOLDER_ID` | Google Drive folder ID that contains the spreadsheet. |
| `UCDLIB_INTRANET_VA_SPREADSHEET_NAME` | Exact filename of the spreadsheet within that folder. |

## Dependencies

Composer packages required: `google/apiclient` (^2.0 or ^3.0) and `phpoffice/phpspreadsheet`.

### Monolog version pin

In additition to adding `"google/apiclient": "^2.0",` to composer file, had to add `"monolog/monolog": "^2.10"` because defender loads an older version (`/usr/src/wordpress/wp-content/plugins/wp-defender/vendor/psr/log/Psr/Log/LoggerInterface.php`) without going through composer. Received the following error:

```
PHP Fatal error:  Declaration of Monolog\Logger::emergency(Stringable|string $message, array $context = []): void must be compatible with Psr\Log\LoggerInterface::emergency($message, array $context = []) in /usr/src/wordpress/vendor/monolog/monolog/src/Monolog/Logger.php on line 683
```

`google/apiclient` is fine with version 2 or 3.
