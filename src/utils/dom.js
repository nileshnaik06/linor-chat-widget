/**
 * dom.js
 * Lightweight DOM helpers used across UI components.
 * Keeps component code readable while avoiding heavy framework overhead.
 */

/**
 * Create a DOM element with attributes, event listeners, and children.
 * Supports string children (text nodes) and Element children.
 *
 * @param {string} tag - HTML tag name
 * @param {object} [attrs={}] - Attributes and event handlers
 *   - Strings/numbers → setAttribute
 *   - Functions prefixed with "on" → addEventListener
 *   - "class" → className (convenience)
 *   - "style" string → style.cssText
 *   - "html" string → innerHTML (use with sanitized content only)
 * @param {...(string|Element|null|undefined)} children
 * @returns {HTMLElement}
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);

  // Normalize attrs to an empty object if null/undefined
  attrs = attrs || {};

  for (const [key, val] of Object.entries(attrs)) {
    if (val == null) continue;

    if (key === 'class') {
      el.className = val;
    } else if (key === 'style' && typeof val === 'string') {
      el.style.cssText = val;
    } else if (key === 'html') {
      el.innerHTML = val;
    } else if (key.startsWith('on') && typeof val === 'function') {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, val);
    } else {
      el.setAttribute(key, val);
    }
  }

  for (const child of children.flat(Infinity)) {
    if (child == null) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }

  return el;
}

/**
 * Set innerHTML safely — escapes text content.
 * Use this when you need to set text that may contain HTML special chars.
 * @param {string} text
 * @returns {string} HTML-escaped string
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format a timestamp as a relative human-readable string.
 * @param {number} timestamp - Unix ms
 * @returns {string} e.g. "just now", "2 min ago", "3:45 PM"
 */
export function formatTime(timestamp) {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;

  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Get initials from a name string (up to 2 chars).
 * @param {string} name
 * @returns {string} e.g. "Aria" → "A", "John Doe" → "JD"
 */
export function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
