# Executing Wordpress Scripts

It can be useful to run a php script in the WP environment (all WP and theme/plugin code will be run first), especially when doing ETL type tasks. This directory is available in any utils-based image, which should not be on an exposed port.

To run a script, use the cli:

```bash
# bash into a running utils container
docker compose exec backup bash

# move to wordpress src directory (required for wp cli)
cd /usr/src/wordpress

# use wp cli to run script
wp --allow-root eval-file /deploy-utils/wp-scripts/your-script.php
```
