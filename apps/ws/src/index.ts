/**
 * Alifh WebSocket Server - Lean Implementation
 * Real-time messaging with presence, typing, and broadcasts
 */

import type { Server } from "bun";

const PORT = parseInt(process.env.WS_PORT || "3001");

// ============================================================================
// Types
// ============================================================================

interface WSData {
  userId: string;
  connectedAt: number;
  watchedUsers: Set<string>;
}

interface PresenceState {
  connections: number;
  lastSeenAt: string | null;
}

// ============================================================================
// State
// ============================================================================

const presence = new Map<string, PresenceState>();

function getPresence(userId: string) {
  const state = presence.get(userId);
  return {
    isOnline: state ? state.connections > 0 : false,
    lastSeenAt: state?.lastSeenAt ?? null,
  };
}

function setOnline(server: Server, userId: string) {
  const state = presence.get(userId) ?? { connections: 0, lastSeenAt: null };
  state.connections++;
  presence.set(userId, state);

  console.log(`🟢 [WS] User online: ${userId} (connections: ${state.connections})`);

  if (state.connections === 1) {
    server.publish(`presence:${userId}`, JSON.stringify({
      type: "presence",
      userId,
      isOnline: true,
      lastSeenAt: state.lastSeenAt,
      timestamp: new Date().toISOString(),
    }));
  }
}

function setOffline(server: Server, userId: string) {
  const state = presence.get(userId);
  if (!state) return;

  state.connections = Math.max(0, state.connections - 1);
  console.log(`🔴 [WS] User offline: ${userId} (connections: ${state.connections})`);

  if (state.connections === 0) {
    state.lastSeenAt = new Date().toISOString();
    server.publish(`presence:${userId}`, JSON.stringify({
      type: "presence",
      userId,
      isOnline: false,
      lastSeenAt: state.lastSeenAt,
      timestamp: new Date().toISOString(),
    }));
  }
}

// ============================================================================
// Server
// ============================================================================

const server = Bun.serve<WSData>({
  port: PORT,
  hostname: "0.0.0.0",

  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      const userId = url.searchParams.get("userId");
      if (!userId) return new Response("Unauthorized", { status: 401 });

      const ok = server.upgrade<WSData>(req, {
        data: { userId, connectedAt: Date.now(), watchedUsers: new Set() },
      });
      return ok ? new Response(undefined, { status: 101 }) : new Response("Upgrade failed", { status: 400 });
    }

    // Health check
    if (url.pathname === "/health") {
      const activeConnections = Array.from(presence.values()).reduce((sum, state) => sum + state.connections, 0);
      return Response.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        uniqueUsers: presence.size,
        activeConnections,
        presenceDetails: Array.from(presence.entries()).map(([userId, state]) => ({
          userId,
          connections: state.connections,
          isOnline: state.connections > 0,
        })),
      });
    }

    // Broadcast endpoint (for API -> WS)
    if (url.pathname === "/broadcast" && req.method === "POST") {
      return req.json().then(({ channel, message }) => {
        if (!channel || !message) {
          return Response.json({ error: "channel and message required" }, { status: 400 });
        }
        const count = server.publish(channel, JSON.stringify(message));
        
        // Extract userId from channel if it's a user channel
        const userId = channel.startsWith('user:') ? channel.slice(5) : null;
        const actualConnections = userId ? (presence.get(userId)?.connections ?? 0) : '?';
        
        console.log(`📡 [WS] Broadcast to ${channel} - type: ${message.type || 'unknown'} (${actualConnections} actual connections, ${count} subscription slots)`);
        return Response.json({ success: true, recipients: count });
      }).catch(() => Response.json({ error: "Invalid JSON" }, { status: 400 }));
    }

    return new Response("Not Found", { status: 404 });
  },

  websocket: {
    open(ws) {
      const { userId } = ws.data;
      console.log(`🔌 [WS] Client connected: ${userId}`);
      ws.subscribe(`user:${userId}`);
      ws.subscribe(`presence:${userId}`);
      setOnline(server, userId);

      ws.send(JSON.stringify({
        type: "connected",
        userId,
        serverTime: new Date().toISOString(),
      }));
    },

    message(ws, raw) {
      try {
        const data = JSON.parse(String(raw));
        const { userId } = ws.data;

        switch (data.type) {
          case "ping":
            ws.send(JSON.stringify({ type: "pong", serverTime: new Date().toISOString() }));
            break;

          case "typing":
            if (data.targetUserId && data.conversationId && typeof data.isTyping === "boolean") {
              server.publish(`user:${data.targetUserId}`, JSON.stringify({
                type: "typing",
                userId,
                conversationId: data.conversationId,
                isTyping: data.isTyping,
                timestamp: new Date().toISOString(),
              }));
            }
            break;

          case "watch_user":
            if (data.targetUserId) {
              ws.subscribe(`presence:${data.targetUserId}`);
              ws.data.watchedUsers.add(data.targetUserId);
              ws.send(JSON.stringify({
                type: "presence",
                userId: data.targetUserId,
                ...getPresence(data.targetUserId),
                timestamp: new Date().toISOString(),
              }));
            }
            break;

          case "unwatch_user":
            if (data.targetUserId) {
              ws.unsubscribe(`presence:${data.targetUserId}`);
              ws.data.watchedUsers.delete(data.targetUserId);
            }
            break;
        }
      } catch { /* ignore */ }
    },

    close(ws) {
      const { userId, watchedUsers } = ws.data;
      console.log(`🔌 [WS] Client disconnected: ${userId}`);
      ws.unsubscribe(`user:${userId}`);
      ws.unsubscribe(`presence:${userId}`);
      for (const id of watchedUsers) ws.unsubscribe(`presence:${id}`);
      setOffline(server, userId);
    },
  },
});

console.log(`🚀 WebSocket Server running on ws://0.0.0.0:${PORT}`);
console.log(`   Endpoints: /ws?userId=ID, /health, /broadcast`);
