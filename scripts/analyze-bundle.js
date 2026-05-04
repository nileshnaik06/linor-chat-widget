import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

console.log('\n📈 Bundle Analysis\n');
console.log('═'.repeat(60));

// List all files in dist
const files = fs.readdirSync(distDir);
console.log(`📁 Generated Files:\n`);

let totalSize = 0;
files.forEach(file => {
  const filePath = path.join(distDir, file);
  const stats = fs.statSync(filePath);
  const size = stats.size;
  totalSize += size;
  
  let icon = '📄';
  if (file.endsWith('.js')) icon = '📦';
  if (file.endsWith('.map')) icon = '🗺️ ';
  if (file.startsWith('_')) icon = '⚙️ ';
  
  console.log(`   ${icon} ${file.padEnd(25)} ${formatBytes(size)}`);
});

console.log(`\n   Total: ${formatBytes(totalSize)}`);

console.log('\n' + '═'.repeat(60) + '\n');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
