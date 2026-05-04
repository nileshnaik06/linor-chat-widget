/**
 * bubble.js
 * Factory for a single message bubble element.
 *
 * Each bubble is created once and later updated in-place (status changes).
 * The messages component maintains a Map<id, BubbleHandle> for reconciliation.
 *
 * Supports:
 *  - User bubbles (right-aligned, primary colour)
 *  - Assistant bubbles (left-aligned, neutral, with mini avatar)
 *  - Status: 'sending' (dimmed), 'sent', 'failed' (error border + retry)
 *  - Timestamps
 */

import { h, escapeHtml, formatTime, getInitials } from '../../utils/dom.js';
import { ICON_RETRY, ICON_CHECK, ICON_CHECK_DOUBLE } from '../../utils/icons.js';
import { createSuggestions } from './suggestions.js';

/**
 * Create a message bubble element.
 *
 * @param {object} message   — { id, role, content, timestamp, status }
 * @param {object} config    — widget config (botName, avatarUrl, primaryColor)
 * @param {object} bus       — event bus (for retry click)
 * @param {boolean} showAvatar — whether to render the bot avatar (group-last only)
 * @returns {{ el: HTMLElement, update: Function }}
 */
export function createBubble(message, config, bus, showAvatar = true) {
  const isUser = message.role === 'user';

  // ── Bot mini-avatar (assistant only) ────────────────────────────────────

  let avatarEl = null;
  if (!isUser) {
    if (config.avatarUrl) {
      const img = document.createElement('img');
      img.src = config.avatarUrl;
      img.alt = '';
      avatarEl = h('div', { class: 'bubble-avatar' }, img);
      img.addEventListener('error', () => {
        img.replaceWith(document.createTextNode(getInitials(config.botName)));
      });
    } else {
      avatarEl = h(
        'div',
        {
          class: `bubble-avatar${showAvatar ? '' : ' bubble-avatar--hidden'}`,
          'aria-hidden': 'true',
        },
        getInitials(config.botName)
      );
    }
  }

  // ── Bubble text ──────────────────────────────────────────────────────────

  const textEl = h('div', { class: `bubble bubble--${isUser ? 'user' : 'assistant'}` });
  textEl.textContent = message.content;

  // ── Retry row (user bubbles only — assistant can never "fail to send") ────

  let retryRow = null;
  if (isUser) {
    retryRow = h('div', { class: 'bubble-retry-row', 'aria-live': 'polite' });
    retryRow.setAttribute('hidden', '');

    const retryBtn = h('button', {
      class: 'bubble-retry-btn',
      type: 'button',
      'aria-label': 'Retry sending this message',
      html: `${ICON_RETRY} Retry`,
    });
    retryBtn.addEventListener('click', () => {
      bus.emit('retry-message', { messageId: message.id, content: message.content });
    });

    const failedText = h('span', { class: 'bubble-retry-row__text' }, 'Failed to send.');
    retryRow.appendChild(failedText);
    retryRow.appendChild(retryBtn);
  }

  // ── Timestamp + delivery status ───────────────────────────────────────────

  const timeSpan = h('span', { class: 'bubble-meta__time' }, formatTime(message.timestamp));

  // Delivery check glyph — only for user bubbles, hidden until status=sent
  let statusGlyph = null;
  if (isUser) {
    statusGlyph = h('span', {
      class: 'bubble-meta__status',
      'aria-hidden': 'true',
      html: ICON_CHECK,
    });
    statusGlyph.setAttribute('hidden', '');
  }

  const metaEl = h(
    'div',
    {
      class: `bubble-meta bubble-meta--${isUser ? 'user' : 'assistant'}`,
      'aria-label': new Date(message.timestamp).toLocaleTimeString(),
    },
    timeSpan,
    statusGlyph
  );

  // ── Suggestion chips (assistant only) ─────────────────────────────────────
  // Created for every assistant bubble; self-hides when list is empty.

  let suggestionsHandle = null;
  if (!isUser) {
    suggestionsHandle = createSuggestions({
      suggestions: Array.isArray(message.suggestions) ? message.suggestions : [],
      bus,
      messageId: message.id,
    });
  }

  // ── Content wrapper (bubble + chips + retry + meta) ───────────────────────

  const contentChildren = [textEl];
  if (suggestionsHandle) contentChildren.push(suggestionsHandle.el);
  if (retryRow) contentChildren.push(retryRow);
  contentChildren.push(metaEl);
  const contentEl = h('div', { class: 'bubble-content' }, ...contentChildren);

  // ── Wrapper ───────────────────────────────────────────────────────────────

  const wrapperChildren = isUser
    ? [contentEl]
    : [avatarEl, contentEl];

  const el = h(
    'div',
    {
      class: `bubble-wrapper bubble-wrapper--${isUser ? 'user' : 'assistant'}`,
      role: 'listitem',
      'data-message-id': message.id,
    },
    ...wrapperChildren
  );

  // Initial status render
  applyStatus(message.status);

  // ── Status update (in-place) ──────────────────────────────────────────────

  function applyStatus(status) {
    textEl.classList.remove('bubble--sending', 'bubble--failed');

    if (status === 'sending') {
      textEl.classList.add('bubble--sending');
      if (retryRow) retryRow.setAttribute('hidden', '');
      if (statusGlyph) statusGlyph.setAttribute('hidden', '');
    } else if (status === 'failed') {
      textEl.classList.add('bubble--failed');
      if (retryRow) retryRow.removeAttribute('hidden');
      if (statusGlyph) statusGlyph.setAttribute('hidden', '');
    } else {
      // 'sent' (or any other non-error state) — show delivery glyph for user bubbles
      if (retryRow) retryRow.setAttribute('hidden', '');
      if (statusGlyph) {
        statusGlyph.innerHTML = status === 'delivered' ? ICON_CHECK_DOUBLE : ICON_CHECK;
        statusGlyph.classList.toggle('bubble-meta__status--delivered', status === 'delivered');
        statusGlyph.classList.toggle('bubble-meta__status--sent', status !== 'delivered');
        statusGlyph.removeAttribute('hidden');
      }
    }
  }

  /**
   * Update the bubble in-place when its message object changes.
   * @param {object} updatedMessage
   */
  function update(updatedMessage) {
    if (updatedMessage.content !== message.content) {
      textEl.textContent = updatedMessage.content;
      message.content = updatedMessage.content;
    }
    if (updatedMessage.status !== message.status) {
      message.status = updatedMessage.status;
      applyStatus(updatedMessage.status);
    }
    if (updatedMessage.timestamp !== message.timestamp) {
      message.timestamp = updatedMessage.timestamp;
      timeSpan.textContent = formatTime(updatedMessage.timestamp);
      metaEl.setAttribute(
        'aria-label',
        new Date(updatedMessage.timestamp).toLocaleTimeString()
      );
    }

    // Suggestions: cheap value-compare avoids spurious DOM churn.
    if (suggestionsHandle) {
      const nextList = Array.isArray(updatedMessage.suggestions)
        ? updatedMessage.suggestions
        : [];
      const prevList = Array.isArray(message.suggestions) ? message.suggestions : [];
      if (nextList.length !== prevList.length ||
          nextList.some((v, i) => v !== prevList[i])) {
        message.suggestions = nextList;
        suggestionsHandle.update({ suggestions: nextList, messageId: message.id });
      }
    }
  }

  /**
   * Show or hide the bot avatar (used for message group visual grouping).
   * @param {boolean} visible
   */
  function setAvatarVisible(visible) {
    if (avatarEl) {
      avatarEl.classList.toggle('bubble-avatar--hidden', !visible);
    }
  }

  return { el, update, setAvatarVisible };
}
