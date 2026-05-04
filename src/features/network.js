/**
 * network.js
 * Monitors navigator.onLine and broadcasts changes.
 * Components subscribe and react (show banner, disable send, etc.).
 *
 * Returns a minimal subscribe/isOnline API and a destroy() for cleanup.
 */

export function createNetworkMonitor() {
  const subscribers = new Set();
  const isBrowser = typeof window !== 'undefined';

  const getOnline = () => (isBrowser && typeof navigator !== 'undefined'
    ? navigator.onLine !== false
    : true);

  let online = getOnline();

  function notify() {
    const next = getOnline();
    if (next === online) return;
    online = next;
    subscribers.forEach((fn) => {
      try { fn(online); } catch (err) { console.error('[AI Widget] network listener error', err); }
    });
  }

  if (isBrowser) {
    window.addEventListener('online', notify);
    window.addEventListener('offline', notify);
  }

  return {
    isOnline: () => online,
    subscribe(fn) {
      subscribers.add(fn);
      // Push current state immediately for instant sync
      try { fn(online); } catch {}
      return () => subscribers.delete(fn);
    },
    destroy() {
      if (isBrowser) {
        window.removeEventListener('online', notify);
        window.removeEventListener('offline', notify);
      }
      subscribers.clear();
    },
  };
}
