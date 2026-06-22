# syntax=docker/dockerfile:1

# Stage 1: Base image
FROM node:20-alpine AS base
WORKDIR /app
# Install OpenSSL (required for Prisma) and libc6-compat
RUN apk add --no-cache libc6-compat openssl

# Stage 2: Install dependencies and generate Prisma Client
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
# Install dependencies
RUN npm ci
# Generate Prisma Client
RUN npx prisma generate

# Stage 3: Build the application
FROM base AS builder
# Copy node_modules and prisma generated client from deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# We need environment variables for build time if you have NEXT_PUBLIC_ vars
# Docker compose will pass them or you can rely on .env file which is copied above
RUN npm run build

# Stage 4: Production runner
FROM base AS runner
ENV NODE_ENV production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
