#!/usr/bin/env node

const { exec } = require('child_process');
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
    exec(`${rootDir}/node_modules/.bin/ngsw-config ${buildDir} ${rootDir}/ngsw-config.json`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`Successfully wrote ${buildDir}/ngsw.json`);
    });
}
