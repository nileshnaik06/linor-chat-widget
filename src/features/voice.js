/**
 * voice.js
 * Browser-native Speech-to-Text (SpeechRecognition) and Text-to-Speech
 * (SpeechSynthesis) wrapper. Capability-detected so the widget degrades
 * gracefully on unsupported browsers (e.g. Firefox, older Safari).
 *
 * API shape:
 *   const voice = createVoiceController({ lang, onResult, onError, onStateChange });
 *   voice.sttSupported / voice.ttsSupported     — booleans
 *   voice.startListening() / voice.stopListening()
 *   voice.speak(text) / voice.cancelSpeaking()
 *   voice.setMuted(flag)                         — suppresses further TTS
 *   voice.destroy()
 *
 * States surfaced via onStateChange('idle' | 'listening' | 'speaking' | 'error'):
 *   idle       — nothing in-flight
 *   listening  — mic open, capturing transcript
 *   speaking   — assistant voice playing
 *   error      — last op failed; auto-resets to idle
 *
 * Design notes:
 *  - Interim results stream via onResult({ text, isFinal: false }) for live UI.
 *  - A silence auto-stop (no speech for 2.5s) prevents stuck open mic on desktops
 *    that never fire an `end` event.
 *  - speak() sanitises text (strips emoji & markdown chars) because some voices
 *    read them literally ("asterisk asterisk").
 *  - Voice selection prefers local, natural-sounding voices for the requested lang.
 */

