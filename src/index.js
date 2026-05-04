/**
 * index.js — Widget entry point
 *
 * This file is the IIFE entry point bundled by Vite.
 *
 * IMPORTANT: document.currentScript is captured at the very top, before
 * any async operations, because it is only valid during synchronous script
 * execution. In the built IIFE (production), this runs as the script loads.
 * In dev mode (ES module via Vite), it will be null — config falls back
 * to window.__AI_WIDGET_CONFIG__ which is set in index.html.
 *
 * Execution order:
 *  1. Capture script element reference
 *  2. Wait for DOM to be ready
 *  3. Parse config
 *  4. Initialize widget
 */

import { parseConfig } from './core/config.js';
import { initWidget } from './core/init.js';

// Capture immediately — valid during synchronous IIFE execution in prod.
// Will be null in dev (ES module), handled gracefully in parseConfig.
const _scriptEl = typeof document !== 'undefined'
  ? document.currentScript
  : null;

function bootstrap() {
  const config = parseConfig(_scriptEl);

  if (!config.apiKey || !config.apiUrl) {
    // parseConfig already warned; bail silently rather than crashing the host page.
    return;
  }

  const api = initWidget(config);

  // Expose public API on window so integrators can call:
  //   window.LinorWidget.open()
  //   window.LinorWidget.close()
  //   window.LinorWidget.toggle()
  //   window.LinorWidget.destroy()
  //   window.LinorWidget.on('open' | 'close' | 'send', fn)
  if (api && typeof window !== 'undefined') {
    window.LinorWidget = api;
  }
}

// Handle both "script at end of body" and "async" script cases
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }
}
