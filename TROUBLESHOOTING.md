# Cloudflare CDN Deployment - Troubleshooting Guide

## Common Errors & Solutions

### **Error 1: "401 Unauthorized" when deploying**

**Symptoms:**
```
Error: Invalid authentication token
```

**Causes:**
- Expired API token
- Wrong account ID
- Insufficient permissions

**Solutions:**

```bash
# 1. Re-login to Cloudflare
wrangler logout
wrangler login

# 2. Verify API token
wrangler whoami
# Should show your account info

# 3. Check environment variables
echo $CLOUDFLARE_API_TOKEN
# Should not be empty

# 4. Re-export if needed
export CLOUDFLARE_API_TOKEN="your-token-here"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
```

---

### **Error 2: "Project not found" when publishing**

**Symptoms:**
```
Error: Project "linor-widget-cdn" not found
```

**Causes:**
- Project doesn't exist yet
- Wrong project name
- Typo in project name

**Solutions:**

```bash
# 1. Create project first
wrangler pages project create linor-widget-cdn

# 2. List existing projects
wrangler pages project list

# 3. Deploy with correct name
wrangler pages publish dist --project-name=linor-widget-cdn

# 4. For custom domain, go to:
# Cloudflare Dashboard → Pages → linor-widget-cdn → Custom Domains
```

---

### **Error 3: "widget.js not found" after deployment**

**Symptoms:**
```
Error: 404 Not Found
URL: https://linor-widget-cdn.pages.dev/widget.js
```

**Causes:**
- Build didn't complete
- Files not copied to `dist/`
- Wrong build output directory

**Solutions:**

```bash
# 1. Verify build output
npm run build
ls -la dist/widget.js

# 2. Check file size (should be ~20-25 KB)
ls -lh dist/widget.js

# 3. Test widget locally first
npm run preview
# Visit http://localhost:4173/widget.js

# 4. Re-publish
wrangler pages publish dist --project-name=linor-widget-cdn

# 5. Verify upload
curl -I https://linor-widget-cdn.pages.dev/widget.js
# Should show 200 OK
```

---

### **Error 4: "CORS errors" in browser console**

**Symptoms:**
```
Access to XMLHttpRequest at 'https://your-api.com' from origin 'https://customer.com' 
has been blocked by CORS policy
```

**Causes:**
- API backend doesn't allow widget origin
- CORS headers not set on widget
- Wrong API URL in widget config

**Solutions:**

```bash
# 1. Check widget CORS headers
curl -I https://linor-widget-cdn.pages.dev/widget.js | grep -i access-control

# Should show:
# access-control-allow-origin: *
# access-control-allow-methods: GET, HEAD, OPTIONS

# 2. Fix backend API CORS (node example)
// In your API backend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

# 3. Test API CORS
curl -H "Origin: https://customer.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS https://your-api.com/v1/chat
# Should show 200 OK with CORS headers
```

---

### **Error 5: "Cache not working" / High latency**

**Symptoms:**
```
CF-Cache-Status: MISS (every request)
High latency (> 500ms)
```

**Causes:**
- Cache headers not set
- Query parameters changing each request
- Browser cache disabled
- Cache bypass in headers

**Solutions:**

```bash
# 1. Verify cache headers
curl -I https://linor-widget-cdn.pages.dev/widget.js

# Should show:
# Cache-Control: public, max-age=2592000, immutable
# CF-Cache-Status: HIT (after 2nd request)

# 2. Check _headers file exists
ls -la dist/_headers

# 3. Verify no cache-busting query strings in embed code
# ❌ WRONG (always cache miss):
# <script src="https://cdn.yourdomain.com/widget.js?t=123"></script>

# ✅ RIGHT (cached):
# <script src="https://cdn.yourdomain.com/widget.js"></script>

# 4. Clear Cloudflare cache
# In Cloudflare Dashboard:
# - Caching → Purge Cache → Purge Everything

# 5. Wait 30 seconds and test again
sleep 30
curl -I https://linor-widget-cdn.pages.dev/widget.js | grep CF-Cache-Status
# Should show HIT
```

---

### **Error 6: "502 Bad Gateway" / Upstream errors**

**Symptoms:**
```
Error 502: Bad Gateway
```

**Causes:**
- Origin server (Pages) is down
- Too many requests (rate limited)
- Region-specific issue

**Solutions:**

```bash
# 1. Check Cloudflare status
# Visit: https://www.cloudflarestatus.com/

# 2. Test origin directly
curl -I https://linor-widget-cdn.pages.dev/

# 3. Check Cloudflare error logs
# Dashboard → Pages → linor-widget-cdn → Analytics → Errors

# 4. Wait 1-2 minutes and retry
# Cloudflare usually auto-recovers

# 5. If persistent, re-deploy
wrangler pages publish dist --project-name=linor-widget-cdn
```

---

### **Error 7: "Custom domain not working"**

**Symptoms:**
```
Error: Unable to resolve cdn.yourdomain.com
or
404 Not Found on custom domain
```

**Causes:**
- DNS not configured
- SSL certificate not ready
- Domain not owned by Cloudflare

**Solutions:**

```bash
# 1. Verify domain is on Cloudflare
# You should see nameservers:
# NS1.CLOUDFLARE.COM
# NS2.CLOUDFLARE.COM

# 2. Check DNS records
nslookup cdn.yourdomain.com

# Should resolve to Cloudflare IP or Pages redirect

# 3. Wait for SSL certificate (5-10 min)
# Check in Cloudflare Dashboard:
# SSL/TLS → Edge Certificates → Search your domain

# 4. Clear browser cache
# Hard refresh: Ctrl+Shift+Del (Windows) or Cmd+Shift+Del (Mac)

# 5. Test DNS propagation
# https://www.whatsmydns.net/

# 6. If still failing, remove and re-add custom domain
# Dashboard → Pages → Custom Domains → Delete → Re-add
```

