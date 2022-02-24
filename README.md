# dispersed-network-cli

A command line tool for working with the Dispersed Network.

## Installation

```sh
npm install dispersed-network
```

## Usage

### Generating a Manifest

Once a site has been built and is ready for bundling, run the following command to generate the Dispersed Network manifest:
```sh
npx dispersed-network generate-manifest <build-dir>
```
The manifest will automatically be saved as `<build-dir>/ngsw.json`.