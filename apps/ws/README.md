# WebSocket Server

Real-time WebSocket server for Revvup messaging system.

## Quick Start

```bash
# Development
cd apps/ws
bun run dev

# Production
bun run build
bun run start
```

## Default Port

- Development: `ws://localhost:3001`
- Configure via `WS_URL` environment variable

## Features

- Real-time message delivery
- User presence tracking
- Auto-reconnection handling
- Heartbeat/ping-pong mechanism

## Status

⚠️ **Optional for Development**

The messaging system will work without the WebSocket server running:
- Messages will be sent/received via REST API
- Real-time updates will be disabled
- Users need to refresh to see new messages

To enable real-time features, start this server alongside the web app.

## Environment Variables

```env
# In apps/web/.env.local
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# In apps/ws/.env (if needed)
PORT=3001
```
