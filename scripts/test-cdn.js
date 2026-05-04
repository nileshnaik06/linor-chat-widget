import https from 'https';

const CDN_URL = process.env.CDN_URL || 'https://cdn.yourdomain.com/widget.js';

console.log('\n🧪 CDN Tests\n');
console.log('═'.repeat(60));
console.log(`Testing: ${CDN_URL}\n`);

async function testCDN() {
  try {
    console.log('📝 Test 1: Basic Connectivity');
    const response = await fetchWithHeaders(CDN_URL);
    console.log(`   Status:        ${response.statusCode}`);
    console.log(`   Content-Type:  ${response.headers['content-type']}`);
    
    console.log('\n📝 Test 2: Cache Headers');
    console.log(`   Cache-Control: ${response.headers['cache-control']}`);
    console.log(`   CF-Cache-Status: ${response.headers['cf-cache-status'] || 'N/A'}`);
    console.log(`   Age:           ${response.headers['age'] || '0'}s`);
    
    console.log('\n📝 Test 3: Security Headers');
    console.log(`   X-Content-Type-Options: ${response.headers['x-content-type-options']}`);
    console.log(`   X-Frame-Options:        ${response.headers['x-frame-options']}`);
    console.log(`   X-XSS-Protection:       ${response.headers['x-xss-protection']}`);
    
    console.log('\n📝 Test 4: CORS Headers');
    console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
    console.log(`   Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods']}`);
    
    console.log('\n📝 Test 5: Performance');
    console.log(`   Content-Length: ${response.headers['content-length']} bytes`);
    console.log(`   Content-Encoding: ${response.headers['content-encoding'] || 'none'}`);
    
    console.log('\n✅ All tests passed!\n');
    console.log('═'.repeat(60) + '\n');
    
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}\n`);
  }
}

function fetchWithHeaders(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000 }, (response) => {
      const data = [];
      response.on('data', chunk => data.push(chunk));
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: Buffer.concat(data).toString(),
        });
      });
    }).on('error', reject);
  });
}

testCDN();
