/**
 * session.js
 * Manages chat session persistence via localStorage.
 *
 * A session stores:
 *  - sessionId: unique identifier sent to the backend with each request
 *  - messages:  conversation history (restored on page reload)
 *  - lastActive: timestamp for TTL expiry
 *
 * Sessions expire after `ttlHours` (default 24h) of inactivity.
 * Each widget instance (identified by apiKey) has its own session key.
 */

import storage from '../utils/storage.js';
import { generateSessionId } from '../utils/uid.js';

/**
 * Create a session manager bound to a specific apiKey.
 *
 * @param {string} apiKey  - Widget API key (used to namespace the storage key)
 * @param {number} ttlHours - Session lifetime in hours
 * @returns {{ load, save, clear, createNew }}
 */
export function createSession(apiKey, ttlHours) {
  const storageKey = `ai_widget_session_${apiKey}`;
  const ttlMs = ttlHours * 60 * 60 * 1000;

  function isExpired(lastActive) {
    return Date.now() - lastActive > ttlMs;
  }

  return {
    /**
     * Load a persisted session. Returns null if none exists or it has expired.
     * @returns {{ sessionId: string, messages: Array }|null}
     */
    load() {
      const data = storage.get(storageKey);
      if (!data) return null;
      if (isExpired(data.lastActive)) {
        storage.remove(storageKey);
        return null;
      }
      return {
        sessionId: data.sessionId,
        messages: Array.isArray(data.messages) ? data.messages : [],
      };
    },

    /**
     * Persist the current session state.
     * @param {string} sessionId
     * @param {Array}  messages
     */
    save(sessionId, messages) {
      storage.set(storageKey, {
        sessionId,
        messages,
        lastActive: Date.now(),
      });
    },

    /**
     * Clear the session (e.g., user clicked "clear chat").
     */
    clear() {
      storage.remove(storageKey);
    },

    /**
     * Generate a fresh session ID.
     * @returns {string}
     */
    createNew() {
      return generateSessionId();
    },
  };
}
