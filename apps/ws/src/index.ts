import type { Server } from "bun";

interface WebSocketData {
  userId?: string;
  roomId?: string;
}

const PORT = parseInt(process.env.WS_PORT || "3001");

const server = Bun.serve<WebSocketData>({
  port: PORT,
  fetch(req, server) {
    const url = new URL(req.url);
    
    // Upgrade HTTP connection to WebSocket
    if (url.pathname === "/ws") {
      const success = server.upgrade<WebSocketData>(req, {
        data: {
          userId: req.headers.get("x-user-id"),
          roomId: url.searchParams.get("room") || "default",
        },
      });

      if (success) {
        // Handle successful upgrade
        return new Response(undefined, { status: 101 });
      }
    }

    // Return 404 for other paths
    return new Response("Not Found", { status: 404 });
  },

  websocket: {
    open(ws) {
      const { userId, roomId } = ws.data;
      console.log(`[${new Date().toISOString()}] User ${userId} connected to room ${roomId}`);
      
      // Send welcome message
      ws.send(
        JSON.stringify({
          type: "connected",
          message: "Welcome to Alifh WebSocket Server",
          userId,
          roomId,
          timestamp: new Date().toISOString(),
        })
      );
    },

    message(ws, message) {
      const { userId, roomId } = ws.data;
      
      try {
        const data = typeof message === "string" ? JSON.parse(message) : message;
        
        console.log(`[${new Date().toISOString()}] Message from ${userId}:`, data.type);

        // Handle different message types
        switch (data.type) {
          case "ping":
            ws.send(
              JSON.stringify({
                type: "pong",
                timestamp: new Date().toISOString(),
              })
            );
            break;

          case "broadcast":
            // Broadcast to all clients in the room
            server.publish(
              `room:${roomId}`,
              JSON.stringify({
                type: "broadcast",
                from: userId,
                content: data.content,
                timestamp: new Date().toISOString(),
              })
            );
            break;

          case "notification":
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
            break;

          default:
            console.warn(`Unknown message type: ${data.type}`);
        }
      } catch (error) {
        console.error("Error processing message:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Failed to process message",
          })
        );
      }
    },

    close(ws) {
      const { userId, roomId } = ws.data;
      console.log(`[${new Date().toISOString()}] User ${userId} disconnected from room ${roomId}`);
    },

    error(ws, error) {
      const { userId } = ws.data;
      console.error(`[${new Date().toISOString()}] WebSocket error for user ${userId}:`, error);
    },
  },
});

console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);
console.log("   Available endpoints:");
console.log("   - ws://localhost:3001/ws");
console.log("   Connect with: ?room=roomName&userId=yourId headers");
