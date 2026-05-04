/**
 * a11y.js
 * Accessibility utilities:
 *  - Focus trap (keeps keyboard focus inside the open widget)
 *  - ARIA live region announcements (for screen readers)
 *  - Focusable element queries
 */

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Get all keyboard-focusable elements within a container.
 * @param {Element} container
 * @returns {Element[]}
 */
export function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.closest('[hidden]') && el.offsetParent !== null
  );
}

/**
 * Create a focus trap that keeps Tab/Shift+Tab cycling within a container.
 * The trap is inactive until `.activate()` is called.
 *
 * @param {Element} container - The element to trap focus inside
 * @returns {{ activate: Function, deactivate: Function }}
 */
export function createFocusTrap(container) {
  let active = false;

  function handleKeyDown(e) {
    if (!active || e.key !== 'Tab') return;

    const elements = getFocusableElements(container);
    if (elements.length === 0) {
      e.preventDefault();
      return;
    }

    const first = elements[0];
    const last = elements[elements.length - 1];
    // Use e.target for Shadow DOM compatibility — document.activeElement returns
    // the shadow host in closed mode, not the actual focused element inside.
    const current = e.target;

    if (e.shiftKey) {
      if (current === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (current === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  return {
    /**
     * Activate the trap and move focus to the first focusable element.
     * @param {Element} [initialFocusEl] - Override which element gets initial focus
     */
    activate(initialFocusEl) {
      active = true;
      container.addEventListener('keydown', handleKeyDown);

      const target = initialFocusEl || getFocusableElements(container)[0];
      if (target) {
        // Delay one frame to allow CSS transitions to complete
        requestAnimationFrame(() => target.focus());
      }
    },

    /**
     * Deactivate the trap and optionally restore focus to a previous element.
     * @param {Element} [restoreFocusEl] - Element to restore focus to
     */
    deactivate(restoreFocusEl) {
      active = false;
      container.removeEventListener('keydown', handleKeyDown);
      if (restoreFocusEl) {
        requestAnimationFrame(() => restoreFocusEl.focus());
      }
    },
  };
}

/**
 * Trigger a screen-reader announcement via an ARIA live region.
 * Uses a double-RAF technique to ensure the DOM mutation is picked up.
 *
 * @param {Element} liveRegion - An element with aria-live set
 * @param {string} message
 */
export function announce(liveRegion, message) {
  liveRegion.textContent = '';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  });
}
