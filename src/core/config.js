/**
 * config.js
 * Parses widget configuration from (in increasing priority):
 *   1. Built-in defaults
 *   2. window.__AI_WIDGET_CONFIG__ (legacy programmatic / dev mode)
 *   3. window.LinorConfig (preferred programmatic embed, matches portal snippets)
 *   4. data-* attributes on the <script> tag (CDN one-liner embed — highest priority)
 *
 * All keys are optional except apiKey and apiUrl.
 */

export const DEFAULTS = {
  botName: 'Assistant',
  primaryColor: '#6366f1',
  welcomeMessage: 'Hi! How can I help you today?',
  position: 'bottom-right',   // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  offsetX: 24,                // horizontal distance from the viewport edge (px)
  offsetY: 24,                // vertical distance from the viewport edge (px)
  zIndex: 2147483647,         // CSS z-index for the widget host
  buttonSize: 56,             // launcher button diameter (px)
  windowWidth: 380,           // chat window width (px, ignored on mobile)
  windowHeight: 580,          // chat window height (px, ignored on mobile)
  hideAttribution: false,     // set true to hide "Powered by AI Receptionist"
  avatarUrl: null,
  apiKey: null,
  apiUrl: null,
  sessionTtlHours: 24,
  maxRetries: 3,
  requestTimeoutMs: 30000,
  // Quick-reply chips shown on the empty welcome screen before the first message.
  // Set to [] to hide entirely.
  defaultSuggestions: [
    'Book an appointment',
    'Working hours',
    'Services offered',
    'Contact info',
  ],
  // Voice mode — browser-native Speech API
  enableVoice: true,           // show mic button (STT) when supported
  enableTTS: true,             // allow toggling spoken replies (off by default)
  ttsDefaultOn: false,         // initial TTS state
  voiceLang: 'en-US',          // BCP-47 language tag for STT + TTS
  // Subtle UI sound effects on send / receive / error
  enableSounds: false,
  soundVolume: 0.18,           // 0..1
};

/**
 * Convert a hex color string to "r, g, b" triplet for use in rgba().
 * Falls back to indigo if the input is malformed.
 * @param {string} hex
 * @returns {string} e.g. "99, 102, 241"
 */
export function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
  if (!result) return '99, 102, 241';
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ].join(', ');
}

/**
 * Parse and validate configuration.
 * @param {HTMLScriptElement|null} scriptEl — the <script> tag that loaded the widget
 * @returns {object} Merged and validated config
 */
export function parseConfig(scriptEl) {
  // 1. window.__AI_WIDGET_CONFIG__ — legacy programmatic / dev mode
  const legacyCfg =
    typeof window !== 'undefined' && window.__AI_WIDGET_CONFIG__
      ? window.__AI_WIDGET_CONFIG__
      : {};

  // 2. window.LinorConfig — preferred programmatic pattern (used by portal snippets)
  const linorCfg =
    typeof window !== 'undefined' && window.LinorConfig
      ? window.LinorConfig
      : {};

  // 3. Parse data-* attributes from the script element (CDN one-liner — highest priority)
  const attrCfg = {};
  if (scriptEl) {
    const get = (attr) => scriptEl.getAttribute(`data-${attr}`);
    const getInt = (attr) => { const v = parseInt(get(attr), 10); return isNaN(v) ? undefined : v; };

    if (get('api-key'))         attrCfg.apiKey            = get('api-key');
    if (get('api-url'))         attrCfg.apiUrl             = get('api-url');
    if (get('bot-name'))        attrCfg.botName            = get('bot-name');
    if (get('primary-color'))   attrCfg.primaryColor       = get('primary-color');
    if (get('welcome-message')) attrCfg.welcomeMessage     = get('welcome-message');
    if (get('position'))        attrCfg.position           = get('position');
    if (get('avatar-url'))      attrCfg.avatarUrl          = get('avatar-url');
    if (get('hide-attribution')) attrCfg.hideAttribution   = get('hide-attribution') !== 'false';
    const offsetX = getInt('offset-x'); if (offsetX !== undefined) attrCfg.offsetX = offsetX;
    const offsetY = getInt('offset-y'); if (offsetY !== undefined) attrCfg.offsetY = offsetY;
    const zIndex  = getInt('z-index');  if (zIndex  !== undefined) attrCfg.zIndex  = zIndex;
    const btnSize = getInt('button-size'); if (btnSize !== undefined) attrCfg.buttonSize = btnSize;
    const winW    = getInt('window-width');  if (winW  !== undefined) attrCfg.windowWidth  = winW;
    const winH    = getInt('window-height'); if (winH  !== undefined) attrCfg.windowHeight = winH;
    const sessTtl = getInt('session-ttl-hours'); if (sessTtl !== undefined) attrCfg.sessionTtlHours = sessTtl;
    const retries = getInt('max-retries'); if (retries !== undefined) attrCfg.maxRetries = retries;
    const timeout = getInt('request-timeout-ms'); if (timeout !== undefined) attrCfg.requestTimeoutMs = timeout;

    // defaultSuggestions: pipe-separated to avoid collisions with natural commas
    //   data-default-suggestions="Book an appointment|Working hours|Services"
    const rawSuggestions = get('default-suggestions');
    if (rawSuggestions != null) {
      attrCfg.defaultSuggestions = rawSuggestions
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4);
    }

    // Voice / sound flags (boolean "false" disables; anything else enables)
    if (get('enable-voice')   != null) attrCfg.enableVoice   = get('enable-voice')   !== 'false';
    if (get('enable-tts')     != null) attrCfg.enableTTS     = get('enable-tts')     !== 'false';
    if (get('tts-default-on') != null) attrCfg.ttsDefaultOn  = get('tts-default-on') !== 'false';
    if (get('enable-sounds')  != null) attrCfg.enableSounds  = get('enable-sounds')  !== 'false';
    if (get('voice-lang'))             attrCfg.voiceLang     = get('voice-lang');
  }

  // Merge priority: defaults < __AI_WIDGET_CONFIG__ < LinorConfig < data-* attrs
  const config = { ...DEFAULTS, ...legacyCfg, ...linorCfg, ...attrCfg };

  // Validate position value
  const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
  if (!validPositions.includes(config.position)) {
    console.warn(`[AI Widget] Invalid position "${config.position}". Falling back to "bottom-right".`);
    config.position = 'bottom-right';
  }

  // Compute derived values
  config.primaryRgb = hexToRgb(config.primaryColor);

  // Validation warnings
  if (!config.apiKey) {
    console.warn('[AI Widget] Missing api-key. Widget will be disabled. Set data-api-key on the script tag or window.LinorConfig.apiKey.');
  }
  if (!config.apiUrl) {
    console.warn('[AI Widget] Missing api-url. Widget will be disabled. Set data-api-url on the script tag or window.LinorConfig.apiUrl.');
  }

  return config;
}
