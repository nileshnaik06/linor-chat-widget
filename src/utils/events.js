/**
 * events.js
 * Lightweight internal publish/subscribe event bus.
 * Used for decoupled communication between UI components and the
 * widget orchestrator (e.g., "user submitted a message", "close requested").
 *
 * Components emit events; the orchestrator (widget.js) subscribes and
 * dispatches to the store + API layer — keeping components pure/dumb.
 */

/**
 * Create a new isolated event bus instance.
 * @returns {{ on, off, emit }}
 */
export function createEventBus() {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();

  return {
    /**
     * Subscribe to an event.
     * @param {string} event
     * @param {Function} fn
     * @returns {Function} Unsubscribe function
     */
    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(fn);
      return () => this.off(event, fn);
    },

    /**
     * Unsubscribe a specific handler from an event.
     * @param {string} event
     * @param {Function} fn
     */
    off(event, fn) {
      listeners.get(event)?.delete(fn);
    },

    /**
     * Emit an event with optional payload.
     * @param {string} event
     * @param {any} [data]
     */
    emit(event, data) {
      listeners.get(event)?.forEach((fn) => {
        try {
          fn(data);
        } catch (err) {
          console.error(`[AI Widget] EventBus error in handler for "${event}":`, err);
        }
      });
    },

    /**
     * Remove all listeners (useful for cleanup/destroy).
     */
    clear() {
      listeners.clear();
    },
  };
}
