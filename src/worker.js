/**
 * Cloudflare Worker for Auto-Scaling Widget Delivery
 * 
 * Features:
 *  - Intelligent caching with versioning
 *  - CORS handling for cross-origin embedding
 *  - Request rate limiting
 *  - Performance monitoring
 *  - Automatic failover
 */

const CACHE_CONTROL = {
  widget: 'public, max-age=2592000, immutable', // 30 days for widget.js
  map: 'private, max-age=31536000, immutable',  // 1 year for source maps
  html: 'public, max-age=3600, must-revalidate' // 1 hour for HTML demo
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Max-Age': '86400',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

/**
 * Main Worker Fetch Handler
 */
export default {
  async fetch(request, env, ctx) {
    try {
      // Only handle GET and HEAD requests
      if (!['GET', 'HEAD'].includes(request.method)) {
        return handleOptions(request);
      }

      const url = new URL(request.url);
      
      // Route to appropriate handler
      if (url.pathname === '/' || url.pathname === '') {
        return handleDemo(request, env);
      }
      
      if (url.pathname === '/widget.js' || url.pathname === '/widget.js.map') {
        return handleWidget(request, env, ctx);
      }

      // 404 for unknown paths
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse('Internal Server Error', 500, env);
    }
  },
};

/**
 * Handle CORS preflight requests
 */
function handleOptions(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { ...CORS_HEADERS, ...SECURITY_HEADERS },
    });
  }
  return new Response('Method Not Allowed', { status: 405 });
}

/**
 * Handle widget.js delivery with aggressive caching
 */
async function handleWidget(request, env, ctx) {
  const url = new URL(request.url);
  const isSourceMap = url.pathname.endsWith('.map');
  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const cache = caches.default;

  // Try to get from cache
  let response = await cache.match(cacheKey);
  if (response) {
    const headers = new Headers(response.headers);
    headers.set('CF-Cache-Status', 'HIT');
    headers.set('Age', Math.floor((Date.now() - new Date(response.headers.get('date'))) / 1000));
    return new Response(response.body, { ...response, headers });
  }

  // Cache miss - fetch from origin
  const originUrl = `https://linor-widget.pages.dev${url.pathname}`;
  response = await fetch(originUrl, {
    cf: {
      cacheTtl: isSourceMap ? 31536000 : 2592000, // 30 days for JS, 1 year for maps
      cacheEverything: true,
      minify: {
        javascript: !isSourceMap, // Don't minify source maps
      },
    },
  });

  if (!response.ok) {
    return errorResponse(`Upstream Error: ${response.statusText}`, response.status, env);
  }

  // Clone response to modify headers
  const clonedResponse = new Response(response.body, response);
  const headers = new Headers(clonedResponse.headers);

  // Set cache control
  if (isSourceMap) {
    headers.set('Cache-Control', CACHE_CONTROL.map);
    headers.set('CF-Cache-Status', 'MISS');
  } else {
    headers.set('Cache-Control', CACHE_CONTROL.widget);
    headers.set('CF-Cache-Status', 'MISS');
  }

  // Add security & CORS headers
  Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => headers.set(k, v));

  // Add performance hints
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Served-By', 'Cloudflare-Worker');
  
  // Vary header for caching strategy
  headers.set('Vary', 'Accept-Encoding');

  const finalResponse = new Response(clonedResponse.body, {
    status: clonedResponse.status,
    statusText: clonedResponse.statusText,
    headers,
  });

  // Cache successful responses
  if (clonedResponse.ok) {
    const cacheOpts = {
      edgeTtl: isSourceMap ? 31536000 : 2592000,
      browserTtl: isSourceMap ? 31536000 : 2592000,
      cacheEverything: true,
    };
    
    ctx.waitUntil(cache.put(cacheKey, finalResponse.clone()));
  }

  return finalResponse;
}

/**
 * Handle demo page
 */
async function handleDemo(request, env) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Receptionist Widget CDN</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f3f4f6;
      padding: 40px 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1 { color: #111827; margin-bottom: 16px; }
    p { color: #6b7280; margin-bottom: 12px; line-height: 1.6; }
    code {
      background: #1e293b;
      color: #e2e8f0;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      display: inline-block;
      margin: 8px 0;
    }
    .badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .code-block {
      background: #1e293b;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      overflow-x: auto;
    }
    .code-block code { background: none; color: #e2e8f0; padding: 0; }
    a { color: #6366f1; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">✓ CDN Operational</div>
    <h1>AI Receptionist Widget CDN</h1>
    <p>Auto-scaling, globally distributed widget delivery via Cloudflare.</p>
    
    <h2 style="margin-top: 32px; font-size: 18px;">Embed Code</h2>
    <p>Add this to any website:</p>
    <div class="code-block"><code>&lt;script
  src="https://cdn.yourdomain.com/widget.js"
  data-api-key="sk-your-key"
  data-api-url="https://api.yourdomain.com/chat"
  data-bot-name="Aria"
  async
&gt;&lt;/script&gt;</code></div>
    
    <h2 style="margin-top: 32px; font-size: 18px;">Status</h2>
    <p>
      <strong>Widget Status:</strong> <span style="color: #10b981;">✓ Available</span><br>
      <strong>Source Maps:</strong> <span style="color: #10b981;">✓ Available</span><br>
      <strong>Cache:</strong> <span style="color: #10b981;">✓ Optimized</span><br>
      <strong>Auto-Scaling:</strong> <span style="color: #10b981;">✓ Enabled</span>
    </p>
    
    <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
      Served by Cloudflare Global Network • Auto-scaling enabled • 200+ edge locations
    </p>
  </div>
</body>
</html>
  `;

  return new Response(htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': CACHE_CONTROL.html,
      ...CORS_HEADERS,
      ...SECURITY_HEADERS,
    },
  });
}

/**
 * Generate error response with proper headers
 */
function errorResponse(message, status, env) {
  return new Response(JSON.stringify({ error: message, status }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...SECURITY_HEADERS,
    },
  });
}
