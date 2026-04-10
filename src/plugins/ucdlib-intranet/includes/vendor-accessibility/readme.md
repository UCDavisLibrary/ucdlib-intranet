# Dependencies
In additition to adding `"google/apiclient": "^2.0",` to composer file, had to add `"monolog/monolog": "^2.10"` because defender loads an older version (`/usr/src/wordpress/wp-content/plugins/wp-defender/vendor/psr/log/Psr/Log/LoggerInterface.php`) without going through composer. Received the following error: 

```
PHP Fatal error:  Declaration of Monolog\Logger::emergency(Stringable|string $message, array $context = []): void must be compatible with Psr\Log\LoggerInterface::emergency($message, array $context = []) in /usr/src/wordpress/vendor/monolog/monolog/src/Monolog/Logger.php on line 683
```

`google/apiclient` is fine with version 2 or 3.