#!/usr/bin/env node

import { program } from 'commander';
import { downloadPackage } from '../index';
program
  .name('tinypm')
  .description('A tiny package manager')
  .version('0.1.0')
  .command('add <package>').action(async (pkg) => {
    try {
      const path = await downloadPackage(pkg);
      console.log(`Package ${pkg} downloaded to ${path}`);
    } catch (error) {
      console.error(`Error downloading package ${pkg}:`, error);
    }
  }
  )
  .parse(process.argv);