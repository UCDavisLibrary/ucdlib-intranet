#! /usr/bin/env node

import { Command } from 'commander';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { config } from 'dotenv';
import OldLinksReport from './old_links.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @description CLI to run OldLinksReport
 * @module reports-old-links
 * @example
 *   $ reports old-links
 *   $ reports old-links https://staff.library.ucdavis.edu http://staff.library.ucdavis.edu
 *   $ reports old-links https://staff.library.ucdavis.edu http://staff.library.ucdavis.edu -e ./reports/old-intranet-links/.env -d ./reports
 *   $ reports old-links -e ./reports/old-intranet-links/.env
 *   $ reports old-links -e ./reports/old-intranet-links/.env -d ./reports
 */

const program = new Command();
program
  .name('old-links')
  .description('Scan WordPress content for old links')
  .argument('[bases...]', 'Base URLs to check (default: https://staff.library.ucdavis.edu and http://staff.library.ucdavis.edu)')
  .option('-e, --env <path>', 'Path to .env file', path.join(__dirname, '.env'))
  .option('-d, --destination <path>', 'Path to destination folder for reports', __dirname)
  .action(async (bases, options) => {
    if (!bases || bases.length === 0) {
      bases = [
        'https://staff.library.ucdavis.edu',
        'http://staff.library.ucdavis.edu',
      ];
    }
    let envPath = null;

    let desinationPath = path.isAbsolute(options.destination)
      ? options.destination
      : path.resolve(process.cwd(), options.destination);

    if (options.env) {
      envPath = path.isAbsolute(options.env)
      ? options.env
      : path.resolve(process.cwd(), options.env);    
    }

    const out = envPath ? config({ path: envPath }): config();

    if (out.error) {
      console.error('.env credentials needed:', out.error);
      process.exit(1);
    }

    console.log('Loaded .env from:', envPath);
    console.log('Checking bases:', bases);

    const baseConfig = {
      wpBase: process.env.WP_API_BASE || "https://stage.staff.library.ucdavis.edu/wp-json/wp/v2",
      wpUser: process.env.WP_API_USER || "USERNAME",
      wpPass: process.env.WP_API_PASS || "PASSWORD",
      wpPage: process.env.WP_API_PER_PAGE || 100,
    }

    await new OldLinksReport(bases, baseConfig, desinationPath).generate();
  });

program.parse(process.argv);
