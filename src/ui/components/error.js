/**
 * error.js
 * Global error banner shown above the input area.
 *
 * Displayed when state.error is non-null with a user-friendly message.
 * Shows a "Retry" button for retryable errors.
 * Can be dismissed by the user (sets error to null in store).
 *
 * Note: Per-message retry is handled inline in bubble.js.
 * This banner handles errors that aren't tied to a specific message
 * (e.g., session errors, network failures that occur before send).
 */

import { h } from '../../utils/dom.js';
import { ICON_ALERT, ICON_CLOSE } from '../../utils/icons.js';

/**
 * @param {object} store — reactive state store
 * @param {object} bus   — event bus
 * @returns {{ el: HTMLElement, destroy: Function }}
 */
export function createErrorBanner(store, bus) {
  // ── Elements ──────────────────────────────────────────────────────────────

  const iconEl = h('span', { class: 'error-banner__icon', html: ICON_ALERT, 'aria-hidden': 'true' });

  const textEl = h('span', { class: 'error-banner__text' });

  const retryBtn = h('button', {
    class: 'error-banner__retry',
    type: 'button',
    'aria-label': 'Retry',
  }, 'Retry');

  const dismissBtn = h('button', {
    class: 'error-banner__dismiss',
    type: 'button',
    'aria-label': 'Dismiss error',
    html: ICON_CLOSE,
  });

  const el = h(
    'div',
    {
      class: 'error-banner',
      role: 'alert',
      'aria-live': 'assertive',
    },
    iconEl,
    textEl,
    retryBtn,
    dismissBtn
  );

  el.setAttribute('hidden', '');

  // ── Interactions ──────────────────────────────────────────────────────────

  retryBtn.addEventListener('click', () => {
    bus.emit('retry-last');
  });

  dismissBtn.addEventListener('click', () => {
    bus.emit('dismiss-error');
  });

  // ── State sync ─────────────────────────────────────────────────────────────

  function update(state, prev) {
    if (state.error === prev?.error) return;

    if (state.error) {
      textEl.textContent = state.error.message;
      retryBtn.style.display = state.error.retryable ? '' : 'none';
      el.removeAttribute('hidden');
    } else {
      el.setAttribute('hidden', '');
    }
  }

  const unsubscribe = store.subscribe(update);

  // ── Cleanup ────────────────────────────────────────────────────────────────

  function destroy() {
    unsubscribe();
  }

  return { el, destroy };
}
