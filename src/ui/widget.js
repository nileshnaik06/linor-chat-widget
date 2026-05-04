/**
 * widget.js
 * Root component and application orchestrator.
 *
 * Responsibilities:
 *  1. Inject all styles into the Shadow DOM
 *  2. Create and mount all UI components
 *  3. Initialize the reactive store and session
 *  4. Wire event bus → store mutations → API calls
 *  5. Handle focus management (trap, restore) and Escape key
 *  6. Manage the unread badge counter
 *  7. Persist session on every state change
 *
 * This is the single place where business logic lives.
 * All components are dumb — they render state and emit events.
 */

import { createStore, createInitialState } from '../features/store.js';
import { createSession } from '../features/session.js';
import { createVoiceController } from '../features/voice.js';
import { createSoundController } from '../features/sounds.js';
import { createNetworkMonitor } from '../features/network.js';
import { sendMessage, requestHumanTransfer } from '../api/chat.js';
import { classifyError } from '../api/client.js';
import { createEventBus } from '../utils/events.js';
import { generateId } from '../utils/uid.js';
import { createFocusTrap } from '../utils/a11y.js';

import { baseStyles }     from './styles/base.css.js';
import { widgetStyles }   from './styles/widget.css.js';
import { messagesStyles } from './styles/messages.css.js';
import { inputStyles }    from './styles/input.css.js';

import { createLauncher }      from './components/launcher.js';
import { createHeader }        from './components/header.js';
import { createMessages }      from './components/messages.js';
import { createInput }         from './components/input.js';
import { createErrorBanner }   from './components/error.js';
import { createOfflineBanner } from './components/offline.js';

/**
 * Bootstrap the entire widget inside a Shadow DOM root.
 *
 * @param {ShadowRoot} shadow — closed shadow root created by init.js
 * @param {object}     config — parsed widget configuration
 */
