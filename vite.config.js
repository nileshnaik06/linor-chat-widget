import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'AIReceptionistWidget',
      fileName: () => 'widget.js',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        // Aggressive minification
        compact: true,
        format: 'iife',
      },
    },
    // Use esbuild for faster, better minification
    minify: 'esbuild',
    // Generate source maps for debugging in production
    sourcemap: 'hidden',
    target: 'es2017',
    outDir: 'dist',
    // Disable CSS code splitting (all CSS inline)
    cssCodeSplit: false,
    // Inline small assets (fonts, images) below 4KB
    assetsInlineLimit: 4096,
    // Enable advanced compression
    reportCompressedSize: true,
  },
  server: {
    port: 3000,
    open: false,
  },
  plugins: [
    {
      name: 'copy-cf-files',
      writeBundle() {
        // Copy Cloudflare Pages config files
        const files = ['_headers', '_redirects', '_routes.json'];
        files.forEach(file => {
          const src = path.join(__dirname, 'public', file);
          const dest = path.join(__dirname, 'dist', file);
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`✓ Copied ${file} to dist/`);
          }
        });
      }
    }
  ]
});
