# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app

# Install deps (use npm lockfile for reproducible builds)
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OUTPUT=standalone

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runtime image (Next.js standalone output)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# IBM Cloud Code Engine commonly uses 8080. Next standalone respects PORT.
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 8080
CMD ["node", "server.js"]


