/**
 * chat.js
 * Sends a chat message to the configured REST API endpoint.
 *
 * Request format (POST):
 * {
 *   message:   string                      — current user message text
 *   sessionId: string                      — for backend session tracking (camelCase)
 *   history:   [{ role, content }, ...]    — prior conversation turns (excluding current)
 * }
 *
 * Expected response format (any of):
 * { reply: string, suggestions?: string[] }
 * { message: string, suggestions?: string[] }
 * { content: string }
 *
 * `suggestions` is optional — when present, the widget renders them as
 * tap-to-send quick-reply chips below the assistant's message.
 *
 * Both 'x-api-key' and 'Authorization: Bearer <apiKey>' headers are sent.
 */

import { fetchWithTimeout, fetchWithRetry, ApiError } from './client.js';

/**
 * Send the conversation history and receive the assistant's reply.
 *
 * @param {Array<{ role: string, content: string }>} messages
 * @param {object} config — widget config (apiKey, apiUrl, sessionId, maxRetries, requestTimeoutMs)
 * @returns {Promise<{ reply: string, suggestions: string[] }>}
 */
export async function sendMessage(messages, config) {
  const { apiKey, apiUrl, sessionId, maxRetries, requestTimeoutMs } = config;

  const call = async () => {
    // Split the conversation into the current user message and prior history.
    // The backend expects: { message: string, sessionId, history: [] }
    const lastMessage = messages[messages.length - 1];
    const history = messages
      .slice(0, -1)
      .map(({ role, content }) => ({ role, content }));

    const response = await fetchWithTimeout(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Send the key via both headers so the backend accepts it regardless
          // of which header it is configured to read (x-api-key is the primary
          // backend convention; Authorization: Bearer is the widget convention).
          'x-api-key': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'X-Widget-Session': sessionId || '',
          'X-Widget-Version': '1.0.0',
        },
        body: JSON.stringify({
          message: lastMessage.content,
          sessionId,
          history,
        }),
      },
      requestTimeoutMs
    );

    if (!response.ok) {
      let errorText = '';
      try {
        const body = await response.json();
        errorText = body.error || body.message || JSON.stringify(body);
      } catch {
        errorText = await response.text().catch(() => `HTTP ${response.status}`);
      }
      throw new ApiError(errorText || `HTTP ${response.status}`, response.status);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new ApiError('Invalid JSON in API response', 200);
    }

    // Support multiple common response shapes
    const reply = data.reply ?? data.message ?? data.content ?? data.text ?? data.answer;
    if (typeof reply !== 'string' || reply.trim() === '') {
      throw new ApiError('Unrecognised response format from API', 200);
    }

    return {
      reply: reply.trim(),
      suggestions: sanitizeSuggestions(data.suggestions),
    };
  };

  return fetchWithRetry(call, maxRetries);
}

/**
 * Request a human agent transfer for the current session.
 *
 * @param {object} config — widget config (apiKey, apiUrl, sessionId)
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function requestHumanTransfer(config) {
  const { apiKey, apiUrl, sessionId, requestTimeoutMs } = config;

  // Derive the transfer endpoint: replace the last path segment with /transfer
  const baseUrl = apiUrl.replace(/\/[^/]*$/, '');
  const transferUrl = `${baseUrl}/transfer`;

  const response = await fetchWithTimeout(
    transferUrl,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ sessionId }),
    },
    requestTimeoutMs
  );

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try { const b = await response.json(); msg = b.message || msg; } catch {}
    throw new Error(msg);
  }

  return response.json();
}

/**
 * Sanitize a suggestions array coming from the API.
 * - Strings only, trimmed, non-empty
 * - De-duplicated (case-insensitive)
 * - Individually capped at 60 chars to prevent UI-breaking payloads
 * - Hard cap at 4 entries (matches backend contract + UI density)
 *
 * @param {unknown} raw
 * @returns {string[]}
 */
function sanitizeSuggestions(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const v = item.trim();
    if (!v) continue;
    const truncated = v.length > 60 ? v.slice(0, 60).trim() : v;
    const key = truncated.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(truncated);
    if (out.length >= 4) break;
  }
  return out;
}
