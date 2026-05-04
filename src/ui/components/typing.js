/**
 * typing.js
 * Animated typing / progress indicator shown while the assistant is
 * generating a response (status === 'loading').
 *
 * Progress stages (ms since loading started):
 *   0        — dots only (subtle, non-intrusive)
 *   1 500    — "Thinking…"
 *   5 000    — "Processing…"
 *   10 000   — "Almost ready…"
 *
 * The text fades in/out via CSS so transitions feel smooth.
 * All timers are cleared when loading ends, so stale text never
 * bleeds into the next request.
 */

import { h, getInitials } from '../../utils/dom.js';

// Progress stages: { delayMs, text }
const STAGES = [
  { delayMs: 1500,  text: 'Thinking\u2026'     },
  { delayMs: 5000,  text: 'Processing\u2026'   },
  { delayMs: 10000, text: 'Almost ready\u2026' },
];

/**
 * @param {object} store  — reactive state store
 * @param {object} config — widget config (botName, avatarUrl)
 * @returns {{ el: HTMLElement, destroy: Function }}
 */
export function createTypingIndicator(store, config) {
  // ── Bot mini-avatar ───────────────────────────────────────────────────────

  let avatarEl;
  if (config.avatarUrl) {
    avatarEl = h('div', { class: 'bubble-avatar' });
    const img = document.createElement('img');
    img.src = config.avatarUrl;
    img.alt = '';
    img.addEventListener('error', () => {
      img.replaceWith(document.createTextNode(getInitials(config.botName)));
    });
    avatarEl.appendChild(img);
  } else {
    avatarEl = h(
      'div',
      { class: 'bubble-avatar', 'aria-hidden': 'true' },
      getInitials(config.botName)
    );
  }

  // ── Dots ──────────────────────────────────────────────────────────────────

  const dotsEl = h(
    'div',
    { class: 'typing-dots', 'aria-hidden': 'true' },
    h('span', { class: 'typing-dot' }),
    h('span', { class: 'typing-dot' }),
    h('span', { class: 'typing-dot' })
  );

  // ── Progress text label ───────────────────────────────────────────────────

  const labelEl = h('span', {
    class: 'typing-label',
    'aria-live': 'polite',
  });

  // ── Inner bubble (dots + label side-by-side) ──────────────────────────────

  const bubbleEl = h(
    'div',
    { class: 'typing-bubble' },
    dotsEl,
    labelEl
  );

  // ── Root ──────────────────────────────────────────────────────────────────

  const el = h(
    'div',
    {
      class: 'typing-indicator',
      role: 'status',
      'aria-label': `${config.botName} is thinking`,
    },
    avatarEl,
    bubbleEl
  );

  el.setAttribute('hidden', '');

  // ── Stage timer management ────────────────────────────────────────────────

  let stageTimers = [];

  function startStages() {
    labelEl.textContent = '';
    labelEl.classList.remove('typing-label--visible');

    stageTimers = STAGES.map(({ delayMs, text }) =>
      setTimeout(() => {
        labelEl.textContent = text;
        labelEl.classList.add('typing-label--visible');
        // Announce each new stage to screen readers (a11y)
        el.setAttribute('aria-label', `${config.botName}: ${text}`);
      }, delayMs)
    );
  }

  function clearStages() {
    stageTimers.forEach(clearTimeout);
    stageTimers = [];
    labelEl.textContent = '';
    labelEl.classList.remove('typing-label--visible');
    el.setAttribute('aria-label', `${config.botName} is thinking`);
  }

  // ── State sync ────────────────────────────────────────────────────────────

  function update(state, prev) {
    if (state.status === prev?.status) return;

    if (state.status === 'loading') {
      el.removeAttribute('hidden');
      startStages();
    } else {
      el.setAttribute('hidden', '');
      clearStages();
    }
  }

  const unsubscribe = store.subscribe(update);

  function destroy() {
    clearStages();
    unsubscribe();
  }

  return { el, destroy };
}
