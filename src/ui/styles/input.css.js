/**
 * input.css.js
 * Styles for the message input area at the bottom of the chat window.
 *
 * @returns {string} CSS string
 */
export function inputStyles() {
  return `
    /* ===================================================
       INPUT CONTAINER (outer wrapper — stacks input row + footer)
    =================================================== */

    .input-container {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      background: var(--surface);
    }

    /* ===================================================
       INPUT AREA
    =================================================== */

    .input-area {
      padding: 10px 12px 12px;
      background: var(--surface);
      border-top: 1px solid var(--border);
      display: flex;
      align-items: flex-end;
      gap: 8px;
      flex-shrink: 0;
    }

    .input-wrapper {
      flex: 1;
      background: var(--surface-alt);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      display: flex;
      align-items: flex-end;
      overflow: hidden;
      transition: border-color var(--transition-fast),
                  box-shadow var(--transition-fast);
    }

    .input-wrapper:focus-within {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
      background: var(--surface);
    }

    .input-wrapper.is-disabled {
      opacity: 0.55;
      pointer-events: none;
      /* Subtle animated border shows the request is in-flight */
      border-color: rgba(var(--primary-rgb), 0.4);
      animation: inputPulse 1.8s ease-in-out infinite;
    }

    @keyframes inputPulse {
      0%, 100% { box-shadow: 0 0 0 0px rgba(var(--primary-rgb), 0); }
      50%       { box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.12); }
    }

    .input-textarea {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      padding: 8px 10px 8px 12px;
      font-family: var(--font);
      font-size: var(--font-size-md);
      color: var(--text-primary);
      resize: none;
      min-height: 36px;
      max-height: 116px;
      line-height: 1.5;
      display: block;
      width: 100%;
      overflow-y: auto;
      scrollbar-width: thin;
    }

    .input-textarea::placeholder {
      color: var(--text-tertiary);
    }

    .input-textarea::-webkit-scrollbar {
      width: 3px;
    }

    .input-textarea::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 2px;
    }

    /* Send button */
    .send-btn {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      border: none;
      background: var(--primary);
      color: var(--text-inverse);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background var(--transition-fast),
                  opacity var(--transition-fast),
                  transform var(--transition-spring);
    }

    .send-btn:disabled {
      background: var(--border);
      color: var(--text-tertiary);
      cursor: not-allowed;
      transform: none;
    }

    .send-btn:not(:disabled):hover {
      filter: brightness(0.87);
      transform: scale(1.06);
    }

    .send-btn:not(:disabled):active {
      transform: scale(0.93);
    }

    .send-btn:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    /* Footer attribution */
    .input-footer {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4px 0 0;
    }

    .input-footer__text {
      font-size: var(--font-size-2xs);
      color: var(--text-tertiary);
      letter-spacing: 0.2px;
    }

    .input-footer__text a {
      color: var(--text-tertiary);
      text-decoration: none;
    }

    .input-footer__text a:hover {
      text-decoration: underline;
    }

    /* ===================================================
       VOICE INPUT — mic button + listening pulse
    =================================================== */

    .voice-btn {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      border: none;
      background: transparent;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition:
        background var(--transition-fast),
        color var(--transition-fast),
        transform 120ms ease;
    }

    .voice-btn:hover {
      background: var(--surface-alt);
      color: var(--text-primary);
    }

    .voice-btn:active { transform: scale(0.92); }

    .voice-btn:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .voice-btn[hidden] { display: none !important; }

    /* Active "listening" state — red mic + animated rings */
    .voice-btn.is-listening {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error);
    }

    .voice-btn.is-listening::before,
    .voice-btn.is-listening::after {
      content: '';
      position: absolute;
      inset: 4px;
      border-radius: var(--radius-sm);
      border: 2px solid rgba(239, 68, 68, 0.55);
      pointer-events: none;
      animation: voicePulse 1.4s ease-out infinite;
    }

    .voice-btn.is-listening::after {
      animation-delay: 0.7s;
    }

    @keyframes voicePulse {
      0%   { transform: scale(0.92); opacity: 0.8; }
      100% { transform: scale(1.55); opacity: 0;   }
    }

    /* Interim transcript chip appearing above the input */
    .interim-transcript {
      margin: 0 12px 6px;
      padding: 7px 11px;
      background: rgba(var(--primary-rgb), 0.08);
      border: 1px dashed rgba(var(--primary-rgb), 0.4);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      color: var(--primary);
      font-style: italic;
      line-height: 1.4;
      display: flex;
      align-items: center;
      gap: 6px;
      animation: bannerSlideIn 220ms ease both;
    }

    .interim-transcript[hidden] { display: none !important; }

    .interim-transcript__dot {
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      border-radius: var(--radius-full);
      background: var(--error);
      animation: blink 1s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1;   }
      50%       { opacity: 0.3; }
    }

    /* ===================================================
       CHARACTER COUNTER
    =================================================== */

    .input-counter {
      font-size: 10px;
      color: var(--text-tertiary);
      font-weight: 500;
      padding: 0 8px 4px 0;
      text-align: right;
      opacity: 0;
      transition: opacity var(--transition-base), color var(--transition-fast);
    }

    .input-counter.is-visible { opacity: 1; }
    .input-counter.is-warn    { color: var(--warning); }
    .input-counter.is-limit   { color: var(--error); }

    /* ===================================================
       REDUCED MOTION
    =================================================== */

    @media (prefers-reduced-motion: reduce) {
      .voice-btn.is-listening::before,
      .voice-btn.is-listening::after,
      .interim-transcript__dot,
      .input-wrapper.is-disabled {
        animation: none !important;
      }
    }
  `;
}
