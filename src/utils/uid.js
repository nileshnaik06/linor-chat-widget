/**
 * uid.js
 * Generates unique identifiers for messages and sessions.
 * Uses a combination of timestamp + random suffix for uniqueness
 * without requiring crypto.randomUUID (broader browser support).
 */

/**
 * Generate a short unique ID suitable for message IDs.
 * e.g. "lx7y4z-a3k9"
 * @returns {string}
 */
export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generate a session ID with a descriptive prefix.
 * @returns {string}
 */
export function generateSessionId() {
  return `sess_${generateId()}`;
}
