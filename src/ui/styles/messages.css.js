/**
 * messages.css.js
 * Styles for the header, messages area, individual message bubbles,
 * typing indicator, and error banner.
 *
 * @returns {string} CSS string
 */
export function messagesStyles() {
  return `
    /* ===================================================
       HEADER
    =================================================== */

    .header {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 13px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      flex-shrink: 0;
    }

    .header__avatar {
      position: relative;
      flex-shrink: 0;
    }

    .header__avatar-img {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-full);
      object-fit: cover;
      display: block;
    }

    .header__avatar-fallback {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-full);
      background: var(--primary);
      color: var(--text-inverse);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-md);
      font-weight: 700;
      letter-spacing: -0.3px;
      flex-shrink: 0;
    }

    .header__status-dot {
      position: absolute;
      bottom: 1px;
      right: 1px;
      width: 10px;
      height: 10px;
      border-radius: var(--radius-full);
      background: var(--success);
      border: 2px solid var(--surface);
    }

    .header__info {
      flex: 1;
      min-width: 0;
    }

    .header__name {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }

    .header__subtitle {
      font-size: var(--font-size-xs);
      color: var(--success);
      font-weight: 500;
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .header__actions {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
    }

    .header__btn {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: background var(--transition-fast), color var(--transition-fast);
      padding: 0;
    }

    .header__btn:hover {
      background: var(--surface-alt);
      color: var(--text-primary);
    }

    .header__btn:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 1px;
    }

    .header__btn--transfer {
      color: var(--text-secondary);
    }
    .header__btn--transfer:hover:not(:disabled) {
      color: var(--primary);
      background: rgba(var(--primary-rgb), 0.1);
    }
    .header__btn--transfer.is-active {
      color: var(--primary);
      background: rgba(var(--primary-rgb), 0.12);
    }
    .header__btn--transfer:disabled {
      opacity: 0.5;
      cursor: default;
    }

    /* ===================================================
       MESSAGES AREA
    =================================================== */

    .messages-area {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      background: var(--surface-alt);
      scroll-behavior: smooth;
      overscroll-behavior: contain;
    }

    .messages-area::-webkit-scrollbar {
      width: 4px;
    }

    .messages-area::-webkit-scrollbar-track {
      background: transparent;
    }

    .messages-area::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.12);
      border-radius: 2px;
    }

    .messages-area::-webkit-scrollbar-thumb:hover {
      background: rgba(0,0,0,0.22);
    }

    /* Welcome / empty state */
    .messages-welcome {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 20px 12px 12px;
      gap: 8px;
    }

    .messages-welcome__avatar {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-full);
      background: var(--primary-light);
      border: 2px solid rgba(var(--primary-rgb), 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 4px;
    }

    .messages-welcome__text {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: 1.6;
      max-width: 260px;
    }

    /* Date / time separator between message groups */
    .date-separator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 10px 0 4px;
      padding: 0 2px;
    }

    .date-separator__line {
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    .date-separator__text {
      font-size: var(--font-size-2xs);
      color: var(--text-tertiary);
      font-weight: 500;
      white-space: nowrap;
      letter-spacing: 0.3px;
    }

    /* ===================================================
       MESSAGE BUBBLE
    =================================================== */

    .bubble-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 7px;
      max-width: 86%;
      margin-top: 2px;
    }

    .bubble-wrapper--user {
      margin-left: auto;
      flex-direction: row-reverse;
    }

    .bubble-wrapper--assistant {
      margin-right: auto;
    }

    /* Small bot avatar beside each assistant message */
    .bubble-avatar {
      width: 26px;
      height: 26px;
      border-radius: var(--radius-full);
      background: var(--primary);
      color: var(--text-inverse);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      flex-shrink: 0;
      margin-bottom: 2px;
      overflow: hidden;
    }

    .bubble-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bubble-avatar--hidden {
      visibility: hidden;
    }

    .bubble-content {
      display: flex;
      flex-direction: column;
    }

    .bubble {
      padding: 9px 13px;
      border-radius: var(--radius-md);
      font-size: var(--font-size-md);
      line-height: 1.55;
      word-break: break-word;
      overflow-wrap: break-word;
      transition: opacity var(--transition-base);
    }

    .bubble--user {
      background: var(--primary);
      color: var(--text-inverse);
      border-radius: var(--radius-md) var(--radius-md) var(--radius-sm) var(--radius-md);
    }

    .bubble--assistant {
      background: var(--surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md) var(--radius-md) var(--radius-md) var(--radius-sm);
    }

    /* Failed message state */
    .bubble--failed {
      background: var(--error-bg);
      border: 1.5px solid rgba(var(--error-rgb), 0.35);
      color: var(--text-primary);
      opacity: 0.9;
    }

    .bubble-retry-row {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 5px;
    }

    /* Critical: the 'hidden' attribute must actually hide the row —
       otherwise "Failed to send" bleeds into every successful message. */
    .bubble-retry-row[hidden] {
      display: none !important;
    }

    .bubble-retry-row__text {
      font-size: var(--font-size-xs);
      color: var(--error);
    }

    .bubble-retry-btn {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: none;
      border: none;
      padding: 2px 6px;
      font-size: var(--font-size-xs);
      font-family: var(--font);
      font-weight: 600;
      color: var(--error);
      cursor: pointer;
      border-radius: var(--radius-xs);
      transition: background var(--transition-fast);
    }

    .bubble-retry-btn:hover {
      background: rgba(var(--error-rgb), 0.1);
    }

    .bubble-retry-btn:focus-visible {
      outline: 2px solid var(--error);
      outline-offset: 1px;
    }

    /* Timestamp below each bubble */
    .bubble-meta {
      font-size: var(--font-size-2xs);
      color: var(--text-tertiary);
      margin-top: 3px;
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .bubble-meta--user {
      justify-content: flex-end;
    }

    .bubble-meta--assistant {
      justify-content: flex-start;
      padding-left: 1px;
    }

    /* Sending state: subtle pulse on user message */
    .bubble--sending {
      opacity: 0.7;
    }

    /* ===================================================
       SUGGESTION CHIPS
    =================================================== */

    /* Row container — horizontal, wraps on very narrow screens */
    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }

    .suggestions[hidden] {
      display: none;
    }

    /* Welcome-state chips: centered so they sit nicely under the greeting */
    .messages-welcome .suggestions {
      justify-content: center;
      margin-top: 12px;
    }

    .suggestion-chip {
      display: inline-flex;
      align-items: center;
      height: 30px;
      padding: 0 12px;
      background: var(--surface);
      border: 1.5px solid rgba(var(--primary-rgb), 0.35);
      border-radius: 100px;           /* pill */
      font-size: var(--font-size-xs);
      font-family: var(--font);
      font-weight: 500;
      color: var(--primary);
      cursor: pointer;
      white-space: nowrap;
      line-height: 1;
      user-select: none;
      -webkit-user-select: none;
      transition:
        background var(--transition-fast),
        border-color var(--transition-fast),
        color var(--transition-fast),
        transform 80ms ease,
        box-shadow var(--transition-fast),
        opacity var(--transition-fast);
      /* Entrance: fade + slight vertical drift */
      animation: chipIn 220ms ease both;
    }

    @keyframes chipIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0);   }
    }

    /* Stagger entrance for each chip */
    .suggestion-chip:nth-child(1) { animation-delay: 0ms;   }
    .suggestion-chip:nth-child(2) { animation-delay: 50ms;  }
    .suggestion-chip:nth-child(3) { animation-delay: 100ms; }
    .suggestion-chip:nth-child(4) { animation-delay: 150ms; }

    .suggestion-chip:hover {
      background: rgba(var(--primary-rgb), 0.08);
      border-color: var(--primary);
      box-shadow: 0 1px 4px rgba(var(--primary-rgb), 0.18);
    }

    .suggestion-chip:active {
      transform: scale(0.95);
      background: rgba(var(--primary-rgb), 0.14);
      box-shadow: none;
    }

    .suggestion-chip:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .suggestion-chip:disabled,
    .suggestions--disabled .suggestion-chip {
      opacity: 0.45;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* ===================================================
       TYPING INDICATOR
    =================================================== */

    .typing-indicator {
      display: flex;
      align-items: flex-end;
      gap: 7px;
      margin-top: 4px;
      margin-right: auto;
    }

    .typing-indicator[hidden] {
      display: none;
    }

    .typing-bubble {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md) var(--radius-md) var(--radius-md) var(--radius-sm);
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Dots wrapper (class renamed from typing-bubble to typing-dots) */
    .typing-dots {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: var(--radius-full);
      background: var(--text-tertiary);
      animation: typingBounce 1.3s infinite ease-in-out both;
    }

    .typing-dot:nth-child(1) { animation-delay: 0ms;   }
    .typing-dot:nth-child(2) { animation-delay: 160ms; }
    .typing-dot:nth-child(3) { animation-delay: 320ms; }

    @keyframes typingBounce {
      0%, 60%, 100% { transform: translateY(0);   opacity: 0.4; }
      30%            { transform: translateY(-5px); opacity: 1;   }
    }

    /* Progress stage label — fades in when text is set */
    .typing-label {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      font-weight: 500;
      white-space: nowrap;
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      transition:
        opacity 350ms ease,
        max-width 350ms ease;
    }

    .typing-label--visible {
      opacity: 1;
      max-width: 120px; /* generous cap; actual text is short */
    }

    /* ===================================================
       ERROR BANNER
    =================================================== */

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 14px;
      background: var(--error-bg);
      border-top: 1px solid rgba(var(--error-rgb), 0.2);
      border-bottom: 1px solid rgba(var(--error-rgb), 0.2);
      font-size: var(--font-size-sm);
      color: #991b1b;
      flex-shrink: 0;
    }

    .error-banner[hidden] {
      display: none;
    }

    .error-banner__icon {
      color: var(--error);
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .error-banner__text {
      flex: 1;
      line-height: 1.4;
    }

    .error-banner__retry {
      flex-shrink: 0;
      background: none;
      border: 1px solid rgba(var(--error-rgb), 0.4);
      border-radius: var(--radius-xs);
      padding: 3px 10px;
      font-size: var(--font-size-xs);
      font-family: var(--font);
      font-weight: 600;
      color: var(--error);
      cursor: pointer;
      white-space: nowrap;
      transition: background var(--transition-fast);
    }

    .error-banner__retry:hover {
      background: rgba(var(--error-rgb), 0.1);
    }

    .error-banner__retry:focus-visible {
      outline: 2px solid var(--error);
      outline-offset: 1px;
    }

    .error-banner__dismiss {
      flex-shrink: 0;
      background: none;
      border: none;
      padding: 2px;
      cursor: pointer;
      color: rgba(var(--error-rgb), 0.7);
      display: flex;
      align-items: center;
      border-radius: var(--radius-xs);
      transition: color var(--transition-fast);
    }

    .error-banner__dismiss:hover {
      color: var(--error);
    }

    .error-banner__dismiss:focus-visible {
      outline: 2px solid var(--error);
      outline-offset: 1px;
    }

    /* ===================================================
       BUBBLE ENTRANCE ANIMATION
    =================================================== */

    .bubble-wrapper {
      animation: bubbleIn 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes bubbleIn {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.985);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .bubble-wrapper--user .bubble {
      background: linear-gradient(135deg,
        var(--primary) 0%,
        rgba(var(--primary-rgb), 0.88) 100%);
      box-shadow: 0 1px 2px rgba(var(--primary-rgb), 0.3),
                  0 4px 12px rgba(var(--primary-rgb), 0.18);
    }

    /* ===================================================
       READ RECEIPTS (inline with timestamp)
    =================================================== */

    .bubble-meta__status {
      display: inline-flex;
      align-items: center;
      color: var(--text-tertiary);
      transition: color var(--transition-base);
    }

    .bubble-meta__status--sent {
      color: var(--text-tertiary);
    }

    .bubble-meta__status--delivered {
      color: var(--primary);
    }

    .bubble-meta__status[hidden] { display: none !important; }

    /* ===================================================
       HEADER — refined avatar + extra actions
    =================================================== */

    .header {
      background: linear-gradient(180deg,
        var(--surface) 0%,
        rgba(var(--primary-rgb), 0.015) 100%);
    }

    .header__avatar-fallback {
      background: linear-gradient(135deg,
        var(--primary) 0%,
        rgba(var(--primary-rgb), 0.78) 100%);
      box-shadow: 0 2px 6px rgba(var(--primary-rgb), 0.28);
    }

    .header__status-dot {
      animation: statusPulse 2.4s ease-in-out infinite;
    }

    @keyframes statusPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45); }
      50%       { box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
    }

    .header__btn[aria-pressed="true"] {
      background: rgba(var(--primary-rgb), 0.12);
      color: var(--primary);
    }

    /* ===================================================
       WELCOME CARD — richer starter screen
    =================================================== */

    .messages-welcome {
      padding: 28px 16px 16px;
      gap: 10px;
    }

    .messages-welcome__avatar {
      background: linear-gradient(135deg,
        rgba(var(--primary-rgb), 0.14) 0%,
        rgba(var(--primary-rgb), 0.28) 100%);
      border-color: rgba(var(--primary-rgb), 0.28);
      box-shadow: 0 4px 14px rgba(var(--primary-rgb), 0.18);
      animation: welcomeAvatarIn 420ms cubic-bezier(0.22, 1.2, 0.36, 1) both;
    }

    @keyframes welcomeAvatarIn {
      from { opacity: 0; transform: scale(0.6); }
      to   { opacity: 1; transform: scale(1);   }
    }

    .messages-welcome__title {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.3px;
      margin-top: 2px;
    }

    .messages-welcome__text {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: 1.55;
      max-width: 280px;
    }

    .messages-welcome__hint {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      margin-top: 4px;
      font-size: var(--font-size-2xs);
      font-weight: 600;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      color: var(--primary);
      background: rgba(var(--primary-rgb), 0.1);
      border-radius: var(--radius-full);
    }

    .messages-welcome__hint svg { flex-shrink: 0; }

    /* ===================================================
       SCROLL-TO-BOTTOM FLOATING PILL
    =================================================== */

    .scroll-to-bottom {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%) translateY(8px);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px 5px 10px;
      background: var(--surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-family: var(--font);
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transition: opacity 180ms ease, transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
      z-index: 3;
    }

    .scroll-to-bottom.is-visible {
      opacity: 1;
      pointer-events: all;
      transform: translateX(-50%) translateY(0);
    }

    .scroll-to-bottom:hover {
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
      border-color: rgba(var(--primary-rgb), 0.3);
      color: var(--primary);
    }

    .scroll-to-bottom__count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      background: var(--primary);
      color: var(--text-inverse);
      border-radius: var(--radius-full);
      font-size: 9px;
      font-weight: 700;
    }

    .scroll-to-bottom__count[hidden] { display: none !important; }

    /* Messages area needs to be positioning context for the pill */
    .messages-area {
      position: relative;
    }

    /* ===================================================
       OFFLINE BANNER
    =================================================== */

    .offline-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 7px 14px;
      background: #fef3c7;
      color: #92400e;
      border-bottom: 1px solid rgba(245, 158, 11, 0.3);
      font-size: var(--font-size-xs);
      font-weight: 600;
      flex-shrink: 0;
      animation: bannerSlideIn 240ms ease both;
    }

    .offline-banner[hidden] { display: none !important; }

    @keyframes bannerSlideIn {
      from { opacity: 0; transform: translateY(-100%); }
      to   { opacity: 1; transform: translateY(0);    }
    }

    /* ===================================================
       TYPING INDICATOR — enhanced
    =================================================== */

    .typing-bubble {
      background: linear-gradient(135deg,
        var(--surface) 0%,
        var(--surface-alt) 100%);
      animation: bubbleIn 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .typing-dot {
      background: linear-gradient(135deg,
        var(--primary) 0%,
        rgba(var(--primary-rgb), 0.7) 100%);
    }

    .typing-label--visible {
      color: var(--primary);
    }

    /* ===================================================
       RESPECT REDUCED MOTION
    =================================================== */

    @media (prefers-reduced-motion: reduce) {
      .bubble-wrapper,
      .typing-bubble,
      .messages-welcome__avatar,
      .offline-banner,
      .suggestion-chip {
        animation: none !important;
      }
      .header__status-dot { animation: none !important; }
    }
  `;
}
