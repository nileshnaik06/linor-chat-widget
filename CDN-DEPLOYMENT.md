# Chat Widget CDN Deployment Guide

## Step-by-Step Process: Deploy to Cloudflare CDN

### **STEP 1: Prepare Your Build**

```bash
# Navigate to chat-widget folder
cd Frontend/chat-widget

# Install dependencies
npm install

# Build the optimized production widget
npm run build

# Output: dist/widget.js (~21 KB gzipped)
```

---

### **STEP 2: Set Up Cloudflare Account & Domain**

1. **Create Cloudflare Account:**
   - Go to https://www.cloudflare.com/
   - Sign up for free (Flexible SSL included)
   - Add your domain or create a new subdomain for CDN

2. **Get API Token:**
   - Login to Cloudflare Dashboard
   - Go to: **Account Settings → API Tokens**
   - Click "Create Token"
   - Use template: **"Edit Cloudflare Workers"**
   - Grant permissions: `Account.Workers Scripts Write`
   - Get your **API Token** and **Account ID**

3. **Note Your Details:**
   ```
   Zone ID:      (find in dashboard for your domain)
   Account ID:   (from API token creation)
   API Token:    (the generated token)
   Domain:       cdn.yourdomain.com (or use Cloudflare Pages)
   ```

---

### **STEP 3: Use Cloudflare Pages (Easiest for Static Files)**

**Option A: Git-Connected Deployment (Recommended)**

1. **Connect Repository:**
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project"
   - Select "Connect to Git" (GitHub/GitLab/Bitbucket)
   - Authorize Cloudflare
   - Select your repo

2. **Configure Build Settings:**
   - **Project name:** `linor-widget`
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `Frontend/chat-widget`

3. **Deploy:**
   - Click "Save and Deploy"
   - Cloudflare automatically builds & deploys
   - Your widget is live at: `https://<project>.pages.dev/widget.js`

---

### **STEP 4: Set Custom Domain**

1. Go to: **Pages Project → Custom Domains**
2. Add your domain: `cdn.yourdomain.com`
3. Update DNS records (Cloudflare will show exact records)
4. Wait for SSL certificate (5-10 min)
5. **Your CDN URL:** `https://cdn.yourdomain.com/widget.js`

---

### **STEP 5: Configure Cache & Performance Headers**

**Create `_headers` file in `dist/` folder:**

```txt
# Cache control for widget.js
/widget.js
  Cache-Control: public, max-age=2592000, immutable
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Access-Control-Allow-Origin: *
  Content-Security-Policy: default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src *

# Source map (long-term cache, not user-facing)
/widget.js.map
  Cache-Control: private, max-age=31536000, immutable
```

**Create `_redirects` file in `dist/` folder:**

```txt
# Redirect all non-JS requests to static widget
/* /widget.js 200
```

---

### **STEP 6: Auto-Scaling Setup (Cloudflare Workers)**

Create `wrangler.toml` in root:

```toml
name = "linor-widget-cdn"
type = "javascript"
account_id = "YOUR_ACCOUNT_ID"
workers_dev = true
route = "cdn.yourdomain.com/*"
zone_id = "YOUR_ZONE_ID"

[env.production]
vars = { CACHE_VERSION = "1" }
```

Create `src/worker.js`:

```javascript
/**
 * Cloudflare Worker for auto-scaling widget delivery
 * - Optimizes caching
 * - Handles CORS
 * - Auto-scales with traffic
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cacheKey = new Request(url.toString(), { method: 'GET' });
    const cache = caches.default;

    // Check cache first
    let response = await cache.match(cacheKey);
    if (response) {
      return response;
    }

    // Fetch from origin (Cloudflare Pages)
    const originUrl = `https://linor-widget.pages.dev${url.pathname}`;
    response = await fetch(originUrl);

    // Only cache successful responses
    if (response.status === 200) {
      const clonedResponse = response.clone();
      const headers = new Headers(clonedResponse.headers);
      
      // Set aggressive caching for widget.js
      if (url.pathname === '/widget.js') {
        headers.set('Cache-Control', 'public, max-age=2592000, immutable');
      }
      
      // Set CORS headers
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'SAMEORIGIN');

      const responseWithHeaders = new Response(clonedResponse.body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers,
      });

      // Cache with 30-day TTL for widget.js
      if (url.pathname === '/widget.js') {
        responseWithHeaders.headers.set('Cache-Control', 'public, max-age=2592000, immutable');
        await cache.put(cacheKey, responseWithHeaders.clone());
      }

      return responseWithHeaders;
    }

    return response;
  },
};
```

Deploy with Wrangler:

```bash
npm install -g wrangler
wrangler publish
```

---

### **STEP 7: Performance Optimization**

Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { terser } from 'rollup-plugin-terser';

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
        plugins: [terser()],
      },
    },
    minify: 'terser',
    sourcemap: 'hidden',
    target: 'es2017',
    outDir: 'dist',
    // Enable compression
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    // Gzip will be handled by Cloudflare
  },
  server: {
    port: 3000,
  },
});
```

