/**
 * suggestions.js
 * Quick-reply chip row — a horizontal, wrap-capable list of tap-to-send buttons.
 *
 * Usage:
 *   const { el, update } = createSuggestions({ suggestions, bus, messageId });
 *   // call update({ suggestions, messageId }) when the attached message mutates
 *
 * The component is UI-only. All behaviour is delegated to the event bus:
 *   bus.emit('suggestion-click', { text, messageId })
 *
 * Accessibility:
 *  - role="group" with aria-label for screen reader announcement
 *  - each chip is a real <button> — Enter/Space/keyboard-navigable by default
 *  - disabled state visually + aria-disabled to communicate "in flight"
 */

import { h } from '../../utils/dom.js';

/**
 * @param {object}    params
 * @param {string[]}  params.suggestions  — initial chip labels
 * @param {object}    params.bus          — widget event bus
 * @param {string|null} [params.messageId] — associated assistant-message id (null for welcome-state chips)
 * @param {string}    [params.ariaLabel='Suggested replies']
 * @returns {{ el: HTMLElement, update: Function, setDisabled: Function, destroy: Function }}
 */
export function createSuggestions({
  suggestions = [],
  bus,
  messageId = null,
  ariaLabel = 'Suggested replies',
}) {
  const el = h('div', {
    class: 'suggestions',
    role: 'group',
    'aria-label': ariaLabel,
  });

  let currentMessageId = messageId;
  let isDisabled = false;

  function render(list) {
    // Empty state → collapse completely (no DOM noise)
    el.textContent = '';
    if (!Array.isArray(list) || list.length === 0) {
      el.setAttribute('hidden', '');
      return;
    }
    el.removeAttribute('hidden');

    list.forEach((label) => {
      const btn = h('button', {
        type: 'button',
        class: 'suggestion-chip',
        'aria-label': `Send: ${label}`,
      });
      btn.textContent = label;

      btn.addEventListener('click', () => {
        if (isDisabled) return;
        // Optimistically lock the entire row so a quick second tap can't
        // double-send (the store also collapses chips on handler execution).
        setDisabled(true);
        bus.emit('suggestion-click', {
          text: label,
          messageId: currentMessageId,
        });
      });

      el.appendChild(btn);
    });
  }

  function update({ suggestions: next = [], messageId: nextId = currentMessageId } = {}) {
    currentMessageId = nextId;
    isDisabled = false;
    render(next);
  }

  function setDisabled(disabled) {
    isDisabled = !!disabled;
    el.classList.toggle('suggestions--disabled', isDisabled);
    for (const btn of el.querySelectorAll('.suggestion-chip')) {
      btn.disabled = isDisabled;
      btn.setAttribute('aria-disabled', String(isDisabled));
    }
  }

  function destroy() {
    el.textContent = '';
  }

  render(suggestions);

  return { el, update, setDisabled, destroy };
}
