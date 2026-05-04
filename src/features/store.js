/**
 * store.js
 * Minimal reactive state store — no framework, no dependencies.
 *
 * Pattern: subscribers are called synchronously after every setState.
 * Components subscribe to slices of state they care about.
 *
 * State shape:
 * {
 *   isOpen:     boolean           — whether the chat window is visible
 *   messages:   Message[]         — all conversation messages
 *   status:     'idle'|'loading'|'error'  — global request status
 *   error:      ErrorState|null   — current error details
 *   sessionId:  string            — active session identifier
 *   unreadCount: number           — messages received while widget is closed
 * }
 *
 * Message shape:
 * {
 *   id:        string
 *   role:      'user' | 'assistant'
 *   content:   string
 *   timestamp: number  (Unix ms)
 *   status:    'sending' | 'sent' | 'failed'
 * }
 *
 * ErrorState shape:
 * {
 *   message:   string
 *   retryable: boolean
 *   failedMessageId: string|null  — ID of the message that failed (for inline retry)
 * }
 */

/**
 * Create a store instance with the given initial state.
 * @param {object} initialState
 * @returns {{ getState, setState, subscribe }}
 */
export function createStore(initialState) {
  let state = { ...initialState };

  /** @type {Set<Function>} */
  const subscribers = new Set();

  return {
    /**
     * Get current state snapshot.
     * @returns {object}
     */
    getState() {
      return state;
    },

    /**
     * Merge partial state and notify all subscribers.
     * Accepts an object or an updater function (prev state → partial state).
     * @param {object|Function} partial
     */
    setState(partial) {
      const prev = state;
      const patch = typeof partial === 'function' ? partial(state) : partial;
      state = { ...state, ...patch };
      subscribers.forEach((fn) => fn(state, prev));
    },

    /**
     * Subscribe to state changes.
     * The callback receives (nextState, prevState).
     * @param {Function} fn
     * @returns {Function} Unsubscribe function
     */
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
  };
}

/**
 * Initial state factory — called once per widget instance.
 * @param {string} sessionId
 * @param {Array}  [persistedMessages=[]]
 * @returns {object}
 */
export function createInitialState(sessionId, persistedMessages = [], overrides = {}) {
  return {
    isOpen: false,
    messages: persistedMessages,
    status: 'idle',
    error: null,
    sessionId,
    unreadCount: 0,
    // Voice state
    voiceState: 'idle',          // 'idle' | 'listening' | 'speaking' | 'error'
    ttsEnabled: false,            // user-toggleable TTS (mirrors config.ttsDefaultOn)
    interimTranscript: '',        // live STT preview (non-final)
    sttSupported: false,
    ttsSupported: false,
    // Network
    online: true,
    // Human transfer state
    transferState: 'none',       // 'none' | 'requested' | 'connected' | 'ended'
    agentName: null,
    ...overrides,
  };
}
