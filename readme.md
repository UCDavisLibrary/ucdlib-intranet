# UC Davis Library Intranet

IN DEVELOPMENT

This is a standard Docker-based Wordpress installation that runs our [custom theme](https://github.com/UCDavisLibrary/ucdlib-theme-wp).

## Custom Functionality
In addition to OOB Wordpress functionality, we add a few custom features:

### Liball News Importer

### Library Group Post Type

### Elasticsearch Indexer

### Favorite Pages

## Local Development

First, create a directory on your local machine and git clone the following repositories:
- This repository
- [ucdlib-theme-wp](https://github.com/UCDavisLibrary/ucdlib-theme-wp)
- [gmail-wp-pipeline](https://github.com/UCDavisLibrary/gmail-wp-pipeline)

For any dependencies, you should pull the version that is defined in the [cork-build registry](https://github.com/ucd-library/cork-build-registry/blob/main/repositories/ucdlib-intranet.json).

Next, run the following scripts:
-  `./deploy/cmds/init-local-dev.sh`
-  `./deploy/cmds/build-local-dev.sh <version>`

Finally, go to `./deploy/compose/ucdlib-intranet-dev` and `docker compose up -d`

There are two JS bundles; one for public views, and one for the block editor. To start either of these watch processes, go to the respective directory in `src/plugins/ucdlib-intranet/assets` and run `npm run watch`

### Liball News Importer
By default, [the service](https://github.com/UCDavisLibrary/gmail-wp-pipeline) that checks for library-wide list emails and posts them as news is disabled in local development.
To run it:
- manually start the main process with `docker compose exec wp-gmail bash` and `node ./server.js`
- and then in another terminal manually run the script with `docker compose exec wp-gmail bash` and `node ./cli.js run -w`



