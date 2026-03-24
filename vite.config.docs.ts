import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'shared'),
    },
  },
  build: {
    outDir: 'docs/assets/js',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'docs-src/demo.ts'),
      formats: ['es'],
      fileName: 'demo',
    },
  },
});
