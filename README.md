# AI Receptionist — Embeddable Chatbot Widget

A production-grade embeddable chatbot widget. Ships as a single self-contained
`widget.js` file (IIFE). Fully isolated from host page styles via Shadow DOM.

---

## Quick Start

```bash
# Install dev dependencies
npm install

# Start the dev server with hot reload (demo page at http://localhost:3000)
npm run dev

# Build the production widget.js bundle
npm run build
# Output: dist/widget.js  (~15–25 KB gzipped)
```

---

## Embed

Add one `<script>` tag to any website:

```html
<script
  src="https://your-cdn.com/widget.js"
  data-api-key="sk-your-key"
  data-api-url="https://api.yourbackend.com/chat"
  data-bot-name="Aria"
  data-primary-color="#6366f1"
  data-welcome-message="Hi! How can I help you today?"
  data-avatar-url="https://example.com/avatar.png"
  data-position="bottom-right"
  async
></script>
```

### All Script Tag Attributes

| Attribute                | Required | Default                         | Description                          |
|--------------------------|----------|---------------------------------|--------------------------------------|
| `data-api-key`           | ✅        | —                               | Your API key (sent as Bearer token)  |
| `data-api-url`           | ✅        | —                               | POST endpoint for chat messages      |
| `data-bot-name`          | ❌        | `"Assistant"`                   | Display name in the header           |
| `data-primary-color`     | ❌        | `"#6366f1"`                     | Brand colour (hex)                   |
| `data-welcome-message`   | ❌        | `"Hi! How can I help you today?"` | Text shown before first message    |
| `data-avatar-url`        | ❌        | `null` (uses initials)          | URL for bot avatar image             |
| `data-position`          | ❌        | `"bottom-right"`                | Launcher position                    |
| `data-session-ttl-hours` | ❌        | `24`                            | Session persistence lifetime         |
| `data-max-retries`       | ❌        | `3`                             | API retry attempts                   |
| `data-request-timeout-ms`| ❌        | `30000`                         | Request timeout in milliseconds      |

---

## API Contract

**Request** — POST `{data-api-url}`

```json
{
  "messages": [
    { "role": "user",      "content": "Hello!" },
    { "role": "assistant", "content": "Hi there!" }
  ],
  "session_id": "sess_lx7y4z-a3k9"
}
```

Headers: `Authorization: Bearer <apiKey>`, `X-Widget-Session: <sessionId>`

**Response** — any of:

```json
{ "reply": "Hello! How can I help?" }
{ "message": "Hello! How can I help?" }
{ "content": "Hello! How can I help?" }
```

---

## Folder Structure

```
src/
├── index.js               Entry point (IIFE bootstrap)
├── core/
│   ├── config.js          Parse script tag attributes / window config
│   └── init.js            Mount Shadow DOM host to document.body
├── api/
│   ├── client.js          fetch wrapper: timeout, retry, error classes
│   └── chat.js            sendMessage() → assistant reply
├── features/
│   ├── store.js           Reactive state store (pub/sub)
│   └── session.js         localStorage session with TTL
├── ui/
│   ├── widget.js          Root orchestrator — wires store, bus, API, components
│   ├── components/
│   │   ├── launcher.js    Floating action button + unread badge
│   │   ├── header.js      Bot avatar, name, status, close button
│   │   ├── messages.js    Scrollable message list (reconciled updates)
│   │   ├── bubble.js      Single message bubble (user/assistant/failed)
│   │   ├── typing.js      Animated 3-dot typing indicator
│   │   ├── input.js       Auto-resize textarea + send button
│   │   └── error.js       Error banner with retry CTA
│   └── styles/
│       ├── base.css.js    Design tokens (CSS custom props)
│       ├── widget.css.js  Launcher + chat window layout + animations
│       ├── messages.css.js Header, bubbles, typing, error banner
│       └── input.css.js   Input area
└── utils/
    ├── dom.js             h() helper, escapeHtml, formatTime, getInitials
    ├── uid.js             generateId(), generateSessionId()
    ├── storage.js         Safe localStorage wrapper
    ├── events.js          Internal EventBus (pub/sub)
    ├── a11y.js            Focus trap (Shadow DOM-compatible), ARIA announce
    └── icons.js           Inline SVG icon strings (Heroicons)
```

---

## Programmatic Init (Dev / Headless)

Instead of script tag attributes, set config before the script loads:

```html
<script>
  window.__AI_WIDGET_CONFIG__ = {
    apiKey: 'sk-dev',
    apiUrl: 'https://api.example.com/chat',
    botName: 'Aria',
    primaryColor: '#6366f1',
    welcomeMessage: 'Hi! How can I help?',
  };
</script>
<script type="module" src="/src/index.js"></script>
```

---

## Architecture Notes

- **Isolation**: Closed Shadow DOM — zero CSS leakage to/from host page
- **State**: Tiny reactive store (pub/sub pattern, no framework)
- **Rendering**: Targeted DOM updates — bubble reconciliation via `Map<id, el>`
- **Retries**: Exponential backoff with jitter; 4xx errors not retried
- **Accessibility**: ARIA dialog, live region, keyboard nav (Esc/Enter), focus trap
- **Session**: localStorage keyed by `ai_widget_session_<apiKey>`, 24h TTL default
