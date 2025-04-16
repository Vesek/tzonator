import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import fs from 'fs';
import https from 'https';
import path from 'path';

function downloadFontPlugin() {
  return {
    name: 'download-font',
    buildStart() {
      const FONT_URL = 'https://raw.githubusercontent.com/hikikomori82/osifont/master/osifont-lgpl3fe.ttf';
      const DEST = path.resolve('public/fonts/osifont-lgpl3fe.ttf');

      if (!fs.existsSync(DEST)) {
        fs.mkdirSync(path.dirname(DEST), { recursive: true });
        const file = fs.createWriteStream(DEST);
        https.get(FONT_URL, response => {
          response.pipe(file);
          file.on('finish', () => file.close());
        });
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [downloadFontPlugin(),react(),tailwindcss()],
})
