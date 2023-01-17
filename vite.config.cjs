// vite.config.js
import * as path from 'path';
import { defineConfig } from "vite";

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'dwh',
      fileName: (format) => `dwh.${format}.js`
    }
   }
})
