import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
// manifest.json をインポート
import manifest from './manifest.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // crxプラグインを呼び出し、manifestを渡す
    crx({ manifest }),
  ],
})