---

### **Error 8: "Bundle size too large" / Widget not loading**

**Symptoms:**
```
Uncompressed: > 30 KB
Or widget fails to initialize
```

**Causes:**
- Too many dependencies
- Source code not minified
- Duplicate code

**Solutions:**

```bash
# 1. Analyze bundle
npm run analytics

# 2. Check bundle size
npm run build
ls -lh dist/widget.js

# 3. If > 30 KB, optimize:
# - Remove unused dependencies
# - Check for tree-shaking
# - Use production mode: NODE_ENV=production npm run build

# 4. Rebuild with optimization
npm run build

# 5. Verify new size
ls -lh dist/widget.js
# Should be < 25 KB uncompressed, < 7 KB gzipped

# 6. Re-deploy
wrangler pages publish dist --project-name=linor-widget-cdn
```

---

### **Error 9: "Script loading very slowly" / Timeout**

**Symptoms:**
```
Widget takes > 3 seconds to load
Script timeout
```

**Causes:**
- Network latency
- Large bundle
- API endpoint slow
- Browser or network throttling

**Solutions:**

```bash
# 1. Test script loading speed
curl -w "Time: %{time_total}s\n" -o /dev/null \
     https://linor-widget-cdn.pages.dev/widget.js

# Should be < 0.5 seconds from Cloudflare edge

# 2. Test from different regions
# Use: https://tools.keycdn.com/curl

# 3. Check API response time
curl -w "Time: %{time_total}s\n" -o /dev/null \
     -X POST https://your-api.com/v1/chat

# API should respond < 1 second

# 4. Enable compression on browser
# Cloudflare should auto-gzip, verify:
curl -H "Accept-Encoding: gzip" -I \
     https://linor-widget-cdn.pages.dev/widget.js | grep content-encoding
# Should show: gzip or br (brotli)

# 5. Optimize API endpoint
# Add caching headers
# Reduce payload size
# Use CDN for API if possible
```

---

### **Error 10: "Widget code not running" / Initialization fails**

**Symptoms:**
```
Browser console shows nothing
Widget button doesn't appear
window.LinorWidget is undefined
```

**Causes:**
- Script tag not in HTML
- API key or URL missing
- JavaScript errors
- Browser console security policy

**Solutions:**

```bash
# 1. Verify script tag
# In HTML source, check:
<script src="https://cdn.yourdomain.com/widget.js" async></script>

# 2. Check browser console
# Open: F12 → Console → Look for errors

# 3. Verify config
# Add to your HTML BEFORE script tag:
<script>
  window.LinorConfig = {
    apiKey: 'sk-your-key',
    apiUrl: 'https://api.yourdomain.com/v1/chat',
    botName: 'Aria'
  };
</script>

# 4. Check API key format
# Should start with: sk-
# Not: Bearer token or JWT

# 5. Test API connectivity
curl -X POST https://your-api.com/v1/chat \
  -H "Authorization: Bearer sk-your-key" \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "sessionId": "sess_123"}'

# Should get a response

# 6. Enable debug logging
<script>
  // Add before widget script
  window.DEBUG_WIDGET = true;
</script>

# 7. Check for CSP violations
# Look in console for: "Refused to..."
# May need to update Content-Security-Policy header
```

---

## 🔍 Diagnostic Checklist

Run these checks systematically:

```bash
# 1. Verify build
[ -f dist/widget.js ] && echo "✓ Widget built" || echo "✗ Build missing"

# 2. Check file size
[ $(stat -f%z dist/widget.js 2>/dev/null || stat -c%s dist/widget.js) -lt 30000 ] && echo "✓ Size OK" || echo "✗ Size too large"

# 3. Verify upload
curl -s https://linor-widget-cdn.pages.dev/widget.js | head -c 5 | grep -q "var AI" && echo "✓ Deployed" || echo "✗ Deploy failed"

# 4. Check cache headers
curl -I https://linor-widget-cdn.pages.dev/widget.js | grep -q "max-age=2592000" && echo "✓ Cache headers OK" || echo "✗ Cache not configured"

# 5. Test CORS
curl -H "Origin: https://example.com" -I https://linor-widget-cdn.pages.dev/widget.js | grep -q "Access-Control-Allow-Origin" && echo "✓ CORS OK" || echo "✗ CORS missing"

# 6. Check API
curl -s https://your-api.com/health | grep -q "ok" && echo "✓ API online" || echo "✗ API down"
```

---

## 📞 Still Need Help?

If you've tried all solutions above:

1. **Check Cloudflare Docs:** https://developers.cloudflare.com/pages/
2. **Review Error Log:** Dashboard → Pages → Analytics → Errors
3. **Contact Support:**
   - Free: Cloudflare Community Forums
   - Paid: Priority Support in Cloudflare Dashboard
4. **Report Bug:** Open issue in GitHub repository

---

## 🚀 Quick Recovery Commands

```bash
# Full redeploy (nuclear option)
npm run build
wrangler pages publish dist --project-name=linor-widget-cdn --force

# Clear all caches
# Cloudflare Dashboard → Caching → Purge Cache → Purge Everything

# Test everything
npm run test:cdn
npm run analytics
```

