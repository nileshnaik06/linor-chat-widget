/**
 * storage.js
 * Safe wrapper around localStorage.
 * Handles environments where localStorage is unavailable (private browsing,
 * sandboxed iframes, storage quota exceeded) without throwing.
 */

const storage = {
  /**
   * Retrieve a parsed JSON value, or null if missing/invalid.
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Serialize and store a value. Returns true on success.
   * @param {string} key
   * @param {any} value
   * @returns {boolean}
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Remove a key. Silently ignores errors.
   * @param {string} key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Intentionally swallowed
    }
  },

  /**
   * Check if localStorage is available in this environment.
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const testKey = '__ai_widget_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
};

export default storage;
