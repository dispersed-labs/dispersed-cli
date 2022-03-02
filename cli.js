#!/usr/bin/env node

const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const tar = require('tar');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

yargs(hideBin(process.argv))
    .command(
        'bundle <archive> <build-dir>',
        'Bundle an application for use on the Dispersed Network',
        (yargs) => {
            return yargs
                .positional('archive', {
                    describe: 'The output archive to create (e.g. site.tgz)',
                })
                .positional('build-dir', {
                    describe: 'Relative path to the build directory (e.g. ./dist)',
                })
        },
        (argv) => {
            bundle(argv.archive, argv.buildDir);
        }
    )
    .command(
        'checksum <file>',
        'Prints the SHA256 checksum of the provided file',
        (yargs) => {
            return yargs
                .positional('file', {
                    describe: 'The file to checksum',
                })
        },
        (argv) => {
            checksum(argv.file);
        }
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
        (argv) => {
            generateManifest(argv.buildDir);
        }
    )
    .demandCommand(1)
    .parse();

function bundle(archive, buildDir) {
    generateManifest(buildDir);
    tar.c(
        {
            gzip: true,
            file: archive,
            sync: true,
        },
        [buildDir]
    );
    console.log(`Successfully created archive: ${archive}`);
    checksum(archive);
}

function checksum(file) {
    var hash = crypto.createHash('sha256');
    hash.setEncoding('hex');

    var fd = fs.createReadStream(file);
    fd.on('end', function () {
        hash.end();
        console.log(`${file} has SHA256 checksum: ${hash.read()}`);
    });
    fd.pipe(hash);
}

function generateManifest(buildDir) {
    const pkgDir = path.join('.', 'node_modules', 'dispersed-cli');
    execSync(`npx ngsw-config ${buildDir} ${path.join(pkgDir, 'ngsw-config.json')}`);
    fs.renameSync(path.join(buildDir, 'ngsw.json'), path.join(buildDir, 'dispersed.json'));
    console.log(`Successfully created manifest: ${path.join(buildDir, 'dispersed.json')}`);
}
