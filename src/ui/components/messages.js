/**
 * messages.js
 * Scrollable messages list container.
 *
 * Handles:
 *  - Rendering message bubbles via createBubble()
 *  - Efficient reconciliation: add/update/keep bubbles without full re-render
 *  - Auto-scrolling to the latest message (unless user has scrolled up)
 *  - Welcome state (shown when there are no messages)
 *  - Typing indicator integration
 *  - ARIA live region for screen reader announcements
 */

import { h, getInitials } from '../../utils/dom.js';
import { announce } from '../../utils/a11y.js';
import { ICON_SPARKLES, ICON_ARROW_DOWN } from '../../utils/icons.js';
import { createBubble } from './bubble.js';
import { createTypingIndicator } from './typing.js';
import { createSuggestions } from './suggestions.js';

/**
 * @param {object} store  — reactive state store
 * @param {object} bus    — event bus
 * @param {object} config — widget config
 * @returns {{ el: HTMLElement, destroy: Function }}
 */
export function createMessages(store, bus, config) {
  // ── ARIA live region (screen readers announce new messages) ───────────────

  const liveRegion = h('div', {
    class: 'sr-only',
    'aria-live': 'polite',
    'aria-atomic': 'false',
    role: 'log',
  });

  // ── Welcome state ────────────────────────────────────────────────────────

  let welcomeAvatarEl;
  if (config.avatarUrl) {
    const img = document.createElement('img');
    img.src = config.avatarUrl;
    img.alt = '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';
    welcomeAvatarEl = h('div', { class: 'messages-welcome__avatar' }, img);
  } else {
    welcomeAvatarEl = h(
      'div',
      { class: 'messages-welcome__avatar' },
      getInitials(config.botName)
    );
  }

  // Starter chips — only visible in the empty welcome state.
  const starterChips = createSuggestions({
    suggestions: Array.isArray(config.defaultSuggestions) ? config.defaultSuggestions : [],
    bus,
    messageId: null,
    ariaLabel: 'Quick start options',
  });

  const welcomeTitle = h(
    'div',
    { class: 'messages-welcome__title' },
    `Hi, I'm ${config.botName}`
  );
  const welcomeHint = h(
    'div',
    { class: 'messages-welcome__hint' },
    h('span', { class: 'messages-welcome__hint-icon', html: ICON_SPARKLES }),
    'AI Assistant'
  );
  const welcomeEl = h(
    'div',
    { class: 'messages-welcome', 'aria-hidden': 'true' },
    welcomeAvatarEl,
    welcomeHint,
    welcomeTitle,
    h('p', { class: 'messages-welcome__text' }, config.welcomeMessage),
    starterChips.el
  );

  // ── Typing indicator ──────────────────────────────────────────────────────

  const { el: typingEl, destroy: destroyTyping } = createTypingIndicator(store, config);

  // ── Message list (virtual) ────────────────────────────────────────────────

  const listEl = h('div', { role: 'list', 'aria-label': 'Chat messages' });

  // ── Scroll-to-bottom pill ─────────────────────────────────────────────────

  const scrollBtnCount = h('span', { class: 'scroll-to-bottom__count' });
  scrollBtnCount.setAttribute('hidden', '');

  const scrollBtn = h(
    'button',
    {
      type: 'button',
      class: 'scroll-to-bottom',
      'aria-label': 'Jump to latest message',
    },
    h('span', { class: 'scroll-to-bottom__icon', html: ICON_ARROW_DOWN, 'aria-hidden': 'true' }),
    h('span', { class: 'scroll-to-bottom__label' }, 'Latest'),
    scrollBtnCount
  );

  // ── Root container ────────────────────────────────────────────────────────

  const el = h(
    'div',
    {
      class: 'messages-area',
      'aria-label': 'Messages',
      tabindex: '0',
    },
    welcomeEl,
    listEl,
    typingEl,
    scrollBtn,
    liveRegion
  );

  // ── Bubble map: id → { el, handle } ──────────────────────────────────────

  /** @type {Map<string, { el: HTMLElement, handle: object }>} */
  const bubbleMap = new Map();

  let isUserScrolled = false;
  let prevMessageCount = 0;
  let unseenCount = 0;

  function syncScrollPill() {
    const show = isUserScrolled;
    scrollBtn.classList.toggle('is-visible', show);
    if (!show) unseenCount = 0;
    updateScrollPillCount();
  }

  function updateScrollPillCount() {
    if (unseenCount > 0) {
      scrollBtnCount.textContent = unseenCount > 99 ? '99+' : String(unseenCount);
      scrollBtnCount.removeAttribute('hidden');
    } else {
      scrollBtnCount.setAttribute('hidden', '');
    }
  }

  // Detect if user has manually scrolled up
  el.addEventListener('scroll', () => {
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const wasScrolled = isUserScrolled;
    isUserScrolled = distanceFromBottom > 60;
    if (wasScrolled !== isUserScrolled) syncScrollPill();
  }, { passive: true });

  scrollBtn.addEventListener('click', () => {
    isUserScrolled = false;
    unseenCount = 0;
    scrollToBottom(true);
    syncScrollPill();
  });

  // ── Scroll helpers ────────────────────────────────────────────────────────

  function scrollToBottom(force = false) {
    if (!isUserScrolled || force) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }

  // ── Reconcile messages ────────────────────────────────────────────────────

  function reconcile(messages) {
    const currentIds = new Set(messages.map((m) => m.id));

    // Remove bubbles that no longer exist in state
    for (const [id, entry] of bubbleMap) {
      if (!currentIds.has(id)) {
        entry.el.remove();
        bubbleMap.delete(id);
      }
    }

    // Add or update bubbles
    messages.forEach((msg, index) => {
      const isLastInGroup =
        index === messages.length - 1 ||
        messages[index + 1]?.role !== msg.role;

      if (bubbleMap.has(msg.id)) {
        // Update existing bubble in-place
        const { handle } = bubbleMap.get(msg.id);
        handle.update(msg);
        handle.setAvatarVisible(msg.role === 'assistant' && isLastInGroup);
      } else {
        // Create new bubble
        const showAvatar = msg.role === 'assistant' && isLastInGroup;
        const handle = createBubble(msg, config, bus, showAvatar);
        listEl.appendChild(handle.el);
        bubbleMap.set(msg.id, { el: handle.el, handle });

        // Announce to screen readers
        if (msg.role === 'assistant') {
          announce(liveRegion, `${config.botName}: ${msg.content}`);
        }
      }
    });
  }

  // ── State sync ────────────────────────────────────────────────────────────

  function update(state, prev) {
    const messagesChanged = state.messages !== prev?.messages;
    const statusChanged = state.status !== prev?.status;

    if (messagesChanged) {
      const hasMessages = state.messages.length > 0;

      // Toggle welcome state
      welcomeEl.setAttribute('aria-hidden', String(hasMessages));
      welcomeEl.style.display = hasMessages ? 'none' : '';

      reconcile(state.messages);

      // Auto-scroll when new messages arrive — BUT respect user's explicit
      // scroll-up. Instead of yanking them back down, surface the scroll-pill
      // with an unseen-counter so they can jump at will.
      const isNewMessage = state.messages.length > prevMessageCount;
      if (isNewMessage) {
        if (isUserScrolled) {
          const newMsgs = state.messages.slice(prevMessageCount);
          const newAssistantMsgs = newMsgs.filter((m) => m.role === 'assistant').length;
          unseenCount += newAssistantMsgs;
          updateScrollPillCount();
        } else {
          scrollToBottom(true);
        }
      }
      prevMessageCount = state.messages.length;
    }

    if (statusChanged && state.status === 'loading') {
      // Scroll to show typing indicator
      scrollToBottom();
    }

    // aria-busy while loading
    el.setAttribute('aria-busy', String(state.status === 'loading'));
  }

  const unsubscribe = store.subscribe(update);

  // Render initial state
  update(store.getState(), null);

  // ── Cleanup ────────────────────────────────────────────────────────────────

  function destroy() {
    unsubscribe();
    destroyTyping();
    starterChips.destroy();
    bubbleMap.clear();
  }

  return { el, scrollToBottom, destroy };
}
