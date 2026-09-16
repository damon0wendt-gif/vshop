# ── VELOX Studios — all-in-one production image ──────────────────────────
# Works on any Docker host (Hetzner, Railway, Render, Fly.io, ...).
# The app self-initializes its database schema + demo catalog on first start.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL is only needed at runtime, not during build.
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "run", "start"]
