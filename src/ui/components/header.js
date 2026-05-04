/**
 * header.js
 * Chat window header bar.
 *
 * Displays:
 *  - Bot avatar (image or initials fallback) with online status dot
 *  - Bot name + "Active now" subtitle
 *  - Optional TTS (voice output) toggle — only when the browser supports it
 *    and config.enableTTS !== false
 *  - Close (chevron-down) button
 *
 * Emits:
 *  - 'close'        when the close button is clicked
 *  - 'tts-toggle'   when the speaker toggle is clicked
 */

import { h, getInitials } from '../../utils/dom.js';
import { ICON_CHEVRON_DOWN, ICON_VOLUME_ON, ICON_VOLUME_OFF, ICON_HUMAN } from '../../utils/icons.js';

/**
 * @param {object} store  — reactive state store (for ttsEnabled/ttsSupported)
 * @param {object} bus    — internal event bus
 * @param {object} config — widget config (botName, avatarUrl, enableTTS)
 * @returns {{ el: HTMLElement, destroy: Function }}
 */
export function createHeader(store, bus, config) {
  // ── Avatar ────────────────────────────────────────────────────────────────

  let avatarEl;
  if (config.avatarUrl) {
    const img = h('img', {
      class: 'header__avatar-img',
      src: config.avatarUrl,
      alt: `${config.botName} avatar`,
    });
    img.addEventListener('error', () => {
      img.replaceWith(makeFallbackAvatar());
    });
    avatarEl = img;
  } else {
    avatarEl = makeFallbackAvatar();
  }

  function makeFallbackAvatar() {
    return h(
      'span',
      { class: 'header__avatar-fallback', 'aria-hidden': 'true' },
      getInitials(config.botName)
    );
  }

  const statusDot = h('span', {
    class: 'header__status-dot',
    title: 'Online',
    'aria-hidden': 'true',
  });

  const avatarWrapper = h('div', { class: 'header__avatar' }, avatarEl, statusDot);

  // ── Info ──────────────────────────────────────────────────────────────────

  const nameEl = h('div', { class: 'header__name' }, config.botName);
  const subtitleEl = h('div', { class: 'header__subtitle' }, 'Active now');
  const infoEl = h('div', { class: 'header__info' }, nameEl, subtitleEl);

  // ── TTS / speaker toggle (optional) ───────────────────────────────────────

  const ttsBtn = h('button', {
    class: 'header__btn',
    type: 'button',
    'aria-label': 'Turn on voice responses',
    'aria-pressed': 'false',
    title: 'Voice responses',
    html: ICON_VOLUME_OFF,
  });
  ttsBtn.setAttribute('hidden', '');

  const handleTtsToggle = () => bus.emit('tts-toggle');
  ttsBtn.addEventListener('click', handleTtsToggle);

  function syncTtsButton(state) {
    const show = state.ttsSupported && config.enableTTS !== false;
    ttsBtn.toggleAttribute('hidden', !show);

    const on = !!state.ttsEnabled;
    ttsBtn.innerHTML = on ? ICON_VOLUME_ON : ICON_VOLUME_OFF;
    ttsBtn.setAttribute('aria-pressed', String(on));
    ttsBtn.setAttribute(
      'aria-label',
      on ? 'Turn off voice responses' : 'Turn on voice responses'
    );
    ttsBtn.title = on ? 'Voice responses: on' : 'Voice responses: off';
  }

  // ── Human transfer button (optional) ─────────────────────────────────────

  const transferBtn = h('button', {
    class: 'header__btn header__btn--transfer',
    type: 'button',
    'aria-label': 'Talk to a human agent',
    title: 'Talk to a human',
    html: ICON_HUMAN,
  });

  const handleTransfer = () => bus.emit('request-transfer');
  transferBtn.addEventListener('click', handleTransfer);

  function syncTransferButton(state) {
    const requested = state.transferState === 'requested';
    const connected = state.transferState === 'connected';
    const ended = state.transferState === 'ended';
    transferBtn.classList.toggle('is-active', requested || connected);
    transferBtn.disabled = requested || connected || ended;
    transferBtn.title = requested
      ? 'Connecting to agent…'
      : connected
      ? 'Agent is connected'
      : 'Talk to a human';
  }

  // ── Close button ──────────────────────────────────────────────────────────

  const closeBtn = h('button', {
    class: 'header__btn',
    type: 'button',
    'aria-label': 'Close chat',
    html: ICON_CHEVRON_DOWN,
  });

  const handleClose = () => bus.emit('close');
  closeBtn.addEventListener('click', handleClose);

  const actionsEl = h('div', { class: 'header__actions' }, ttsBtn, transferBtn, closeBtn);

  // ── Root ──────────────────────────────────────────────────────────────────

  const el = h('header', { class: 'header', role: 'banner' }, avatarWrapper, infoEl, actionsEl);

  // ── Reactive sync ─────────────────────────────────────────────────────────

  function update(state, prev) {
    if (
      state.ttsEnabled   !== prev?.ttsEnabled ||
      state.ttsSupported !== prev?.ttsSupported
    ) {
      syncTtsButton(state);
    }
    if (state.transferState !== prev?.transferState) {
      syncTransferButton(state);
    }
    if (state.agentName !== prev?.agentName && state.agentName) {
      subtitleEl.textContent = `${state.agentName} (Human)`;
    } else if (!state.agentName) {
      subtitleEl.textContent = state.transferState === 'requested'
        ? 'Connecting to agent…'
        : 'Active now';
    }
  }
  const unsubscribe = store.subscribe(update);
  syncTtsButton(store.getState());
  syncTransferButton(store.getState());

  // ── Cleanup ────────────────────────────────────────────────────────────────

  function destroy() {
    closeBtn.removeEventListener('click', handleClose);
    ttsBtn.removeEventListener('click', handleTtsToggle);
    transferBtn.removeEventListener('click', handleTransfer);
    unsubscribe();
  }

  return { el, destroy };
}
