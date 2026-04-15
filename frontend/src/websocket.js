import { Client } from "@stomp/stompjs";

const WS_URL = "ws://localhost:8080/ws";

/**
 * Decodes the userId (JWT `sub` claim) from an access token without any
 * external library.  JWT payloads are base64url-encoded JSON; we handle
 * the two URL-safe substitutions (+, /) before calling atob().
 *
 * @param   {string} token  — the raw JWT string
 * @returns {string|null}   — the userId UUID, or null if decoding fails
 */
export function decodeUserId(token) {
  try {
    // base64url → base64 (replace URL-safe chars, pad if needed)
    const b64 = token
      .split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const payload = JSON.parse(atob(b64));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

/**
 * Opens a STOMP-over-native-WebSocket connection to the backend and
 * subscribes to the current user's personal reminder topic.
 *
 * The backend endpoint /ws accepts native WebSocket upgrades (no SockJS
 * wrapper needed).  The JWT is sent in the STOMP CONNECT frame headers so
 * the server can identify the client if it adds a channel interceptor later.
 *
 * Reconnection: @stomp/stompjs automatically reconnects after 5 s on drop.
 *
 * @param {string}   userId          — the user's UUID (decoded from JWT sub)
 * @param {string}   token           — current JWT access token
 * @param {Function} onNotification  — called with { type, message, eventId }
 * @returns {Function}               — call to cleanly deactivate the client
 */
export function connectReminders(userId, token, onNotification) {
  const client = new Client({
    brokerURL: WS_URL,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,

    onConnect: () => {
      client.subscribe(`/topic/reminders/${userId}`, (frame) => {
        try {
          const notification = JSON.parse(frame.body);
          onNotification(notification);
        } catch {
          // Malformed frame body — silently ignore
        }
      });
    },

    // Suppress error noise in the browser console for expected disconnects
    onStompError:     () => {},
    onWebSocketError: () => {},
  });

  client.activate();

  // Return a cleanup function so callers (React useEffect) can disconnect
  return () => { client.deactivate(); };
}
