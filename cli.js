#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const tar = require('tar');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

yargs(hideBin(process.argv))
    .command(
        'bundle <archive> <build-dir>',
        'Bundle an application for use on the Dispersed Network.',
        (yargs) => {
            return yargs
                .positional('archive', {
                    describe: 'The output archive to create (e.g. site.tgz)',
                })
                .positional('build-dir', {
                    describe: 'Relative path to the build directory (e.g. ./dist)',
                })
        },
        bundle
    )
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

function bundle(argv) {
    generateManifest(argv);
    tar.c(
        {
            gzip: true,
            file: argv.archive,
            sync: true,
        },
        [argv.buildDir]
    );
    console.log(`Successfully created archive: ${argv.archive}`);
}

function generateManifest(argv) {
    const buildDir = argv.buildDir;
    const rootDir = './node_modules/dispersed-cli';
    execSync(`${rootDir}/node_modules/.bin/ngsw-config ${buildDir} ${rootDir}/ngsw-config.json`);
    fs.renameSync(`${buildDir}/ngsw.json`, `${buildDir}/dispersed.json`);
    console.log(`Successfully created manifest: ${buildDir}/dispersed.json`);
}