---

### **STEP 8: Monitoring & Analytics**

1. **Cloudflare Analytics:**
   - Dashboard → Analytics → Performance
   - Monitor cache hit rate (target: 95%+)
   - Check bandwidth usage

2. **Error Tracking:**
   ```javascript
   // Add to your application
   window.addEventListener('error', (e) => {
     const img = new Image();
     img.src = `https://analytics.yourdomain.com/error?msg=${encodeURIComponent(e.message)}&url=${encodeURIComponent(window.location.href)}`;
   });
   ```

---

### **STEP 9: Test CDN Deployment**

```bash
# Test widget loading
curl -I https://cdn.yourdomain.com/widget.js

# Check headers
curl -I https://cdn.yourdomain.com/widget.js | grep -E "Cache-Control|Age|CF-Cache-Status"

# Test CORS
curl -H "Origin: https://example.com" -v https://cdn.yourdomain.com/widget.js
```

Expected output:
```
CF-Cache-Status: HIT
Cache-Control: public, max-age=2592000, immutable
Age: 3600
Access-Control-Allow-Origin: *
X-Content-Type-Options: nosniff
```

---

### **STEP 10: Embed on Your Website**

```html
<script
  src="https://cdn.yourdomain.com/widget.js"
  data-api-key="sk-your-key"
  data-api-url="https://api.yourdomain.com/v1/chat"
  data-bot-name="Aria"
  data-primary-color="#6366f1"
  async
></script>
```

---

## **Performance Checklist**

✅ **Gzip Compression:** Cloudflare auto-enables (21 KB → 7 KB gzipped)
✅ **Brotli Compression:** Enabled on Cloudflare (even smaller)
✅ **HTTP/2 Push:** Cloudflare handles automatically
✅ **Cache Headers:** Set to 30 days for immutable assets
✅ **CORS Headers:** Allowed on all origins (configurable)
✅ **CDN Edge Locations:** 200+ globally (Cloudflare's network)
✅ **Auto-Scaling:** Handled by Cloudflare (no server management)
✅ **DDoS Protection:** Included with Cloudflare
✅ **Analytics:** Real-time monitoring
✅ **SSL/TLS:** Automatic, renewed by Cloudflare

---

## **Troubleshooting**

### **404 on `/widget.js`**
- Check build output: `ls dist/`
- Verify Pages project root directory
- Rebuild: `npm run build`

### **CORS Errors**
- Check `_headers` file is in `dist/`
- Verify `Access-Control-Allow-Origin: *` is set
- Clear browser cache

### **High Latency**
- Enable Argo Smart Routing (paid Cloudflare feature)
- Check cache hit rate in Analytics
- Verify no cache-busting query strings

### **Widget Not Loading**
- Check browser console for 404/CORS errors
- Test direct URL: `https://cdn.yourdomain.com/widget.js`
- Verify API key and URL in script tag

---

## **Cost Estimate**

| Plan | Price | Bandwidth | Includes |
|------|-------|-----------|----------|
| Free | $0 | Unlimited | Basic CDN, SSL, Workers (10k req/day) |
| Pro | $20/mo | Unlimited | Advanced cache, Argo, Workers (10M req/day) |
| Business | $200/mo | Unlimited | Full features, SLA, DDoS protection |

**Recommendation:** Start with Free, upgrade to Pro once traffic exceeds 10k requests/day.

---

## **Version Management**

Update `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "build:version": "npm run build && echo $(date +%s) > dist/VERSION.txt",
    "deploy:cf-pages": "wrangler pages publish dist",
    "deploy:cf-workers": "wrangler publish"
  }
}
```

Create versioned CDN URLs:

```html
<!-- Version 1.0.0 -->
<script src="https://cdn.yourdomain.com/v1.0.0/widget.js" async></script>

<!-- Or use cache-buster for development -->
<script src="https://cdn.yourdomain.com/widget.js?v=1.0.0" async></script>
```

---

## **Next Steps**

1. ✅ Build: `npm run build`
2. ✅ Test locally with dev server
3. ✅ Create Cloudflare account
4. ✅ Set up Cloudflare Pages
5. ✅ Configure custom domain
6. ✅ Add `_headers` file
7. ✅ Deploy & test
8. ✅ Monitor analytics
9. ✅ Update embed code on websites

