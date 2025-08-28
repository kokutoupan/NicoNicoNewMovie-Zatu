// scripts/get-manifest-version.js
const fs = require('fs-extra');
const path = require('path');

async function getVersion() {
  try {
    const manifestPath = path.resolve(__dirname, '../manifest.json');
    const manifest = await fs.readJson(manifestPath);
    // バージョン番号だけを標準出力に出力する
    process.stdout.write(manifest.version);
  } catch (error) {
    console.error('Could not read manifest version:', error);
    process.exit(1);
  }
}

getVersion();