export function createWidget(shadow, config) {
  // ── 1. Styles ──────────────────────────────────────────────────────────────

  const styleEl = document.createElement('style');
  styleEl.textContent = [
    baseStyles(config),
    widgetStyles(config),
    messagesStyles(),
    inputStyles(),
  ].join('\n');
  shadow.appendChild(styleEl);

  // ── 2. Session ─────────────────────────────────────────────────────────────

  const session = createSession(config.apiKey, config.sessionTtlHours);
  const persisted = session.load();
  const sessionId = persisted?.sessionId ?? session.createNew();
  const persistedMessages = persisted?.messages ?? [];

  // Attach sessionId to config so API calls can include it
  config.sessionId = sessionId;

  // ── 3. Network monitor ────────────────────────────────────────────────────

  const netMonitor = createNetworkMonitor();

  // ── 4. Voice controller (STT + TTS) ───────────────────────────────────────

  const voice = createVoiceController({
    lang: config.voiceLang || 'en-US',
    onResult: ({ text, isFinal }) => {
      if (isFinal) {
        store.setState({ interimTranscript: '' });
        if (text) bus.emit('send', text);
      } else {
        store.setState({ interimTranscript: text });
      }
    },
    onError: (err) => {
      store.setState({
        voiceState: 'idle',
        interimTranscript: '',
        error: { message: err.message, retryable: false, failedMessageId: null },
      });
    },
    onStateChange: (vs) => {
      // Clear interim once listening ends
      if (vs !== 'listening') {
        store.setState({ voiceState: vs, interimTranscript: '' });
      } else {
        store.setState({ voiceState: vs });
      }
    },
  });

  // ── 5. Sound controller ───────────────────────────────────────────────────

  const sounds = createSoundController({
    enabled: !!config.enableSounds,
    volume: typeof config.soundVolume === 'number' ? config.soundVolume : 0.18,
  });

  // ── 6. Store ──────────────────────────────────────────────────────────────

  const store = createStore(
    createInitialState(sessionId, persistedMessages, {
      sttSupported: voice.sttSupported,
      ttsSupported: voice.ttsSupported,
      ttsEnabled:   voice.ttsSupported && config.enableTTS !== false && !!config.ttsDefaultOn,
      online:       netMonitor.isOnline(),
    })
  );

  // Keep the voice controller mute state in sync with store.ttsEnabled.
  voice.setMuted(!store.getState().ttsEnabled);

  // Persist on every state change (debounced)
  let persistTimer = null;
  store.subscribe((state) => {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      session.save(state.sessionId, state.messages);
    }, 300);
  });

  // ── 7. Network → store sync ───────────────────────────────────────────────

  const unsubscribeNet = netMonitor.subscribe((online) => {
    store.setState({ online });
  });

  // ── 8. Event bus ──────────────────────────────────────────────────────────

  const bus = createEventBus();

  // ── 9. Create components ──────────────────────────────────────────────────

  const { el: launcherEl } = createLauncher(store, bus, config);

  const { el: headerEl, destroy: destroyHeader } = createHeader(store, bus, config);

  const { el: offlineEl, destroy: destroyOffline } = createOfflineBanner(store);

  const { el: messagesEl, scrollToBottom } = createMessages(store, bus, config);

  const { el: errorEl } = createErrorBanner(store, bus);

  const { el: inputEl, focus: focusInput } = createInput(store, bus, config);

  // ── 10. Assemble chat window ──────────────────────────────────────────────

  const chatWindow = document.createElement('div');
  chatWindow.className = 'widget-window';
  chatWindow.setAttribute('role', 'dialog');
  chatWindow.setAttribute('aria-modal', 'true');
  chatWindow.setAttribute('aria-label', `Chat with ${config.botName}`);
  chatWindow.setAttribute('aria-hidden', 'true');

  chatWindow.appendChild(headerEl);
  chatWindow.appendChild(offlineEl);
  chatWindow.appendChild(messagesEl);
  chatWindow.appendChild(errorEl);
  chatWindow.appendChild(inputEl);

  shadow.appendChild(chatWindow);
  shadow.appendChild(launcherEl);

  // ── 7. Focus management ────────────────────────────────────────────────────

  const focusTrap = createFocusTrap(chatWindow);
  let launcherFocusRef = launcherEl; // restore focus here on close

  // ── 8. Event bus handlers ──────────────────────────────────────────────────

  bus.on('toggle', () => {
    const { isOpen } = store.getState();
    if (isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  });

  bus.on('close', () => {
    closeWidget();
  });

  bus.on('send', (text) => {
    handleSend(text);
  });

  bus.on('retry-last', () => {
    const { messages } = store.getState();
    // Find the last failed user message and retry it
    const lastFailed = [...messages].reverse().find(
      (m) => m.role === 'user' && m.status === 'failed'
    );
    if (lastFailed) {
      retryMessage(lastFailed);
    }
  });

  bus.on('retry-message', ({ messageId, content }) => {
    const { messages } = store.getState();
    const msg = messages.find((m) => m.id === messageId);
    if (msg) {
      retryMessage(msg);
    }
  });

  bus.on('dismiss-error', () => {
    store.setState({ error: null });
  });

  bus.on('suggestion-click', ({ text, messageId }) => {
    // Collapse the chips on the originating message immediately so the user
    // can't double-tap; then route through the normal send flow.
    if (messageId) {
      store.setState((s) => ({
        messages: s.messages.map((m) =>
          m.id === messageId ? { ...m, suggestions: [] } : m
        ),
      }));
    }
    handleSend(text);
  });

  bus.on('voice-toggle', () => {
    const state = store.getState();
    if (state.status === 'loading') return; // don't let mic open during request
    if (state.voiceState === 'listening') {
      voice.stopListening();
    } else {
      // Stop any in-flight TTS so we don't capture the bot's own voice
      voice.cancelSpeaking();
      voice.startListening();
    }
  });

  bus.on('tts-toggle', () => {
    const nextEnabled = !store.getState().ttsEnabled;
    store.setState({ ttsEnabled: nextEnabled });
    voice.setMuted(!nextEnabled);
    // Politely cancel whatever is playing when turning off.
    if (!nextEnabled) voice.cancelSpeaking();
  });

  bus.on('request-transfer', () => {
    handleHumanTransfer();
  });

  // ── 9. Open / close ────────────────────────────────────────────────────────

  function openWidget() {
    store.setState({ isOpen: true, unreadCount: 0 });
    chatWindow.classList.add('is-open');
    chatWindow.removeAttribute('aria-hidden');
    focusTrap.activate(/* initial focus */ null);
    focusInput();
    scrollToBottom(true);

    // Announce to screen readers
    chatWindow.setAttribute('aria-label', `Chat with ${config.botName} — dialog`);
  }

  function closeWidget() {
    store.setState({ isOpen: false });
    chatWindow.classList.remove('is-open');
    chatWindow.setAttribute('aria-hidden', 'true');
    focusTrap.deactivate(launcherFocusRef);
    // Don't keep the mic / TTS running while the window is hidden —
    // avoids surprise audio from a "closed" widget.
    voice.stopListening();
    voice.cancelSpeaking();
  }

  // ── 10. Global Escape key listener (stored ref for cleanup) ─────────────────────

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape' && store.getState().isOpen) {
      closeWidget();
    }
  };
  document.addEventListener('keydown', handleEscapeKey);

  // ── 11. Human transfer flow ─────────────────────────────────────────────────

  let agentSocket = null;

  async function handleHumanTransfer() {
    const state = store.getState();
    if (state.transferState !== 'none') return;
    if (!config.apiKey || !config.apiUrl) return;

    store.setState({ transferState: 'requested', status: 'loading' });

    // Add a system message notifying the patient
    const systemMsg = {
      id: generateId(),
      role: 'assistant',
      content: '🔄 Connecting you to a human agent. Please hold on…',
      timestamp: Date.now(),
      status: 'sent',
      isSystem: true,
    };
    store.setState((s) => ({
      messages: [...s.messages, systemMsg],
      status: 'idle',
    }));

    try {
      await requestHumanTransfer(config);
    } catch (err) {
      store.setState({
        transferState: 'none',
        error: { message: 'Could not connect to a human agent right now. Please try again.', retryable: true, failedMessageId: null },
        status: 'error',
      });
      return;
    }

    // Connect via socket.io to receive agent messages in real time
    const socketUrl = config.apiUrl.replace(/\/api\/chat.*$/, '');
    try {
      // Dynamically load socket.io-client if the CDN or local version is available
      let io = typeof window !== 'undefined' && window.io;
      if (!io) {
        // Try loading from same origin as apiUrl
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = `${socketUrl}/socket.io/socket.io.js`;
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
        io = window.io;
      }
      if (io) {
        agentSocket = io(socketUrl, { transports: ['websocket', 'polling'] });

        agentSocket.on('connect', () => {
          agentSocket.emit('join-session', {
            sessionId: config.sessionId,
            tenantId: config.apiKey,
          });
        });

        agentSocket.on('agent-joined', ({ agentName }) => {
          store.setState({ transferState: 'connected', agentName });
          const joinMsg = {
            id: generateId(),
            role: 'assistant',
            content: `✅ ${agentName} has joined the conversation.`,
            timestamp: Date.now(),
            status: 'sent',
            isSystem: true,
          };
          store.setState((s) => ({ messages: [...s.messages, joinMsg] }));
          scrollToBottom(true);
        });

        agentSocket.on('new-message', ({ content, isHuman, agentName: aName }) => {
          if (!isHuman) return; // Patient's own messages are added optimistically
          const agentMsg = {
            id: generateId(),
            role: 'assistant',
            content,
            timestamp: Date.now(),
            status: 'sent',
          };
          store.setState((s) => ({ messages: [...s.messages, agentMsg] }));
          sounds.play('receive');
          if (!store.getState().isOpen) {
            store.setState((s) => ({ unreadCount: s.unreadCount + 1 }));
          }
          scrollToBottom(true);
        });

        agentSocket.on('session-ended', () => {
          store.setState({ transferState: 'ended', agentName: null });
          const endMsg = {
            id: generateId(),
            role: 'assistant',
            content: 'The conversation has been closed by the agent.',
            timestamp: Date.now(),
            status: 'sent',
            isSystem: true,
          };
          store.setState((s) => ({ messages: [...s.messages, endMsg] }));
          if (agentSocket) agentSocket.disconnect();
          agentSocket = null;
        });
      }
    } catch (socketErr) {
      // Socket failed — transfer still went through via REST, agent can view in portal
      console.warn('[AI Widget] Socket.IO unavailable; transfer request sent via REST.', socketErr);
    }
  }

  // ── 12. Send message flow ──────────────────────────────────────────────────

  async function handleSend(text) {
    const state = store.getState();
    if (state.status === 'loading') return;

    const userMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      status: 'sending',
    };

    // Optimistic update: add user message immediately
    store.setState((s) => ({
      messages: [...s.messages, userMessage],
      status: 'idle',
      error: null,
    }));

    sounds.play('send');

    // If human agent is connected, route through socket
    if (state.transferState === 'connected' && agentSocket?.connected) {
      agentSocket.emit('patient-message', {
        sessionId: config.sessionId,
        content: text,
      });
      store.setState((s) => ({
        messages: s.messages.map((m) =>
          m.id === userMessage.id ? { ...m, status: 'sent' } : m
        ),
      }));
      return;
    }

    // Normal AI flow
    store.setState({ status: 'loading' });
    await dispatchApiCall(userMessage);
  }

  async function retryMessage(failedMessage) {
    // Reset the failed message to 'sending'
    store.setState((s) => ({
      messages: s.messages.map((m) =>
        m.id === failedMessage.id ? { ...m, status: 'sending' } : m
      ),
      status: 'loading',
      error: null,
    }));

    await dispatchApiCall(failedMessage);
  }

  async function dispatchApiCall(userMessage) {
    // Mark user message as sent right before the API call
    store.setState((s) => ({
      messages: s.messages.map((m) =>
        m.id === userMessage.id ? { ...m, status: 'sent' } : m
      ),
    }));

    try {
      const currentMessages = store.getState().messages.filter(
        (m) => m.status !== 'failed'
      );

      const { reply, suggestions } = await sendMessage(currentMessages, config);

      const assistantMessage = {
        id: generateId(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        status: 'sent',
        suggestions, // rendered as chips below this bubble if non-empty
      };

      // Clear suggestions from every earlier assistant message — only the
      // most recent turn's chips are ever active (prevents stale chips).
      store.setState((s) => ({
        messages: [
          ...s.messages.map((m) =>
            m.role === 'assistant' && m.suggestions?.length
              ? { ...m, suggestions: [] }
              : m
          ),
          assistantMessage,
        ],
        status: 'idle',
        error: null,
      }));

      // Increment unread count if window is closed
      if (!store.getState().isOpen) {
        store.setState((s) => ({ unreadCount: s.unreadCount + 1 }));
      }

      // Receive chime + optional spoken reply.
      sounds.play('receive');
      if (store.getState().ttsEnabled) {
        voice.speak(reply);
      }

    } catch (err) {
      const errorDetails = classifyError(err);

      // Mark the user message as failed
      store.setState((s) => ({
        messages: s.messages.map((m) =>
          m.id === userMessage.id ? { ...m, status: 'failed' } : m
        ),
        status: 'error',
        error: {
          message: errorDetails.message,
          retryable: errorDetails.retryable,
          failedMessageId: userMessage.id,
        },
      }));

      sounds.play('error');
      console.error('[AI Widget] API call failed:', err);
    }
  }

  // ── 12. Restore persisted open state is intentionally NOT done ─────────────
  // The widget always starts closed. Open state is not persisted
  // as it would be jarring on page reload.

  // ── 13. Public API ────────────────────────────────────────────────────────────────

  function destroyWidget() {
    document.removeEventListener('keydown', handleEscapeKey);
    bus.clear();
    persistTimer && clearTimeout(persistTimer);
    try { unsubscribeNet(); } catch {}
    try { netMonitor.destroy(); } catch {}
    try { voice.destroy(); } catch {}
    try { sounds.destroy(); } catch {}
    try { destroyHeader(); } catch {}
    try { destroyOffline(); } catch {}
    try { if (agentSocket) agentSocket.disconnect(); } catch {}
  }

  return {
    open:    openWidget,
    close:   closeWidget,
    toggle:  () => (store.getState().isOpen ? closeWidget() : openWidget()),
    destroy: destroyWidget,
    on:      (event, fn) => bus.on(event, fn),
    off:     (event, fn) => bus.off(event, fn),
    getState: () => ({ ...store.getState() }),
  };
}
