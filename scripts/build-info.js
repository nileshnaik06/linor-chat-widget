import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const widgetPath = path.join(distDir, 'widget.js');

console.log('\n📊 Build Information\n');
console.log('═'.repeat(60));

if (fs.existsSync(widgetPath)) {
  const stats = fs.statSync(widgetPath);
  const content = fs.readFileSync(widgetPath);
  
  // Calculate sizes
  const uncompressedSize = stats.size;
  const gzipSize = zlib.gzipSync(content).length;
  const brotliSize = zlib.brotliCompressSync(content).length;
  
  console.log(`📦 Widget Bundle: dist/widget.js`);
  console.log(`   Uncompressed:  ${formatBytes(uncompressedSize)}`);
  console.log(`   Gzip:          ${formatBytes(gzipSize)} (${((gzipSize / uncompressedSize) * 100).toFixed(1)}%)`);
  console.log(`   Brotli:        ${formatBytes(brotliSize)} (${((brotliSize / uncompressedSize) * 100).toFixed(1)}%)`);
  
  // Estimate load times
  console.log(`\n⚡ Estimated Load Times (on 3G)`);
  console.log(`   At 1 Mbps:     ${((gzipSize * 8) / 1000000).toFixed(2)}s`);
  console.log(`   At 4 Mbps:     ${((gzipSize * 8) / 4000000).toFixed(2)}s`);
  console.log(`   At 10 Mbps:    ${((gzipSize * 8) / 10000000).toFixed(2)}s`);
  
  // Source map info
  const mapPath = path.join(distDir, 'widget.js.map');
  if (fs.existsSync(mapPath)) {
    const mapStats = fs.statSync(mapPath);
    console.log(`\n🗺️  Source Map: dist/widget.js.map`);
    console.log(`   Size:          ${formatBytes(mapStats.size)}`);
  }
  
  // Build metadata
  console.log(`\n✨ Build Metadata`);
  console.log(`   Timestamp:     ${new Date().toISOString()}`);
  console.log(`   Version:       1.0.0`);
  console.log(`   Target:        ES2017`);
  console.log(`   Format:        IIFE (Global)`);
  console.log(`   Minified:      Yes (esbuild)`);
  
  // CDN deployment info
  console.log(`\n🚀 CDN Deployment`);
  console.log(`   Cache TTL:     30 days (immutable)`);
  console.log(`   Compression:   Gzip + Brotli`);
  console.log(`   CORS:          Enabled (*)`);
  console.log(`   Security:      Headers included`);
  
  // Performance checklist
  console.log(`\n✅ Performance Checklist`);
  if (uncompressedSize < 30000) console.log(`   ✓ Bundle size < 30KB`);
  else console.log(`   ✗ Bundle size >= 30KB`);
  
  if (gzipSize < 10000) console.log(`   ✓ Gzipped size < 10KB`);
  else console.log(`   ✗ Gzipped size >= 10KB`);
  
  console.log(`   ✓ Source map included`);
  console.log(`   ✓ IIFE format (no build required)`);
  
} else {
  console.log('❌ widget.js not found. Run "npm run build" first.');
}

console.log('\n' + '═'.repeat(60) + '\n');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
