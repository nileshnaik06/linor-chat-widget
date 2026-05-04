/**
 * widget.css.js
 * Styles for the launcher button and the main chat window frame.
 * Includes open/close animations and responsive breakpoints.
 *
 * @param {object} config — widget config (position, offsetX, offsetY, buttonSize,
 *                          windowWidth, windowHeight, zIndex)
 * @returns {string} CSS string
 */
export function widgetStyles(config) {
  const pos     = config.position   || 'bottom-right';
  const isLeft  = pos.includes('left');
  const isTop   = pos.includes('top');
  const x       = typeof config.offsetX     === 'number' ? config.offsetX     : 24;
  const y       = typeof config.offsetY     === 'number' ? config.offsetY     : 24;
  const btnSize = typeof config.buttonSize  === 'number' ? config.buttonSize  : 56;
  const winW    = typeof config.windowWidth === 'number' ? config.windowWidth : 380;
  const winH    = typeof config.windowHeight=== 'number' ? config.windowHeight: 580;

  // Gap between the launcher button and the chat window edge
  const GAP = 12;
  const windowEdge = y + btnSize + GAP;

  // CSS property names based on position
  const hProp   = isLeft ? 'left'   : 'right';
  const vProp   = isTop  ? 'top'    : 'bottom';

  // Animation direction: window slides toward/away from the button
  const slideY  = isTop  ? '-14px'  : '14px';

  // transform-origin corners
  const origin  = `${isTop ? 'top' : 'bottom'} ${isLeft ? 'left' : 'right'}`;

  // Mobile: small launcher position
  const mobileBtnSize = Math.max(btnSize - 4, 44);

  return `
    /* ===================================================
       LAUNCHER BUTTON
    =================================================== */

    .launcher {
      position: fixed;
      ${vProp}: ${y}px;
      ${hProp}: ${x}px;
      z-index: var(--z-widget);
      width: ${btnSize}px;
      height: ${btnSize}px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg,
        var(--primary) 0%,
        rgba(var(--primary-rgb), 0.82) 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-inverse);
      box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.45),
                  0 2px 6px rgba(0,0,0,0.12);
      transition: transform var(--transition-spring),
                  box-shadow var(--transition-base),
                  background var(--transition-base);
      outline: none;
      pointer-events: all;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      /* Gentle entrance — the button scales in from 0 on mount */
      animation: launcherIn 520ms cubic-bezier(0.22, 1.2, 0.36, 1) both,
                 launcherAttention 3.2s ease-in-out 1.2s 2;
    }

    @keyframes launcherIn {
      from { opacity: 0; transform: scale(0.2); }
      to   { opacity: 1; transform: scale(1);   }
    }

    /* Gentle two-pulse attention — plays twice after mount, then stops */
    @keyframes launcherAttention {
      0%, 100% { box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.45),
                             0 2px 6px rgba(0,0,0,0.12),
                             0 0 0 0 rgba(var(--primary-rgb), 0.35); }
      50%       { box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.45),
                              0 2px 6px rgba(0,0,0,0.12),
                              0 0 0 12px rgba(var(--primary-rgb), 0); }
    }

    .launcher:hover {
      transform: scale(1.07);
      box-shadow: 0 6px 22px rgba(var(--primary-rgb), 0.55),
                  0 3px 8px rgba(0,0,0,0.15);
    }

    .launcher:active {
      transform: scale(0.94);
    }

    .launcher:focus-visible {
      box-shadow: 0 0 0 3px var(--surface),
                  0 0 0 5px var(--primary);
    }

    /* Icon swap animation */
    .launcher__icon {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s ease, transform 0.25s ease;
      will-change: transform, opacity;
    }

    .launcher__icon--chat {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }

    .launcher__icon--close {
      opacity: 0;
      transform: scale(0.4) rotate(-90deg);
    }

    .launcher.is-open .launcher__icon--chat {
      opacity: 0;
      transform: scale(0.4) rotate(90deg);
    }

    .launcher.is-open .launcher__icon--close {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }

    /* Unread badge */
    .launcher__badge {
      position: absolute;
      top: -3px;
      right: -3px;
      min-width: 20px;
      height: 20px;
      border-radius: var(--radius-full);
      background: var(--error);
      color: var(--text-inverse);
      font-size: var(--font-size-xs);
      font-weight: 700;
      font-family: var(--font);
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
      border: 2px solid var(--surface);
      transform: scale(1);
      transition: transform var(--transition-spring), opacity var(--transition-base);
      pointer-events: none;
    }

    .launcher__badge[hidden] {
      transform: scale(0);
      opacity: 0;
      display: flex; /* override hidden so we can animate out */
    }

    /* ===================================================
       CHAT WINDOW
    =================================================== */

    .widget-window {
      position: fixed;
      ${vProp}: ${windowEdge}px;
      ${hProp}: ${x}px;
      z-index: var(--z-widget);
      width: ${winW}px;
      height: ${winH}px;
      max-height: calc(100dvh - ${windowEdge + 16}px);
      background: var(--surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      pointer-events: none;
      /* Animation start state */
      opacity: 0;
      transform: scale(0.93) translateY(${slideY});
      transform-origin: ${origin};
      transition: opacity 0.2s ease,
                  transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
      will-change: transform, opacity;
    }

    .widget-window.is-open {
      opacity: 1;
      transform: scale(1) translateY(0);
      pointer-events: all;
    }

    /* ===================================================
       RESPONSIVE — mobile
    =================================================== */

    @media (max-width: 480px) {
      .widget-window {
        width: calc(100vw - 16px);
        height: calc(100dvh - ${mobileBtnSize + y + GAP + 16}px);
        max-height: calc(100dvh - ${mobileBtnSize + y + GAP + 16}px);
        ${vProp}: ${mobileBtnSize + y + GAP}px;
        ${hProp}: 8px;
        ${isLeft ? 'right: 8px;' : 'left: 8px;'}
        border-radius: var(--radius-lg) var(--radius-lg) var(--radius-md) var(--radius-md);
        transform-origin: ${isTop ? 'top' : 'bottom'} center;
      }

      .launcher {
        ${vProp}: ${Math.max(y - 10, 8)}px;
        ${hProp}: ${Math.max(x - 10, 8)}px;
        width: ${mobileBtnSize}px;
        height: ${mobileBtnSize}px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .launcher { animation: launcherIn 280ms ease both !important; }
      .widget-window {
        transition: opacity 150ms ease !important;
        transform: none !important;
      }
    }
  `;
}
