/**
 * init.js
 * Bootstraps the widget:
 *  1. Creates the Shadow DOM host element
 *  2. Mounts it safely to document.body
 *  3. Delegates to the Widget root component for all further rendering
 *
 * This module is the only one that touches document.body directly.
 */

import { createWidget } from '../ui/widget.js';

const HOST_ID = 'ai-receptionist-widget-host';

/**
 * Initialize and mount the chatbot widget.
 * Safe to call multiple times — idempotent (returns existing public API on re-call).
 *
 * @param {object} config — parsed configuration from config.js
 * @returns {{ open, close, toggle, destroy, on, off, getState } | null}
 */
export function initWidget(config) {
  // Guard: prevent double-initialization — return existing instance if present
  if (document.getElementById(HOST_ID)) {
    console.warn('[AI Widget] Already initialized. Call window.LinorWidget.destroy() first to re-mount.');
    return typeof window !== 'undefined' ? window.LinorWidget || null : null;
  }

  // Create the host element that will contain the Shadow DOM
  const host = document.createElement('div');
  host.id = HOST_ID;

  // These styles ensure the host element itself doesn't affect page layout
  host.style.cssText = [
    'position: fixed',
    'z-index: 2147483647',
    'top: 0',
    'left: 0',
    'width: 0',
    'height: 0',
    'overflow: visible',
    'pointer-events: none',
  ].join('; ');

  // Attach a closed shadow root — prevents external JS from accessing internals
  const shadow = host.attachShadow({ mode: 'closed' });

  // Mount to body — safely, after the current script finishes
  document.body.appendChild(host);

  // Hand off to the Widget root component; get back the public API
  const api = createWidget(shadow, config);

  // Wrap destroy to also physically remove the host element from the DOM
  const innerDestroy = api.destroy;
  api.destroy = () => {
    innerDestroy();
    host.remove();
    if (typeof window !== 'undefined' && window.LinorWidget === api) {
      delete window.LinorWidget;
    }
  };

  return api;
}
