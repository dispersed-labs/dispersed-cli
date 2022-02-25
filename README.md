# dispersed-cli

A command line tool for working with the Dispersed Network.

## Installation

```sh
npm install dispersed-cli
```

## Usage

### Creating a Bundle

Once a site has been built and is ready for bundling, run the following command to generate a Dispersed Network compatible tarball:

```sh
npx dispersed bundle <archive> <build-dir>
```

Example: `npx dispersed bundle mysite.tgz ./dist`

Note that running `bundle` will also print the SHA256 checksum of the archive, which is needed for publishing the site to the Dispersed Network.
