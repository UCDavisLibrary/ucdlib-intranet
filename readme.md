# UC Davis Library Intranet

This is a standard Docker-based Wordpress installation that runs our [custom theme](https://github.com/UCDavisLibrary/ucdlib-theme-wp).

## Custom Functionality
In addition to OOB Wordpress and our custom theme functionality, we add a few custom features just for the intranet:

### Liball News Importer
The UCD Library uses a couple of email distribution lists to send updates, news, etc to employees. We added a gmail account as a recipient, and these emails are imported into Wordpress as posts via the API on a cron interval. This service was built to be reusable, so it lives in its [own repository](https://github.com/UCDavisLibrary/gmail-wp-pipeline), which has more detailed documentation.

### Library Group Post Type
Each Library group (e.g. department, committee, task force, etc) can create and maintain its own section on the intranet. This is a standard custom post type with the major exception that group pages can be hierarchical, so any metadata associated with a group is attached to its top-level page (landping page).

### Elasticsearch Indexer
In order to improve search, elasticsearch is used instead of the native WP query class. The `elastic-search` directory contains an express server with the following endpoints:
- `/reindex` - performs a full reindex. The `rebuildSchema` will rebuild the schema from the `schema.json` file.
- `/reindex/:postId` - reindexes a single post
- `/search` - returns results given a simplified query object

Wordpress pings the relevant endpoint whenver a post is created/updated/deleted. However, you can always manually run any of these reindexing processes:
```sh
# full reindex
docker compose exec wordpress curl http://indexer:3000/reindex

# follow along
docker compose logs indexer -f
```

### Favorite Pages
Employees can favorite pages on the intranet, which then get displayed on their homepage. The primary interface can be found at `/wp-admin/admin.php?page=ucdlib-intranet-favorites`, but pages can also be added/removed via the star icon on each page header.

## Production Deployment

On your machine:
- Submit PR to main, merge, pull, tag, and push
- Update production compose.yaml file with new tag
- Update the cork-build-registry with your new tag
- Build images with with deploy/cmds/build.sh <tag>

On the production server (currently veers.library)

- `cd /opt/ucdlib-intranet/deploy/compose/ucdlib-intranet-prod`
- `git pull`
- If you need the freshest data (backups are performed nightly), run `docker compose exec backup ./backup/backup.sh`
- `docker compose pull` to download images from Google Cloud
- `docker compose down` then `docker compose up -d`

There will be a brief service outage as the containers start up, so try to schedule deployents accordingly. If something goes wrong, you can always revert to the previously tagged images.

## Local Development

First, create a directory on your local machine and git clone the following repositories:
- This repository
- [ucdlib-theme-wp](https://github.com/UCDavisLibrary/ucdlib-theme-wp)
- [gmail-wp-pipeline](https://github.com/UCDavisLibrary/gmail-wp-pipeline)

For any dependencies, you should pull the version that is defined in the [cork-build registry](https://github.com/ucd-library/cork-build-registry/blob/main/repositories/ucdlib-intranet.json).

Next, run the following scripts:
-  `./deploy/cmds/init-local-dev.sh`
-  `./deploy/cmds/build-local-dev.sh <version>`

Review your env file downloaded to `deploy/compose/ucdlib-intranet-local-dev`

Finally, go to `./deploy/compose/ucdlib-intranet-local-dev` and `docker compose up -d`

There are two JS bundles; one for public views, and one for the block editor. To start either of these watch processes, go to the respective directory in `src/plugins/ucdlib-intranet/assets` and run `npm run watch`

### Indexer
By default, the index, which is only used by the main search, is not hydrated during the init script. So if you want the full index, you will have to manually poke it with `docker compose exec wordpress curl http://indexer:3000/reindex?rebuildSchema=true`. 

Even if you don't trigger a full reindex, a post will still be indexed when you update it locally.

### Liball News Importer
The news importer container will be idle during local dev, and the cron process will be disabled even if you start the main process. To work on the importer, 
- bash into the container and start the process with `node server.js`
- open a new terminal and bash into the container, and run a single import check with `node ./cli.js run -w`

The script assigns a label in gmail after a message is processed, so you don't have to worry about interfering with the production process eventhough the same mailbox is used. If you want to use a custom label as opposed to the default local-dev label, set the `GMAILWP_INSTANCE_NAME` env variable.

