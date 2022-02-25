#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

yargs(hideBin(process.argv))
  .command(
    'generate-manifest <build-dir>',
    'Generate a new site manifest',
    (yargs) => {
        return yargs
        .positional('build-dir', {
            describe: 'Relative path to the build directory (e.g. ./dist)',
        })
    },
    generateManifest
  )
  .demandCommand(1)
  .parse();

function generateManifest(argv) {
    const buildDir = argv['build-dir'];
    const rootDir = './node_modules/dispersed-cli';
    execSync(`${rootDir}/node_modules/.bin/ngsw-config ${buildDir} ${rootDir}/ngsw-config.json`);
    fs.renameSync(`${buildDir}/ngsw.json`, `${buildDir}/dispersed.json`);
    console.log(`Successfully wrote ${buildDir}/dispersed.json`);
}
