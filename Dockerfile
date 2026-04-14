FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# ─── Build ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public vars must be available during `next build`
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ─── Runtime ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/public ./public
COPY --from=builder --chown=appuser:appgroup /app/.next ./.next
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/auth/me || exit 1

CMD ["npm", "start"]
