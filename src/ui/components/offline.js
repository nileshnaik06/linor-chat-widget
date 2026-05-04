/**
 * offline.js
 * Slim banner shown when navigator.onLine flips to false.
 * Hidden by default — widget.js toggles it via store.online state updates.
 */

import { h } from '../../utils/dom.js';
import { ICON_OFFLINE } from '../../utils/icons.js';

/**
 * @param {object} store — reactive state store
 * @returns {{ el: HTMLElement, destroy: Function }}
 */
export function createOfflineBanner(store) {
  const el = h(
    'div',
    { class: 'offline-banner', role: 'status', 'aria-live': 'polite' },
    h('span', { html: ICON_OFFLINE, 'aria-hidden': 'true' }),
    h('span', null, 'You are offline — we will reconnect automatically')
  );
  el.setAttribute('hidden', '');

  function update(state, prev) {
    if (state.online === prev?.online) return;
    el.toggleAttribute('hidden', state.online !== false);
  }

  const unsubscribe = store.subscribe(update);

  return {
    el,
    destroy() { unsubscribe(); },
  };
}
