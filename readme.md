# UC Davis Library Intranet

In active development...

## Local Development

First, create a directory on your local machine and git clone the following repositories:
- This repository
- [ucdlib-theme-wp](https://github.com/UCDavisLibrary/ucdlib-theme-wp)
- [gmail-wp-pipeline](https://github.com/UCDavisLibrary/gmail-wp-pipeline)

Next, run the following scripts:
-  `./deploy/cmds/init-local-dev.sh`
-  `./deploy/cmds/build-local-dev.sh`

Finally, go to `./deploy/compose/ucdlib-intranet-dev` and `docker compose up -d`

There are two JS bundles; one for public views, and one for the block editor. To start either of these watch processes, go to the respective directory in `src/plugins/ucdlib-intranet/assets` and run `npm run watch`


