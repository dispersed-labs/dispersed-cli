#!/usr/bin/env node

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const crypto = require('crypto');
const fs = require('fs');
const fsPromises = require('fs/promises');
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
        async (argv) => {
            const manifestPath = await generateManifest(argv.buildDir);
            console.log(`Successfully created manifest: ${manifestPath}`);

            await compress(argv.archive, argv.buildDir);
            console.log(`Successfully created archive: ${argv.archive}`);

            const sum = await checksum(argv.archive);
            console.log(`${argv.archive} has SHA256 checksum: ${sum}`);
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
        async (argv) => {
            console.log(await checksum(argv.file));
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
        async (argv) => {
            const manifestPath = await generateManifest(argv.buildDir);
            console.log(`Successfully created manifest: ${manifestPath}`);
        }
    )
    .demandCommand(1)
    .parse();

async function compress(archive, buildDir) {
    return tar.c(
        {
            gzip: true,
            file: archive,

            // Always change directories to the immediate parent of buildDir before
            // archiving so that the final file structure is one level deep.
            C: path.join(buildDir, '..'),

            // Follow symlinks, the network will only serve regular files.
            follow: true,
        },
        [
            // Due to the `C` flag used above, only specify the final path component.
            path.basename(buildDir)
        ]
    );
}

async function checksum(file) {
    const hash = crypto.createHash('sha256');
    hash.setEncoding('hex');

    return new Promise((resolve, reject) => {
        const fd = fs.createReadStream(file);
        fd.on('end', () => {
            hash.end();
            resolve(hash.read());
        });
        fd.on('error', reject);
        fd.pipe(hash);
    });
}

async function generateManifest(buildDir) {
    const pkgDir = path.join('.', 'node_modules', 'dispersed-cli');
    const configPath = path.join(pkgDir, 'ngsw-config.json');
    const outputPath = path.join(buildDir, 'dispersed.json');

    await exec(`npx ngsw-config ${buildDir} ${configPath}`);
    await fsPromises.rename(path.join(buildDir, 'ngsw.json'), outputPath);

    return outputPath;
}
