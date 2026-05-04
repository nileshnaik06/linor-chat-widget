/**
 * launcher.js
 * Floating action button that opens/closes the chat window.
 *
 * Responsibilities:
 *  - Renders the chat / close icon (animated swap)
 *  - Shows an unread badge when new messages arrive while closed
 *  - Emits 'toggle' on click
 *  - Updates its visual state from the store (isOpen, unreadCount)
 */

import { h } from '../../utils/dom.js';
import { ICON_CHAT, ICON_CLOSE } from '../../utils/icons.js';

/**
 * @param {object}   store  — reactive state store
 * @param {object}   bus    — internal event bus
 * @param {object}   config — widget config
 * @returns {{ el: HTMLButtonElement, destroy: Function }}
 */
export function createLauncher(store, bus, config) {
  // ── Build DOM ──────────────────────────────────────────────────────────────

  const iconChat = h('span', { class: 'launcher__icon launcher__icon--chat', html: ICON_CHAT });
  const iconClose = h('span', { class: 'launcher__icon launcher__icon--close', html: ICON_CLOSE });

  const badge = h('span', {
    class: 'launcher__badge',
    'aria-label': 'unread messages',
    role: 'status',
  });
  badge.setAttribute('hidden', '');

  const button = h(
    'button',
    {
      class: 'launcher',
      type: 'button',
      'aria-label': `Open chat with ${config.botName}`,
      'aria-expanded': 'false',
      'aria-haspopup': 'dialog',
    },
    iconChat,
    iconClose,
    badge
  );

  // ── Interactions ───────────────────────────────────────────────────────────

  const handleClick = () => bus.emit('toggle');
  button.addEventListener('click', handleClick);

  // ── State sync ─────────────────────────────────────────────────────────────

  function update(state, prev) {
    const openChanged = state.isOpen !== prev?.isOpen;
    const countChanged = state.unreadCount !== prev?.unreadCount;

    if (openChanged) {
      button.classList.toggle('is-open', state.isOpen);
      button.setAttribute('aria-expanded', String(state.isOpen));
      button.setAttribute(
        'aria-label',
        state.isOpen ? `Close chat` : `Open chat with ${config.botName}`
      );
    }

    if (countChanged || openChanged) {
      const count = state.unreadCount;
      const showBadge = count > 0 && !state.isOpen;

      if (showBadge) {
        badge.textContent = count > 99 ? '99+' : String(count);
        badge.removeAttribute('hidden');
        badge.setAttribute('aria-label', `${count} unread message${count !== 1 ? 's' : ''}`);
      } else {
        badge.setAttribute('hidden', '');
      }
    }
  }

  const unsubscribe = store.subscribe(update);

  // ── Cleanup ────────────────────────────────────────────────────────────────

  function destroy() {
    unsubscribe();
    button.removeEventListener('click', handleClick);
  }

  return { el: button, destroy };
}
