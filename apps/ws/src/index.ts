import type { Server } from "bun";

// Simple logging utilities to replace the removed logger system
const logger = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || ''),
};

const securityLogger = {
  warn: (message: string, meta?: any) => console.warn(`[SECURITY] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[SECURITY] ${message}`, meta || ''),
  suspiciousActivity: (userId: string, activity: string, details: any, ip?: string) =>
    console.warn(`[SECURITY] Suspicious activity by ${userId}: ${activity}`, { details, ip }),
  authSuccess: (userId: string, method: string, ip?: string) =>
    console.log(`[SECURITY] Auth success: ${userId} via ${method}`, ip || ''),
};

const auditLogger = {
  info: (message: string, meta?: any) => console.log(`[AUDIT] ${message}`, meta || ''),
  dataAccess: (userId: string, resource: string, action: string, details?: string) => 
    console.log(`[AUDIT] User ${userId} performed ${action} on ${resource}`, details || ''),
};

interface WebSocketData {
  userId?: string;
  roomId?: string;
  connectedAt: number;
  ip?: string;
  lastMessage?: number; // For rate limiting
}

const PORT = parseInt(process.env.WS_PORT || "3001");

// Enhanced Bun.serve with security logging and performance optimizations
const server = Bun.serve<WebSocketData>({
  port: PORT,
  hostname: '0.0.0.0', // Listen on all interfaces
  // Enable development mode for better debugging
  development: process.env.NODE_ENV !== 'production',
  
  async fetch(req, server) {
    const startTime = Date.now();
    const url = new URL(req.url);
    const ip = req.headers.get("x-forwarded-for") || 
               req.headers.get("x-real-ip") || 
               "unknown";
    
    // Security: Log all connection attempts
    logger.info('WebSocket connection attempt', {
      path: url.pathname,
      ip,
      userAgent: req.headers.get("user-agent"),
      origin: req.headers.get("origin"),
    });
    
    // Upgrade HTTP connection to WebSocket
    if (url.pathname === "/ws") {
      const userId = req.headers.get("x-user-id") || 
                     url.searchParams.get("userId");
      const roomId = url.searchParams.get("room") || "default";
      
      // Security validation
      if (!userId) {
        logger.warn('WebSocket connection rejected: missing userId', { ip });
        return new Response("Unauthorized: Missing userId", { status: 401 });
      }
      
      const success = server.upgrade<WebSocketData>(req, {
        data: {
          userId,
          roomId,
          connectedAt: Date.now(),
          ip,
        },
      });

      if (success) {
        // Log successful upgrade
        auditLogger.dataAccess(userId, 'websocket', 'connect', roomId);
        logger.info('WebSocket upgrade successful', {
          userId,
          roomId,
          ip,
          duration: Date.now() - startTime,
        });
        return new Response(undefined, { status: 101 });
      } else {
        // Log failed upgrade
        securityLogger.suspiciousActivity(
          userId, 
          'websocket_upgrade_failed',
          { roomId, ip },
          ip
        );
        return new Response("Upgrade Failed", { status: 400 });
      }
    }

    // Health check endpoint
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Broadcast endpoint for server-side triggers
    if (url.pathname === "/broadcast" && req.method === "POST") {
      try {
        const body = await req.json();
        const { channel, message } = body;
        
        if (!channel || !message) {
          return new Response(JSON.stringify({ error: 'channel and message required' }), { 
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Publish message to the specified channel
        const publishCount = server.publish(channel, JSON.stringify(message));
        
        logger.info('Broadcast sent', { 
          channel, 
          messageType: message.type,
          recipientsCount: publishCount,
          messageData: message,
        });
        
        return new Response(JSON.stringify({ 
          success: true, 
          recipientsCount: publishCount 
        }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        logger.error('Broadcast failed', { error });
        return new Response(JSON.stringify({ error: 'Broadcast failed' }), { 
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Return 404 for other paths
    logger.warn('WebSocket 404', { path: url.pathname, ip });
    return new Response("Not Found", { status: 404 });
  },

  websocket: {
    // Enhanced connection handler with security logging
    open(ws) {
      const { userId, roomId, connectedAt, ip } = ws.data;
      
      // Subscribe to user-specific and room-specific channels
      const userChannel = `user:${userId}`;
      const roomChannel = `room:${roomId}`;
      ws.subscribe(userChannel);
      ws.subscribe(roomChannel);
      
      // Security audit log
      securityLogger.authSuccess(userId!, 'websocket', ip);
      logger.info('WebSocket connection established', {
        userId,
        roomId,
        ip,
        connectionTime: Date.now() - connectedAt,
        subscribedTo: [userChannel, roomChannel],
      });
      
      // Send enhanced welcome message
      ws.send(
        JSON.stringify({
          type: "connected",
          message: "Welcome to Alifh WebSocket Server",
          userId,
          roomId,
          serverTime: new Date().toISOString(),
          features: ["ping", "broadcast", "notification"],
        })
      );

      // Set up keep-alive ping interval
      const pingInterval = setInterval(() => {
        if (ws.readyState === 1) { // 1 = OPEN
          ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
        } else {
          clearInterval(pingInterval);
        }
      }, 30000); // Ping every 30 seconds

      // Store interval for cleanup
      (ws as any).pingInterval = pingInterval;
    },

    // Enhanced message handler with better error handling and logging
    message(ws, message) {
      const { userId, roomId, ip } = ws.data;
      const messageStartTime = Date.now();
      
      try {
        const data = typeof message === "string" ? JSON.parse(message) : message;
        
        // Log message with security context
        logger.info('WebSocket message received', {
          userId,
          roomId,
          type: data.type,
          ip,
        });

        // Rate limiting check (basic implementation)
        // In production, use Redis or similar for distributed rate limiting
        const now = Date.now();
        if (!ws.data.lastMessage) ws.data.lastMessage = 0;
        
        if (now - ws.data.lastMessage < 100) { // 100ms minimum between messages
          logger.warn('WebSocket rate limit exceeded', { userId, ip });
          ws.send(JSON.stringify({
            type: "error",
            message: "Rate limit exceeded. Please slow down.",
          }));
          return;
        }
        ws.data.lastMessage = now;

        // Handle different message types with enhanced functionality
        switch (data.type) {
          case "ping":
            ws.send(
              JSON.stringify({
                type: "pong",
                serverTime: new Date().toISOString(),
                latency: Date.now() - messageStartTime,
              })
            );
            break;

          case "broadcast":
            // Audit log for broadcasts
            auditLogger.dataAccess(userId!, 'websocket', 'broadcast', roomId);
            
            // Broadcast to all clients in the room
            server.publish(
              `room:${roomId}`,
              JSON.stringify({
                type: "broadcast",
                from: userId,
                content: data.content,
                timestamp: new Date().toISOString(),
                roomId,
              })
            );
            
            logger.info('WebSocket broadcast sent', {
              from: userId,
              roomId,
              contentLength: data.content?.length || 0,
            });
            break;

          case "notification":
            // Validate target user
            if (!data.targetUserId) {
              ws.send(JSON.stringify({
                type: "error",
                message: "Target user ID required for notifications",
              }));
              return;
            }
            
            // Audit log for direct messages
            auditLogger.dataAccess(userId!, 'websocket', 'notification', data.targetUserId);
            
            // Send notification to specific user
            server.publish(
              `user:${data.targetUserId}`,
              JSON.stringify({
                type: "notification",
                from: userId,
                content: data.content,
                timestamp: new Date().toISOString(),
              })
            );
            
            logger.info('WebSocket notification sent', {
              from: userId,
              to: data.targetUserId,
              contentLength: data.content?.length || 0,
            });
            break;

          case "join_room":
            // Handle room switching
            if (data.newRoom && data.newRoom !== roomId) {
              ws.unsubscribe(`room:${roomId}`);
              ws.subscribe(`room:${data.newRoom}`);
              ws.data.roomId = data.newRoom;
              
              auditLogger.dataAccess(userId!, 'websocket', 'join_room', data.newRoom);
              
              ws.send(JSON.stringify({
                type: "room_changed",
                oldRoom: roomId,
                newRoom: data.newRoom,
                timestamp: new Date().toISOString(),
              }));
              
              logger.info('WebSocket room changed', {
                userId,
                oldRoom: roomId,
                newRoom: data.newRoom,
              });
            }
            break;

          default:
            logger.warn('Unknown WebSocket message type', {
              userId,
              type: data.type,
              ip,
            });
            ws.send(JSON.stringify({
              type: "error",
              message: `Unknown message type: ${data.type}`,
              supportedTypes: ["ping", "broadcast", "notification", "join_room"],
            }));
        }
      } catch (error) {
        logger.error('WebSocket message processing error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
          ip,
          messageLength: typeof message === 'string' ? message.length : 0,
        });
        
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Failed to process message",
            timestamp: new Date().toISOString(),
          })
        );
      }
    },

    // Enhanced disconnect handler with cleanup
    close(ws, code, reason) {
      const { userId, roomId, connectedAt, ip } = ws.data;
      const sessionDuration = Date.now() - connectedAt;
      
      // Clear ping interval
      if ((ws as any).pingInterval) {
        clearInterval((ws as any).pingInterval);
      }
      
      // Cleanup subscriptions
      ws.unsubscribe(`user:${userId}`);
      ws.unsubscribe(`room:${roomId}`);
      
      // Audit log for disconnection
      auditLogger.dataAccess(userId!, 'websocket', 'disconnect', roomId);
      
      logger.info('WebSocket connection closed', {
        userId,
        roomId,
        ip,
        sessionDuration,
        code,
        reason: reason || 'Client disconnect',
      });
    },

    // Enhanced error handler with detailed logging
    error(ws, error) {
      const { userId, ip } = ws.data;
      
      logger.error('WebSocket error occurred', {
        error: error.message,
        stack: error.stack,
        userId,
        ip,
        timestamp: new Date().toISOString(),
      });
      
      // Security: Log potential attack patterns
      securityLogger.suspiciousActivity(
        userId || 'unknown',
        'websocket_error',
        { 
          error: error.message,
          type: error.name,
        },
        ip
      );
    },
  },
});

// Enhanced startup logging with system information
logger.info('🚀 Bun WebSocket server starting...', {
  port: PORT,
  environment: process.env.NODE_ENV || 'development',
  bunVersion: Bun.version,
  nodeVersion: process.version,
  platform: process.platform,
  architecture: process.arch,
});

console.log(`🚀 Alifh WebSocket Server running on ws://localhost:${PORT}`);
console.log("   Powered by Bun.serve() - Ultra-fast native WebSocket support");
console.log("   Available endpoints:");
console.log(`   - ws://localhost:${PORT}/ws?userId=YOUR_USER_ID&room=ROOM_NAME`);
console.log(`   - http://localhost:${PORT}/health (Health check)`);
console.log("   Features:");
console.log("   - ✅ Native Bun WebSocket performance");
console.log("   - ✅ Security logging & audit trails");
console.log("   - ✅ Rate limiting protection");
console.log("   - ✅ Room-based messaging");
console.log("   - ✅ Direct user notifications");
console.log("   - ✅ Real-time room switching");

// Graceful shutdown handling
process.on('SIGINT', () => {
  logger.info('🛑 WebSocket server shutting down gracefully...');
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 WebSocket server received SIGTERM, shutting down...');
  server.stop();
  process.exit(0);
});
