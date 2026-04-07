FROM oven/bun:1.2-slim

WORKDIR /app

# Copy ws-specific package.json with limited workspaces
COPY apps/ws/package.ws.json ./package.json
COPY bun.lock ./
COPY packages/database/package.json ./packages/database/
COPY packages/database/src ./packages/database/src/
COPY apps/ws/package.json ./apps/ws/
COPY apps/ws/src ./apps/ws/src/
COPY apps/ws/tsconfig.json ./apps/ws/

# Install deps
RUN bun install

# Build ws
RUN cd apps/ws && bun run build

WORKDIR /app/apps/ws

EXPOSE 3001

CMD ["bun", "run", "dist/index.js"]
