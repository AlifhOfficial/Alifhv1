/// <reference types="bun-types" />
/**
 * Revvup WebSocket Server - Lean Implementation
 * Real-time messaging with presence, typing, and broadcasts
 */

import { db, userProfile, eq, sql } from "@alifh/database";

const PORT = parseInt(process.env.WS_PORT || "3001");

// ============================================================================
// Types
// ============================================================================

interface WSData {
  userId: string;
  connectedAt: number;
  watchedUsers: Set<string>;
  isActive: boolean; // false when tab is hidden (Page Visibility API)
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

/**
 * Get presence with DB fallback for lastSeenAt.
 * Used on watch_user so the client always gets an accurate last-active time
 * even after a WS server restart (when in-memory state is lost).
 */
async function getPresenceWithDbFallback(userId: string) {
  const state = presence.get(userId);
  const isOnline = state ? state.connections > 0 : false;
  let lastSeenAt = state?.lastSeenAt ?? null;

  // If no in-memory lastSeenAt and user is offline, query DB
  if (!lastSeenAt && !isOnline) {
    try {
      const [row] = await db
        .select({ lastActiveAt: userProfile.lastActiveAt })
        .from(userProfile)
        .where(eq(userProfile.userId, userId))
        .limit(1);
      if (row?.lastActiveAt) {
        lastSeenAt = row.lastActiveAt.toISOString();
      }
    } catch {
      // Silent fail — return null
    }
  }

  return { isOnline, lastSeenAt };
}

function setOnline(server: { publish(topic: string, data: string): void }, userId: string) {
  const state = presence.get(userId) ?? { connections: 0, lastSeenAt: null };
  state.connections++;
  presence.set(userId, state);


  if (state.connections === 1) {
    // Update database lastActiveAt
    db.update(userProfile)
      .set({ lastActiveAt: new Date() })
      .where(eq(userProfile.userId, userId))
      .catch(() => {}); // Silent fail

    server.publish(`presence:${userId}`, JSON.stringify({
      type: "presence",
      userId,
      isOnline: true,
      lastSeenAt: state.lastSeenAt,
      timestamp: new Date().toISOString(),
    }));
  }
}

function setOffline(server: { publish(topic: string, data: string): void }, userId: string) {
  const state = presence.get(userId);
  if (!state) return;

  state.connections = Math.max(0, state.connections - 1);

  if (state.connections === 0) {
    state.lastSeenAt = new Date().toISOString();
    
    // Update database lastActiveAt when going offline
    db.update(userProfile)
      .set({ lastActiveAt: new Date(state.lastSeenAt) })
      .where(eq(userProfile.userId, userId))
      .catch(() => {}); // Silent fail

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

  async fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      const userId = url.searchParams.get("userId");
      if (!userId) return new Response("Unauthorized", { status: 401 });

      const ok = server.upgrade(req, {
        data: { userId, connectedAt: Date.now(), watchedUsers: new Set(), isActive: true },
      });
      return ok ? new Response(undefined, { status: 101 }) : new Response("Upgrade failed", { status: 400 });
    }

    // Health check - with timing breakdown
    if (url.pathname === "/health") {
      const start = performance.now();
      const activeConnections = Array.from(presence.values()).reduce((sum, state) => sum + state.connections, 0);
      
      // Test DB latency (Fly → Neon)
      const dbStart = performance.now();
      let dbLatency = -1;
      try {
        await db.execute(sql`SELECT 1`);
        dbLatency = Math.round((performance.now() - dbStart) * 100) / 100;
      } catch {
        dbLatency = -1; // DB unreachable
      }
      
      const processTime = performance.now() - start;
      
      return new Response(JSON.stringify({
        status: "ok",
        fly: {
          region: process.env.FLY_REGION ?? null,
          appName: process.env.FLY_APP_NAME ?? null,
          machineId: process.env.FLY_MACHINE_ID ?? null,
        },
        timing: {
          requestReceivedAt: new Date().toISOString(),
          processTimeMs: Math.round(processTime * 100) / 100,
          dbLatencyMs: dbLatency,
          uptimeSeconds: Math.round(process.uptime()),
        },
        stats: {
          uniqueUsers: presence.size,
          activeConnections,
        },
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Server-Timing': `process;dur=${processTime.toFixed(2)}, db;dur=${dbLatency}`,
        },
      });
    }

    // Detailed stats endpoint (separate from health)
    if (url.pathname === "/stats") {
      const activeConnections = Array.from(presence.values()).reduce((sum, state) => sum + state.connections, 0);
      return Response.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        uniqueUsers: presence.size,
        activeConnections,
      });
    }

    // Broadcast endpoint (for API -> WS)
    if (url.pathname === "/broadcast" && req.method === "POST") {
      return req.json().then((body: unknown) => {
        if (!body || typeof body !== "object") {
          return Response.json({ error: "channel and message required" }, { status: 400 });
        }
        const { channel, message } = body as { channel?: unknown; message?: unknown };
        if (typeof channel !== "string" || message === undefined) {
          return Response.json({ error: "channel and message required" }, { status: 400 });
        }
        server.publish(channel, JSON.stringify(message));
        const userId = channel.startsWith('user:') ? channel.slice(5) : null;
        const connections = userId ? (presence.get(userId)?.connections ?? 0) : 0;
        return Response.json({ success: true, delivered: connections > 0 });
      }).catch(() => {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
      });
    }

    return new Response("Not Found", { status: 404 });
  },

  websocket: {
    open(ws) {
      const { userId } = ws.data;
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
              // Subscribe to presence channel if not already watching
              if (!ws.data.watchedUsers.has(data.targetUserId)) {
                ws.subscribe(`presence:${data.targetUserId}`);
                ws.data.watchedUsers.add(data.targetUserId);
              }
              // Always send current presence back (even if already subscribed)
              // This lets multiple hooks/screens get initial presence state
              // Uses DB fallback so lastSeenAt is accurate after server restarts
              getPresenceWithDbFallback(data.targetUserId).then((p) => {
                ws.send(JSON.stringify({
                  type: "presence",
                  userId: data.targetUserId,
                  ...p,
                  timestamp: new Date().toISOString(),
                }));
              }).catch(() => {
                // Fallback to in-memory only
                ws.send(JSON.stringify({
                  type: "presence",
                  userId: data.targetUserId,
                  ...getPresence(data.targetUserId),
                  timestamp: new Date().toISOString(),
                }));
              });
            }
            break;

          case "unwatch_user":
            if (data.targetUserId && ws.data.watchedUsers.has(data.targetUserId)) {
              ws.unsubscribe(`presence:${data.targetUserId}`);
              ws.data.watchedUsers.delete(data.targetUserId);
            }
            break;

          case "visibility": {
            // Page Visibility API: tab hidden/visible without closing the connection
            if (typeof data.visible === "boolean") {
              const wasActive = ws.data.isActive;
              ws.data.isActive = data.visible;
              if (!data.visible && wasActive) {
                setOffline(server, userId);
              } else if (data.visible && !wasActive) {
                setOnline(server, userId);
              }
            }
            break;
          }
        }
      } catch { /* ignore */ }
    },

    close(ws) {
      const { userId, watchedUsers, isActive } = ws.data;
      ws.unsubscribe(`user:${userId}`);
      ws.unsubscribe(`presence:${userId}`);
      for (const id of watchedUsers) ws.unsubscribe(`presence:${id}`);
      // Only decrement presence if this connection was actively counted as online.
      // If the tab was hidden, setOffline was already called via the visibility message.
      if (isActive) setOffline(server, userId);
    },
  },
});

console.log(`🚀 WebSocket server running on port ${PORT}`);
