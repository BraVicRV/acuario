import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',               // carpeta donde está index.html
  publicDir: 'static',     // tus modelos .glb y assets
  server: {
    open: true             // abre el navegador automáticamente
  }
});