const SILENCE_TIMEOUT_MS = 2500;
// Avoid shouting emojis + stray markdown syntax chars at the listener.
const TTS_CLEAN_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}*_`~#>]/gu;

/** Detect the best available SpeechRecognition constructor (Chrome/Edge/Safari). */
function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/** Detect SpeechSynthesis availability. */
function hasSpeechSynthesis() {
  return typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && typeof window.SpeechSynthesisUtterance === 'function';
}

/**
 * Pick the best matching voice for a language tag.
 * Prefers: localService voices > name includes "Natural"/"Neural" > first match.
 * @param {SpeechSynthesisVoice[]} voices
 * @param {string} lang
 * @returns {SpeechSynthesisVoice|null}
 */
function pickVoice(voices, lang) {
  if (!Array.isArray(voices) || voices.length === 0) return null;
  const baseLang = (lang || '').split('-')[0].toLowerCase();

  const candidates = voices.filter((v) => {
    const vl = (v.lang || '').toLowerCase();
    return vl === lang.toLowerCase() || vl.startsWith(baseLang);
  });

  if (candidates.length === 0) return voices[0] || null;

  const score = (v) => {
    let s = 0;
    if (v.localService) s += 4;
    const n = (v.name || '').toLowerCase();
    if (/natural|neural|premium|enhanced|online/.test(n)) s += 3;
    if (/google|microsoft|samantha|alex/.test(n)) s += 2;
    if ((v.lang || '').toLowerCase() === lang.toLowerCase()) s += 1;
    return s;
  };

  return candidates.sort((a, b) => score(b) - score(a))[0];
}

/**
 * Create a voice controller instance.
 *
 * @param {object} opts
 * @param {string}  [opts.lang='en-US']
 * @param {(payload: { text: string, isFinal: boolean }) => void} opts.onResult
 * @param {(err: Error) => void} [opts.onError]
 * @param {(state: 'idle'|'listening'|'speaking'|'error') => void} [opts.onStateChange]
 * @returns {object}
 */
export function createVoiceController({
  lang = 'en-US',
  onResult = () => {},
  onError = () => {},
  onStateChange = () => {},
} = {}) {
  const SRCtor = getSpeechRecognitionCtor();
  const sttSupported = !!SRCtor;
  const ttsSupported = hasSpeechSynthesis();

  let recognition = null;
  let listening = false;
  let muted = false;
  let currentUtterance = null;
  let silenceTimer = null;
  let cachedVoice = null;

  // ── State surface ─────────────────────────────────────────────────────────
  function setState(s) {
    try { onStateChange(s); } catch (err) { console.error('[AI Widget] voice onStateChange error', err); }
  }

  // ── STT ───────────────────────────────────────────────────────────────────
  function createRecognition() {
    const r = new SRCtor();
    r.lang = lang;
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;

    r.onstart = () => {
      listening = true;
      setState('listening');
      resetSilenceTimer();
    };

    r.onresult = (evt) => {
      let interim = '';
      let finalText = '';
      for (let i = evt.resultIndex; i < evt.results.length; i++) {
        const res = evt.results[i];
        const transcript = res[0]?.transcript || '';
        if (res.isFinal) finalText += transcript;
        else interim += transcript;
      }
      resetSilenceTimer();
      if (finalText) {
        onResult({ text: finalText.trim(), isFinal: true });
      } else if (interim) {
        onResult({ text: interim.trim(), isFinal: false });
      }
    };

    r.onerror = (evt) => {
      clearSilenceTimer();
      listening = false;
      // `aborted` fires whenever we programmatically stop — not an error.
      if (evt.error === 'aborted' || evt.error === 'no-speech') {
        setState('idle');
        return;
      }
      setState('error');
      const msg = ({
        'not-allowed': 'Microphone access was denied.',
        'service-not-allowed': 'Speech service is unavailable.',
        'audio-capture': 'No microphone found.',
        'network': 'Network issue — voice input needs a connection.',
      })[evt.error] || `Voice input failed (${evt.error || 'unknown'}).`;
      try { onError(new Error(msg)); } catch {}
      // Snap back to idle so UI isn't stuck in error state.
      setTimeout(() => setState('idle'), 50);
    };

    r.onend = () => {
      clearSilenceTimer();
      listening = false;
      setState('idle');
    };

    return r;
  }

  function resetSilenceTimer() {
    clearSilenceTimer();
    silenceTimer = setTimeout(() => {
      if (listening && recognition) {
        try { recognition.stop(); } catch {}
      }
    }, SILENCE_TIMEOUT_MS);
  }

  function clearSilenceTimer() {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
  }

  function startListening() {
    if (!sttSupported) {
      onError(new Error('Voice input is not supported in this browser.'));
      return false;
    }
    if (listening) return true;

    // If TTS is playing, cut it off — two-way duplex is confusing.
    cancelSpeaking();

    try {
      recognition = createRecognition();
      recognition.start();
      return true;
    } catch (err) {
      // start() throws if called too quickly after a previous stop.
      setState('error');
      onError(err instanceof Error ? err : new Error('Could not start voice input.'));
      setTimeout(() => setState('idle'), 50);
      return false;
    }
  }

  function stopListening() {
    clearSilenceTimer();
    if (recognition && listening) {
      try { recognition.stop(); } catch {}
    }
  }

  // ── TTS ───────────────────────────────────────────────────────────────────
  function ensureVoice() {
    if (!ttsSupported) return null;
    if (cachedVoice) return cachedVoice;
    const voices = window.speechSynthesis.getVoices() || [];
    cachedVoice = pickVoice(voices, lang);
    return cachedVoice;
  }

  // Voices can load asynchronously; refresh the cache once they're ready.
  if (ttsSupported && 'onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      cachedVoice = null;
      ensureVoice();
    });
  }

  function speak(text) {
    if (!ttsSupported || muted || !text) return;
    const cleaned = String(text).replace(TTS_CLEAN_REGEX, '').trim();
    if (!cleaned) return;

    // Flush any previous utterance so we never overlap.
    cancelSpeaking();

    const utter = new window.SpeechSynthesisUtterance(cleaned);
    utter.lang = lang;
    utter.rate = 1.02;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    const voice = ensureVoice();
    if (voice) utter.voice = voice;

    utter.onstart = () => setState('speaking');
    utter.onend = () => {
      if (currentUtterance === utter) currentUtterance = null;
      setState('idle');
    };
    utter.onerror = () => {
      if (currentUtterance === utter) currentUtterance = null;
      setState('idle');
    };

    currentUtterance = utter;
    try {
      window.speechSynthesis.speak(utter);
    } catch (err) {
      currentUtterance = null;
      setState('idle');
    }
  }

  function cancelSpeaking() {
    if (!ttsSupported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    currentUtterance = null;
  }

  function setMuted(flag) {
    muted = !!flag;
    if (muted) cancelSpeaking();
  }

  function isMuted() {
    return muted;
  }

  function destroy() {
    stopListening();
    cancelSpeaking();
    recognition = null;
  }

  return {
    sttSupported,
    ttsSupported,
    startListening,
    stopListening,
    speak,
    cancelSpeaking,
    setMuted,
    isMuted,
    isListening: () => listening,
    destroy,
  };
}
