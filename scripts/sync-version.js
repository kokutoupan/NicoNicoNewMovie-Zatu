// scripts/sync-version.js
const fs = require('fs-extra');
const path = require('path');

async function syncVersion() {
  try {
    // package.jsonとmanifest.jsonのパスを解決
    const packageJsonPath = path.resolve(__dirname, '../package.json');
    const manifestJsonPath = path.resolve(__dirname, '../manifest.json');

    // 両方のファイルを読み込む
    const packageJson = await fs.readJson(packageJsonPath);
    const manifestJson = await fs.readJson(manifestJsonPath);

    // package.jsonのバージョンをmanifest.jsonに設定
    manifestJson.version = packageJson.version;

    // manifest.jsonを整形して書き戻す（インデント2スペース）
    await fs.writeJson(manifestJsonPath, manifestJson, { spaces: 2 });

    console.log(`Successfully synced version to ${packageJson.version} in manifest.json`);
  } catch (error) {
    console.error('Error syncing version:', error);
    process.exit(1);
  }
}

syncVersion();