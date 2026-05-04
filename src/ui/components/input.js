/**
 * input.js
 * Message input area at the bottom of the chat window.
 *
 * Features:
 *  - Auto-resizing textarea (expands up to 4 lines, then scrolls)
 *  - Enter to send, Shift+Enter for newline
 *  - Disabled while status === 'loading'
 *  - Emits 'send' on the event bus with trimmed text
 *  - Clears after send
 *  - Optional voice mic button (Web Speech API) → emits 'voice-toggle'
 *  - Live interim transcript preview while listening
 *  - Character counter (appears near the limit)
 *  - Adaptive placeholder per status / voice / offline state
 *  - "Powered by AI Receptionist" attribution footer
 */

import { h } from '../../utils/dom.js';
import { ICON_SEND, ICON_MIC } from '../../utils/icons.js';

const MAX_CHARS = 2000;
const COUNTER_WARN_AT = 1700;

/**
 * @param {object} store  — reactive state store
 * @param {object} bus    — event bus
 * @param {object} config — widget config (botName, enableVoice, ...)
 * @returns {{ el: HTMLElement, focus: Function, destroy: Function }}
 */
export function createInput(store, bus, config) {
  // ── Textarea ──────────────────────────────────────────────────────────────

  const textarea = document.createElement('textarea');
  textarea.className = 'input-textarea';
  textarea.placeholder = `Message ${config.botName}…`;
  textarea.setAttribute('aria-label', 'Type a message');
  textarea.setAttribute('rows', '1');
  textarea.setAttribute('maxlength', String(MAX_CHARS));
  textarea.setAttribute('autocomplete', 'off');
  textarea.setAttribute('spellcheck', 'true');

  // ── Send button ───────────────────────────────────────────────────────────

  const sendBtn = h('button', {
    class: 'send-btn',
    type: 'button',
    'aria-label': 'Send message',
    html: ICON_SEND,
    disabled: '',
  });

  // ── Voice mic button (optional) ───────────────────────────────────────────

  const voiceBtn = h('button', {
    class: 'voice-btn',
    type: 'button',
    'aria-label': 'Start voice input',
    'aria-pressed': 'false',
    html: ICON_MIC,
  });
  // Hidden until the widget tells us voice is supported.
  voiceBtn.setAttribute('hidden', '');

  voiceBtn.addEventListener('click', () => {
    if (isDisabled()) return;
    bus.emit('voice-toggle');
  });

  // ── Input wrapper ─────────────────────────────────────────────────────────

  const inputWrapper = h('div', { class: 'input-wrapper' }, textarea);

  // ── Interim transcript chip ───────────────────────────────────────────────

  const interimDot = h('span', { class: 'interim-transcript__dot', 'aria-hidden': 'true' });
  const interimText = h('span', { class: 'interim-transcript__text' });
  const interimEl = h(
    'div',
    { class: 'interim-transcript', role: 'status', 'aria-live': 'polite' },
    interimDot,
    interimText
  );
  interimEl.setAttribute('hidden', '');

  // ── Character counter ─────────────────────────────────────────────────────

  const counterEl = h('div', { class: 'input-counter', 'aria-live': 'polite' });

  // ── Main input row ────────────────────────────────────────────────────────

  const el = h(
    'div',
    { class: 'input-area', role: 'form', 'aria-label': 'Message input' },
    inputWrapper,
    voiceBtn,
    sendBtn
  );

  // Container: stacks interim preview + input row + counter + footer
  const wrapper = h(
    'div',
    { class: 'input-container' },
    interimEl,
    el,
    counterEl
  );

  if (!config.hideAttribution) {
    wrapper.appendChild(
      h('div', { class: 'input-footer' },
        h('span', { class: 'input-footer__text' }, 'Powered by AI Receptionist')
      )
    );
  }

  // ── Auto-resize textarea ──────────────────────────────────────────────────

  function autoResize() {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  textarea.addEventListener('input', () => {
    autoResize();
    updateSendBtn();
    updateCounter();
  });

  function updateSendBtn() {
    const hasText = textarea.value.trim().length > 0;
    sendBtn.disabled = !hasText || isDisabled();
  }

  function updateCounter() {
    const len = textarea.value.length;
    const remaining = MAX_CHARS - len;
    counterEl.classList.toggle('is-visible', len >= COUNTER_WARN_AT);
    counterEl.classList.toggle('is-warn',  len >= COUNTER_WARN_AT && len < MAX_CHARS);
    counterEl.classList.toggle('is-limit', len >= MAX_CHARS);
    counterEl.textContent = `${remaining} left`;
  }

  // ── Submit logic ──────────────────────────────────────────────────────────

  function submit() {
    const text = textarea.value.trim();
    if (!text || isDisabled()) return;

    bus.emit('send', text);
    textarea.value = '';
    textarea.style.height = 'auto';
    sendBtn.disabled = true;
    updateCounter();
    textarea.focus();
  }

  sendBtn.addEventListener('click', submit);

  textarea.addEventListener('keydown', (e) => {
    // Toggle voice with Ctrl/Cmd + M — only when voice is visible
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
      if (!voiceBtn.hasAttribute('hidden') && !isDisabled()) {
        e.preventDefault();
        bus.emit('voice-toggle');
      }
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  });

  // ── Disabled state helpers ───────────────────────────────────────────────

  function isDisabled() {
    const s = store.getState();
    return s.status === 'loading' || s.online === false;
  }

  function setDisabled(disabled) {
    textarea.disabled = disabled;
    inputWrapper.classList.toggle('is-disabled', disabled);
    if (disabled) {
      sendBtn.disabled = true;
    } else {
      updateSendBtn();
    }
  }

  function setPlaceholder(state) {
    if (state.online === false) {
      textarea.placeholder = 'You are offline — messages will resume once reconnected';
    } else if (state.voiceState === 'listening') {
      textarea.placeholder = 'Listening… speak now or click mic to stop';
    } else if (state.status === 'loading') {
      textarea.placeholder = `${config.botName} is thinking…`;
    } else {
      textarea.placeholder = `Message ${config.botName}…`;
    }
  }

  function setVoiceUI(state) {
    const supported = state.sttSupported && config.enableVoice !== false;
    voiceBtn.toggleAttribute('hidden', !supported);

    const listening = state.voiceState === 'listening';
    voiceBtn.classList.toggle('is-listening', listening);
    voiceBtn.setAttribute('aria-pressed', String(listening));
    voiceBtn.setAttribute(
      'aria-label',
      listening ? 'Stop voice input' : 'Start voice input'
    );
  }

  function setInterimUI(state) {
    const show = state.voiceState === 'listening'
      && typeof state.interimTranscript === 'string'
      && state.interimTranscript.trim().length > 0;
    interimEl.toggleAttribute('hidden', !show);
    if (show) interimText.textContent = state.interimTranscript;
  }

  // ── State sync ────────────────────────────────────────────────────────────

  function update(state, prev) {
    if (state.status !== prev?.status || state.online !== prev?.online) {
      setDisabled(isDisabled());
    }
    if (
      state.status !== prev?.status ||
      state.online !== prev?.online ||
      state.voiceState !== prev?.voiceState
    ) {
      setPlaceholder(state);
    }
    if (
      state.voiceState !== prev?.voiceState ||
      state.sttSupported !== prev?.sttSupported
    ) {
      setVoiceUI(state);
    }
    if (
      state.interimTranscript !== prev?.interimTranscript ||
      state.voiceState !== prev?.voiceState
    ) {
      setInterimUI(state);
    }
  }

  const unsubscribe = store.subscribe(update);
  // Render initial state
  update(store.getState(), null);
  updateCounter();

  // ── Focus utility (called by widget.js when window opens) ──────────────────

  function focus() {
    requestAnimationFrame(() => textarea.focus());
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  function destroy() {
    unsubscribe();
  }

  return { el: wrapper, focus, destroy };
}
