#! /usr/bin/env node

import { Command } from 'commander';

const program = new Command();
program
  .name('reports')
  .description('CLI tools for intranet reports')
  .version('1.0.0');

program.command('old-links', 'Scan WordPress content for old links');

program.parse(process.argv);